// Global response and error handling utilities
import { Response } from 'express';

export class ApiResponse {
  static success(
    res: Response,
    data: any = null,
    message: string = 'Success',
    statusCode: number = 200
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  static error(
    res: Response,
    message: string = 'An error occurred',
    statusCode: number = 400,
    errors: any = null
  ) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString(),
    });
  }

  static created(
    res: Response,
    data: any = null,
    message: string = 'Created successfully'
  ) {
    return this.success(res, data, message, 201);
  }

  static notFound(res: Response, message: string = 'Resource not found') {
    return this.error(res, message, 404);
  }

  static unauthorized(res: Response, message: string = 'Unauthorized') {
    return this.error(res, message, 401);
  }

  static forbidden(res: Response, message: string = 'Forbidden') {
    return this.error(res, message, 403);
  }

  static badRequest(res: Response, message: string, errors?: any) {
    return this.error(res, message, 400, errors);
  }

  static conflict(res: Response, message: string = 'Conflict') {
    return this.error(res, message, 409);
  }

  static internalError(res: Response, message: string = 'Internal server error') {
    return this.error(res, message, 500);
  }
}

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
    public errors?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Helper functions for use in controllers
export const sendSuccess = (res: Response, statusCode: number, data: any) => {
  return ApiResponse.success(res, data, data.message || 'Success', statusCode);
};

export const sendError = (res: Response, statusCode: number, message: string) => {
  return ApiResponse.error(res, message, statusCode);
};
