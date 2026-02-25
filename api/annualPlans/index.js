const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.DATABASE_URL;
const sql = DATABASE_URL ? neon(DATABASE_URL) : null;

module.exports = async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!sql) {
    return res.status(500).json({ message: 'Database not configured' });
  }

  try {
    if (req.method === 'GET') {
      const { office_id, year } = req.query;
      let query = 'SELECT * FROM annual_plans';
      const conditions = [];
      const params = [];
      
      if (office_id) {
        conditions.push(`office_id = $${params.length + 1}`);
        params.push(office_id);
      }
      if (year) {
        conditions.push(`year = $${params.length + 1}`);
        params.push(parseInt(year));
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      query += ' ORDER BY created_at DESC';
      
      const plans = await sql`SELECT * FROM annual_plans ORDER BY created_at DESC`;
      res.status(200).json(plans);
    } else if (req.method === 'POST') {
      const { office_id, task_id, annual_targets, distributed_plans, year, submitted_by, status } = req.body;
      const result = await sql`
        INSERT INTO annual_plans (office_id, task_id, annual_targets, distributed_plans, year, submitted_by, status)
        VALUES (${office_id}, ${task_id}, ${JSON.stringify(annual_targets)}, ${JSON.stringify(distributed_plans)}, ${year}, ${submitted_by}, ${status || 'draft'})
        RETURNING *
      `;
      res.status(201).json(result[0]);
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (err) {
    console.error('Annual Plans error:', err);
    res.status(500).json({ message: err.message });
  }
};
