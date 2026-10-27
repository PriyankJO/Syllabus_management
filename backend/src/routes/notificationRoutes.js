const express = require('express');
const router = express.Router();
const { getNotifications, createNotification, markAsRead, deleteNotification } = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getNotifications)
  .post(protect, authorize('ADMIN', 'HOD', 'FACULTY'), createNotification);

router.route('/:id')
  .delete(protect, authorize('ADMIN', 'HOD'), deleteNotification);

router.route('/:id/read')
  .patch(protect, markAsRead);

module.exports = router;
