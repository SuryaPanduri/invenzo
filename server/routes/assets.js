const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const auth = require('../middleware/auth');
const db = require('../db');

// Protect with auth middleware
router.get('/', auth, assetController.getAllAssets);
router.post('/', auth, assetController.addAsset);
router.put('/:id', auth, assetController.updateAsset);
// DELETE /api/assets/:id
router.delete('/:id', auth, assetController.deleteAsset);

// GET asset by ID
router.get('/:id', auth, async (req, res) => {
  const id = req.params.id;
  //console.log('Requested asset ID:', id); // Log the ID before querying
  try {
    const [rows] = await db.query('SELECT * FROM assets WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Asset not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving asset' });
  }
});

module.exports = router;
