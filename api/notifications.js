const express = require('express');
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

const router = express.Router();

// Get all notifications
router.get('/', async (req, res) => {
  try {
    const notifications = await sql`SELECT * FROM notifications ORDER BY created_at DESC`;
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get unread notifications
router.get('/unread', async (req, res) => {
  try {
    const notifications = await sql`SELECT * FROM notifications WHERE is_read = false ORDER BY created_at DESC`;
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create notification
router.post('/', async (req, res) => {
  try {
    const { title, message, type, office_id, created_by } = req.body;
    const maxIdResult = await sql`SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM notifications`;
    const nextId = maxIdResult[0].next_id;
    
    await sql`
      INSERT INTO notifications (id, title, message, type, office_id, created_by)
      VALUES (${nextId}, ${title}, ${message}, ${type}, ${office_id}, ${created_by})
    `;
    
    res.status(201).json({ message: 'Notification created' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    await sql`UPDATE notifications SET is_read = true WHERE id = ${req.params.id}`;
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete notification
router.delete('/:id', async (req, res) => {
  try {
    await sql`DELETE FROM notifications WHERE id = ${req.params.id}`;
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
