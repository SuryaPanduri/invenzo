const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Test server working!');
});

app.listen(3000, '0.0.0.0', () => {
  console.log('Test server running on http://0.0.0.0:3000');
});