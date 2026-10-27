const express = require('express');
const router = express.Router();
const { getMaterials, createMaterial, deleteMaterial, updateMaterial, downloadMaterial } = require('../controllers/materialController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
  .get(protect, getMaterials)
  .post(protect, authorize('ADMIN', 'HOD', 'FACULTY'), upload.single('file'), createMaterial);

router.route('/:id/download')
  .get(protect, downloadMaterial);

router.route('/:id')
  .put(protect, authorize('ADMIN', 'HOD', 'FACULTY'), upload.single('file'), updateMaterial)
  .delete(protect, authorize('ADMIN', 'HOD', 'FACULTY'), deleteMaterial);

module.exports = router;
