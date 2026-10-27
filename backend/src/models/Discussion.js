const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  message: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now }
});

const discussionSchema = new mongoose.Schema({
  discussionCode: { type: String, unique: true }, // DIS001
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
  replies: [replySchema]
}, { timestamps: true });

module.exports = mongoose.model('Discussion', discussionSchema);
