const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  attemptNumber: { type: Number, default: 1 },
  totalQuestions: { type: Number, required: true },
  correctAnswers: { type: Number, default: 0 },
  wrongAnswers: { type: Number, default: 0 },
  unanswered: { type: Number, default: 0 },
  totalMarks: { type: Number, required: true },
  marksObtained: { type: Number, required: true },
  percentage: { type: Number, required: true },
  answers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId },
    selectedAnswer: { type: String },
    correctAnswer: { type: String },
    isCorrect: { type: Boolean },
    marksObtained: { type: Number, default: 0 }
  }],
  startTime: { type: Date },
  endTime: { type: Date },
  submittedAt: { type: Date },
  timeTakenSeconds: { type: Number },
  status: { type: String, enum: ['In Progress', 'Completed', 'Auto-Submitted', 'Abandoned'], default: 'Completed' }
}, { timestamps: true });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
