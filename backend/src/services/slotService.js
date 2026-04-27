const slotRepository = require('../repositories/slotRepository');
const stationRepository = require('../repositories/stationRepository');
const { HttpError } = require('../utils/http');
const { parseIsoDateTime, toIsoString } = require('../utils/datetime');
const { serializeSlot } = require('../utils/serializers');
const {
  VEHICLE_TYPES,
  ensureEnum,
  ensureNonEmptyString,
} = require('../utils/validation');

function normalizeSlotInput(slot) {
  return {
    slot_number: ensureNonEmptyString(slot.slotNumber ?? slot.slot_number, 'slotNumber'),
    vehicle_type: ensureEnum(slot.vehicleType ?? slot.vehicle_type, VEHICLE_TYPES, 'vehicleType'),
  };
}

async function addSlots(stationId, slots) {
  const station = await stationRepository.getStationById(stationId);
  if (!station) throw new HttpError(404, 'Station not found');

  if (!Array.isArray(slots) || slots.length === 0) {
    throw new HttpError(400, 'At least one slot is required');
  }

  const normalizedSlots = slots.map(normalizeSlotInput);
  const duplicateSlotNumbersInRequest = normalizedSlots
    .map((slot) => slot.slot_number.toLowerCase())
    .filter((slotNumber, index, allValues) => allValues.indexOf(slotNumber) !== index);

  if (duplicateSlotNumbersInRequest.length > 0) {
    throw new HttpError(400, 'slotNumber values must be unique within the request');
  }

  const existingSlots = await slotRepository.listSlotsByStation(stationId);
  if (existingSlots.length + normalizedSlots.length > Number(station.total_spots)) {
    throw new HttpError(400, 'Adding these slots would exceed totalSpots for this station');
  }

  const existingSlotNumbers = new Set(existingSlots.map((slot) => slot.slot_number.toLowerCase()));
  const conflictingSlot = normalizedSlots.find((slot) => existingSlotNumbers.has(slot.slot_number.toLowerCase()));
  if (conflictingSlot) {
    throw new HttpError(409, `Slot ${conflictingSlot.slot_number} already exists for this station`);
  }

  const createdSlots = await slotRepository.addSlots(stationId, normalizedSlots);
  return createdSlots.map(serializeSlot);
}

async function getAvailability(stationId, vehicleType, startTime, endTime) {
  const station = await stationRepository.getStationById(stationId);
  if (!station) throw new HttpError(404, 'Station not found');

  const normalizedVehicleType = vehicleType
    ? ensureEnum(vehicleType, VEHICLE_TYPES, 'vehicleType')
    : null;
  let parsedStartTime = null;
  let parsedEndTime = null;
  let availableSlots;

  if (startTime || endTime) {
    if (!startTime || !endTime) {
      throw new HttpError(400, 'startTime and endTime are both required');
    }

    parsedStartTime = parseIsoDateTime(startTime, 'startTime');
    parsedEndTime = parseIsoDateTime(endTime, 'endTime');
    if (parsedEndTime <= parsedStartTime) {
      throw new HttpError(400, 'endTime must be after startTime');
    }

    availableSlots = await slotRepository.getAvailableSlotsForWindow({
      stationId,
      vehicleType: normalizedVehicleType,
      startTime: parsedStartTime,
      endTime: parsedEndTime,
    });
  } else {
    availableSlots = await slotRepository.getAvailableSlots(stationId, normalizedVehicleType);
  }

  return {
    stationId,
    vehicleType: normalizedVehicleType,
    startTime: toIsoString(parsedStartTime),
    endTime: toIsoString(parsedEndTime),
    availableCount: availableSlots.length,
    slots: availableSlots.map(serializeSlot),
  };
}

async function listSlots(stationId) {
  const station = await stationRepository.getStationById(stationId);
  if (!station) throw new HttpError(404, 'Station not found');

  const slots = await slotRepository.listSlotsByStation(stationId);
  return slots.map(serializeSlot);
}

async function updateSlot(slotId, payload) {
  const existingSlot = await slotRepository.getSlotById(slotId);
  if (!existingSlot) {
    throw new HttpError(404, 'Slot not found');
  }

  const updates = {};
  if (payload.vehicleType !== undefined || payload.vehicle_type !== undefined) {
    updates.vehicle_type = ensureEnum(payload.vehicleType ?? payload.vehicle_type, VEHICLE_TYPES, 'vehicleType');
  }
  if (payload.isAvailable !== undefined || payload.is_available !== undefined) {
    const nextValue = payload.isAvailable ?? payload.is_available;
    if (typeof nextValue !== 'boolean') {
      throw new HttpError(400, 'isAvailable must be a boolean');
    }
    updates.is_available = nextValue;
  }

  if (Object.keys(updates).length === 0) {
    throw new HttpError(400, 'At least one slot field must be provided for update');
  }

  const updatedSlot = await slotRepository.updateSlot(slotId, updates);
  return serializeSlot(updatedSlot);
}

module.exports = {
  addSlots,
  getAvailability,
  listSlots,
  updateSlot,
};
