const mongoose = require('mongoose');

const syllabusUnitSchema = new mongoose.Schema({
  unitCode: { type: String, unique: true }, // e.g. UNIT001
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  unitNumber: { type: Number, required: true },
  unitTitle: { type: String, required: true },
  topics: { type: String },
  status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
  completionDate: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('SyllabusUnit', syllabusUnitSchema);
