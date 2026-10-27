const Department = require('../models/Department');
const { logActivity } = require('../utils/activityLogger');

exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().populate('hod', 'name email');
    res.json({ success: true, data: departments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id).populate('hod', 'name email');
    if (!department) return res.status(404).json({ success: false, message: 'Department not found' });
    res.json({ success: true, data: department });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createDepartment = async (req, res) => {
  try {
    const department = await Department.create(req.body);
    const populatedDept = await Department.findById(department._id).populate('hod', 'name email');
    
    await logActivity(req, 'Created', 'Department', `Created department: ${department.name}`);
    
    res.status(201).json({ success: true, data: populatedDept });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('hod', 'name email');
    if (!department) return res.status(404).json({ success: false, message: 'Department not found' });
    
    await logActivity(req, 'Updated', 'Department', `Updated department: ${department.name}`);
    
    res.json({ success: true, data: department });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) return res.status(404).json({ success: false, message: 'Department not found' });
    
    await logActivity(req, 'Deleted', 'Department', `Deleted department: ${department.name}`);
    
    res.json({ success: true, message: 'Department removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
