const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/online-exam';
const PORT = process.env.PORT || 5000;

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is healthy 🚀' });
});

try {
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/exams', require('./routes/exams'));
  app.use('/api/questions', require('./routes/questions'));
  app.use('/api/results', require('./routes/results'));
  app.use('/api/profiles', require('./routes/profiles'));
  app.use('/api/waste_categories', require('./routes/wasteCategories'));
} catch (err) {
  console.error('⚠️ Route import error:', err.message);
}

app.all(/^\/api(\/.*)?$/, (req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

app.use((err, req, res, next) => {
  console.error('🔥 Internal Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`🌍 Visit: http://localhost:${PORT}`);
});
