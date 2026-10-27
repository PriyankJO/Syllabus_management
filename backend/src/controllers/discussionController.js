const Discussion = require('../models/Discussion');

exports.getDiscussions = async (req, res) => {
  try {
    const discussions = await Discussion.find(req.query)
      .populate('subject')
      .populate('createdBy', 'name email')
      .populate('replies.createdBy', 'name email');
    res.json({ success: true, data: discussions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createDiscussion = async (req, res) => {
  try {
    const discussionData = {
      ...req.body,
      subject: req.body.subjectId || req.body.subject,
      createdBy: req.user._id,
      discussionCode: `DIS-${Date.now()}`
    };
    const discussion = await Discussion.create(discussionData);
    
    const populatedDiscussion = await Discussion.findById(discussion._id)
      .populate('subject')
      .populate('createdBy', 'name email');
      
    res.status(201).json({ success: true, data: populatedDiscussion });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.addReply = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ success: false, message: 'Not found' });

    discussion.replies.push({ 
      message: req.body.message || req.body.text, 
      createdBy: req.user._id 
    });
    await discussion.save();
    
    const updatedDiscussion = await Discussion.findById(req.params.id)
      .populate('subject')
      .populate('createdBy', 'name email')
      .populate('replies.createdBy', 'name email');
    
    res.json({ success: true, data: updatedDiscussion });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteDiscussion = async (req, res) => {
  try {
    await Discussion.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
