const express = require('express');
const router = express.Router();
const { sql } = require('../db');

// Get all notifications - Using PostgreSQL
router.get('/', async (req, res) => {
  try {
    const notifications = await sql`SELECT * FROM notifications ORDER BY created_at DESC`;
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get notifications for a specific user - Using PostgreSQL
router.get('/user/:userId', async (req, res) => {
  try {
    const notifications = await sql`
      SELECT * FROM notifications 
      WHERE user_id = ${req.params.userId}
      ORDER BY created_at DESC
    `;
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new notification - Using PostgreSQL
router.post('/', async (req, res) => {
  const { title, message, type, recipient, sender, office, isRead, priority, data, user_id } = req.body;
  
  try {
    // Get next ID
    const maxIdResult = await sql`SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM notifications`;
    const nextId = maxIdResult[0].next_id;
    
    const result = await sql`
      INSERT INTO notifications (id, title, message, type, recipient, sender, office, "isRead", priority, data, user_id, created_at)
      VALUES (${nextId}, ${title}, ${message}, ${type}, ${recipient}, ${sender}, ${office}, ${isRead || false}, ${priority || 'medium'}, ${JSON.stringify(data || {})}, ${user_id}, NOW())
      RETURNING *
    `;
    
    res.status(201).json(result[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Mark notification as read - Using PostgreSQL
router.patch('/:id/read', async (req, res) => {
  try {
    const result = await sql`
      UPDATE notifications 
      SET "isRead" = true
      WHERE id = ${req.params.id}
      RETURNING *
    `;
    
    if (result.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a notification - Using PostgreSQL
router.delete('/:id', async (req, res) => {
  try {
    const result = await sql`
      DELETE FROM notifications 
      WHERE id = ${req.params.id}
      RETURNING *
    `;
    
    if (result.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
