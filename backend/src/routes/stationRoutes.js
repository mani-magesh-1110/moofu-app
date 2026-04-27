const express = require('express');
const stationController = require('../controllers/stationController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', stationController.listStations);
router.get('/search/area', stationController.searchStationsByArea);
router.get('/nearby', stationController.nearbyStations);
router.get('/:id', stationController.getStationById);
router.post('/', authenticate, authorizeRoles('admin'), stationController.createStation);

module.exports = router;
