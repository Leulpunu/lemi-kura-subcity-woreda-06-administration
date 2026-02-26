const express = require('express');
const jwt = require('jsonwebtoken');
const { sql } = require('../db');

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Get all reports - Using PostgreSQL (admin and subadmin can see all)
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Get user details
    const users = await sql`SELECT * FROM users WHERE id = ${req.userId}`;
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = users[0];
    const accessibleOffices = user.accessibleoffices || [];
    
    let reports;
    if (user.role === 'admin' || user.role === 'subadmin') {
      // Admin and subadmin can see all reports
      reports = await sql`
        SELECT r.*, u.name as user_name, u.username, o.name_en as office_name
        FROM reports r 
        LEFT JOIN users u ON r.reported_by = u.id
        LEFT JOIN offices o ON r.office_id = o.office_id
        ORDER BY r.date DESC
      `;
    } else {
      // Regular users can only see their accessible offices
      reports = await sql`
        SELECT r.*, u.name as user_name, u.username, o.name_en as office_name
        FROM reports r 
        LEFT JOIN users u ON r.reported_by = u.id
        LEFT JOIN offices o ON r.office_id = o.office_id
        WHERE r.office_id = ANY(${accessibleOffices})
        ORDER BY r.date DESC
      `;
    }
    
    res.json(reports);
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ message: err.message });
  }
});

// Create report - Using PostgreSQL
router.post('/', async (req, res) => {
  const { office_id, task_id, value, date, description, reported_by } = req.body;
  
  try {
    // Get next ID
    const maxIdResult = await sql`SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM reports`;
    const nextId = maxIdResult[0].next_id;
    
    const result = await sql`
      INSERT INTO reports (id, office_id, task_id, value, date, description, reported_by, created_at)
      VALUES (${nextId}, ${office_id}, ${task_id}, ${value}, ${date}, ${description}, ${reported_by}, NOW())
      RETURNING *
    `;
    
    res.status(201).json(result[0]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get reports by office - Using PostgreSQL
router.get('/office/:officeId', async (req, res) => {
  try {
    const reports = await sql`
      SELECT * FROM reports 
      WHERE office_id = ${req.params.officeId}
      ORDER BY date DESC
    `;
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get stats for dashboard - Using PostgreSQL
router.get('/stats/:timeFrame/:selectedOffice', async (req, res) => {
  try {
    const { timeFrame, selectedOffice } = req.params;
    const currentYear = new Date().getFullYear();
    
    // Calculate date range based on timeFrame
    let startDate, endDate;
    const now = new Date();
    
    switch (timeFrame) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'weekly':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        startDate = weekStart;
        endDate = new Date(weekStart.getDate() + 7);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      case 'yearly':
        startDate = new Date(currentYear, 0, 1);
        endDate = new Date(currentYear + 1, 0, 1);
        break;
      default:
        return res.status(400).json({ message: 'Invalid timeFrame' });
    }

    // Build query conditions
    let officeCondition = '';
    let officeParam = [];
    if (selectedOffice && selectedOffice !== 'all') {
      officeCondition = 'AND r.office_id = $2';
      officeParam = [selectedOffice];
    }

    // Get reports for the period
    const reportsQuery = await sql`
      SELECT r.*, o.name_en as office_name 
      FROM reports r
      LEFT JOIN offices o ON r.office_id = o.office_id
      WHERE r.date >= ${startDate.toISOString()} AND r.date < ${endDate.toISOString()}
      ${selectedOffice && selectedOffice !== 'all' ? sql`AND r.office_id = ${selectedOffice}` : sql``}
    `;

    // Get annual plans
    const plansQuery = await sql`
      SELECT * FROM annual_plans 
      WHERE year = ${currentYear}
      ${selectedOffice && selectedOffice !== 'all' ? sql`AND office_id = ${selectedOffice}` : sql``}
    `;

    // Calculate stats
    const officeSet = new Set();
    let totalReports = reportsQuery.length;
    let totalActual = 0;
    let totalTarget = 0;
    let performanceSum = 0;
    let performanceCount = 0;

    // Group reports by office and task
    const reportGroups = {};
    reportsQuery.forEach(report => {
      officeSet.add(report.office_id);
      const key = `${report.office_id}-${report.task_id}`;
      if (!reportGroups[key]) reportGroups[key] = [];
      reportGroups[key].push(report);
    });

    // Calculate for each office-task combination
    Object.keys(reportGroups).forEach(key => {
      const [officeId, taskId] = key.split('-');
      const groupReports = reportGroups[key];
      const actual = groupReports.reduce((sum, r) => sum + Number(r.value), 0);

      // Find corresponding annual plan
      const plan = plansQuery.find(p => p.office_id === officeId && p.task_id === taskId);
      let target = 0;
      if (plan && plan.distributed_plans) {
        const distributed = JSON.parse(plan.distributed_plans)[timeFrame];
        if (distributed) {
          target = Object.values(distributed).reduce((sum, val) => sum + val, 0);
        }
      }

      totalActual += actual;
      totalTarget += target;

      if (target > 0) {
        const performance = (actual / target) * 100;
        performanceSum += performance;
        performanceCount++;
      }
    });

    const activeOffices = officeSet.size;
    const avgPerformance = performanceCount > 0 ? performanceSum / performanceCount : 0;
    const completionRate = totalTarget > 0 ? (totalActual / totalTarget) * 100 : 0;

    res.json({
      totalReports,
      activeOffices,
      avgPerformance: Math.round(avgPerformance * 100) / 100,
      completionRate: Math.round(completionRate * 100) / 100
    });
  } catch (err) {
    console.error('Error calculating stats:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
