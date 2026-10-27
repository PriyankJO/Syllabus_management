const ActivityLog = require('../models/ActivityLog');

const logActivity = async (req, action, entityType, details) => {
  try {
    const userId = req.user ? req.user._id : null;
    const departmentId = req.user ? req.user.department : null;
    await ActivityLog.create({
      action,
      entityType,
      details,
      user: userId,
      department: departmentId
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

module.exports = { logActivity };
