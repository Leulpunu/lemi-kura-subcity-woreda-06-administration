const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['admin', 'user'] },
  office: { type: String, required: true },
  position_am: { type: String, required: true },
  position_en: { type: String, required: true },
  accessibleOffices: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
