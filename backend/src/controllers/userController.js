const User = require('../models/User');
const { logActivity } = require('../utils/activityLogger');

exports.getUsers = async (req, res) => {
  try {
    let query = {};
    if (req.query.role) query.role = req.query.role;
    if (req.query.department) query.department = req.query.department;

    if (req.user.role === 'HOD') {
      query.department = req.user.department;
    }

    const users = await User.find(query).populate('department', 'name code').select('-password');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('department', 'name code').select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    req.body.mustChangePassword = true;
    
    if (req.user.role === 'HOD') {
      req.body.department = req.user.department;
    }

    const user = await User.create(req.body);
    const userWithoutPassword = await User.findById(user._id).populate('department', 'name code').select('-password');
    
    await logActivity(req, 'Created', 'User', `Created user: ${user.name} (${user.role})`);
    
    res.status(201).json({ success: true, data: userWithoutPassword });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    if (req.user.role === 'STUDENT') {
      if (req.user._id.toString() !== req.params.id) {
        return res.status(403).json({ success: false, message: 'You can only update your own profile' });
      }
      delete req.body.role;
      delete req.body.department;
      delete req.body.semester;
      delete req.body.userCode;
    }

    // If updating password, hash it before updating
    if (req.body.password && req.body.password.trim() !== '') {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    } else {
      delete req.body.password;
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('department', 'name code').select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    await logActivity(req, 'Updated', 'User', `Updated user: ${user.name}`);
    
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    await logActivity(req, 'Deleted', 'User', `Deleted user: ${user.name}`);
    
    res.json({ success: true, message: 'User removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
