const { neon } = require('@neondatabase/serverless');

// Initialize the database connection
let sql;
try {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not defined in environment variables');
  } else {
    sql = neon(process.env.DATABASE_URL);
    console.log('Neon database connection initialized in api/test.js');
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
      return res.status(500).json({ 
        status: 'error',
        message: 'Database connection not initialized. Please check DATABASE_URL environment variable.',
        environment: {
          DATABASE_URL: process.env.DATABASE_URL ? 'set (hidden)' : 'not set'
        }
      });
    }

    // Test the database connection
    const result = await sql`SELECT 1 as test`;
    
    // Try to get user count
    const userCount = await sql`SELECT COUNT(*) as count FROM users`;
    
    res.status(200).json({
      status: 'success',
      message: 'Database connection successful!',
      database: {
        connected: true,
        testQuery: result,
        userCount: userCount[0].count
      },
      environment: {
        nodeVersion: process.version,
        vercelEnv: process.env.VERCEL_ENV || 'not detected'
      }
    });
  } catch (err) {
    console.error('Test endpoint error:', err.message);
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed: ' + err.message,
      environment: {
        DATABASE_URL: process.env.DATABASE_URL ? 'set (hidden)' : 'not set'
      }
    });
  }
};
