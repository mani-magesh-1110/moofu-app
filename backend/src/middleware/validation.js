const Joi = require('joi');

// Auth validation schemas
const authSchemas = {
  signup: Joi.object({
    name: Joi.string().min(2).max(120).required().messages({
      'string.empty': 'Name cannot be empty',
      'string.min': 'Name must be at least 2 characters',
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Invalid email address',
      'string.empty': 'Email cannot be empty',
    }),
    phoneNumber: Joi.string()
      .pattern(/^[\d+\-\s()]{7,20}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid phone number format',
        'string.empty': 'Phone number cannot be empty',
      }),
    password: Joi.string().min(8).max(128).required().messages({
      'string.min': 'Password must be at least 8 characters',
      'string.empty': 'Password cannot be empty',
    }),
    role: Joi.string().valid('admin', 'customer').optional(),
    adminSignupSecret: Joi.string().optional(),
  }),

  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Invalid email address',
    }),
    password: Joi.string().required(),
  }),

  requestOtp: Joi.object({
    phoneNumber: Joi.string()
      .pattern(/^[\d+\-\s()]{7,20}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid phone number format',
      }),
  }),

  verifyOtp: Joi.object({
    phoneNumber: Joi.string()
      .pattern(/^[\d+\-\s()]{7,20}$/)
      .required(),
    otp: Joi.string()
      .length(4)
      .pattern(/^\d{4}$/)
      .required()
      .messages({
        'string.length': 'OTP must be 4 digits',
        'string.pattern.base': 'OTP must contain only digits',
      }),
  }),

  updateProfile: Joi.object({
    name: Joi.string().min(2).max(120).optional(),
    location: Joi.string().max(120).optional(),
    vehicleNumber: Joi.string().max(50).optional(),
  }),
};

// Parking/Station validation schemas
const stationSchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(120).required(),
    area: Joi.string().min(2).max(120).required(),
    address: Joi.string().min(5).max(500).required(),
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    hourlyRate: Joi.number().min(0).precision(2).required(),
    convenienceFee: Joi.number().min(0).precision(2).optional().default(0),
    totalSpots: Joi.number().integer().min(1).required(),
  }),

  listQuery: Joi.object({
    area: Joi.string().optional(),
    limit: Joi.number().integer().min(1).max(100).optional().default(20),
    offset: Joi.number().integer().min(0).optional().default(0),
  }),

  nearbyQuery: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    radiusKm: Joi.number().min(0.1).max(50).optional().default(5),
  }),
};

// Booking validation schemas
const bookingSchemas = {
  create: Joi.object({
    stationId: Joi.string().uuid().required(),
    slotId: Joi.string().uuid().required(),
    vehicleType: Joi.string().valid('car', 'bike').required(),
    vehicleNumber: Joi.string().max(50).required(),
    arrivalAt: Joi.date().iso().required(),
    durationHours: Joi.number().integer().min(1).max(168).required(),
    paymentMethodId: Joi.string().max(40).required(),
  }),

  queryById: Joi.object({
    id: Joi.string().uuid().required(),
  }),

  queryHistory: Joi.object({
    limit: Joi.number().integer().min(1).max(100).optional().default(20),
    offset: Joi.number().integer().min(0).optional().default(0),
  }),
};

// Middleware for validation
function validateRequest(schema) {
  return (req, res, next) => {
    const dataToValidate = {
      ...req.body,
      ...req.params,
      ...req.query,
    };

    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: messages,
      });
    }

    req.validated = value;
    next();
  };
}

module.exports = {
  authSchemas,
  stationSchemas,
  bookingSchemas,
  validateRequest,
};
