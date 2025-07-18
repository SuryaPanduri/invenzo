const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Route: POST /api/users/signup
router.post('/signup',userController.signup);
// Route: POST /api/users/login
router.post('/login', userController.login);

module.exports = router;