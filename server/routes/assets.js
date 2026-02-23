const express = require('express');
const router = express.Router();

const assetController = require('../controllers/assetController');
const analyticsController = require('../controllers/analyticsController');
const checkoutController = require('../controllers/checkoutController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const db = require('../db');
const {
  validateAssetCreate,
  validateAssetUpdate,
  validateAssetCheckout,
  validateAssetReturn
} = require('../middleware/validate');

router.get('/analytics/summary', auth, analyticsController.getAnalyticsSummary);
router.get('/analytics/top-used', auth, analyticsController.getTopUsedAssets);
router.get('/analytics/monthly-checkouts', auth, analyticsController.getMonthlyCheckouts);
router.get('/analytics', auth, analyticsController.getAnalytics);

router.get('/', auth, assetController.getAllAssets);
router.post('/', auth, authorize('admin'), validateAssetCreate, assetController.addAsset);
router.put('/:id', auth, authorize('admin', 'manager'), validateAssetUpdate, assetController.updateAsset);
router.delete('/:id', auth, authorize('admin'), assetController.deleteAsset);

router.post(
  '/:id/checkout',
  auth,
  authorize('admin', 'manager'),
  validateAssetCheckout,
  checkoutController.checkoutAsset
);
router.post(
  '/:id/return',
  auth,
  authorize('admin', 'manager'),
  validateAssetReturn,
  checkoutController.returnAsset
);
router.get('/:id/history', auth, checkoutController.getAssetHistory);

router.get('/:id', auth, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query('SELECT * FROM assets WHERE id = $1', [id]);

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
