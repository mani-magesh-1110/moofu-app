const { HttpError } = require('./http');

const VEHICLE_TYPES = new Set(['car', 'bike']);
const PAYMENT_METHODS = new Set(['google_pay', 'phonepe', 'paytm']);

function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

function normalizePhoneNumber(phoneNumber) {
  return typeof phoneNumber === 'string' ? phoneNumber.replace(/\D/g, '') : '';
}

function ensureNonEmptyString(value, fieldName) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new HttpError(400, `${fieldName} is required`);
  }

  return value.trim();
}

function ensureEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new HttpError(400, 'email must be a valid email address');
  }

  return normalizedEmail;
}

function ensurePhoneNumber(phoneNumber) {
  const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);
  if (!/^\d{10}$/.test(normalizedPhoneNumber)) {
    throw new HttpError(400, 'phoneNumber must be a 10 digit number');
  }

  return normalizedPhoneNumber;
}

function ensureNumber(value, fieldName, options = {}) {
  const parsedValue = Number(value);
  if (Number.isNaN(parsedValue)) {
    throw new HttpError(400, `${fieldName} must be a valid number`);
  }

  if (options.integer && !Number.isInteger(parsedValue)) {
    throw new HttpError(400, `${fieldName} must be an integer`);
  }

  if (options.min !== undefined && parsedValue < options.min) {
    throw new HttpError(400, `${fieldName} must be at least ${options.min}`);
  }

  if (options.max !== undefined && parsedValue > options.max) {
    throw new HttpError(400, `${fieldName} must be at most ${options.max}`);
  }

  return parsedValue;
}

function ensureEnum(value, allowedValues, fieldName) {
  if (!allowedValues.has(value)) {
    throw new HttpError(400, `${fieldName} must be one of: ${Array.from(allowedValues).join(', ')}`);
  }

  return value;
}

module.exports = {
  PAYMENT_METHODS,
  VEHICLE_TYPES,
  normalizeEmail,
  normalizePhoneNumber,
  ensureNonEmptyString,
  ensureEmail,
  ensurePhoneNumber,
  ensureNumber,
  ensureEnum,
};
