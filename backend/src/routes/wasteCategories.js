const express = require('express');
const WasteCategory = require('../models/WasteCategory');

const router = express.Router();

// GET /api/waste_categories?name=...
router.get('/', async (req, res) => {
  try {
    const { name } = req.query;
    if (name) {
      const cat = await WasteCategory.findOne({ name });
      if (!cat) return res.status(404).json({ message: 'Not found' });
      return res.json(cat);
    } else {
      const cats = await WasteCategory.find();
      return res.json(cats);
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
