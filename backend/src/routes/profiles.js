const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user.userId).select('_id name email role createdAt updatedAt');
  if (!user) return res.status(404).send('Not found');
  res.json(user);
});

module.exports = router;


