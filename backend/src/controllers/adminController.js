const adminService = require('../services/adminService');
const { successResponse, HttpError } = require('../utils/http');

async function onboardStation(req, res, next) {
  try {
    const data = await adminService.onboardStation(
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

async function manageSlots(req, res, next) {
  try {
    const { stationId } = req.params;
    const { slots } = req.body;

    if (!Array.isArray(slots) || slots.length === 0) {
      throw new HttpError(400, 'slots array is required');
    }

    const data = await adminService.manageSlots(stationId, slots);
    return successResponse(res, data, 201);
  } catch (error) {
    next(error);
  }
}

async function listSlots(req, res, next) {
  try {
    const data = await adminService.listSlots(req.params.stationId);
    return successResponse(res, { slots: data });
  } catch (error) {
    next(error);
  }
}

async function updateSlot(req, res, next) {
  try {
    const data = await adminService.updateSlot(req.params.slotId, req.body);
    return successResponse(res, data);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  onboardStation,
  manageSlots,
  listSlots,
  updateSlot,
};
