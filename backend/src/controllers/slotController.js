const slotService = require('../services/slotService');
const { successResponse, HttpError } = require('../utils/http');

async function addSlots(req, res, next) {
  try {
    const { stationId } = req.params;
    const { slots } = req.body;

    if (!slots || !Array.isArray(slots)) {
      throw new HttpError(400, 'slots must be an array');
    }

    const data = await slotService.addSlots(stationId, slots);
    return successResponse(res, data, 201);
  } catch (error) {
    next(error);
  }
}

async function checkAvailability(req, res, next) {
  try {
    const { stationId } = req.params;
    const { vehicleType, startTime, endTime } = req.query;

    const data = await slotService.getAvailability(stationId, vehicleType, startTime, endTime);
    return successResponse(res, data);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  addSlots,
  checkAvailability,
};
