const Syllabus = require('../models/Syllabus');
const Notification = require('../models/Notification');
const SyllabusUnit = require('../models/SyllabusUnit');
const Subject = require('../models/Subject');
const { logActivity } = require('../utils/activityLogger');


exports.getSyllabus = async (req, res) => {
  try {
    let query = { ...req.query };
    if (req.user.role === 'FACULTY') {
      const mySubjects = await Subject.find({ faculty: req.user._id }).select('_id');
      const mySubjectIds = mySubjects.map(s => s._id);
      query.$or = [
        { uploadedBy: req.user._id },
        { subject: { $in: mySubjectIds } }
      ];
    }
    const syllabuses = await Syllabus.find(query)
      .populate('subject', 'name code')
      .populate('department', 'name code')
      .populate('uploadedBy', 'name email');
    res.json({ success: true, data: syllabuses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSyllabusById = async (req, res) => {
  try {
    const syllabus = await Syllabus.findById(req.params.id)
      .populate('subject')
      .populate('department')
      .populate('uploadedBy');
    if (!syllabus) return res.status(404).json({ success: false, message: 'Syllabus not found' });
    res.json({ success: true, data: syllabus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createSyllabus = async (req, res) => {
  try {
    const data = { ...req.body, uploadedBy: req.user._id };
    if (req.user.role === 'HOD') {
      data.department = req.user.department;
    }
    if (req.file) {
      data.file = `/uploads/${req.file.filename}`;
    }
    const syllabus = await Syllabus.create(data);
    
    // Trigger Notification
    await Notification.create({
      notificationCode: `NOT${Date.now()}`,
      title: 'New Syllabus Added',
      message: `A new syllabus document has been uploaded for the department.`,
      type: 'Syllabus',
      roleTarget: 'All'
    });

    await logActivity(req, 'Created', 'Syllabus', `Uploaded syllabus document`);

    const populated = await Syllabus.findById(syllabus._id).populate('subject', 'name code').populate('department', 'name code').populate('uploadedBy', 'name email');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateSyllabus = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.file = `/uploads/${req.file.filename}`;
    }
    const syllabus = await Syllabus.findByIdAndUpdate(req.params.id, data, { new: true }).populate('subject', 'name code').populate('department', 'name code').populate('uploadedBy', 'name email');
    if (!syllabus) return res.status(404).json({ success: false, message: 'Not found' });
    
    // Trigger Notification
    await Notification.create({
      notificationCode: `NOT${Date.now()}`,
      title: 'Syllabus Updated',
      message: `A syllabus document has been updated.`,
      type: 'Syllabus',
      roleTarget: 'All'
    });
    
    await logActivity(req, 'Updated', 'Syllabus', `Updated syllabus document`);
    
    res.json({ success: true, data: syllabus });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteSyllabus = async (req, res) => {
  try {
    await Syllabus.findByIdAndDelete(req.params.id);
    await logActivity(req, 'Deleted', 'Syllabus', `Deleted syllabus document`);
    res.json({ success: true, message: 'Removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Unit methods
exports.getUnits = async (req, res) => {
  try {
    const units = await SyllabusUnit.find(req.query).populate('subject');
    res.json({ success: true, data: units });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createUnit = async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.unitCode) {
      data.unitCode = `UNIT${Date.now()}`;
    }
    data.createdBy = req.user._id;
    const unit = await SyllabusUnit.create(data);
    await logActivity(req, 'Created', 'SyllabusUnit', `Added syllabus unit: ${unit.unitTitle}`);
    res.status(201).json({ success: true, data: unit });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateUnit = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.status === 'Completed') {
      updateData.completionDate = Date.now();
    }
    const unit = await SyllabusUnit.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('subject');
    
    if (req.body.status === 'Completed') {
      await Notification.create({
        notificationCode: `NOT${Date.now()}`,
        title: `Syllabus Unit Completed`,
        message: `Unit ${unit.unitNumber} (${unit.unitTitle}) for subject ${unit.subject.name} was completed on ${new Date().toLocaleString()}.`,
        type: 'General',
        roleTarget: 'All',
        departmentTarget: unit.subject.department
      });
    }

    await logActivity(req, 'Updated', 'SyllabusUnit', `Updated syllabus unit: ${unit.unitTitle}`);
    res.json({ success: true, data: unit });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteUnit = async (req, res) => {
  try {
    await SyllabusUnit.findByIdAndDelete(req.params.id);
    await logActivity(req, 'Deleted', 'SyllabusUnit', `Deleted syllabus unit`);
    res.json({ success: true, message: 'Removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
