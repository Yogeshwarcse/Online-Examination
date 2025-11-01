const express = require('express');
const auth = require('../middleware/auth');
const Result = require('../models/Result');
const Question = require('../models/Question');
const Test = require('../models/Test');
const User = require('../models/User');

const router = express.Router();

// Admin: list all results with populated user and exam data
router.get('/', async (_req, res) => {
  try {
    const results = await Result.find()
      .sort({ submittedAt: -1 });
    
    // Populate userId and testId for each result
    const populatedResults = await Promise.all(
      results.map(async (result) => {
        const resultObj = result.toObject();
        
        // Populate user
        try {
          const user = await User.findById(resultObj.userId).select('name email');
          if (user) {
            resultObj.userId = { _id: user._id, name: user.name, email: user.email };
          } else {
            // If user not found, keep the ID but show placeholder
            resultObj.userId = { _id: resultObj.userId, name: `User ${String(resultObj.userId).substring(0, 8)}`, email: '' };
          }
        } catch (err) {
          console.error('Error populating user:', err);
          resultObj.userId = { _id: resultObj.userId, name: `User ${String(resultObj.userId).substring(0, 8)}`, email: '' };
        }
        
        // Populate test
        try {
          const test = await Test.findById(resultObj.testId).select('title description');
          if (test) {
            resultObj.testId = { _id: test._id, title: test.title, description: test.description || '' };
          } else {
            // If test not found, keep the ID but show placeholder
            resultObj.testId = { _id: resultObj.testId, title: `Exam ${String(resultObj.testId).substring(0, 8)}`, description: '' };
          }
        } catch (err) {
          console.error('Error populating test:', err);
          resultObj.testId = { _id: resultObj.testId, title: `Exam ${String(resultObj.testId).substring(0, 8)}`, description: '' };
        }
        
        return resultObj;
      })
    );
    
    res.json(populatedResults);
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ message: 'Failed to fetch results', error: error.message });
  }
});

router.get('/my', auth, async (req, res) => {
  try {
    const results = await Result.find({ userId: req.user.userId })
      .sort({ submittedAt: -1 });
    
    // Populate testId for each result
    const populatedResults = await Promise.all(
      results.map(async (result) => {
        const resultObj = result.toObject();
        
        // Populate test
        try {
          console.log('Looking up test with ID:', resultObj.testId); // Debug log
          const test = await Test.findById(resultObj.testId).select('title description');
          console.log('Found test:', test); // Debug log
          
          if (test && test.title) {
            resultObj.testId = { 
              _id: test._id || resultObj.testId, 
              title: test.title, 
              description: test.description || '' 
            };
            console.log('Populated testId:', resultObj.testId); // Debug log
          } else {
            // If test not found or has no title
            console.warn('Test not found or missing title, testId:', resultObj.testId);
            resultObj.testId = { 
              _id: resultObj.testId, 
              title: '', 
              description: '' 
            };
          }
        } catch (err) {
          console.error('Error populating test:', err);
          console.error('testId that failed:', resultObj.testId);
          resultObj.testId = { 
            _id: resultObj.testId, 
            title: '', 
            description: '' 
          };
        }
        
        return resultObj;
      })
    );
    
    console.log('Sending populated results:', JSON.stringify(populatedResults, null, 2)); // Debug log
    res.json(populatedResults);
  } catch (error) {
    console.error('Error fetching my results:', error);
    res.status(500).json({ message: 'Failed to fetch results', error: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  const result = await Result.findById(req.params.id)
    .populate('userId', 'name email')
    .populate('testId', 'title description');
  if (!result) return res.status(404).json({ message: 'Not found' });
  res.json(result);
});

router.post('/submit', auth, async (req, res) => {
  const { examId, answers } = req.body; // answers: [{ qId, selectedIndex }]
  const test = await Test.findById(examId);
  if (!test) return res.status(400).json({ message: 'Invalid exam' });

  const questions = await Question.find({ _id: { $in: test.questionIds } });
  const questionById = new Map(questions.map((q) => [String(q._id), q]));

  let totalScore = 0;
  let maxScore = 0;
  const evaluated = answers.map((ans) => {
    const q = questionById.get(String(ans.qId));
    if (!q) return { ...ans, correct: false, points: 0 };
    const correct = q.correctOptionIndex === ans.selectedIndex;
    const pts = correct ? (q.points || 1) : 0;
    totalScore += pts;
    maxScore += q.points || 1;
    return { qId: q._id, selectedIndex: ans.selectedIndex, correct, points: pts };
  });

  const result = await Result.create({
    testId: test._id,
    userId: req.user.userId,
    answers: evaluated,
    totalScore,
    maxScore,
    startedAt: req.body.startedAt ? new Date(req.body.startedAt) : undefined,
    submittedAt: new Date(),
  });

  res.status(201).json(result);
});

module.exports = router;


