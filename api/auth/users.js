const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.DATABASE_URL;
const sql = DATABASE_URL ? neon(DATABASE_URL) : null;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!sql) {
    return res.status(500).json({ message: 'Database not configured. Please set DATABASE_URL environment variable.' });
  }

  try {
    const users = await sql`
      SELECT
        id,
        name,
        username,
        role,
        office,
        position_am,
        position_en,
        "accessibleOffices"
      FROM users
      ORDER BY id ASC
    `;

    return res.status(200).json(users);
  } catch (err) {
    console.error('Users fetch error:', err);
    return res.status(500).json({ message: 'Server error: ' + err.message });
  }
};
