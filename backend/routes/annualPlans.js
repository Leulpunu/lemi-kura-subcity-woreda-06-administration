const express = require('express');
const router = express.Router();
const { sql } = require('../db');

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
  try {
    const users = await sql`SELECT * FROM users WHERE id = ${req.userId}`;
    if (users.length === 0 || users[0].role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  // For now, we'll use a simple token check
  // In production, use proper JWT verification
  req.userId = parseInt(token);
  next();
};

// Submit annual plan (users) - Using PostgreSQL
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { office_id, task_id, annual_targets, distributed_plans, year } = req.body;

    // Check if plan already exists and is approved
    const existingPlans = await sql`
      SELECT * FROM annual_plans 
      WHERE office_id = ${office_id} 
      AND task_id = ${task_id} 
      AND year = ${year}
      AND status IN ('submitted', 'approved')
    `;

    if (existingPlans.length > 0) {
      return res.status(400).json({
        message: 'Annual plan already submitted for this office/task/year'
      });
    }

    // Get next ID
    const maxIdResult = await sql`SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM annual_plans`;
    const nextId = maxIdResult[0].next_id;

    const result = await sql`
      INSERT INTO annual_plans (id, office_id, task_id, annual_targets, distributed_plans, year, submitted_by, status, created_at)
      VALUES (${nextId}, ${office_id}, ${task_id}, ${JSON.stringify(annual_targets)}, ${JSON.stringify(distributed_plans)}, ${year}, ${req.userId}, 'submitted', NOW())
      RETURNING *
    `;

    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Error creating annual plan:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get annual plan for specific office/task/year - Using PostgreSQL
router.get('/:officeId/:taskId/:year', authenticateToken, async (req, res) => {
  try {
    const { officeId, taskId, year } = req.params;
    
    const users = await sql`SELECT * FROM users WHERE id = ${req.userId}`;
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = users[0];
    const accessibleOffices = user.accessibleoffices || [];

    // Check if user has access to this office
    if (!accessibleOffices.includes(officeId) && user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const plans = await sql`
      SELECT * FROM annual_plans 
      WHERE office_id = ${officeId} AND task_id = ${taskId} AND year = ${year}
    `;

    if (plans.length === 0) {
      return res.status(404).json({ message: 'Annual plan not found' });
    }

    res.json(plans[0]);
  } catch (error) {
    console.error('Error fetching annual plan:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all annual plans for user's accessible offices - Using PostgreSQL
router.get('/', authenticateToken, async (req, res) => {
  try {
    const users = await sql`SELECT * FROM users WHERE id = ${req.userId}`;
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = users[0];
    const accessibleOffices = user.accessibleoffices || [];

    const plans = await sql`
      SELECT * FROM annual_plans 
      WHERE office_id = ANY(${accessibleOffices})
      ORDER BY year DESC, created_at DESC
    `;

    res.json(plans);
  } catch (error) {
    console.error('Error fetching annual plans:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get all pending annual plans - Using PostgreSQL
router.get('/admin/pending', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const plans = await sql`
      SELECT ap.*, u.name as submitted_by_name
      FROM annual_plans ap
      LEFT JOIN users u ON ap.submitted_by = u.id
      WHERE ap.status = 'submitted'
      ORDER BY ap.created_at ASC
    `;

    res.json(plans);
  } catch (error) {
    console.error('Error fetching pending plans:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Approve annual plan - Using PostgreSQL
router.put('/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await sql`
      UPDATE annual_plans 
      SET status = 'approved', approved_by = ${req.userId}, approved_at = NOW()
      WHERE id = ${req.params.id} AND status = 'submitted'
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: 'Annual plan not found or not in submitted status' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Error approving annual plan:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Reject annual plan - Using PostgreSQL
router.put('/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    
    const result = await sql`
      UPDATE annual_plans 
      SET status = 'rejected', approved_by = ${req.userId}, approved_at = NOW(), rejection_reason = ${rejectionReason}
      WHERE id = ${req.params.id} AND status = 'submitted'
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: 'Annual plan not found or not in submitted status' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Error rejecting annual plan:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Update approved annual plan - Using PostgreSQL
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { annual_targets, distributed_plans } = req.body;
    
    const result = await sql`
      UPDATE annual_plans 
      SET annual_targets = ${JSON.stringify(annual_targets)}, distributed_plans = ${JSON.stringify(distributed_plans)}
      WHERE id = ${req.params.id} AND status = 'approved'
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: 'Annual plan not found or not approved' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Error updating annual plan:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
