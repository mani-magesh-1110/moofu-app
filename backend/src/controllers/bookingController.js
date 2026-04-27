const bookingService = require('../services/bookingService');
const { successResponse } = require('../utils/http');

async function createBooking(req, res, next) {
  try {
    const data = await bookingService.createBooking(req.user.id, req.body);
    return successResponse(res, data, 201);
  } catch (error) {
    next(error);
  }
}

async function cancelBooking(req, res, next) {
  try {
    const data = await bookingService.cancelBooking(req.user.id, req.params.id);
    return successResponse(res, data);
  } catch (error) {
    next(error);
  }
}

async function bookingHistory(req, res, next) {
  try {
    const bookings = await bookingService.getBookingHistory(req.user.id);
    return successResponse(res, { bookings });
  } catch (error) {
    next(error);
  }
}

async function getBooking(req, res, next) {
  try {
    const booking = await bookingService.getBooking(req.user.id, req.params.id);
    return successResponse(res, booking);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createBooking,
  cancelBooking,
  bookingHistory,
  getBooking,
};
