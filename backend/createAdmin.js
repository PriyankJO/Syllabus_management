const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/syllabus_management');
    console.log('Connected to MongoDB');

    const adminExists = await User.findOne({ role: 'ADMIN' });
    if (adminExists) {
      console.log('Admin user already exists!');
      process.exit(0);
    }

    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@college.edu',
      password: 'admin',
      role: 'ADMIN',
      mustChangePassword: true // They will be forced to change password on first login
    });

    console.log('Admin user created successfully!');
    console.log('Email: admin@college.edu');
    console.log('Password: admin');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
