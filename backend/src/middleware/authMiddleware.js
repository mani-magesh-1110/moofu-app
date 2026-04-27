const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { HttpError } = require('../utils/http');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new HttpError(401, 'Authorization token missing');
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = payload;
    next();
  } catch (error) {
    throw new HttpError(401, 'Invalid or expired token');
  }
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new HttpError(403, 'Forbidden: insufficient permissions');
    }
    next();
  };
}

module.exports = {
  authenticate,
  authorizeRoles,
};
