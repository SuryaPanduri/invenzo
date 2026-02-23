const db = require('../db');

async function logAssetAudit(client, { assetId, actorUserId, action, metadata }) {
  await client.query(
    `INSERT INTO asset_audit_logs (asset_id, actor_user_id, action, metadata)
     VALUES ($1, $2, $3, $4)`,
    [assetId, actorUserId, action, JSON.stringify(metadata || {})]
  );
}

exports.checkoutAsset = async (req, res) => {
  const assetId = Number(req.params.id);
  const checkedOutToUserId = Number(req.body.checkedOutToUserId);
  const dueDate = req.body.dueDate || null;
  const notes = req.body.notes || null;

  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const assetResult = await client.query(
      'SELECT id, name, status FROM assets WHERE id = $1 FOR UPDATE',
      [assetId]
    );

    if (assetResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Asset not found' });
    }

    const asset = assetResult.rows[0];
    if (asset.status === 'Checked Out') {
      await client.query('ROLLBACK');
      return res.status(409).json({ message: 'Asset is already checked out' });
    }

    const userResult = await client.query('SELECT id, name FROM users WHERE id = $1', [checkedOutToUserId]);
    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Assignee user not found' });
    }

    const checkoutResult = await client.query(
      `INSERT INTO asset_checkouts (
        asset_id,
        checked_out_to_user_id,
        checked_out_by_user_id,
        due_date,
        notes
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, checkout_date`,
      [assetId, checkedOutToUserId, req.user.userId, dueDate, notes]
    );

    await client.query('UPDATE assets SET status = $1 WHERE id = $2', ['Checked Out', assetId]);

    await logAssetAudit(client, {
      assetId,
      actorUserId: req.user.userId,
      action: 'checked_out',
      metadata: {
        checkedOutToUserId,
        dueDate,
        notes
      }
    });

    await client.query('COMMIT');

    return res.status(201).json({
      message: 'Asset checked out successfully',
      checkout: checkoutResult.rows[0]
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Checkout error:', err);
    return res.status(500).json({ message: 'Failed to checkout asset' });
  } finally {
    client.release();
  }
};

exports.returnAsset = async (req, res) => {
  const assetId = Number(req.params.id);
  const returnNotes = req.body.notes || null;

  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const assetResult = await client.query(
      'SELECT id, status FROM assets WHERE id = $1 FOR UPDATE',
      [assetId]
    );

    if (assetResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Asset not found' });
    }

    const activeCheckoutResult = await client.query(
      `SELECT id, notes
       FROM asset_checkouts
       WHERE asset_id = $1 AND returned_at IS NULL
       ORDER BY checkout_date DESC
       LIMIT 1
       FOR UPDATE`,
      [assetId]
    );

    if (activeCheckoutResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ message: 'Asset is not currently checked out' });
    }

    const activeCheckout = activeCheckoutResult.rows[0];
    const mergedNotes = returnNotes
      ? `${activeCheckout.notes ? `${activeCheckout.notes}\n` : ''}Return note: ${returnNotes}`
      : activeCheckout.notes;

    await client.query(
      `UPDATE asset_checkouts
       SET returned_at = NOW(),
           returned_by_user_id = $1,
           notes = $2
       WHERE id = $3`,
      [req.user.userId, mergedNotes, activeCheckout.id]
    );

    await client.query('UPDATE assets SET status = $1 WHERE id = $2', ['Available', assetId]);

    await logAssetAudit(client, {
      assetId,
      actorUserId: req.user.userId,
      action: 'returned',
      metadata: { notes: returnNotes }
    });

    await client.query('COMMIT');

    return res.json({ message: 'Asset returned successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Return asset error:', err);
    return res.status(500).json({ message: 'Failed to return asset' });
  } finally {
    client.release();
  }
};

exports.getAssetHistory = async (req, res) => {
  const assetId = Number(req.params.id);

  try {
    const assetResult = await db.query('SELECT id, name, status FROM assets WHERE id = $1', [assetId]);

    if (assetResult.rows.length === 0) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    const historyResult = await db.query(
      `SELECT
          ac.id,
          ac.checkout_date,
          ac.due_date,
          ac.returned_at,
          ac.notes,
          u_to.name AS checked_out_to_name,
          u_by.name AS checked_out_by_name,
          u_ret.name AS returned_by_name
       FROM asset_checkouts ac
       LEFT JOIN users u_to ON u_to.id = ac.checked_out_to_user_id
       LEFT JOIN users u_by ON u_by.id = ac.checked_out_by_user_id
       LEFT JOIN users u_ret ON u_ret.id = ac.returned_by_user_id
       WHERE ac.asset_id = $1
       ORDER BY ac.checkout_date DESC`,
      [assetId]
    );

    const auditResult = await db.query(
      `SELECT
          l.id,
          l.action,
          l.metadata,
          l.created_at,
          u.name AS actor_name
       FROM asset_audit_logs l
       LEFT JOIN users u ON u.id = l.actor_user_id
       WHERE l.asset_id = $1
       ORDER BY l.created_at DESC`,
      [assetId]
    );

    res.json({
      asset: assetResult.rows[0],
      checkoutHistory: historyResult.rows,
      auditLog: auditResult.rows
    });
  } catch (err) {
    console.error('Get asset history error:', err);
    res.status(500).json({ message: 'Failed to fetch asset history' });
  }
};
