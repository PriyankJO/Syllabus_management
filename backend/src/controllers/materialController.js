const Material = require('../models/Material');
const Notification = require('../models/Notification');
const { logActivity } = require('../utils/activityLogger');


exports.getMaterials = async (req, res) => {
  try {
    let query = { ...req.query };
    if (req.user.role === 'HOD') {
      query.department = req.user.department;
    } else if (req.user.role === 'STUDENT' && req.user.department) {
      query.department = req.user.department;
    }
    const materials = await Material.find(query)
      .populate('subject')
      .populate('department')
      .populate('uploadedBy', 'name email');
    res.json({ success: true, data: materials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createMaterial = async (req, res) => {
  try {
    const data = { ...req.body, uploadedBy: req.body.uploadedBy || req.user._id };
    if (req.user.role === 'HOD') {
      data.department = req.user.department;
    }
    data.materialCode = `MAT${Date.now()}`;
    if (req.file) {
      data.file = `/uploads/${req.file.filename}`;
    }
    const material = await Material.create(data);

    await Notification.create({
      notificationCode: `NOT${Date.now()}`,
      title: 'New Study Material Added',
      message: `A new study material "${data.title || 'document'}" has been uploaded.`,
      type: 'Study Material',
      roleTarget: 'All'
    });

    await logActivity(req, 'Created', 'Material', `Uploaded study material: ${data.title || 'document'}`);

    const populated = await Material.findById(material._id).populate('subject').populate('department').populate('uploadedBy', 'name email');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    await Material.findByIdAndDelete(req.params.id);
    await logActivity(req, 'Deleted', 'Material', `Deleted study material: ${material ? material.title : ''}`);
    res.json({ success: true, message: 'Removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateMaterial = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.file = `/uploads/${req.file.filename}`;
    }
    const material = await Material.findByIdAndUpdate(req.params.id, data, { new: true }).populate('subject').populate('department').populate('uploadedBy', 'name email');
    if (!material) return res.status(404).json({ success: false, message: 'Not found' });

    await Notification.create({
      notificationCode: `NOT${Date.now()}`,
      title: 'Study Material Updated',
      message: `The study material "${material.title || 'document'}" has been updated.`,
      type: 'Study Material',
      roleTarget: 'All'
    });

    await logActivity(req, 'Updated', 'Material', `Updated study material: ${material.title || 'document'}`);

    res.json({ success: true, data: material });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.downloadMaterial = async (req, res) => {
  try {
    const path = require('path');
    const fs = require('fs');
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ success: false, message: 'Material not found' });

    if (!material.file) {
      return res.status(400).json({ success: false, message: 'No file attached to this material' });
    }

    const relativePath = material.file.replace(/^\/uploads\//, '');
    const filePath = path.join(__dirname, '../../uploads', relativePath);

    if (fs.existsSync(filePath)) {
      const ext = path.extname(relativePath) || '.pdf';
      const safeName = (material.title || 'material').replace(/[^a-zA-Z0-9_\-\s]/g, '').trim() || 'material';
      return res.download(filePath, `${safeName}${ext}`);
    } else {
      return res.status(404).json({ success: false, message: 'File not found on server' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

