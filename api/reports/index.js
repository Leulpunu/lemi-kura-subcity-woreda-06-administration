const { neon } = require('@neondatabase/serverless');
const jwt = require('jsonwebtoken');

const DATABASE_URL = process.env.DATABASE_URL;
const sql = DATABASE_URL ? neon(DATABASE_URL) : null;

const mapReport = (row) => ({
  id: Number(row.id),
  officeId: row.office_id,
  taskId: row.task_id,
  userId: Number(row.user_id),
  userName: row.user_name,
  type: row.report_type,
  date: row.report_date,
  startDate: row.start_date,
  endDate: row.end_date,
  month: row.report_month,
  year: row.report_year,
  periodKey: row.period_key,
  data: row.data || {},
  status: row.status || 'submitted',
  isLocked: row.is_locked !== false,
  feedback: row.feedback || '',
  feedbackBy: row.feedback_by || '',
  feedbackDate: row.feedback_date || '',
  timestamp: row.created_at,
});

const ensureTable = async () => {
  await sql`
    CREATE TABLE IF NOT EXISTS kpi_reports (
      id BIGSERIAL PRIMARY KEY,
      office_id VARCHAR(100) NOT NULL,
      task_id VARCHAR(100) NOT NULL,
      user_id INTEGER NOT NULL,
      user_name VARCHAR(255) NOT NULL,
      report_type VARCHAR(20) NOT NULL,
      report_date DATE,
      start_date DATE,
      end_date DATE,
      report_month VARCHAR(7),
      report_year INTEGER,
      period_key VARCHAR(64),
      data JSONB NOT NULL,
      status VARCHAR(50) DEFAULT 'submitted',
      is_locked BOOLEAN DEFAULT TRUE,
      feedback TEXT DEFAULT '',
      feedback_by VARCHAR(255) DEFAULT '',
      feedback_date TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
};

const getAuthUser = async (req) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const token = authHeader && String(authHeader).startsWith('Bearer ')
    ? String(authHeader).slice(7)
    : null;

  if (!token) return null;

  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
  const users = await sql`SELECT * FROM users WHERE id = ${decoded.id} LIMIT 1`;
  return users[0] || null;
};

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!sql) {
    return res.status(500).json({ message: 'Database not configured. Please set DATABASE_URL environment variable.' });
  }

  try {
    await ensureTable();
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method === 'GET') {
      let rows = [];
      const role = authUser.role;
      const accessible = Array.isArray(authUser.accessibleOffices) ? authUser.accessibleOffices : [];

      if (role === 'admin') {
        rows = await sql`SELECT * FROM kpi_reports ORDER BY created_at DESC`;
      } else if (accessible.length > 0) {
        rows = await sql`
          SELECT * FROM kpi_reports
          WHERE office_id = ANY(${accessible})
          ORDER BY created_at DESC
        `;
      } else if (authUser.office) {
        rows = await sql`
          SELECT * FROM kpi_reports
          WHERE office_id = ${authUser.office}
          ORDER BY created_at DESC
        `;
      } else {
        rows = [];
      }

      return res.status(200).json(rows.map(mapReport));
    }

    if (req.method === 'POST') {
      const {
        officeId,
        taskId,
        type,
        date,
        startDate,
        endDate,
        month,
        year,
        periodKey,
        data,
      } = req.body || {};

      if (!officeId || !taskId || !type || !data || typeof data !== 'object') {
        return res.status(400).json({ message: 'Missing required report fields' });
      }

      const inserted = await sql`
        INSERT INTO kpi_reports (
          office_id, task_id, user_id, user_name, report_type,
          report_date, start_date, end_date, report_month, report_year, period_key,
          data, status, is_locked, feedback, feedback_by, feedback_date, updated_at
        ) VALUES (
          ${officeId}, ${taskId}, ${authUser.id}, ${authUser.name}, ${type},
          ${date || null}, ${startDate || null}, ${endDate || null}, ${month || null}, ${year || null}, ${periodKey || null},
          ${JSON.stringify(data)}::jsonb, 'submitted', TRUE, '', '', NULL, NOW()
        )
        RETURNING *
      `;

      return res.status(201).json(mapReport(inserted[0]));
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (err) {
    console.error('Reports API error:', err);
    return res.status(500).json({ message: 'Server error: ' + err.message });
  }
};
