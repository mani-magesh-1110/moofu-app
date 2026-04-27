const express = require('express');
const adminController = require('../controllers/adminController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate, authorizeRoles('admin'));
router.post('/stations/onboard', adminController.onboardStation);
router.get('/stations/:stationId/slots', adminController.listSlots);
router.post('/stations/:stationId/slots', adminController.manageSlots);
router.patch('/slots/:slotId', adminController.updateSlot);

module.exports = router;
