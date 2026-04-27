const express = require('express');
const authRoutes = require('./authRoutes');
const stationRoutes = require('./stationRoutes');
const slotRoutes = require('./slotRoutes');
const bookingRoutes = require('./bookingRoutes');
const adminRoutes = require('./adminRoutes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({ success: true, data: { status: 'ok' } });
});

router.use('/auth', authRoutes);
router.use('/parking', stationRoutes);
router.use('/slots', slotRoutes);
router.use('/booking', bookingRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
