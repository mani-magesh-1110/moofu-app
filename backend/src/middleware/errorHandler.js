const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  const constraintMessages = {
    users_email_key: 'Email already registered',
    users_phone_number_key: 'Phone number already registered',
    parking_slots_station_id_slot_number_key: 'Slot number already exists for this station',
  };

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  const errorId = Date.now().toString(36) + Math.random().toString(36).substr(2);

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
    logger.error(`[${errorId}] ${err.message}`, { 
      error: err.stack,
      path: req.path,
      method: req.method,
    });
    message = 'Internal Server Error';
  } else if (statusCode >= 400) {
    logger.warn(`[${errorId}] ${message}`, { 
      path: req.path,
      method: req.method,
      statusCode,
    });
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errorId: statusCode >= 500 ? errorId : undefined,
  });
}

module.exports = errorHandler;
