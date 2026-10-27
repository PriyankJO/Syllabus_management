const Notification = require('../models/Notification');
const mongoose = require('mongoose');

exports.getNotifications = async (req, res) => {
  try {
    const userRole = (req.user.role || '').toUpperCase();
    const userDeptId = req.user.department?._id || req.user.department || null;

    let roleConditions = [
      { roleTarget: { $in: ['All', 'all', userRole, req.user.role] } },
      { roleTarget: new RegExp(`^(${userRole}|All)$`, 'i') }
    ];

    let filter = {
      $or: roleConditions
    };

    if (userRole !== 'ADMIN') {
      const deptConditions = [
        { departmentTarget: { $exists: false } },
        { departmentTarget: null }
      ];

      if (userDeptId && mongoose.Types.ObjectId.isValid(userDeptId)) {
        deptConditions.push({ departmentTarget: new mongoose.Types.ObjectId(userDeptId) });
      }

      filter.$and = [
        { $or: deptConditions }
      ];
    }

    const notifications = await Notification.find(filter).sort({ createdAt: -1, date: -1 });

    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createNotification = async (req, res) => {
  try {
    const data = { ...req.body };
    data.notificationCode = `NOT${Date.now()}`;
    
    // Normalize roleTarget
    if (data.roleTarget) {
      const normalizedRole = data.roleTarget.toUpperCase();
      if (['STUDENT', 'FACULTY', 'HOD', 'ADMIN'].includes(normalizedRole)) {
        data.roleTarget = normalizedRole;
      }
    }

    const deptId = data.departmentTarget || (req.user.role !== 'ADMIN' ? (req.user.department?._id || req.user.department) : null);
    if (deptId && String(deptId).match(/^[0-9a-fA-F]{24}$/)) {
      data.departmentTarget = deptId;
    } else {
      delete data.departmentTarget;
    }

    const notification = await Notification.create(data);
    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ success: false, message: 'Not found' });

    if (!notification.readBy.includes(req.user._id)) {
      notification.readBy.push(req.user._id);
      await notification.save();
    }

    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
