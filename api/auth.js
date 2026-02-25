const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

const router = express.Router();

// Add CORS headers middleware
router.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const users = await sql`SELECT * FROM users WHERE username = ${username}`;
    
    if (users.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const user = users[0];
    
    let isMatch = false;
    if (user.password.startsWith('$2')) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = password === user.password;
    }
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

    // Don't return the password
    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// Register
router.post('/register', async (req, res) => {
  const { name, username, password, role, office, position_am, position_en, accessibleOffices } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const maxIdResult = await sql`SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM users`;
    const nextId = maxIdResult[0].next_id;
    
    await sql`
      INSERT INTO users (id, name, username, password, role, office, position_am, position_en, "accessibleOffices")
      VALUES (${nextId}, ${name}, ${username}, ${hashedPassword}, ${role}, ${office}, ${position_am}, ${position_en}, ${JSON.stringify(accessibleOffices || [])})
    `;
    
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await sql`SELECT id, name, username, role, office, position_am, position_en FROM users`;
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
