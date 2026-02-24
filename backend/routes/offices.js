const express = require('express');
const { sql } = require('../db');

const router = express.Router();

// Get all offices - Using PostgreSQL
router.get('/', async (req, res) => {
  try {
    const offices = await sql`SELECT * FROM offices ORDER BY name_en`;
    res.json(offices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get office by ID - Using PostgreSQL
router.get('/:id', async (req, res) => {
  try {
    const offices = await sql`SELECT * FROM offices WHERE office_id = ${req.params.id}`;
    
    if (offices.length === 0) {
      return res.status(404).json({ message: 'Office not found' });
    }
    
    res.json(offices[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
