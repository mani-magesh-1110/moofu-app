function errorHandler(err, req, res, next) {
  const constraintMessages = {
    users_email_key: 'Email already registered',
    users_phone_number_key: 'Phone number already registered',
    parking_slots_station_id_slot_number_key: 'Slot number already exists for this station',
  };

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (!err.statusCode && err.code) {
    if (err.code === '23505') {
      statusCode = 409;
      message = constraintMessages[err.constraint] || 'Resource already exists';
    } else if (err.code === '23503') {
      statusCode = 400;
      message = 'Related resource does not exist';
    } else if (err.code === '23514' || err.code === '23502') {
      statusCode = 400;
      message = 'Request data failed database validation';
    }
  }

  if (statusCode >= 500) {
    console.error('[ERROR]', err);
    message = 'Internal Server Error';
  }

  return res.status(statusCode).json({
    success: false,
    message,
  });
}

module.exports = errorHandler;
