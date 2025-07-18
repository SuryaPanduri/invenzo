const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const auth = require('../middleware/auth');

// Protect with auth middleware
router.get('/', auth, assetController.getAllAssets);

module.exports = router;
