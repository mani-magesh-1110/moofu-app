const stationService = require('../services/stationService');
const { successResponse, HttpError } = require('../utils/http');

async function createStation(req, res, next) {
  try {
    const data = await stationService.createStation(
      {
        name: req.body.name,
        area: req.body.area,
        address: req.body.address,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        hourlyRate: req.body.hourlyRate ?? req.body.hourly_rate,
        convenienceFee: req.body.convenienceFee ?? req.body.convenience_fee,
        totalSpots: req.body.totalSpots ?? req.body.total_spots,
      },
      req.user.id
    );

    return successResponse(res, data, 201);
  } catch (error) {
    next(error);
  }
}

async function listStations(req, res, next) {
  try {
    const stations = await stationService.listStations(req.query);
    return successResponse(res, { spaces: stations });
  } catch (error) {
    next(error);
  }
}

async function nearbyStations(req, res, next) {
  try {
    const stations = await stationService.getNearbyStations(req.query);
    return successResponse(res, { spaces: stations });
  } catch (error) {
    next(error);
  }
}

async function searchStationsByArea(req, res, next) {
  try {
    const stations = await stationService.listStations({ area: req.query.area });
    return successResponse(res, { spaces: stations });
  } catch (error) {
    next(error);
  }
}

async function getStationById(req, res, next) {
  try {
    const station = await stationService.getStationDetails(req.params.id);
    return successResponse(res, { space: station });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createStation,
  listStations,
  nearbyStations,
  searchStationsByArea,
  getStationById,
};
