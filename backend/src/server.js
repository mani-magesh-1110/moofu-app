const app = require('./app');
const env = require('./config/env');
const db = require('./config/db');

async function startServer() {
  await db.query('SELECT 1');
  app.listen(env.port, () => {
    console.log(`MOOFU backend running on port ${env.port}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
