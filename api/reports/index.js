const { neon } = require('@neondatabase/serverless');

// Initialize the database connection
let sql;
try {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not defined in environment variables');
  } else {
    sql = neon(process.env.DATABASE_URL);
    console.log('Neon database connection initialized in api/reports/index.js');
  }
} catch (err) {
  console.error('Failed to initialize Neon database:', err);
}

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method, query, body } = req;

  try {
    if (!sql) {
      return res.status(500).json({ message: 'Database connection not initialized. Please check DATABASE_URL environment variable.' });
    }

    if (method === 'GET') {
      const reports = await sql`SELECT * FROM reports ORDER BY created_at DESC`;
      return res.status(200).json(reports);
    }
    
    if (method === 'POST') {
      const { office_id, report_type, content, date, created_by } = body;
      const maxIdResult = await sql`SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM reports`;
      const nextId = maxIdResult[0].next_id;
      
      await sql`
        INSERT INTO reports (id, office_id, report_type, content, date, created_by)
        VALUES (${nextId}, ${office_id}, ${report_type}, ${JSON.stringify(content)}, ${date}, ${created_by})
      `;
      
      return res.status(201).json({ message: 'Report created' });
    }

    res.status(405).json({ message: 'Method not allowed' });
  } catch (err) {
    console.error('Reports error:', err.message);
    res.status(500).json({ message: err.message });
  }
};
