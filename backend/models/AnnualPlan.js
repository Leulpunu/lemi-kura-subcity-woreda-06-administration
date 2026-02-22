const mongoose = require('mongoose');

const annualPlanSchema = new mongoose.Schema({
  officeId: { type: String, required: true },
  taskId: { type: String, required: true },
  annualTargets: {
    type: Map,
    of: Number,
    required: true
  },
  distributedPlans: {
    monthly: { type: Map, of: Number },
    weekly: { type: Map, of: Number },
    daily: { type: Map, of: Number }
  },
  year: { type: Number, required: true },
  submittedBy: { type: Number, required: true },
  submittedAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'approved', 'rejected'],
    default: 'draft'
  },
  approvedBy: { type: Number },
  approvedAt: { type: Date },
  rejectionReason: { type: String }
}, { timestamps: true });

// Ensure only one plan per office/task/year
annualPlanSchema.index({ officeId: 1, taskId: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('AnnualPlan', annualPlanSchema);
