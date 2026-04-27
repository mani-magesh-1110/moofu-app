const { HttpError } = require('./http');

const ISO_TIMEZONE_SUFFIX_REGEX = /(Z|[+-]\d{2}:\d{2})$/;

function parseIsoDateTime(value, fieldName) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new HttpError(400, `${fieldName} is required`);
  }

  const normalizedValue = value.trim();
  if (!ISO_TIMEZONE_SUFFIX_REGEX.test(normalizedValue)) {
    throw new HttpError(400, `${fieldName} must be an ISO 8601 datetime with timezone`);
  }

  const dateTime = new Date(normalizedValue);
  if (Number.isNaN(dateTime.getTime())) {
    throw new HttpError(400, `${fieldName} must be a valid ISO 8601 datetime`);
  }

  return dateTime;
}

function calculateDurationHours(startAt, endAt) {
  const diffMs = endAt.getTime() - startAt.getTime();
  return Math.max(1, Math.ceil(diffMs / (60 * 60 * 1000)));
}

function toIsoString(value) {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

module.exports = {
  parseIsoDateTime,
  calculateDurationHours,
  toIsoString,
};
