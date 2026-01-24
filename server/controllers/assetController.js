const db = require('../db');

/**
 * GET ALL ASSETS
 */
exports.getAllAssets = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM assets ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Fetch assets error:', err);
    res.status(500).json({ message: 'Error fetching assets' });
  }
};

/**
 * ADD NEW ASSET
 * NOTE: id is SERIAL in Postgres → do NOT pass id manually
 */
exports.addAsset = async (req, res) => {
  const { name, type, purchase_date, status, serial_number, notes } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO assets (name, type, purchase_date, status, serial_number, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [name, type, purchase_date, status, serial_number, notes]
    );

    res.status(201).json({
      message: 'Asset added successfully',
      assetId: result.rows[0].id
    });
  } catch (err) {
    console.error('❌ Add asset error:', err);
    res.status(500).json({ message: 'Failed to add asset' });
  }
};

/**
 * UPDATE ASSET
 */
exports.updateAsset = async (req, res) => {
  const { id } = req.params;
  const { name, type, purchase_date, status, serial_number, notes } = req.body;

  try {
    const result = await db.query(
      `UPDATE assets
       SET name=$1,
           type=$2,
           purchase_date=$3,
           status=$4,
           serial_number=$5,
           notes=$6
       WHERE id=$7`,
      [name, type, purchase_date, status, serial_number, notes, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    res.json({ message: 'Asset updated successfully' });
  } catch (err) {
    console.error('❌ Update asset error:', err);
    res.status(500).json({ message: 'Failed to update asset' });
  }
};

/**
 * DELETE ASSET
 */
exports.deleteAsset = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      'DELETE FROM assets WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    res.json({ message: 'Asset deleted successfully' });
  } catch (err) {
    console.error('❌ Delete asset error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * ANALYTICS (BASIC)
 */
exports.getAnalytics = async (req, res) => {
  try {
    const result = await db.query('SELECT status FROM assets');
    const assets = result.rows;

    const available = assets.filter(a => a.status === 'Available').length;
    const checkedOut = assets.filter(a => a.status === 'Checked Out').length;

    // Static placeholder until checkout table exists
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