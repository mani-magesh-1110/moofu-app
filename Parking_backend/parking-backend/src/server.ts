import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import { AppDataSource } from './config/data-source';
import { seedParkingSpaces } from './services/parkingService';
import authRoutes from './routes/auth.routes';
import parkingRoutes from './routes/parkingSpace.route';
import bookingRoutes from './routes/booking.routes';
import { ApiResponse, AppError } from './utils/response';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint (no auth required)
app.get('/health', (_req, res) => {
  const dbStatus = AppDataSource.isInitialized ? 'connected' : 'disconnected';
  const statusCode = AppDataSource.isInitialized ? 200 : 503;

  res.status(statusCode).json({
    status: AppDataSource.isInitialized ? 'healthy' : 'degraded',
    message: 'Parking Backend API',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Parking Backend API is running',
    version: '1.0.0',
    docs: '/api/docs',
  });
});

// Auth routes (public - no auth required)
app.use('/api/auth', authRoutes);

// Parking routes (public - no auth required)
app.use('/api/parking', parkingRoutes);

// Booking routes (protected - auth required)
app.use('/api/booking', bookingRoutes);

// 404 handler
app.use((_req, res) => {
  return ApiResponse.notFound(res, 'Endpoint not found');
});

// Global error handler
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error('Error:', err);

    if (err instanceof AppError) {
      return ApiResponse.error(res, err.message, err.statusCode, err.errors);
    }

    if (err.name === 'JsonWebTokenError') {
      return ApiResponse.unauthorized(res, 'Invalid token');
    }

    if (err.name === 'TokenExpiredError') {
      return ApiResponse.unauthorized(res, 'Token expired');
    }

    return ApiResponse.internalError(res, err.message || 'Internal server error');
  }
);

async function startServer() {
  app.listen(PORT, () => {
    console.log(`\n✓ Server running on port ${PORT}`);
    console.log(`✓ Base URL: http://localhost:${PORT}`);
    console.log(`✓ Health check: http://localhost:${PORT}/health\n`);
  });

  try {
    console.log('Initializing database connection...');
    await AppDataSource.initialize();
    console.log('✓ Database connected successfully\n');

    // Seed parking data
    await seedParkingSpaces();
  } catch (err: any) {
    console.error('✗ Database connection failed:', err.message);
    console.error(
      '⚠️  Server running in degraded mode (protected routes will return 503)\n'
    );

    // Retry connection every 10 seconds
    setTimeout(() => retryDatabaseConnection(), 10000);
  }
}

async function retryDatabaseConnection() {
  if (AppDataSource.isInitialized) return;

  try {
    console.log('Retrying database connection...');
    await AppDataSource.initialize();
    console.log('✓ Database connected successfully');
    await seedParkingSpaces();
  } catch (err: any) {
    console.error('✗ Database retry failed:', err.message);
    setTimeout(() => retryDatabaseConnection(), 10000);
  }
}

startServer();

