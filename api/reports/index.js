const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

module.exports = async function handler(req, res) {
  const { method, query, body } = req;

  try {
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
    res.status(500).json({ message: err.message });
  }
};
