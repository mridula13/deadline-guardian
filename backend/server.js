require('dotenv').config();

console.log("Loaded URI:", process.env.MONGO_URI);

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const taskRoutes = require('./routes/tasks');
const reminderRoutes = require('./routes/reminders');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Routes ──────────────────────────────────────────────────
app.use('/api/tasks', taskRoutes);
app.use('/api/reminders', reminderRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'Deadline Guardian API running' }));

// ─── MongoDB Connection ───────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/deadline-guardian';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🛡️  Deadline Guardian API → http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    console.log('💡 Start MongoDB or update MONGO_URI in .env');
    // Still start server so frontend can see API errors clearly
    app.listen(PORT, () => console.log(`⚠️  Server running WITHOUT DB → http://localhost:${PORT}`));
  });
