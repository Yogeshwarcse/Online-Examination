const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Question = require('../models/Question');
const Test = require('../models/Test');

const router = express.Router();

router.get('/by-exam/:examId', async (req, res) => {
  const questions = await Question.find({ _id: { $in: (await Test.findById(req.params.examId)).questionIds } });
  res.json(questions);
});

router.post(
  '/',
  auth,
  [body('examId').isString(), body('text').isString(), body('options').isArray({ min: 2 }), body('correctOptionIndex').isInt()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { examId, text, options, correctOptionIndex, points } = req.body;
    const q = await Question.create({ text, options, correctOptionIndex, points });
    await Test.findByIdAndUpdate(examId, { $addToSet: { questionIds: q._id } });
    res.status(201).json(q);
  }
);

router.put('/:id', auth, async (req, res) => {
  const updated = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

router.delete('/:id', auth, async (req, res) => {
  // Optionally remove from any test.questionIds referencing this question
  await Question.findByIdAndDelete(req.params.id);
  await Test.updateMany({}, { $pull: { questionIds: req.params.id } });
  res.status(204).end();
});

module.exports = router;


