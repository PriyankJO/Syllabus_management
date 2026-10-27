const express = require('express');
const router = express.Router();
const { 
  analyzeMaterial, generateQuiz, createQuiz, updateQuiz, deleteQuiz, 
  getQuizzes, getQuizById, startQuizAttempt, submitQuizAttempt, getQuizAttempts 
} = require('../controllers/quizController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
  .get(protect, getQuizzes)
  .post(protect, createQuiz);

router.route('/analyze')
  .post(protect, upload.single('file'), analyzeMaterial);

router.route('/generate')
  .post(protect, generateQuiz);

router.route('/attempts')
  .get(protect, getQuizAttempts);

router.route('/:id')
  .get(protect, getQuizById)
  .put(protect, authorize('ADMIN', 'HOD', 'FACULTY'), updateQuiz)
  .delete(protect, authorize('ADMIN', 'HOD', 'FACULTY'), deleteQuiz);

router.route('/:id/start')
  .post(protect, authorize('STUDENT'), startQuizAttempt);

router.route('/:id/submit')
  .post(protect, authorize('STUDENT'), submitQuizAttempt);

module.exports = router;
