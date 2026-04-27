const db = require('../config/db');
const bookingRepository = require('../repositories/bookingRepository');
const slotRepository = require('../repositories/slotRepository');
const paymentRepository = require('../repositories/paymentRepository');
const stationRepository = require('../repositories/stationRepository');
const { HttpError } = require('../utils/http');
const { serializeBooking } = require('../utils/serializers');
const { calculateDurationHours, parseIsoDateTime } = require('../utils/datetime');
const {
  PAYMENT_METHODS,
  VEHICLE_TYPES,
  ensureEnum,
  ensureNonEmptyString,
} = require('../utils/validation');

function buildValidatedBookingInput(payload) {
  const parkingId = ensureNonEmptyString(payload.parkingId, 'parkingId');
  const vehicleType = ensureEnum(payload.vehicleType, VEHICLE_TYPES, 'vehicleType');
  const vehicleNumber = ensureNonEmptyString(payload.vehicleNumber, 'vehicleNumber');
  const paymentMethodId = ensureEnum(payload.paymentMethodId, PAYMENT_METHODS, 'paymentMethodId');
  const arrivalAt = parseIsoDateTime(payload.startTime, 'startTime');
  const departureAt = parseIsoDateTime(payload.endTime, 'endTime');

  if (departureAt <= arrivalAt) {
    throw new HttpError(400, 'endTime must be after startTime');
  }

  return {
    parkingId,
    vehicleType,
    vehicleNumber,
    paymentMethodId,
    arrivalAt,
    departureAt,
    durationHours: calculateDurationHours(arrivalAt, departureAt),
  };
}

function getVehicleHourlyRate(station, vehicleType) {
  const baseHourlyRate = Number(station.hourly_rate);
  if (vehicleType === 'bike') {
    return Math.max(10, Math.round(baseHourlyRate * 0.6));
  }

  return baseHourlyRate;
}

async function createBooking(userId, payload) {
  const bookingInput = buildValidatedBookingInput(payload);
  const station = await stationRepository.getStationById(bookingInput.parkingId);
  if (!station) throw new HttpError(404, 'Parking station not found');
  const estimatedSubtotal = getVehicleHourlyRate(station, bookingInput.vehicleType) * bookingInput.durationHours;
  const convenienceFee = Number(station.convenience_fee);
  const totalAmount = estimatedSubtotal + convenienceFee;

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const selectedSlot = await slotRepository.findFirstAvailableSlotForWindow(
      {
        stationId: bookingInput.parkingId,
        vehicleType: bookingInput.vehicleType,
        arrivalAt: bookingInput.arrivalAt,
        departureAt: bookingInput.departureAt,
      },
      client
    );

    if (!selectedSlot) {
      throw new HttpError(409, 'No available slots for the selected time window');
    }

    const booking = await bookingRepository.createBooking(
      {
        user_id: userId,
        station_id: bookingInput.parkingId,
        slot_id: selectedSlot.id,
        vehicle_type: bookingInput.vehicleType,
        vehicle_number: bookingInput.vehicleNumber,
        arrival_at: bookingInput.arrivalAt,
        departure_at: bookingInput.departureAt,
        duration_hours: bookingInput.durationHours,
        estimated_subtotal: estimatedSubtotal,
        convenience_fee: convenienceFee,
        total_amount: totalAmount,
        payment_method_id: bookingInput.paymentMethodId,
      },
      client
    );

    await paymentRepository.createPayment(
      {
        booking_id: booking.id,
        amount: totalAmount,
        method: bookingInput.paymentMethodId,
        status: 'pending',
      },
      client
    );

    await client.query('COMMIT');

    return serializeBooking({
      ...booking,
      station_name: station.name,
      station_area: station.area,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function cancelBooking(userId, bookingId) {
  const booking = await bookingRepository.getBookingById(bookingId);
  if (!booking) throw new HttpError(404, 'Booking not found');

  if (booking.user_id !== userId) {
    throw new HttpError(403, 'You can cancel only your own bookings');
  }

  if (booking.status === 'cancelled') {
    throw new HttpError(400, 'Booking already cancelled');
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const cancelled = await bookingRepository.cancelBooking(bookingId, client);
    await client.query('COMMIT');

    return serializeBooking(cancelled);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function getBookingHistory(userId) {
  const bookings = await bookingRepository.getUserBookings(userId);
  return bookings.map(serializeBooking);
}

async function getBooking(userId, bookingId) {
  const booking = await bookingRepository.getBookingByIdForUser(bookingId, userId);
  if (!booking) {
    throw new HttpError(404, 'Booking not found');
  }

  return serializeBooking(booking);
}

module.exports = {
  createBooking,
  cancelBooking,
  getBookingHistory,
  getBooking,
};
