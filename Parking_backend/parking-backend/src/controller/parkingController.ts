import { Request, Response, NextFunction } from 'express';
import * as parkingService from '../services/parkingService';
import { sendSuccess, sendError, AppError } from '../utils/response';

export const getAllParkings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const spaces = await parkingService.getAllParkingSpaces();
    return sendSuccess(res, 200, { spaces });
  } catch (error: any) {
    if (error instanceof AppError) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

export const getParkingById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!id) {
      return sendError(res, 400, 'Parking ID is required');
    }

    const space = await parkingService.getParkingSpaceById(id);
    return sendSuccess(res, 200, space);
  } catch (error: any) {
    if (error instanceof AppError) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

export const searchByArea = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { area } = req.query;

    if (!area || typeof area !== 'string') {
      return sendError(res, 400, 'Area parameter is required');
    }

    const spaces = await parkingService.searchParkingByArea(area);
    return sendSuccess(res, 200, { spaces });
  } catch (error: any) {
    if (error instanceof AppError) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};
