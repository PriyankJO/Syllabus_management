const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['Created', 'Updated', 'Deleted', 'Logged In', 'Generated', 'Analyzed', 'Started', 'Submitted', 'Other']
  },
  entityType: {
    type: String,
    required: true,
    enum: ['Department', 'User', 'Subject', 'System', 'Quiz', 'Syllabus', 'Material', 'ModelPaper']
  },
  details: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
