const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

module.exports = async function handler(req, res) {
  const { method, body } = req;

  try {
    if (method === 'GET') {
      const notifications = await sql`SELECT * FROM notifications ORDER BY created_at DESC`;
      return res.status(200).json(notifications);
    }
    
    if (method === 'POST') {
      const { title, message, type, office_id, created_by } = body;
      const maxIdResult = await sql`SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM notifications`;
      const nextId = maxIdResult[0].next_id;
      
      await sql`
        INSERT INTO notifications (id, title, message, type, office_id, created_by)
        VALUES (${nextId}, ${title}, ${message}, ${type}, ${office_id}, ${created_by})
      `;
      
      return res.status(201).json({ message: 'Notification created' });
    }

    res.status(405).json({ message: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
