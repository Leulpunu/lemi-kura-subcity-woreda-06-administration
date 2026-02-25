const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { neon } = require('@neondatabase/serverless');

// Initialize the database connection
let sql;
try {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not defined in environment variables');
  } else {
    sql = neon(process.env.DATABASE_URL);
    console.log('Neon database connection initialized');
  }
} catch (err) {
  console.error('Failed to initialize Neon database:', err);
}

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    // Test database connection
    if (!sql) {
      console.error('Database connection not initialized');
      return res.status(500).json({ message: 'Database connection not initialized. Please check environment variables.' });
    }

    // Test the connection first
    try {
      await sql`SELECT 1`;
      console.log('Database connection test successful');
    } catch (dbErr) {
      console.error('Database connection test failed:', dbErr.message);
      return res.status(500).json({ message: 'Database connection failed: ' + dbErr.message });
    }

    console.log('Attempting login for username:', username);
    const users = await sql`SELECT * FROM users WHERE username = ${username}`;
    
    if (users.length === 0) {
      console.log('User not found:', username);
      return res.status(400).json({ message: 'User not found' });
    }

    const user = users[0];
    console.log('User found:', user.username, 'Role:', user.role);
    
    let isMatch = false;
    try {
      if (user.password.startsWith('$2')) {
        isMatch = await bcrypt.compare(password, user.password);
      } else {
        isMatch = password === user.password;
      }
    } catch (bcryptErr) {
      console.error('Password comparison error:', bcryptErr.message);
      return res.status(500).json({ message: 'Password verification failed' });
    }
    
    if (!isMatch) {
      console.log('Invalid credentials for user:', username);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    console.log('Login successful for user:', username);

    // Remove password from user object before sending
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({ token, user: userWithoutPassword });
  } catch (err) {
    console.error('Login error:', err.message);
    console.error('Stack:', err.stack);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};
