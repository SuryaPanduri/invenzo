const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const auth = require('../middleware/auth');
const db = require('../db');

const analyticsController = require('../controllers/analyticsController.js ');

// Add this route for analytics
router.get('/analytics', auth, analyticsController.getAnalytics);


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

router.get('/analytics', auth, async (req, res) => {
    try {
      const [statusStats] = await db.query(
        `SELECT status, COUNT(*) as count FROM assets GROUP BY status`
      );
  
      const [mostUsed] = await db.query(
        `SELECT name, usage_count as usageCount FROM assets ORDER BY usage_count DESC LIMIT 5`
      );
  
      const result = {
        available: statusStats.find(s => s.status === 'Available')?.count || 0,
        checkedOut: statusStats.find(s => s.status === 'Checked Out')?.count || 0,
        mostUsed
      };
  
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: 'Analytics error' });
    }
  });

module.exports = router;
