import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/data-source';

export const requireDB = (req: Request, res: Response, next: NextFunction) => {
  if (!AppDataSource.isInitialized) {
    return res.status(503).json({
      error: 'Service unavailable',
      message: 'Database is not connected. Please try again later.',
      timestamp: new Date().toISOString()
    });
  }
  next();
};