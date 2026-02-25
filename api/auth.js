const express = require('express');
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
    console.log('Neon database connection initialized in api/auth.js');
  }
} catch (err) {
  console.error('Failed to initialize Neon database:', err);
}

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { name, username, password, role, office, position_am, position_en, accessibleOffices } = req.body;

  if (!name || !username || !password) {
    return res.status(400).json({ message: 'Name, username, and password are required' });
  }

  try {
    if (!sql) {
      return res.status(500).json({ message: 'Database connection not initialized' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const maxIdResult = await sql`SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM users`;
    const nextId = maxIdResult[0].next_id;
    
    await sql`
      INSERT INTO users (id, name, username, password, role, office, position_am, position_en, "accessibleOffices")
      VALUES (${nextId}, ${name}, ${username}, ${hashedPassword}, ${role || 'user'}, ${office}, ${position_am}, ${position_en}, ${JSON.stringify(accessibleOffices || [])})
    `;
    
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (!sql) {
      return res.status(500).json({ message: 'Database connection not initialized' });
    }
    
    const users = await sql`SELECT id, name, username, role, office, position_am, position_en FROM users`;
    res.json(users);
  } catch (err) {
    console.error('Get users error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
