const app = require('./app');
const env = require('./config/env');
const db = require('./config/db');
const logger = require('./utils/logger');

async function startServer() {
  // Try to connect to database
  try {
    await db.query('SELECT 1');
    logger.info('✅ Database connected successfully');
  } catch (error) {
    if (env.nodeEnv === 'development') {
      logger.warn('⚠️ Database connection failed (continuing in dev mode):', error.message);
      logger.warn('To use the API, start PostgreSQL or use the integration tests');
    } else {
      logger.error('Database connection failed in production', error);
      process.exit(1);
    }
  }

  app.listen(env.port, () => {
    logger.info(`🚀 MOOFU backend running on port ${env.port}`);
    if (env.nodeEnv === 'development') {
      logger.info('📚 API docs: http://localhost:' + env.port + '/api');
      logger.info('💚 Health check: http://localhost:' + env.port + '/health');
    }
  });
}

startServer().catch((error) => {
  logger.error('Failed to start server', error);
  process.exit(1);
});
