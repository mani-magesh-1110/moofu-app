const { randomUUID } = require('crypto');
const db = require('../config/db');

async function deleteOtpCodesForUser(userId, client = db) {
  await client.query('DELETE FROM otp_codes WHERE user_id = $1', [userId]);
}

async function createOtpCode({ userId, code, expiresAt }, client = db) {
  const result = await client.query(
    `INSERT INTO otp_codes (id, user_id, code, expires_at)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [randomUUID(), userId, code, expiresAt]
  );

  return result.rows[0];
}

async function getLatestOtpCodeByUserId(userId, client = db) {
  const result = await client.query(
    `SELECT *
     FROM otp_codes
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId]
  );

  return result.rows[0] || null;
}

async function incrementAttempts(otpCodeId, client = db) {
  const result = await client.query(
    `UPDATE otp_codes
     SET attempts = attempts + 1
     WHERE id = $1
     RETURNING *`,
    [otpCodeId]
  );

  return result.rows[0] || null;
}

module.exports = {
  deleteOtpCodesForUser,
  createOtpCode,
  getLatestOtpCodeByUserId,
  incrementAttempts,
};
