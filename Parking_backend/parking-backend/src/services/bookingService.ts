import { AppDataSource } from '../config/data-source';
import { Booking } from '../entities/Booking';
import { User } from '../entities/User';
import { ParkingSpace } from '../entities/ParkingSpace';
import { AppError } from '../utils/response';

// Create a new booking
export const createBooking = async (
  userId: string,
  bookingData: {
    parkingId: string;
    vehicleType: string;
    vehicleNumber: string;
    arrivalDateISO: string;
    arrivalTimeLabel: string;
    departureDateISO: string;
    departureTimeLabel: string;
    durationHours: number;
    selectedMonthlyPlanId?: string;
    estimatedSubtotal: number;
    convenienceFee: number;
    totalAmount: number;
    paymentMethodId: string;
  }
): Promise<any> => {
  const userRepo = AppDataSource.getRepository(User);
  const parkingRepo = AppDataSource.getRepository(ParkingSpace);
  const bookingRepo = AppDataSource.getRepository(Booking);

  // Verify user exists
  const user = await userRepo.findOne({ where: { id: userId } });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Verify parking space exists
  const parking = await parkingRepo.findOne({ where: { id: bookingData.parkingId } });
  if (!parking) {
    throw new AppError('Parking space not found', 404);
  }

  // Validate dates
  const arrivalDate = new Date(bookingData.arrivalDateISO);
  const departureDate = new Date(bookingData.departureDateISO);

  if (arrivalDate >= departureDate) {
    throw new AppError('Departure date must be after arrival date', 400);
  }

  // Create booking
  const booking = bookingRepo.create({
    userId,
    parkingId: bookingData.parkingId,
    vehicleType: bookingData.vehicleType,
    vehicleNumber: bookingData.vehicleNumber,
    arrivalDateISO: bookingData.arrivalDateISO,
    arrivalTimeLabel: bookingData.arrivalTimeLabel,
    departureDateISO: bookingData.departureDateISO,
    departureTimeLabel: bookingData.departureTimeLabel,
    durationHours: bookingData.durationHours,
    selectedMonthlyPlanId: bookingData.selectedMonthlyPlanId || null,
    estimatedSubtotal: bookingData.estimatedSubtotal,
    convenienceFee: bookingData.convenienceFee,
    totalAmount: bookingData.totalAmount,
    paymentMethodId: bookingData.paymentMethodId,
    tokenNo: `TOKEN-${Date.now()}`,
    createdAtISO: new Date().toISOString(),
  });

  await bookingRepo.save(booking);

  return {
    id: booking.id,
    userId: booking.userId,
    parkingId: booking.parkingId,
    vehicleType: booking.vehicleType,
    vehicleNumber: booking.vehicleNumber,
    arrivalDateISO: booking.arrivalDateISO,
    arrivalTimeLabel: booking.arrivalTimeLabel,
    departureDateISO: booking.departureDateISO,
    departureTimeLabel: booking.departureTimeLabel,
    durationHours: booking.durationHours,
    selectedMonthlyPlanId: booking.selectedMonthlyPlanId,
    estimatedSubtotal: booking.estimatedSubtotal,
    convenienceFee: booking.convenienceFee,
    totalAmount: booking.totalAmount,
    paymentMethodId: booking.paymentMethodId,
    tokenNo: booking.tokenNo,
    createdAtISO: booking.createdAtISO,
  };
};

// Get booking by ID
export const getBookingById = async (bookingId: string): Promise<any> => {
  const bookingRepo = AppDataSource.getRepository(Booking);
  const booking = await bookingRepo.findOne({ where: { id: bookingId } });

  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  return {
    id: booking.id,
    userId: booking.userId,
    parkingId: booking.parkingId,
    vehicleType: booking.vehicleType,
    vehicleNumber: booking.vehicleNumber,
    arrivalDateISO: booking.arrivalDateISO,
    arrivalTimeLabel: booking.arrivalTimeLabel,
    departureDateISO: booking.departureDateISO,
    departureTimeLabel: booking.departureTimeLabel,
    durationHours: booking.durationHours,
    selectedMonthlyPlanId: booking.selectedMonthlyPlanId,
    estimatedSubtotal: booking.estimatedSubtotal,
    convenienceFee: booking.convenienceFee,
    totalAmount: booking.totalAmount,
    paymentMethodId: booking.paymentMethodId,
    tokenNo: booking.tokenNo,
    createdAtISO: booking.createdAtISO,
  };
};

// Get user's booking history
export const getUserBookingHistory = async (userId: string): Promise<any[]> => {
  const userRepo = AppDataSource.getRepository(User);
  const bookingRepo = AppDataSource.getRepository(Booking);

  // Verify user exists
  const user = await userRepo.findOne({ where: { id: userId } });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const bookings = await bookingRepo.find({
    where: { userId },
    order: { createdAtISO: 'DESC' }, // Most recent first
  });

  return bookings.map((booking) => ({
    id: booking.id,
    userId: booking.userId,
    parkingId: booking.parkingId,
    vehicleType: booking.vehicleType,
    vehicleNumber: booking.vehicleNumber,
    arrivalDateISO: booking.arrivalDateISO,
    arrivalTimeLabel: booking.arrivalTimeLabel,
    departureDateISO: booking.departureDateISO,
    departureTimeLabel: booking.departureTimeLabel,
    durationHours: booking.durationHours,
    selectedMonthlyPlanId: booking.selectedMonthlyPlanId,
    estimatedSubtotal: booking.estimatedSubtotal,
    convenienceFee: booking.convenienceFee,
    totalAmount: booking.totalAmount,
    paymentMethodId: booking.paymentMethodId,
    tokenNo: booking.tokenNo,
    createdAtISO: booking.createdAtISO,
  }));
};

// Cancel booking
export const cancelBooking = async (bookingId: string, userId: string): Promise<{ message: string }> => {
  const bookingRepo = AppDataSource.getRepository(Booking);
  const booking = await bookingRepo.findOne({ where: { id: bookingId } });

  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  if (booking.userId !== userId) {
    throw new AppError('Not authorized to cancel this booking', 403);
  }

  // Check if booking is in the future
  const departureDate = new Date(booking.departureDateISO);
  if (departureDate < new Date()) {
    throw new AppError('Cannot cancel a past booking', 400);
  }

  await bookingRepo.remove(booking);

  return { message: 'Booking cancelled successfully' };
};
