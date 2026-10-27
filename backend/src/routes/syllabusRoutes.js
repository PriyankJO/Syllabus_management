const express = require('express');
const router = express.Router();
const { 
  getSyllabus, getSyllabusById, createSyllabus, updateSyllabus, deleteSyllabus,
  getUnits, createUnit, updateUnit, deleteUnit
} = require('../controllers/syllabusController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
  .get(protect, getSyllabus)
  .post(protect, authorize('ADMIN', 'HOD', 'FACULTY'), upload.single('file'), createSyllabus);

router.route('/units')
  .get(protect, getUnits)
  .post(protect, authorize('ADMIN', 'HOD', 'FACULTY'), createUnit);

router.route('/units/:id')
  .put(protect, authorize('ADMIN', 'HOD', 'FACULTY'), updateUnit)
  .delete(protect, authorize('ADMIN', 'HOD', 'FACULTY'), deleteUnit);

router.route('/:id')
  .get(protect, getSyllabusById)
  .put(protect, authorize('ADMIN', 'HOD', 'FACULTY'), upload.single('file'), updateSyllabus)
  .delete(protect, authorize('ADMIN', 'HOD', 'FACULTY'), deleteSyllabus);

module.exports = router;
