const mongoose = require('mongoose');

const kpiSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name_am: { type: String, required: true },
  name_en: { type: String, required: true },
  unit: { type: String, required: true },
  target: { type: Number, required: true },
});

const taskSchema = new mongoose.Schema({
  id: { type: String, required: true },
  number_am: { type: String, required: true },
  number_en: { type: String, required: true },
  title_am: { type: String, required: true },
  title_en: { type: String, required: true },
  kpis: [kpiSchema],
});

const officeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name_am: { type: String, required: true },
  name_en: { type: String, required: true },
  icon: { type: String, required: true },
  color: { type: String, required: true },
  tasks: [taskSchema],
}, { timestamps: true });

module.exports = mongoose.model('Office', officeSchema);
