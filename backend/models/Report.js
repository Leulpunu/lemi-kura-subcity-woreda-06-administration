const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  officeId: { type: String, required: true },
  taskId: { type: String, required: true },
  kpiId: { type: String, required: true },
  value: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  userId: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
