const express = require('express');
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

const router = express.Router();

// Get all annual plans
router.get('/', async (req, res) => {
  try {
    const plans = await sql`SELECT * FROM annual_plans ORDER BY year DESC, created_at DESC`;
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get annual plan by ID
router.get('/:id', async (req, res) => {
  try {
    const plans = await sql`SELECT * FROM annual_plans WHERE id = ${req.params.id}`;
    if (plans.length === 0) {
      return res.status(404).json({ message: 'Annual plan not found' });
    }
    res.json(plans[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get annual plans by year
router.get('/year/:year', async (req, res) => {
  try {
    const plans = await sql`SELECT * FROM annual_plans WHERE year = ${req.params.year}`;
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create annual plan
router.post('/', async (req, res) => {
  try {
    const { office_id, year, targets, budget, description, created_by } = req.body;
    const maxIdResult = await sql`SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM annual_plans`;
    const nextId = maxIdResult[0].next_id;
    
    await sql`
      INSERT INTO annual_plans (id, office_id, year, targets, budget, description, created_by)
      VALUES (${nextId}, ${office_id}, ${year}, ${JSON.stringify(targets)}, ${budget}, ${description}, ${created_by})
    `;
    
    res.status(201).json({ message: 'Annual plan created' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update annual plan
router.put('/:id', async (req, res) => {
  try {
    const { targets, budget, description } = req.body;
    await sql`
      UPDATE annual_plans 
      SET targets = ${JSON.stringify(targets)}, budget = ${budget}, description = ${description}
      WHERE id = ${req.params.id}
    `;
    res.json({ message: 'Annual plan updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete annual plan
router.delete('/:id', async (req, res) => {
  try {
    await sql`DELETE FROM annual_plans WHERE id = ${req.params.id}`;
    res.json({ message: 'Annual plan deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
