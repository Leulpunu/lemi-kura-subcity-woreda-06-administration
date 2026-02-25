const { neon } = require('@neondatabase/serverless');

// Initialize the database connection
let sql;
try {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not defined in environment variables');
  } else {
    sql = neon(process.env.DATABASE_URL);
    console.log('Neon database connection initialized in api/notifications/index.js');
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

  const { method, body } = req;

  try {
    if (!sql) {
      return res.status(500).json({ message: 'Database connection not initialized. Please check DATABASE_URL environment variable.' });
    }

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
    console.error('Notifications error:', err.message);
    res.status(500).json({ message: err.message });
  }
};
