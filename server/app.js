const express = require('express');
const app = express();
const path = require('path');
require('dotenv').config();

const db = require('./db');
const userRoutes = require('./routes/users');
const assetRoutes = require('./routes/assets');

// Middleware
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.use('/api/users', userRoutes);
app.use('/api/assets', assetRoutes);

// Health check (recommended)
app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', db: 'disconnected' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server listening at http://localhost:${PORT}`);
});