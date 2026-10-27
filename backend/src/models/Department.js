const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  departmentCode: { type: String, required: true, unique: true }, // e.g. DEP001
  name: { type: String, required: true },
  code: { type: String, required: true }, // e.g. BAENG
  hod: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);
