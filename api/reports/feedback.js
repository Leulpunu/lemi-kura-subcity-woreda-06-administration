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

const normalizeRole = (role) => {
  if (role === 'sub_admin' || role === 'party') return 'subadmin';
  return role;
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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!sql) {
    return res.status(500).json({ message: 'Database not configured. Please set DATABASE_URL environment variable.' });
  }

  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const role = normalizeRole(authUser.role);
    const accessible = Array.isArray(authUser.accessibleOffices) ? authUser.accessibleOffices : [];
    const allowedOffices = accessible.length > 0 ? accessible : (authUser.office ? [authUser.office] : []);
    if (role !== 'admin' && role !== 'subadmin') {
      return res.status(403).json({ message: 'Only admin or subadmin can provide feedback' });
    }

    const { reportId, feedback } = req.body || {};
    if (!reportId || !String(feedback || '').trim()) {
      return res.status(400).json({ message: 'reportId and feedback are required' });
    }

    let updated = [];
    if (role === 'admin') {
      updated = await sql`
        UPDATE kpi_reports
        SET
          feedback = ${String(feedback).trim()},
          feedback_by = ${authUser.name},
          feedback_date = NOW(),
          status = 'feedback_provided',
          is_locked = FALSE,
          updated_at = NOW()
        WHERE id = ${reportId}
        RETURNING *
      `;
    } else {
      updated = await sql`
        UPDATE kpi_reports
        SET
          feedback = ${String(feedback).trim()},
          feedback_by = ${authUser.name},
          feedback_date = NOW(),
          status = 'feedback_provided',
          is_locked = FALSE,
          updated_at = NOW()
        WHERE id = ${reportId} AND office_id = ANY(${allowedOffices})
        RETURNING *
      `;
    }

    if (!updated.length) {
      return res.status(404).json({ message: 'Report not found' });
    }

    return res.status(200).json(mapReport(updated[0]));
  } catch (err) {
    console.error('Report feedback API error:', err);
    return res.status(500).json({ message: 'Server error: ' + err.message });
  }
};
