const mongoose = require('mongoose');

const modelPaperSchema = new mongoose.Schema({
  paperCode: { type: String, unique: true }, // e.g. PAPER001
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  semester: { type: Number },
  academicYear: { type: String },
  examYear: { type: String },
  title: { type: String, required: true },
  paperType: { type: String, required: true },
  file: { type: String },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadDate: { type: Date, default: Date.now },
  downloadCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('ModelPaper', modelPaperSchema);
