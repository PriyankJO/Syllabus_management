const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Department = require('../models/Department');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email }).populate('department', 'name code');

    if (user && (await user.matchPassword(password))) {
      if (role && user.role !== role) {
        return res.status(403).json({ success: false, message: 'Invalid role for this user' });
      }

      let userDepartment = user.department;
      if (user.role === 'HOD' && !userDepartment) {
        const dept = await Department.findOne({ hod: user._id }).select('name code');
        if (dept) {
          userDepartment = dept;
        }
      }

      res.json({
        success: true,
        data: {
          _id: user._id,
          userCode: user.userCode,
          name: user.name,
          email: user.email,
          role: user.role,
          department: userDepartment,
          semester: user.semester,
          academicYear: user.academicYear,
          phone: user.phone,
          designation: user.designation,
          mustChangePassword: user.mustChangePassword,
          token: generateToken(user._id)
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    if (req.user) {
      res.json({ success: true, data: req.user });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { userCode, name, email, password, role, department, semester } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      userCode, name, email, password, role, department, semester
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        userCode: user.userCode,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = newPassword; // Will be hashed pre-save by User model
    user.mustChangePassword = false;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
