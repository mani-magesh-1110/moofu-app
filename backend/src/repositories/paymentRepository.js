const { randomUUID } = require('crypto');
const db = require('../config/db');

async function createPayment(payment, client = db) {
  const result = await client.query(
    `INSERT INTO payments (id, booking_id, amount, method, status, provider_txn_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [randomUUID(), payment.booking_id, payment.amount, payment.method, payment.status, payment.provider_txn_id || null]
  );

  return result.rows[0];
}

module.exports = {
  createPayment,
};
