const { randomUUID } = require('crypto');
const db = require('../config/db');

async function createBooking(booking, client = db) {
  const result = await client.query(
    `INSERT INTO bookings
      (id, user_id, station_id, slot_id, vehicle_type, vehicle_number, arrival_at, departure_at,
       duration_hours, estimated_subtotal, convenience_fee, total_amount, payment_method_id, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'confirmed')
     RETURNING *`,
    [
      randomUUID(),
      booking.user_id,
      booking.station_id,
      booking.slot_id,
      booking.vehicle_type,
      booking.vehicle_number,
      booking.arrival_at,
      booking.departure_at,
      booking.duration_hours,
      booking.estimated_subtotal,
      booking.convenience_fee,
      booking.total_amount,
      booking.payment_method_id,
    ]
  );
  return result.rows[0];
}

async function getBookingById(id, client = db) {
  const result = await client.query(
    `SELECT b.*, ps.name AS station_name, ps.area AS station_area
     FROM bookings b
     JOIN parking_stations ps ON ps.id = b.station_id
     WHERE b.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function cancelBooking(id, client = db) {
  const result = await client.query(
    `UPDATE bookings
     SET status = 'cancelled', cancelled_at = NOW(), updated_at = NOW()
     WHERE id = $1
     RETURNING id`,
    [id]
  );

  if (!result.rows[0]) {
    return null;
  }

  return getBookingById(id, client);
}

async function getBookingByIdForUser(id, userId) {
  const result = await db.query(
    `SELECT b.*, ps.name AS station_name, ps.area AS station_area
     FROM bookings b
     JOIN parking_stations ps ON ps.id = b.station_id
     WHERE b.id = $1 AND b.user_id = $2`,
    [id, userId]
  );
  return result.rows[0] || null;
}

async function getUserBookings(userId) {
  const result = await db.query(
    `SELECT b.*, ps.name as station_name, ps.area as station_area
     FROM bookings b
     JOIN parking_stations ps ON ps.id = b.station_id
     WHERE b.user_id = $1
     ORDER BY b.created_at DESC`,
    [userId]
  );
  return result.rows;
}

module.exports = {
  createBooking,
  getBookingById,
  getBookingByIdForUser,
  cancelBooking,
  getUserBookings,
};
