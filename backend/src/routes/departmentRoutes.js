const express = require('express');
const router = express.Router();
const { getDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment } = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getDepartments)
  .post(protect, authorize('ADMIN'), createDepartment);

router.route('/:id')
  .get(protect, getDepartmentById)
  .put(protect, authorize('ADMIN'), updateDepartment)
  .delete(protect, authorize('ADMIN'), deleteDepartment);

module.exports = router;
