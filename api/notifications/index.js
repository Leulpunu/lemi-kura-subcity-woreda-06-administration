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
      const notifications = await sql`SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50`;
      res.status(200).json(notifications);
    } else if (req.method === 'POST') {
      const { title, message, type, recipient, sender, office, priority, data, user_id } = req.body;
      const result = await sql`
        INSERT INTO notifications (title, message, type, recipient, sender, office, priority, data, user_id)
        VALUES (${title}, ${message}, ${type}, ${recipient}, ${sender}, ${office}, ${priority}, ${JSON.stringify(data)}, ${user_id})
        RETURNING *
      `;
      res.status(201).json(result[0]);
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (err) {
    console.error('Notifications error:', err);
    res.status(500).json({ message: err.message });
  }
};
