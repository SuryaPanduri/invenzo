const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.query('SELECT NOW()')
  .then(res => {
    console.log('PostgreSQL connected at:', res.rows[0].now);
  })
  .catch(err => {
    console.error('PostgreSQL connection failed:', err);
    console.error('DATABASE_URL present:', !!process.env.DATABASE_URL);
  });

module.exports = pool;