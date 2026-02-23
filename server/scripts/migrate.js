const fs = require('fs');
const path = require('path');
require('../config/loadEnv');

const db = require('../db');

const migrationsDir = path.join(__dirname, '..', 'migrations');

async function ensureMigrationsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function getAppliedMigrations() {
  const result = await db.query('SELECT filename FROM schema_migrations ORDER BY filename ASC');
  return new Set(result.rows.map((row) => row.filename));
}

async function runMigration(filename) {
  const fullPath = path.join(migrationsDir, filename);
  const sql = fs.readFileSync(fullPath, 'utf8');

  await db.query('BEGIN');
  try {
    await db.query(sql);
    await db.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [filename]);
    await db.query('COMMIT');
    console.log(`Applied migration: ${filename}`);
  } catch (err) {
    await db.query('ROLLBACK');
    throw err;
  }
}

async function main() {
  try {
    await ensureMigrationsTable();
    const applied = await getAppliedMigrations();

    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort((a, b) => a.localeCompare(b));

    for (const file of files) {
      if (applied.has(file)) {
        console.log(`Skipping already applied migration: ${file}`);
        continue;
      }
      await runMigration(file);
    }

    console.log('Migrations complete.');
    await db.end();
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    await db.end();
    process.exit(1);
  }
}

main();
