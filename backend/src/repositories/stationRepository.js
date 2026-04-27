const { randomUUID } = require('crypto');
const db = require('../config/db');

const STATION_COLUMNS = `
  ps.id,
  ps.name,
  ps.area,
  ps.address,
  ps.latitude,
  ps.longitude,
  ps.hourly_rate,
  ps.convenience_fee,
  ps.total_spots,
  ps.created_by,
  ps.created_at,
  ps.updated_at
`;

const AVAILABLE_SPOTS_SUBQUERY = `
  (
    SELECT COUNT(*)
    FROM parking_slots pas
    WHERE pas.station_id = ps.id
      AND pas.is_available = TRUE
      AND NOT EXISTS (
        SELECT 1
        FROM bookings b
        WHERE b.slot_id = pas.id
          AND b.status = 'confirmed'
          AND b.arrival_at <= NOW()
          AND COALESCE(b.departure_at, b.arrival_at) > NOW()
      )
  ) AS available_spots
`;

async function createStation(station) {
  const result = await db.query(
    `INSERT INTO parking_stations
      (id, name, area, address, latitude, longitude, hourly_rate, convenience_fee, total_spots, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING *`,
    [
      randomUUID(),
      station.name,
      station.area,
      station.address,
      station.latitude,
      station.longitude,
      station.hourly_rate,
      station.convenience_fee,
      station.total_spots,
      station.created_by,
    ]
  );

  return result.rows[0];
}

async function listStations({ area }) {
  const params = [];
  let whereClause = '';

  if (area) {
    params.push(`%${area}%`);
    whereClause = `WHERE LOWER(ps.area) LIKE LOWER($${params.length})`;
  }

  const result = await db.query(
    `SELECT ${STATION_COLUMNS},
            ${AVAILABLE_SPOTS_SUBQUERY}
     FROM parking_stations ps
     ${whereClause}
     ORDER BY ps.created_at DESC`,
    params
  );

  return result.rows;
}

async function getStationById(stationId) {
  const result = await db.query(
    `SELECT ${STATION_COLUMNS},
            ${AVAILABLE_SPOTS_SUBQUERY}
     FROM parking_stations ps
     WHERE ps.id = $1`,
    [stationId]
  );

  return result.rows[0] || null;
}

async function findNearbyStations({ latitude, longitude, radiusKm = 5 }) {
  const result = await db.query(
    `SELECT ${STATION_COLUMNS},
            ${AVAILABLE_SPOTS_SUBQUERY},
            (6371 * acos(
              cos(radians($1)) * cos(radians(ps.latitude)) *
              cos(radians(ps.longitude) - radians($2)) +
              sin(radians($1)) * sin(radians(ps.latitude))
            )) AS distance_km
     FROM parking_stations ps
     WHERE (6371 * acos(
              cos(radians($1)) * cos(radians(ps.latitude)) *
              cos(radians(ps.longitude) - radians($2)) +
              sin(radians($1)) * sin(radians(ps.latitude))
            )) <= $3
     ORDER BY distance_km ASC`,
    [latitude, longitude, radiusKm]
  );

  return result.rows;
}

module.exports = {
  createStation,
  listStations,
  getStationById,
  findNearbyStations,
};
