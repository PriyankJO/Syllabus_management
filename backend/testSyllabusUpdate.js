require('dotenv').config();
const mongoose = require('mongoose');
const Syllabus = require('./src/models/Syllabus');

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/spc_syllabus_management');
  
  const syllabus = await Syllabus.findOne();
  if (!syllabus) {
    console.log("No syllabus found");
    process.exit(0);
  }
  
  console.log("Found syllabus:", syllabus.title, "ID:", syllabus._id);
  
  const updatedSyllabus = await Syllabus.findByIdAndUpdate(syllabus._id, { title: syllabus.title + " Updated" }, { new: true }).populate('subject', 'name code').populate('department', 'name code').populate('uploadedBy', 'name email');
  
  console.log("Updated syllabus title:", updatedSyllabus.title);
  
  await Syllabus.findByIdAndUpdate(syllabus._id, { title: syllabus.title });
  
  process.exit(0);
};

run();
