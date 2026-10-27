const express = require('express');
const router = express.Router();
const { getSubjects, getSubjectById, createSubject, updateSubject, deleteSubject } = require('../controllers/subjectController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getSubjects)
  .post(protect, authorize('ADMIN', 'HOD'), createSubject);

router.route('/:id')
  .get(protect, getSubjectById)
  .put(protect, authorize('ADMIN', 'HOD'), updateSubject)
  .delete(protect, authorize('ADMIN', 'HOD'), deleteSubject);

module.exports = router;
