import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';
import { sendSuccess, sendError, AppError } from '../utils/response';

export const requestOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return sendError(res, 400, 'Phone number is required');
    }

    const result = await authService.requestOTP(phoneNumber);
    return sendSuccess(res, 200, result);
  } catch (error: any) {
    if (error instanceof AppError) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

export const verifyOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return sendError(res, 400, 'Phone number and OTP are required');
    }

    const result = await authService.verifyOTPAndLogin(phoneNumber, otp);
    return sendSuccess(res, 200, result);
  } catch (error: any) {
    if (error instanceof AppError) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return sendError(res, 401, 'Unauthorized');
    }

    const user = await authService.getUserById(userId);
    return sendSuccess(res, 200, user);
  } catch (error: any) {
    if (error instanceof AppError) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const { name, location, vehicleNumber } = req.body;

    if (!userId) {
      return sendError(res, 401, 'Unauthorized');
    }

    const updatedUser = await authService.updateUserProfile(userId, {
      name,
      location,
      vehicleNumber,
    });

    return sendSuccess(res, 200, updatedUser);
  } catch (error: any) {
    if (error instanceof AppError) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};
