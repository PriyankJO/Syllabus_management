const express = require('express');
const router = express.Router();
const { getDiscussions, createDiscussion, addReply, deleteDiscussion } = require('../controllers/discussionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getDiscussions)
  .post(protect, createDiscussion);

router.route('/:id')
  .delete(protect, deleteDiscussion);

router.route('/:id/replies')
  .post(protect, addReply);

module.exports = router;
