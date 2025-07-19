const express = require('express');
const app = express();
const path = require('path');
require('dotenv').config();

const db = require('./db'); // DB connection
const userRoutes = require('./routes/users');
const assetRoutes = require('./routes/assets');

// Middleware to parse JSON
app.use(express.json());

// ✅ Serve static files from the 'public' directory (must be BEFORE routes for HTML + CSS + JS to work)
app.use(express.static(path.join(__dirname, '../public')));

// ✅ Routes
app.use('/api/users', userRoutes);
app.use('/api/assets', require('./routes/assets'));

// ✅ Root route for test
app.get('/', (req, res) => {
  res.send('INVENZO Server is running 🚀');
});

// ✅ Start the server
app.listen(3000, () => {
  console.log('✅ Server listening at http://localhost:3000');
});