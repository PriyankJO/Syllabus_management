const express = require('express');
const router = express.Router();
const { getUsers, getUserById, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, authorize('ADMIN', 'HOD', 'FACULTY'), getUsers)
  .post(protect, authorize('ADMIN', 'HOD', 'FACULTY'), createUser);

router.route('/:id')
  .get(protect, authorize('ADMIN', 'HOD', 'FACULTY', 'STUDENT'), getUserById)
  .put(protect, authorize('ADMIN', 'HOD', 'FACULTY', 'STUDENT'), updateUser)
  .delete(protect, authorize('ADMIN', 'HOD', 'FACULTY'), deleteUser);

module.exports = router;
