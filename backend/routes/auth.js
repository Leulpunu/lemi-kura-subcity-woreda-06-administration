const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sql } = require('../db');

const router = express.Router();

// Login - Using PostgreSQL
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const users = await sql`SELECT * FROM users WHERE username = ${username}`;
    
    if (users.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const user = users[0];
    
    // For plain text passwords (from frontend data), compare directly
    // For hashed passwords, use bcrypt.compare
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

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Register - Using PostgreSQL
router.post('/register', async (req, res) => {
  const { name, username, password, role, office, position_am, position_en, accessibleOffices } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Get the next ID
    const maxIdResult = await sql`SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM users`;
    const nextId = maxIdResult[0].next_id;
    
    await sql`
      INSERT INTO users (id, name, username, password, role, office, position_am, position_en, "accessibleOffices")
      VALUES (${nextId}, ${name}, ${username}, ${hashedPassword}, ${role}, ${office}, ${position_am}, ${position_en}, ${JSON.stringify(accessibleOffices || [])})
    `;
    
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all users - Using PostgreSQL
router.get('/users', async (req, res) => {
  try {
    const users = await sql`SELECT id, name, username, role, office, position_am, position_en FROM users`;
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Check username availability
router.get('/check-username/:username', async (req, res) => {
  const { username } = req.params;
  
  try {
    const users = await sql`SELECT id FROM users WHERE username = ${username}`;
    res.json({ available: users.length === 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Change username
router.post('/change-username', async (req, res) => {
  const { userId, newUsername } = req.body;
  
  try {
    // Check if username is already taken
    const existingUsers = await sql`SELECT id FROM users WHERE username = ${newUsername} AND id != ${userId}`;
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Username is already taken' });
    }
    
    // Update username
    await sql`UPDATE users SET username = ${newUsername} WHERE id = ${userId}`;
    
    // Get updated user
    const users = await sql`SELECT id, name, username, role, office, position_am, position_en FROM users WHERE id = ${userId}`;
    
    res.json({ message: 'Username changed successfully', user: users[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
