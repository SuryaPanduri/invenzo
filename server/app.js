const express = require('express');
const app = express();
const path = require('path');
require('dotenv').config();

const db = require('./db'); // DB connection
const userRoutes = require('./routes/users');
const assetRoutes = require('./routes/assets');

// Middleware to parse JSON
app.use(express.json());

// ✅ Log every request to help debug routing issues
// app.use((req, res, next) => {
//   console.log(`${req.method} ${req.originalUrl}`);
//   next();
// });

// ✅ Serve static files from the 'public' directory (must be BEFORE routes for HTML + CSS + JS to work)
app.use(express.static(path.join(__dirname, '../public')));

// ✅ Routes
app.use('/api/users', userRoutes);
app.use('/api/assets', require('./routes/assets'));

// ✅ Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server listening at http://localhost:${PORT}`);
});