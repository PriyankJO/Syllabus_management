const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  materialCode: { type: String, unique: true }, // e.g. MAT001
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  semester: { type: Number },
  title: { type: String, required: true },
  description: { type: String },
  materialType: { type: String, required: true }, // PDF, PPT, Code, etc.
  file: { type: String },
  url: { type: String },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Material', materialSchema);
