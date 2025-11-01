const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

router.post(
  '/signup',
  [body('name').isString(), body('email').isEmail(), body('password').isLength({ min: 6 }), body('role').optional().isIn(['admin', 'student'])],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { name, email, password, role } = req.body;
    try {
      const existing = await User.findOne({ email });
      if (existing) return res.status(409).json({ message: 'Email already in use' });
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, passwordHash, role: role || 'student' });
      res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
    } catch (e) {
      res.status(500).json({ message: 'Signup failed' });
    }
  }
);

router.post('/login', [body('email').isEmail(), body('password').isString()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    res.status(500).json({ message: 'Login failed' });
  }
});

module.exports = router;


