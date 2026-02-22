const express = require('express');
const Report = require('../models/Report');

const router = express.Router();

// Get reports
router.get('/', async (req, res) => {
  try {
    const reports = await Report.find().populate('userId');
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create report
router.post('/', async (req, res) => {
  const report = new Report(req.body);
  try {
    const newReport = await report.save();
    res.status(201).json(newReport);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get reports by office
router.get('/office/:officeId', async (req, res) => {
  try {
    const reports = await Report.find({ officeId: req.params.officeId });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get stats for dashboard
router.get('/stats/:timeFrame/:selectedOffice', async (req, res) => {
  try {
    const { timeFrame, selectedOffice } = req.params;
    const currentYear = new Date().getFullYear();
    let dateFilter = {};

    // Set date filter based on timeFrame
    const now = new Date();
    switch (timeFrame) {
      case 'daily':
        dateFilter = {
          date: {
            $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
          }
        };
        break;
      case 'weekly':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
        dateFilter = {
          date: { $gte: weekStart, $lt: weekEnd }
        };
        break;
      case 'monthly':
        dateFilter = {
          date: {
            $gte: new Date(now.getFullYear(), now.getMonth(), 1),
            $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1)
          }
        };
        break;
      case 'yearly':
        dateFilter = {
          date: {
            $gte: new Date(currentYear, 0, 1),
            $lt: new Date(currentYear + 1, 0, 1)
          }
        };
        break;
      default:
        return res.status(400).json({ message: 'Invalid timeFrame' });
    }

    // Get reports for the period
    let reportQuery = { ...dateFilter };
    if (selectedOffice && selectedOffice !== 'all') {
      reportQuery.officeId = selectedOffice;
    }
    const reports = await Report.find(reportQuery);

    // Get annual plans for current year
    let planQuery = { year: currentYear };
    if (selectedOffice && selectedOffice !== 'all') {
      planQuery.officeId = selectedOffice;
    }
    const annualPlans = await require('../models/AnnualPlan').find(planQuery);

    // Calculate stats
    const officeSet = new Set();
    let totalReports = reports.length;
    let totalActual = 0;
    let totalTarget = 0;
    let performanceSum = 0;
    let performanceCount = 0;

    // Group reports by office and task
    const reportGroups = {};
    reports.forEach(report => {
      officeSet.add(report.officeId);
      const key = `${report.officeId}-${report.taskId}`;
      if (!reportGroups[key]) reportGroups[key] = [];
      reportGroups[key].push(report);
    });

    // Calculate for each office-task combination
    Object.keys(reportGroups).forEach(key => {
      const [officeId, taskId] = key.split('-');
      const groupReports = reportGroups[key];
      const actual = groupReports.reduce((sum, r) => sum + r.value, 0);

      // Find corresponding annual plan
      const plan = annualPlans.find(p => p.officeId === officeId && p.taskId === taskId);
      let target = 0;
      if (plan && plan.distributedPlans) {
        const distributed = plan.distributedPlans[timeFrame];
        if (distributed) {
          // Sum all targets for this timeFrame
          target = Array.from(distributed.values()).reduce((sum, val) => sum + val, 0);
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
