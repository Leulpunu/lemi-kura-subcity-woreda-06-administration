const express = require('express');
const bcrypt = require('bcryptjs');
const { sql } = require('../db');

const router = express.Router();

// Change password
router.post('/change-password', async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;

  try {
    // Get user from database
    const users = await sql`SELECT * FROM users WHERE id = ${userId}`;
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];
    
    // Verify current password
    let isMatch = false;
    if (user.password.startsWith('$2')) {
      isMatch = await bcrypt.compare(currentPassword, user.password);
    } else {
      isMatch = currentPassword === user.password;
    }
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await sql`UPDATE users SET password = ${hashedPassword} WHERE id = ${userId}`;
    
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
