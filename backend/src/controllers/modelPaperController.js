const ModelPaper = require('../models/ModelPaper');
const Notification = require('../models/Notification');
const { logActivity } = require('../utils/activityLogger');


exports.getModelPapers = async (req, res) => {
  try {
    const papers = await ModelPaper.find(req.query)
      .populate('subject')
      .populate('department')
      .populate('uploadedBy', 'name email');
    res.json({ success: true, data: papers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createModelPaper = async (req, res) => {
  try {
    const data = { ...req.body, uploadedBy: req.body.uploadedBy || req.user._id };
    data.paperCode = `PAPER${Date.now()}`;
    if (req.file) {
      data.file = `/uploads/${req.file.filename}`;
    }
    const paper = await ModelPaper.create(data);

    await Notification.create({
      notificationCode: `NOT${Date.now()}`,
      title: 'New Model Paper Added',
      message: `A new model paper "${data.title || 'document'}" has been uploaded.`,
      type: 'Model Paper',
      roleTarget: 'All'
    });

    await logActivity(req, 'Created', 'Model Paper', `Uploaded model paper: ${data.title || 'document'}`);

    const populated = await ModelPaper.findById(paper._id).populate('subject').populate('department').populate('uploadedBy', 'name email');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteModelPaper = async (req, res) => {
  try {
    const paper = await ModelPaper.findById(req.params.id);
    await ModelPaper.findByIdAndDelete(req.params.id);
    await logActivity(req, 'Deleted', 'Model Paper', `Deleted model paper: ${paper ? paper.title : ''}`);
    res.json({ success: true, message: 'Removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.downloadModelPaper = async (req, res) => {
  try {
    const paper = await ModelPaper.findById(req.params.id);
    if (!paper) return res.status(404).json({ success: false, message: 'Not found' });
    
    paper.downloadCount += 1;
    await paper.save();
    
    res.json({ success: true, data: { file: paper.file, downloadCount: paper.downloadCount } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateModelPaper = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.file = `/uploads/${req.file.filename}`;
    }
    const paper = await ModelPaper.findByIdAndUpdate(req.params.id, data, { new: true }).populate('subject').populate('department').populate('uploadedBy', 'name email');
    if (!paper) return res.status(404).json({ success: false, message: 'Not found' });

    await Notification.create({
      notificationCode: `NOT${Date.now()}`,
      title: 'Model Paper Updated',
      message: `The model paper "${paper.title || 'document'}" has been updated.`,
      type: 'Model Paper',
      roleTarget: 'All'
    });

    await logActivity(req, 'Updated', 'Model Paper', `Updated model paper: ${paper.title || 'document'}`);

    res.json({ success: true, data: paper });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
