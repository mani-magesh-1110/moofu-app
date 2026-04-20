import { Request, Response, NextFunction } from 'express';
import * as bookingService from '../services/bookingService';
import { sendSuccess, sendError, AppError } from '../utils/response';

export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return sendError(res, 401, 'Unauthorized');
    }

    const bookingData = req.body;

    if (!bookingData.parkingId || !bookingData.vehicleType || !bookingData.vehicleNumber) {
      return sendError(res, 400, 'Missing required booking fields');
    }

    const booking = await bookingService.createBooking(userId, bookingData);
    return sendSuccess(res, 201, booking);
  } catch (error: any) {
    if (error instanceof AppError) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

export const getBookingById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!id) {
      return sendError(res, 400, 'Booking ID is required');
    }

    const booking = await bookingService.getBookingById(id);
    return sendSuccess(res, 200, booking);
  } catch (error: any) {
    if (error instanceof AppError) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

export const getUserBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return sendError(res, 401, 'Unauthorized');
    }

    const bookings = await bookingService.getUserBookingHistory(userId);
    return sendSuccess(res, 200, { bookings });
  } catch (error: any) {
    if (error instanceof AppError) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

export const cancelBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    if (!userId) {
      return sendError(res, 401, 'Unauthorized');
    }

    if (!id) {
      return sendError(res, 400, 'Booking ID is required');
    }

    const result = await bookingService.cancelBooking(id, userId);
    return sendSuccess(res, 200, result);
  } catch (error: any) {
    if (error instanceof AppError) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};
