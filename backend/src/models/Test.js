// models/Test.js
const mongoose = require('mongoose');
const TestSchema = new mongoose.Schema({
  title: String,
  description: String,
  durationMinutes: Number,
  questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  randomizeQuestions: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});
module.exports = mongoose.model('Test', TestSchema);
