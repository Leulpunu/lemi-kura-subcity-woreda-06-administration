const { neon } = require('@neondatabase/serverless');

// Initialize the database connection
let sql;
try {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not defined in environment variables');
  } else {
    sql = neon(process.env.DATABASE_URL);
    console.log('Neon database connection initialized in api/offices/index.js');
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

  try {
    if (!sql) {
      return res.status(500).json({ message: 'Database connection not initialized. Please check DATABASE_URL environment variable.' });
    }
    
    const offices = await sql`SELECT * FROM offices ORDER BY name_en`;
    res.status(200).json(offices);
  } catch (err) {
    console.error('Offices error:', err.message);
    res.status(500).json({ message: err.message });
  }
};
