const express = require('express');
const router = express.Router();
const AnnualPlan = require('../models/AnnualPlan');
const User = require('../models/User');

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findOne({ id: req.userId });
    if (!user || user.role !== 'admin') {
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

// Submit annual plan (users)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { officeId, taskId, annualTargets, distributedPlans, year } = req.body;

    // Check if plan already exists and is approved
    const existingPlan = await AnnualPlan.findOne({
      officeId,
      taskId,
      year,
      status: { $in: ['submitted', 'approved'] }
    });

    if (existingPlan) {
      return res.status(400).json({
        message: 'Annual plan already submitted for this office/task/year'
      });
    }

    const annualPlan = new AnnualPlan({
      officeId,
      taskId,
      annualTargets,
      distributedPlans,
      year,
      submittedBy: req.userId,
      status: 'submitted'
    });

    await annualPlan.save();
    res.status(201).json(annualPlan);
  } catch (error) {
    console.error('Error creating annual plan:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get annual plan for specific office/task/year
router.get('/:officeId/:taskId/:year', authenticateToken, async (req, res) => {
  try {
    const { officeId, taskId, year } = req.params;
    const user = await User.findOne({ id: req.userId });

    // Check if user has access to this office
    if (!user.accessibleOffices.includes(officeId) && user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const plan = await AnnualPlan.findOne({ officeId, taskId, year });
    if (!plan) {
      return res.status(404).json({ message: 'Annual plan not found' });
    }

    res.json(plan);
  } catch (error) {
    console.error('Error fetching annual plan:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all annual plans for user's accessible offices
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ id: req.userId });
    const plans = await AnnualPlan.find({
      officeId: { $in: user.accessibleOffices }
    }).sort({ year: -1, createdAt: -1 });

    res.json(plans);
  } catch (error) {
    console.error('Error fetching annual plans:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get all pending annual plans
router.get('/admin/pending', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const plans = await AnnualPlan.find({ status: 'submitted' })
      .populate('submittedBy', 'name')
      .sort({ submittedAt: 1 });

    res.json(plans);
  } catch (error) {
    console.error('Error fetching pending plans:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Approve annual plan
router.put('/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const plan = await AnnualPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Annual plan not found' });
    }

    if (plan.status !== 'submitted') {
      return res.status(400).json({ message: 'Plan is not in submitted status' });
    }

    plan.status = 'approved';
    plan.approvedBy = req.userId;
    plan.approvedAt = new Date();
    await plan.save();

    res.json(plan);
  } catch (error) {
    console.error('Error approving annual plan:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Reject annual plan
router.put('/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const plan = await AnnualPlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({ message: 'Annual plan not found' });
    }

    if (plan.status !== 'submitted') {
      return res.status(400).json({ message: 'Plan is not in submitted status' });
    }

    plan.status = 'rejected';
    plan.approvedBy = req.userId;
    plan.approvedAt = new Date();
    plan.rejectionReason = rejectionReason;
    await plan.save();

    res.json(plan);
  } catch (error) {
    console.error('Error rejecting annual plan:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Update approved annual plan
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { annualTargets, distributedPlans } = req.body;
    const plan = await AnnualPlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({ message: 'Annual plan not found' });
    }

    // Only allow updates for approved plans
    if (plan.status !== 'approved') {
      return res.status(400).json({ message: 'Can only update approved plans' });
    }

    plan.annualTargets = annualTargets;
    plan.distributedPlans = distributedPlans;
    await plan.save();

    res.json(plan);
  } catch (error) {
    console.error('Error updating annual plan:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
