require('./config/loadEnv');
const { Pool } = require('pg');

const dbTarget = String(process.env.DB_TARGET || '').toLowerCase();

function resolveConnectionString() {
  if (dbTarget === 'local' && process.env.DATABASE_URL_LOCAL) {
    return process.env.DATABASE_URL_LOCAL;
  }

  if (dbTarget === 'remote' && process.env.DATABASE_URL_REMOTE) {
    return process.env.DATABASE_URL_REMOTE;
  }

  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  if (process.env.DATABASE_URL_LOCAL) {
    return process.env.DATABASE_URL_LOCAL;
  }

  if (process.env.DATABASE_URL_REMOTE) {
    return process.env.DATABASE_URL_REMOTE;
  }

  return null;
}

const resolvedConnectionString = resolveConnectionString();
const hasDatabaseUrl = Boolean(resolvedConnectionString);

const hasDiscretePgConfig = Boolean(
  process.env.PGHOST ||
    process.env.PGUSER ||
    process.env.PGDATABASE ||
    process.env.DB_HOST ||
    process.env.DB_USER ||
    process.env.DB_NAME
);

const forceSslFromEnv = process.env.DATABASE_SSL === 'true' || process.env.PGSSL === 'true';

const useSsl =
  dbTarget === 'remote' ||
  (dbTarget !== 'local' && forceSslFromEnv) ||
  (process.env.NODE_ENV === 'production' && hasDatabaseUrl && dbTarget !== 'local');

const baseConfig = hasDatabaseUrl
  ? { connectionString: resolvedConnectionString }
  : {
      host: process.env.PGHOST || process.env.DB_HOST || 'localhost',
      port: Number(process.env.PGPORT || process.env.DB_PORT || 5432),
      user: process.env.PGUSER || process.env.DB_USER,
      password: process.env.PGPASSWORD || process.env.DB_PASS,
      database: process.env.PGDATABASE || process.env.DB_NAME
    };

const pool = new Pool({
  ...baseConfig,
  ssl: useSsl ? { rejectUnauthorized: false } : false
});

if (hasDatabaseUrl || hasDiscretePgConfig) {
  pool
    .query('SELECT NOW()')
    .then((res) => {
      console.log('PostgreSQL connected at:', res.rows[0].now);
      if (dbTarget) {
        console.log(`DB target: ${dbTarget}`);
      }
    })
    .catch((err) => {
      console.error('PostgreSQL connection failed:', err.message);
      console.error('Connection string selected:', hasDatabaseUrl);
      if (dbTarget) {
        console.error('DB target:', dbTarget);
      }
    });
} else {
  console.warn(
    'No PostgreSQL configuration found. Set DB_TARGET + DATABASE_URL_LOCAL/REMOTE, or DATABASE_URL, or PG*/DB* vars.'
  );
}

module.exports = pool;
