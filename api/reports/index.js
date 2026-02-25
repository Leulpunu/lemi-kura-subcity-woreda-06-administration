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
      const reports = await sql`SELECT * FROM reports ORDER BY created_at DESC LIMIT 100`;
      res.status(200).json(reports);
    } else if (req.method === 'POST') {
      const { office_id, task_id, value, date, description, reported_by, report_type } = req.body;
      const result = await sql`
        INSERT INTO reports (office_id, task_id, value, date, description, reported_by, report_type)
        VALUES (${office_id}, ${task_id}, ${value}, ${date}, ${description}, ${reported_by}, ${report_type})
        RETURNING *
      `;
      res.status(201).json(result[0]);
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (err) {
    console.error('Reports error:', err);
    res.status(500).json({ message: err.message });
  }
};
