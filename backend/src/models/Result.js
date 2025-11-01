// models/Result.js
const mongoose = require('mongoose');
const ResultSchema = new mongoose.Schema({
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  answers: [{ qId: mongoose.Schema.Types.ObjectId, selectedIndex: Number, correct: Boolean, points: Number }],
  totalScore: Number,
  maxScore: Number,
  startedAt: Date,
  submittedAt: Date,
});
module.exports = mongoose.model('Result', ResultSchema);
