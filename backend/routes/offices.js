const express = require('express');
const Office = require('../models/Office');

const router = express.Router();

// Get all offices
router.get('/', async (req, res) => {
  try {
    const offices = await Office.find();
    res.json(offices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get office by ID
router.get('/:id', async (req, res) => {
  try {
    const office = await Office.findOne({ id: req.params.id });
    if (!office) return res.status(404).json({ message: 'Office not found' });
    res.json(office);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
