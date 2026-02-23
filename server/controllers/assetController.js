const db = require('../db');

exports.getAllAssets = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        a.*,
        active.due_date AS current_due_date,
        active.checked_out_to_user_id,
        active.checked_out_to_name AS current_assignee
      FROM assets a
      LEFT JOIN LATERAL (
        SELECT
          ac.due_date,
          ac.checked_out_to_user_id,
          u.name AS checked_out_to_name
        FROM asset_checkouts ac
        LEFT JOIN users u ON u.id = ac.checked_out_to_user_id
        WHERE ac.asset_id = a.id
          AND ac.returned_at IS NULL
        ORDER BY ac.checkout_date DESC
        LIMIT 1
      ) active ON true
      ORDER BY a.id DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('Fetch assets error:', err);
    res.status(500).json({ message: 'Error fetching assets' });
  }
};

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
    console.error('Add asset error:', err);
    res.status(500).json({ message: 'Failed to add asset' });
  }
};

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
    console.error('Update asset error:', err);
    res.status(500).json({ message: 'Failed to update asset' });
  }
};

exports.deleteAsset = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query('DELETE FROM assets WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    res.json({ message: 'Asset deleted successfully' });
  } catch (err) {
    console.error('Delete asset error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
