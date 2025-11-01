const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Test = require('../models/Test');
const Question = require('../models/Question');
const multer = require('multer');
const { createWorker } = require('tesseract.js');

const router = express.Router();

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Multer error handler middleware
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size exceeds 10MB limit' });
    }
    return res.status(400).json({ message: 'File upload error: ' + err.message });
  }
  if (err) {
    return res.status(400).json({ message: 'Upload error: ' + err.message });
  }
  next();
};

// Wrap the upload middleware to catch errors
const uploadMiddleware = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return handleMulterError(err, req, res, next);
    }
    next();
  });
};

// Function to parse OCR text into MCQ questions
function parseMCQQuestions(text) {
  const questions = [];
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  let currentQuestion = null;
  let currentOptions = [];
  let questionNumber = 1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detect question (lines starting with number or Q)
    if (/^\d+[\.\)]/.test(line) || /^Q\d+/i.test(line)) {
      // Save previous question if exists
      if (currentQuestion && currentOptions.length >= 2) {
        // Find correct answer (lines with * or Answer: or Ans:)
        let correctAnswer = 'A';
        const answerLine = lines.slice(i - 5, i).find(l => 
          /answer\s*[:\-]\s*[A-D]/i.test(l) || 
          /^\s*[A-D]\s*[\.\)]\s*\*/.test(l) ||
          /\*\s*[A-D]\s*[\.\)]/.test(l)
        );
        
        if (answerLine) {
          const match = answerLine.match(/[A-D]/i);
          if (match) correctAnswer = match[0].toUpperCase();
        }
        
        questions.push({
          question: currentQuestion,
          options: currentOptions,
          correctAnswer: correctAnswer
        });
      }
      
      // Start new question
      currentQuestion = line.replace(/^\d+[\.\)]\s*/, '').replace(/^Q\d+[\.\)\s]*/i, '').trim();
      currentOptions = [];
    }
    // Detect options (A, B, C, D)
    else if (/^[A-D][\.\)]\s*/.test(line)) {
      const optionText = line.replace(/^[A-D][\.\)]\s*/, '').trim();
      if (optionText) {
        currentOptions.push(optionText);
      }
    }
    // Continue question text if no number/letter prefix
    else if (currentQuestion && currentOptions.length === 0) {
      currentQuestion += ' ' + line;
    }
    // Continue option text
    else if (currentOptions.length > 0 && !/^[A-D][\.\)]/.test(line) && !/^\d+[\.\)]/.test(line)) {
      const lastOptionIdx = currentOptions.length - 1;
      currentOptions[lastOptionIdx] += ' ' + line;
    }
  }
  
  // Save last question
  if (currentQuestion && currentOptions.length >= 2) {
    questions.push({
      question: currentQuestion,
      options: currentOptions.slice(0, 4), // Limit to 4 options
      correctAnswer: 'A' // Default if not found
    });
  }
  
  return questions;
}

// Image upload and OCR endpoint
router.post('/upload-image', auth, uploadMiddleware, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }
    
    const { examId } = req.body;
    if (!examId) {
      return res.status(400).json({ message: 'Exam ID is required' });
    }
    
    // Check if exam exists
    const exam = await Test.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff', 'image/webp'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ message: 'Invalid file type. Please upload a valid image file.' });
    }
    
    // Perform OCR
    console.log('Starting OCR processing...');
    let worker;
    try {
      worker = await createWorker('eng');
      console.log('Worker created, recognizing text...');
      const { data: { text } } = await worker.recognize(req.file.buffer);
      console.log('OCR completed. Extracted text length:', text.length);
      
      // Parse text to extract questions
      const parsedQuestions = parseMCQQuestions(text);
      console.log('Parsed questions count:', parsedQuestions.length);
      
      if (parsedQuestions.length === 0) {
        return res.status(400).json({ 
          message: 'No questions found in the image. Please ensure the image contains clearly formatted MCQ questions with numbered questions and labeled options (A, B, C, D).',
          extractedText: text.substring(0, 500) // Return first 500 chars for debugging
        });
      }
      
      // Create questions in database
      const createdQuestions = [];
      for (const q of parsedQuestions) {
        const correctIndex = ['A', 'B', 'C', 'D'].indexOf(q.correctAnswer.toUpperCase());
        const question = await Question.create({
          text: q.question.trim(),
          options: q.options.map(opt => opt.trim()),
          correctOptionIndex: correctIndex >= 0 ? correctIndex : 0,
          points: 1
        });
        
        await Test.findByIdAndUpdate(examId, { $addToSet: { questionIds: question._id } });
        createdQuestions.push(question);
      }
      
      res.json({
        message: `Successfully extracted and created ${createdQuestions.length} question(s)`,
        questions: createdQuestions,
        extractedText: text.substring(0, 1000) // Return first 1000 chars for review
      });
    } finally {
      if (worker) {
        await worker.terminate();
        console.log('Worker terminated');
      }
    }
  } catch (error) {
    console.error('OCR Error:', error);
    // Always return JSON, never HTML
    res.status(500).json({ 
      message: 'Failed to process image', 
      error: error.message || 'Unknown error occurred',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// GET routes
router.get('/', async (_req, res) => {
  const exams = await Test.find().sort({ createdAt: -1 });
  res.json(exams);
});

router.get('/:id', async (req, res) => {
  const exam = await Test.findById(req.params.id);
  if (!exam) return res.status(404).json({ message: 'Exam not found' });
  res.json(exam);
});

// POST routes - upload-image must come before the generic POST
router.post(
  '/',
  auth,
  [body('title').isString(), body('description').optional().isString(), body('durationMinutes').isInt({ min: 1 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { title, description, durationMinutes, randomizeQuestions } = req.body;
    const exam = await Test.create({ title, description, durationMinutes, randomizeQuestions, createdBy: req.user.userId });
    res.status(201).json(exam);
  }
);

// PUT routes
router.put('/:id', auth, async (req, res) => {
  const updated = await Test.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) return res.status(404).json({ message: 'Exam not found' });
  res.json(updated);
});

// DELETE routes
router.delete('/:id', auth, async (req, res) => {
  const deleted = await Test.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Exam not found' });
  res.status(204).end();
});

module.exports = router;
