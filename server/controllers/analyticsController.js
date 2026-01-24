const db = require('../db');

exports.getAnalytics = async (req, res) => {
  try {
    const result = await db.query('SELECT status FROM assets');
    const assets = result.rows;

    const available = assets.filter(a => a.status === 'Available').length;
    const checkedOut = assets.filter(a => a.status === 'Checked Out').length;

    const mostUsed = [
      { name: 'Laptop', usageCount: 12 },
      { name: 'Projector', usageCount: 9 },
      { name: 'Chair', usageCount: 6 }
    ];

    res.json({ available, checkedOut, mostUsed });
  } catch (err) {
    console.error('❌ Analytics fetch error:', err);
    res.status(500).json({ message: 'Error fetching analytics data' });
  }
};