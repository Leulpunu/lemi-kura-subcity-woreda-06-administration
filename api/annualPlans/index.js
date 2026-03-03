const { neon } = require('@neondatabase/serverless');
const jwt = require('jsonwebtoken');

const DATABASE_URL = process.env.DATABASE_URL;
const sql = DATABASE_URL ? neon(DATABASE_URL) : null;

const normalizeRole = (role) => {
  if (role === 'sub_admin' || role === 'party') return 'subadmin';
  return role;
};

const mapPlan = (row) => ({
  id: Number(row.id),
  officeId: row.office_id,
  taskId: row.task_id,
  annualTargets: row.annual_targets || {},
  kpiUnits: row.kpi_units || {},
  distributedPlans: row.distributed_plans || {},
  year: Number(row.year),
  submittedBy: Number(row.submitted_by),
  submittedAt: row.submitted_at || row.created_at,
  status: row.status || 'draft',
  approvedBy: row.approved_by || null,
  approvedAt: row.approved_at || null,
  rejectionReason: row.rejection_reason || '',
  createdAt: row.created_at,
  updatedAt: row.updated_at || row.created_at,
});

const ensureTable = async () => {
  await sql`
    CREATE TABLE IF NOT EXISTS annual_plans (
      id BIGSERIAL PRIMARY KEY,
      office_id VARCHAR(100) NOT NULL,
      task_id VARCHAR(100) NOT NULL,
      annual_targets JSONB NOT NULL,
      kpi_units JSONB DEFAULT '{}'::jsonb,
      distributed_plans JSONB NOT NULL,
      year INTEGER NOT NULL,
      submitted_by INTEGER NOT NULL,
      submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status VARCHAR(20) DEFAULT 'submitted',
      approved_by INTEGER,
      approved_at TIMESTAMP,
      rejection_reason TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await sql`ALTER TABLE annual_plans ADD COLUMN IF NOT EXISTS kpi_units JSONB DEFAULT '{}'::jsonb`;
  await sql`ALTER TABLE annual_plans ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`;
  await sql`ALTER TABLE annual_plans ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`;
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
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

    const role = normalizeRole(authUser.role);
    const accessible = Array.isArray(authUser.accessibleOffices) ? authUser.accessibleOffices : [];

    if (req.method === 'GET') {
      const { office_id, task_id, year } = req.query || {};
      let rows = [];

      if (role === 'admin') {
        if (office_id || task_id || year) {
          rows = await sql`
            SELECT * FROM annual_plans
            WHERE (${office_id || null}::text IS NULL OR office_id = ${office_id || null})
              AND (${task_id || null}::text IS NULL OR task_id = ${task_id || null})
              AND (${year ? Number(year) : null}::int IS NULL OR year = ${year ? Number(year) : null})
            ORDER BY created_at DESC
          `;
        } else {
          rows = await sql`SELECT * FROM annual_plans ORDER BY created_at DESC`;
        }
      } else {
        const allowedOffices = accessible.length > 0 ? accessible : (authUser.office ? [authUser.office] : []);
        if (allowedOffices.length === 0) {
          return res.status(200).json([]);
        }

        rows = await sql`
          SELECT * FROM annual_plans
          WHERE office_id = ANY(${allowedOffices})
            AND (${task_id || null}::text IS NULL OR task_id = ${task_id || null})
            AND (${year ? Number(year) : null}::int IS NULL OR year = ${year ? Number(year) : null})
          ORDER BY created_at DESC
        `;
      }

      return res.status(200).json(rows.map(mapPlan));
    }

    if (req.method === 'POST') {
      const {
        officeId,
        taskId,
        annualTargets,
        kpiUnits,
        distributedPlans,
        year,
      } = req.body || {};

      if (!officeId || !taskId || !annualTargets || !distributedPlans || !year) {
        return res.status(400).json({ message: 'Missing required annual plan fields' });
      }

      const allowedOffices = accessible.length > 0 ? accessible : (authUser.office ? [authUser.office] : []);
      if (role !== 'admin' && !allowedOffices.includes(officeId)) {
        return res.status(403).json({ message: 'You do not have permission to submit this office annual plan' });
      }

      const existing = await sql`
        SELECT * FROM annual_plans
        WHERE office_id = ${officeId} AND task_id = ${taskId} AND year = ${Number(year)}
        ORDER BY id DESC
        LIMIT 1
      `;

      if (existing.length > 0) {
        const plan = existing[0];

        if (Number(plan.submitted_by) !== Number(authUser.id) && role !== 'admin') {
          return res.status(403).json({ message: 'This annual plan belongs to another user' });
        }

        if (plan.status === 'submitted' || plan.status === 'approved') {
          return res.status(400).json({ message: 'Annual plan is locked until administrator requests changes' });
        }

        const updated = await sql`
          UPDATE annual_plans
          SET
            annual_targets = ${JSON.stringify(annualTargets)}::jsonb,
            kpi_units = ${JSON.stringify(kpiUnits || {})}::jsonb,
            distributed_plans = ${JSON.stringify(distributedPlans)}::jsonb,
            status = 'submitted',
            rejection_reason = NULL,
            approved_by = NULL,
            approved_at = NULL,
            submitted_by = ${authUser.id},
            submitted_at = NOW(),
            updated_at = NOW()
          WHERE id = ${plan.id}
          RETURNING *
        `;
        return res.status(200).json(mapPlan(updated[0]));
      }

      const inserted = await sql`
        INSERT INTO annual_plans (
          office_id, task_id, annual_targets, kpi_units, distributed_plans, year,
          submitted_by, submitted_at, status, created_at, updated_at
        ) VALUES (
          ${officeId},
          ${taskId},
          ${JSON.stringify(annualTargets)}::jsonb,
          ${JSON.stringify(kpiUnits || {})}::jsonb,
          ${JSON.stringify(distributedPlans)}::jsonb,
          ${Number(year)},
          ${authUser.id},
          NOW(),
          'submitted',
          NOW(),
          NOW()
        )
        RETURNING *
      `;
      return res.status(201).json(mapPlan(inserted[0]));
    }

    if (req.method === 'PATCH') {
      if (role !== 'admin') {
        return res.status(403).json({ message: 'Only admin can approve or reject annual plans' });
      }

      const { id, action, rejectionReason } = req.body || {};
      if (!id || !['approve', 'reject'].includes(action)) {
        return res.status(400).json({ message: 'id and valid action are required' });
      }

      let updated = [];
      if (action === 'approve') {
        updated = await sql`
          UPDATE annual_plans
          SET
            status = 'approved',
            approved_by = ${authUser.id},
            approved_at = NOW(),
            rejection_reason = NULL,
            updated_at = NOW()
          WHERE id = ${Number(id)} AND status = 'submitted'
          RETURNING *
        `;
      } else {
        updated = await sql`
          UPDATE annual_plans
          SET
            status = 'rejected',
            approved_by = ${authUser.id},
            approved_at = NOW(),
            rejection_reason = ${String(rejectionReason || 'Please revise and resubmit')},
            updated_at = NOW()
          WHERE id = ${Number(id)} AND status = 'submitted'
          RETURNING *
        `;
      }

      if (!updated.length) {
        return res.status(404).json({ message: 'Annual plan not found or not in submitted status' });
      }

      return res.status(200).json(mapPlan(updated[0]));
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (err) {
    console.error('Annual Plans API error:', err);
    return res.status(500).json({ message: 'Server error: ' + err.message });
  }
};
