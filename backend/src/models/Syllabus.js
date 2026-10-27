const mongoose = require('mongoose');

const syllabusSchema = new mongoose.Schema({
  syllabusCode: { type: String, required: true, unique: true }, // e.g., SYL001
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  semester: { type: Number },
  academicYear: { type: String },
  title: { type: String, required: true },
  description: { type: String },
  file: { type: String },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadDate: { type: Date, default: Date.now },
  status: { type: String, default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('Syllabus', syllabusSchema);
