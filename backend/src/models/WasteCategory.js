const mongoose = require('mongoose');

const WasteCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  environmental_impact: Number,
  points_value: Number,
  co2_impact_kg: Number,
  icon_name: String,
  color: String,
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WasteCategory', WasteCategorySchema);
