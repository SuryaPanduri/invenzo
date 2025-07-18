const db = require('../db');

exports.getAllAssets = async (req, res) => {
  try {
    const [assets] = await db.query('SELECT * FROM assets');
    res.json(assets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching assets' });
  }
};