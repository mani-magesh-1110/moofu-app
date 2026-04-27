const express = require('express');
const bookingController = require('../controllers/bookingController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authenticate, bookingController.createBooking);
router.get('/history/user', authenticate, bookingController.bookingHistory);
router.get('/:id', authenticate, bookingController.getBooking);
router.delete('/:id', authenticate, bookingController.cancelBooking);

module.exports = router;
