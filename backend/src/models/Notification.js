const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  notificationCode: { type: String, unique: true }, // NOT001
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, required: true }, // Material, Exam, General
  roleTarget: { type: String, default: 'All' }, // e.g., 'STUDENT', 'FACULTY', 'All'
  departmentTarget: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' }, // Null if all
  semesterTarget: { type: String, default: 'All' }, // 1, 2, 3... or 'All'
  date: { type: Date, default: Date.now },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
