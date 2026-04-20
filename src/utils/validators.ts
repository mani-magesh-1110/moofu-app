export function normalizePhoneInput(raw: string) {
  return raw.replace(/\D/g, "");
}

// Simple phone validation for demo: accept 10 digits (assuming +91 fixed in UI).
export function isValidPhoneNumber(phoneDigits: string) {
  return /^\d{10}$/.test(phoneDigits);
}

export function isValidOtp(otp: string) {
  return /^\d{4}$/.test(otp);
}

// Light vehicle number validation: allow alphanumeric 3-10 chars.
export function isValidVehicleNumber(value: string) {
  const v = value.trim().toUpperCase().replace(/\s+/g, "");
  return /^[A-Z0-9]{3,10}$/.test(v);
}

export function normalizeVehicleNumber(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

