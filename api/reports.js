const express = require('express');
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

const router = express.Router();

// Get all reports
router.get('/', async (req, res) => {
  try {
    const reports = await sql`SELECT * FROM reports ORDER BY created_at DESC`;
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get report by ID
router.get('/:id', async (req, res) => {
  try {
    const reports = await sql`SELECT * FROM reports WHERE id = ${req.params.id}`;
    if (reports.length === 0) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.json(reports[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create report
router.post('/', async (req, res) => {
  try {
    const { office_id, report_type, content, date, created_by } = req.body;
    const maxIdResult = await sql`SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM reports`;
    const nextId = maxIdResult[0].next_id;
    
    await sql`
      INSERT INTO reports (id, office_id, report_type, content, date, created_by)
      VALUES (${nextId}, ${office_id}, ${report_type}, ${JSON.stringify(content)}, ${date}, ${created_by})
    `;
    
    res.status(201).json({ message: 'Report created' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update report
router.put('/:id', async (req, res) => {
  try {
    const { content } = req.body;
    await sql`UPDATE reports SET content = ${JSON.stringify(content)} WHERE id = ${req.params.id}`;
    res.json({ message: 'Report updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete report
router.delete('/:id', async (req, res) => {
  try {
    await sql`DELETE FROM reports WHERE id = ${req.params.id}`;
    res.json({ message: 'Report deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get report statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const result = await sql`
      SELECT 
        report_type,
        COUNT(*) as count
      FROM reports 
      GROUP BY report_type
    `;
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
