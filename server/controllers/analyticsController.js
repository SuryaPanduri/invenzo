const db = require('../db');

async function getSummaryMetrics() {
  const [assetsResult, overdueResult] = await Promise.all([
    db.query(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status = 'Available')::int AS available,
        COUNT(*) FILTER (WHERE status = 'Checked Out')::int AS checked_out
      FROM assets
    `),
    db.query(`
      SELECT COUNT(*)::int AS overdue
      FROM asset_checkouts
      WHERE returned_at IS NULL
        AND due_date IS NOT NULL
        AND due_date < NOW()
    `)
  ]);

  const summary = assetsResult.rows[0] || { total: 0, available: 0, checked_out: 0 };
  const overdue = overdueResult.rows[0]?.overdue || 0;

  return {
    total: summary.total,
    available: summary.available,
    checkedOut: summary.checked_out,
    overdue
  };
}

exports.getAnalytics = async (req, res) => {
  try {
    const [summary, mostUsedResult] = await Promise.all([
      getSummaryMetrics(),
      db.query(`
        SELECT
          a.name,
          COUNT(ac.id)::int AS usage_count
        FROM assets a
        LEFT JOIN asset_checkouts ac ON ac.asset_id = a.id
        GROUP BY a.id, a.name
        HAVING COUNT(ac.id) > 0
        ORDER BY usage_count DESC, a.name ASC
        LIMIT 5
      `)
    ]);

    res.json({
      total: summary.total,
      available: summary.available,
      checkedOut: summary.checkedOut,
      overdue: summary.overdue,
      mostUsed: mostUsedResult.rows.map((row) => ({
        name: row.name,
        usageCount: row.usage_count
      }))
    });
  } catch (err) {
    console.error('Analytics fetch error:', err);
    res.status(500).json({ message: 'Error fetching analytics data' });
  }
};

exports.getAnalyticsSummary = async (req, res) => {
  try {
    const summary = await getSummaryMetrics();
    res.json(summary);
  } catch (err) {
    console.error('Analytics summary error:', err);
    res.status(500).json({ message: 'Error fetching analytics summary' });
  }
};

exports.getTopUsedAssets = async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);

  try {
    const result = await db.query(
      `SELECT
          a.id,
          a.name,
          COUNT(ac.id)::int AS usage_count
       FROM assets a
       LEFT JOIN asset_checkouts ac ON ac.asset_id = a.id
       GROUP BY a.id, a.name
       ORDER BY usage_count DESC, a.name ASC
       LIMIT $1`,
      [limit]
    );

    res.json(result.rows.map((row) => ({ id: row.id, name: row.name, usageCount: row.usage_count })));
  } catch (err) {
    console.error('Top-used analytics error:', err);
    res.status(500).json({ message: 'Error fetching top-used analytics' });
  }
};

exports.getMonthlyCheckouts = async (req, res) => {
  const months = Math.min(Math.max(Number(req.query.months) || 6, 1), 24);

  try {
    const result = await db.query(
      `SELECT
          TO_CHAR(DATE_TRUNC('month', checkout_date), 'YYYY-MM') AS month,
          COUNT(*)::int AS count
       FROM asset_checkouts
       WHERE checkout_date >= DATE_TRUNC('month', NOW()) - (($1 - 1) * INTERVAL '1 month')
       GROUP BY 1
       ORDER BY 1 ASC`,
      [months]
    );

    res.json(result.rows.map((row) => ({ month: row.month, count: row.count })));
  } catch (err) {
    console.error('Monthly checkouts analytics error:', err);
    res.status(500).json({ message: 'Error fetching monthly checkout analytics' });
  }
};
