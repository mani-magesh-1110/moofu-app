const express = require('express');
const slotController = require('../controllers/slotController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/:stationId', authenticate, authorizeRoles('admin'), slotController.addSlots);
router.get('/:stationId/availability', slotController.checkAvailability);

module.exports = router;
