const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  userCode: { type: String, required: true, unique: true }, // e.g., 'STU001'
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['ADMIN', 'HOD', 'FACULTY', 'STUDENT'], required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' }, // Changed to ObjectId
  mustChangePassword: { type: Boolean, default: false },
  designation: { type: String },
  semester: { type: Number },
  academicYear: { type: String },
  phone: { type: String },
  status: { type: String, default: 'Active' }
}, { timestamps: true });

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
