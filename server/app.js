const express = require('express');
const app = express();
const userRoutes = require('./routes/users');

const assetRoutes = require('./routes/assets');
app.use('/api/assets', assetRoutes);

require('dotenv').config();
const db = require('./db')

app.use(express.json()); // to parse JSON bodies
app.use('/api/users', userRoutes); // mount routes

app.get('/', (req, res) => {
    res.send('INVENZO Server is running 🚀');
 });

 app.listen(3000, () => {
   console.log('✅ Server listening at http://localhost:3000');
 });

 const path = require('path');

// Serve static files from 'public' folder
app.use(express.static(path.join(__dirname, '../public')));

