import { Router } from 'express';
import * as bookingController from '../controller/bookingController';
import { validateToken } from '../middleware/auth.middleware';

const router = Router();

// Protected routes (require authentication)
router.post('/', validateToken, bookingController.createBooking);
router.get('/history/user', validateToken, bookingController.getUserBookings);
router.get('/:id', validateToken, bookingController.getBookingById);
router.delete('/:id', validateToken, bookingController.cancelBooking);

export default router;
