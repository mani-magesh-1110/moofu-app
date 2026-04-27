const { Pool } = require('pg');
const app = require('../../app');

let testDb;
let server;

async function setupTestDb() {
  // Use test database URL from env
  const dbUrl = process.env.TEST_DATABASE_URL || 
    'postgresql://postgres:postgres@localhost:5432/moofu_test';
  
  testDb = new Pool({ connectionString: dbUrl });
  
  // Initialize schema
  const fs = require('fs');
  const path = require('path');
  const schema = fs.readFileSync(path.join(__dirname, '../../scripts/schema.sql'), 'utf8');
  await testDb.query(schema);
}

async function teardownTestDb() {
  if (testDb) {
    await testDb.end();
  }
}

function startServer() {
  return new Promise((resolve) => {
    server = app.listen(5001, () => {
      resolve({
        server,
        baseUrl: 'http://localhost:5001/api',
      });
    });
  });
}

async function stopServer() {
  return new Promise((resolve) => {
    if (server) {
      server.close(() => resolve());
    } else {
      resolve();
    }
  });
}

module.exports = {
  setupTestDb,
  teardownTestDb,
  startServer,
  stopServer,
  getTestDb: () => testDb,
};
