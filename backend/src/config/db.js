const { Pool } = require('pg');
const env = require('./env');

// Allow DATABASE_URL to be optional in test mode to prevent startup errors
if (!env.databaseUrl && env.nodeEnv !== 'test') {
  throw new Error('DATABASE_URL is required');
}

// Create pool with connection string if available, otherwise create a dummy pool
let pool;

if (env.databaseUrl) {
  pool = new Pool({
    connectionString: env.databaseUrl,
    ssl: env.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
  });
} else {
  // Dummy pool for test mode without database
  pool = {
    query: async () => ({ rows: [] }),
    connect: async () => ({
      query: async () => ({ rows: [] }),
      release: () => {},
    }),
  };
}

async function query(text, params = []) {
  return pool.query(text, params);
}

module.exports = {
  pool,
  query,
};
