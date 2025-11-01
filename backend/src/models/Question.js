// models/Question.js
const mongoose = require('mongoose');
const QuestionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: [{ type: String }],
  correctOptionIndex: { type: Number, required: true }, // 0-based
  points: { type: Number, default: 1 }
});
module.exports = mongoose.model('Question', QuestionSchema);
