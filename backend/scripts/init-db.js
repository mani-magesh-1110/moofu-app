const fs = require('fs');
const path = require('path');
const db = require('../src/config/db');

async function initDb() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  await db.query(schemaSql);
  console.log('Database schema initialized successfully.');
  process.exit(0);
}

initDb().catch((error) => {
  console.error('Failed to initialize DB schema', error);
  process.exit(1);
});
