const Subject = require('../models/Subject');
const { logActivity } = require('../utils/activityLogger');

exports.getSubjects = async (req, res) => {
  try {
    let query = {};
    if (req.query.department) query.department = req.query.department;
    if (req.query.semester) query.semester = req.query.semester;

    const subjects = await Subject.find(query)
      .populate('department', 'name code')
      .populate('faculty', 'name email');
    res.json({ success: true, data: subjects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id)
      .populate('department', 'name code')
      .populate('faculty', 'name email');
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });
    res.json({ success: true, data: subject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createSubject = async (req, res) => {
  try {
    if (req.user.role === 'HOD') {
      req.body.department = req.user.department;
    }
    const subject = await Subject.create(req.body);
    const populatedSubject = await Subject.findById(subject._id).populate('department', 'name code').populate('faculty', 'name email');
    
    await logActivity(req, 'Created', 'Subject', `Created subject: ${subject.name}`);
    
    res.status(201).json({ success: true, data: populatedSubject });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('department', 'name code').populate('faculty', 'name email');
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });
    
    await logActivity(req, 'Updated', 'Subject', `Updated subject: ${subject.name}`);
    
    res.json({ success: true, data: subject });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });
    
    await logActivity(req, 'Deleted', 'Subject', `Deleted subject: ${subject.name}`);
    
    res.json({ success: true, message: 'Subject removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
