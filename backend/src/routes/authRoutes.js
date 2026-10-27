const express = require('express');
const router = express.Router();
const { login, getMe, register, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', login);
router.post('/register', register);
router.get('/me', protect, getMe);
router.post('/change-password', protect, changePassword);

module.exports = router;
