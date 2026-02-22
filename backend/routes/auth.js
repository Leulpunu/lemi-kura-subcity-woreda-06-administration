const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Register (for admin)
router.post('/register', async (req, res) => {
  const { name, username, password, role, office, position_am, position_en, accessibleOffices } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      id: Date.now(), // Simple ID generation
      name,
      username,
      password: hashedPassword,
      role,
      office,
      position_am,
      position_en,
      accessibleOffices,
    });

    await user.save();
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
