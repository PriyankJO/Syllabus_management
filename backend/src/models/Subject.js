const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  subjectCode: { type: String, required: true, unique: true }, // e.g. SUB001
  code: { type: String, required: true }, // e.g. ENG301
  name: { type: String, required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  semester: { type: Number, required: true },
  credits: { type: Number, required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('Subject', subjectSchema);
