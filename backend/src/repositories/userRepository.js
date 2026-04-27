const { randomUUID } = require('crypto');
const db = require('../config/db');

async function createUser({ name, email, phone_number, password_hash, role }) {
  const result = await db.query(
    `INSERT INTO users (id, name, email, phone_number, password_hash, role)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, name, email, phone_number, role, location, vehicle_number, created_at`,
    [randomUUID(), name, email, phone_number, password_hash, role]
  );

  return result.rows[0];
}

async function findByEmail(email) {
  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
}

async function findByPhone(phoneNumber) {
  const result = await db.query('SELECT * FROM users WHERE phone_number = $1', [phoneNumber]);
  return result.rows[0] || null;
}

async function findById(id) {
  const result = await db.query(
    'SELECT id, name, email, phone_number, role, location, vehicle_number, created_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

async function updateProfile(userId, { name, location, vehicle_number }) {
  const result = await db.query(
    `UPDATE users
     SET name = COALESCE($2, name),
         location = COALESCE($3, location),
         vehicle_number = COALESCE($4, vehicle_number),
         updated_at = NOW()
     WHERE id = $1
     RETURNING id, name, email, phone_number, role, location, vehicle_number, created_at`,
    [userId, name || null, location || null, vehicle_number || null]
  );

  return result.rows[0] || null;
}

module.exports = {
  createUser,
  findByEmail,
  findByPhone,
  findById,
  updateProfile,
};
