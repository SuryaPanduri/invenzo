
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
    
    exports.addAsset = async (req, res) => {
      const { id, name, type, purchase_date, status, serial_number, notes } = req.body;
    
      try {
        const [result] = await db.query(
          `INSERT INTO assets (id, name, type, purchase_date, status, serial_number, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [id, name, type, purchase_date, status, serial_number, notes]
        );
    
        res.status(201).json({ message: 'Asset added successfully', assetId: result.insertId });
      } catch (err) {
        console.error('Add asset error:', err);
        res.status(500).json({ message: 'Failed to add asset' });
      }
    };
    exports.updateAsset = async (req, res) => {
      const id = req.params.id;
      const { name, type, purchase_date, status, serial_number, notes } = req.body;
      try {
        await db.query(
          `UPDATE assets SET name=?, type=?, purchase_date=?, status=?, serial_number=?, notes=? WHERE id=?`,
          [name, type, purchase_date, status, serial_number, notes, id]
        );
        res.json({ message: 'Asset updated successfully' });
      } catch (err) {
        console.error('Update asset error:', err);
        res.status(500).json({ message: 'Failed to update asset' });
      }
    };
    exports.deleteAsset = async (req, res) => {
      const assetId = req.params.id;
    
      try {
        const [result] = await db.query('DELETE FROM assets WHERE id = ?', [assetId]);
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Asset not found' });
        }
    
        res.json({ message: 'Asset deleted successfully' });
      } catch (error) {
        console.error('Error deleting asset:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    };