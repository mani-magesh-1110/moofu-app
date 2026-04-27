const { randomUUID } = require('crypto');
const db = require('../config/db');

async function addSlots(stationId, slots = []) {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const createdSlots = [];
    for (const slot of slots) {
      const result = await client.query(
        `INSERT INTO parking_slots (id, station_id, slot_number, vehicle_type, is_available)
         VALUES ($1, $2, $3, $4, TRUE)
         RETURNING *`,
        [randomUUID(), stationId, slot.slot_number, slot.vehicle_type]
      );
      createdSlots.push(result.rows[0]);
    }

    await client.query('COMMIT');
    return createdSlots;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function listSlotsByStation(stationId) {
  const result = await db.query(
    'SELECT * FROM parking_slots WHERE station_id = $1 ORDER BY slot_number',
    [stationId]
  );
  return result.rows;
}

async function getAvailableSlots(stationId, vehicleType) {
  const result = await db.query(
    `SELECT * FROM parking_slots
     WHERE station_id = $1
       AND is_available = TRUE
       AND ($2::text IS NULL OR vehicle_type = $2)
       AND NOT EXISTS (
         SELECT 1
         FROM bookings b
         WHERE b.slot_id = parking_slots.id
           AND b.status = 'confirmed'
           AND b.arrival_at <= NOW()
           AND COALESCE(b.departure_at, b.arrival_at) > NOW()
       )
     ORDER BY slot_number`,
    [stationId, vehicleType || null]
  );
  return result.rows;
}

async function getAvailableSlotsForWindow({ stationId, vehicleType, startTime, endTime }, client = db) {
  const result = await client.query(
    `SELECT parking_slots.*
     FROM parking_slots
     WHERE parking_slots.station_id = $1
       AND parking_slots.is_available = TRUE
       AND ($2::text IS NULL OR parking_slots.vehicle_type = $2)
       AND NOT EXISTS (
         SELECT 1
         FROM bookings b
         WHERE b.slot_id = parking_slots.id
           AND b.status = 'confirmed'
           AND b.arrival_at < $4
           AND COALESCE(b.departure_at, b.arrival_at) > $3
       )
     ORDER BY parking_slots.slot_number`,
    [stationId, vehicleType || null, startTime, endTime]
  );

  return result.rows;
}

async function findFirstAvailableSlotForWindow({ stationId, vehicleType, arrivalAt, departureAt }, client = db) {
  const result = await client.query(
    `SELECT parking_slots.*
     FROM parking_slots
     WHERE parking_slots.station_id = $1
       AND parking_slots.is_available = TRUE
       AND ($2::text IS NULL OR parking_slots.vehicle_type = $2)
       AND NOT EXISTS (
         SELECT 1
         FROM bookings b
         WHERE b.slot_id = parking_slots.id
           AND b.status = 'confirmed'
           AND b.arrival_at < $4
           AND COALESCE(b.departure_at, b.arrival_at) > $3
       )
     ORDER BY parking_slots.slot_number
     FOR UPDATE OF parking_slots SKIP LOCKED
     LIMIT 1`,
    [stationId, vehicleType || null, arrivalAt, departureAt]
  );

  return result.rows[0] || null;
}

async function getSlotById(slotId, client = db) {
  const result = await client.query('SELECT * FROM parking_slots WHERE id = $1', [slotId]);
  return result.rows[0] || null;
}

async function updateSlot(slotId, updates, client = db) {
  const fields = [];
  const values = [slotId];

  if (updates.vehicle_type !== undefined) {
    values.push(updates.vehicle_type);
    fields.push(`vehicle_type = $${values.length}`);
  }

  if (updates.is_available !== undefined) {
    values.push(updates.is_available);
    fields.push(`is_available = $${values.length}`);
  }

  values.push(new Date());
  fields.push(`updated_at = $${values.length}`);

  const result = await client.query(
    `UPDATE parking_slots
     SET ${fields.join(', ')}
     WHERE id = $1
     RETURNING *`,
    values
  );

  return result.rows[0] || null;
}

module.exports = {
  addSlots,
  listSlotsByStation,
  getAvailableSlots,
  getAvailableSlotsForWindow,
  findFirstAvailableSlotForWindow,
  getSlotById,
  updateSlot,
};
