module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Test database connection
  let dbStatus = 'disconnected';
  try {
    const { neon } = require('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL);
    const result = await sql`SELECT 1 as test`;
    dbStatus = 'connected';
  } catch (err) {
    dbStatus = 'error: ' + err.message;
  }

  res.status(200).json({
    status: 'success',
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    environment: {
      DATABASE_URL: process.env.DATABASE_URL ? 'set (' + process.env.DATABASE_URL.substring(0, 20) + '...)' : 'not set',
      JWT_SECRET: process.env.JWT_SECRET ? 'set' : 'not set',
      NODE_ENV: process.env.NODE_ENV || 'development'
    },
    database: dbStatus
  });
};
