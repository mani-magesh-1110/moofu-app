const stationService = require('./stationService');
const slotService = require('./slotService');

async function onboardStation(payload, adminUserId) {
  return stationService.createStation(payload, adminUserId);
}

async function manageSlots(stationId, slots) {
  return slotService.addSlots(stationId, slots);
}

async function listSlots(stationId) {
  return slotService.listSlots(stationId);
}

async function updateSlot(slotId, payload) {
  return slotService.updateSlot(slotId, payload);
}

module.exports = {
  onboardStation,
  manageSlots,
  listSlots,
  updateSlot,
};
