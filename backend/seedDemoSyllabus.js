require('dotenv').config();
const mongoose = require('mongoose');
const Subject = require('./src/models/Subject');
const Syllabus = require('./src/models/Syllabus');
const User = require('./src/models/User');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/spc_syllabus_management');
    console.log('Connected to DB');

    // Find a subject to attach the syllabus to
    const subject = await Subject.findOne();
    if (!subject) {
      console.log('No subject found. Please create a subject first.');
      process.exit(1);
    }

    // Find an admin user to set as uploadedBy
    const admin = await User.findOne({ role: 'ADMIN' });

    // Create the syllabus entry
    const demoSyllabus = new Syllabus({
      syllabusCode: `SYL${Math.floor(Math.random() * 100000)}`,
      subject: subject._id,
      department: subject.department,
      semester: subject.semester,
      academicYear: '2026',
      title: 'Official Demo Syllabus Document',
      description: 'This is a demo syllabus containing a .doc file to test the download functionality.',
      file: '/uploads/demo_syllabus.doc',
      uploadedBy: admin ? admin._id : null,
      status: 'Active'
    });

    await demoSyllabus.save();
    console.log('Successfully created demo syllabus in the database!');
    
  } catch (err) {
    console.error('Error seeding demo syllabus:', err);
  } finally {
    process.exit(0);
  }
};

run();
