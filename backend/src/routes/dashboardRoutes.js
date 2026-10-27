const express = require('express');
const router = express.Router();
const { getAdminDashboard, getHodDashboard, getFacultyDashboard, getStudentDashboard } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/admin', protect, authorize('ADMIN'), getAdminDashboard);
router.get('/hod', protect, authorize('HOD', 'ADMIN'), getHodDashboard);
router.get('/faculty', protect, authorize('FACULTY', 'HOD', 'ADMIN'), getFacultyDashboard);
router.get('/student', protect, authorize('STUDENT', 'FACULTY', 'HOD', 'ADMIN'), getStudentDashboard);

module.exports = router;
