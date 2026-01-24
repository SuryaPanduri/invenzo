const express = require('express');
const router = express.Router();

const assetController = require('../controllers/assetController');
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const db = require('../db');

/**
 * ANALYTICS (KEEP THIS FIRST)
 */
router.get('/analytics', auth, analyticsController.getAnalytics);

/**
 * GET ALL ASSETS
 */
router.get('/', auth, assetController.getAllAssets);

/**
 * ADD ASSET (ADMIN)
 */
router.post('/', auth, authorize('admin'), assetController.addAsset);

/**
 * UPDATE ASSET (ADMIN, MANAGER)
 */
router.put('/:id', auth, authorize('admin', 'manager'), assetController.updateAsset);

/**
 * DELETE ASSET (ADMIN)
 */
router.delete('/:id', auth, authorize('admin'), assetController.deleteAsset);

/**
 * GET ASSET BY ID
 */
router.get('/:id', auth, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      'SELECT * FROM assets WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get asset by ID error:', err);
    res.status(500).json({ message: 'Error retrieving asset' });
  }
});

module.exports = router;