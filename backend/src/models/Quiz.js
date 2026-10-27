const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String }],
  correctAnswer: { type: String, required: true },
  explanation: { type: String },
  marks: { type: Number, default: 1 },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard', 'Mixed'], default: 'Medium' },
  topic: { type: String }
});

const quizSchema = new mongoose.Schema({
  quizCode: { type: String, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  topics: [{ type: String }],
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard', 'Mixed'], default: 'Medium' },
  duration: { type: Number, required: true }, // in minutes
  marksPerQuestion: { type: Number, default: 1 },
  negativeMarks: { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 0 },
  totalMarks: { type: Number, default: 0 },
  startDate: { type: Date },
  endDate: { type: Date },
  attemptLimit: { type: Number, default: 3 },
  questions: [questionSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isAIGenerated: { type: Boolean, default: false },
  status: { type: String, enum: ['Draft', 'Published', 'Active', 'Expired'], default: 'Draft' }
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
