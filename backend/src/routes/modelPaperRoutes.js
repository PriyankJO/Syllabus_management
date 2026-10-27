const express = require('express');
const router = express.Router();
const { getModelPapers, createModelPaper, deleteModelPaper, downloadModelPaper, updateModelPaper } = require('../controllers/modelPaperController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
  .get(protect, getModelPapers)
  .post(protect, authorize('ADMIN', 'HOD', 'FACULTY'), upload.single('file'), createModelPaper);

router.route('/:id')
  .put(protect, authorize('ADMIN', 'HOD', 'FACULTY'), upload.single('file'), updateModelPaper)
  .delete(protect, authorize('ADMIN', 'HOD', 'FACULTY'), deleteModelPaper);

router.route('/:id/download')
  .get(protect, downloadModelPaper);

module.exports = router;
