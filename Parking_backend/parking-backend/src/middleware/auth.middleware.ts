import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';
import { ApiResponse } from '../utils/response';
import { verifyToken } from '../services/authService';

// Extend Express Request to include user information
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: {
        id: string;
        phoneNumber?: string;
      };
    }
  }
}

export const validateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return ApiResponse.unauthorized(res, 'Missing Authorization header');
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify JWT token
    const decoded = verifyToken(token);

    // Fetch user from database
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: decoded.userId } });

    if (!user) {
      return ApiResponse.unauthorized(res, 'User not found');
    }

    // Attach userId to request
    (req as any).userId = user.id;
    req.user = {
      id: user.id,
      phoneNumber: user.phoneNumber,
    };

    next();
  } catch (error: any) {
    return ApiResponse.unauthorized(res, error.message || 'Authentication failed');
  }
};

// Legacy authenticate function - alias for validateToken
export const authenticate = validateToken;

