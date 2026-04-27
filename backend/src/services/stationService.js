const stationRepository = require('../repositories/stationRepository');
const { HttpError } = require('../utils/http');
const { serializeStation } = require('../utils/serializers');
const {
  ensureNonEmptyString,
  ensureNumber,
} = require('../utils/validation');

async function createStation(payload, createdBy) {
  const station = await stationRepository.createStation({
    name: ensureNonEmptyString(payload.name, 'name'),
    area: ensureNonEmptyString(payload.area, 'area'),
    address: ensureNonEmptyString(payload.address, 'address'),
    latitude: ensureNumber(payload.latitude, 'latitude', { min: -90, max: 90 }),
    longitude: ensureNumber(payload.longitude, 'longitude', { min: -180, max: 180 }),
    hourly_rate: ensureNumber(payload.hourlyRate, 'hourlyRate', { min: 0 }),
    convenience_fee: ensureNumber(payload.convenienceFee ?? 0, 'convenienceFee', { min: 0 }),
    total_spots: ensureNumber(payload.totalSpots, 'totalSpots', { integer: true, min: 1 }),
    created_by: createdBy,
  });

  return serializeStation(station);
}

async function listStations(query) {
  const stations = await stationRepository.listStations({ area: query.area || null });
  return stations.map(serializeStation);
}

async function getNearbyStations(query) {
  const latitude = Number(query.latitude);
  const longitude = Number(query.longitude);
  const radiusKm = query.radiusKm ? Number(query.radiusKm) : 5;

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    throw new HttpError(400, 'latitude and longitude are required numbers');
  }

  const stations = await stationRepository.findNearbyStations({ latitude, longitude, radiusKm });
  return stations.map(serializeStation);
}

async function getStationDetails(stationId) {
  const station = await stationRepository.getStationById(stationId);
  if (!station) {
    throw new HttpError(404, 'Parking station not found');
  }

  return serializeStation(station);
}

module.exports = {
  createStation,
  listStations,
  getNearbyStations,
  getStationDetails,
};
