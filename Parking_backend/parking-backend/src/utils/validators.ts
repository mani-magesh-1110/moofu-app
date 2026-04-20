// Input validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhoneNumber = (phone: string): boolean => {
  // Indian phone number format: 10 digits starting with 6-9
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

export const validatePassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

export const validateOTP = (otp: string): boolean => {
  // 4-6 digit OTP
  return /^\d{4,6}$/.test(otp);
};

export const validateVehicleNumber = (vehicleNumber: string): boolean => {
  // Indian vehicle number format: XX-XX-XXXX or XXXX
  const vehicleRegex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{0,2}[0-9]{4}$|^[0-9]{4}$/;
  return vehicleRegex.test(vehicleNumber.toUpperCase());
};

export const validateVehicleType = (vehicleType: string): boolean => {
  const validTypes = ['TWO_WHEELER', 'FOUR_WHEELER', 'SEDAN', 'SUV', 'HATCHBACK'];
  return validTypes.includes(vehicleType.toUpperCase());
};

export const sanitizeString = (str: string): string => {
  return str.trim().replace(/[<>\"']/g, '');
};

export const validateRequired = (value: any, fieldName: string): void => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    throw new Error(`${fieldName} is required`);
  }
};

export const validateMinLength = (value: string, minLength: number, fieldName: string): void => {
  if (value.length < minLength) {
    throw new Error(`${fieldName} must be at least ${minLength} characters`);
  }
};

export const validateMaxLength = (value: string, maxLength: number, fieldName: string): void => {
  if (value.length > maxLength) {
    throw new Error(`${fieldName} must not exceed ${maxLength} characters`);
  }
};
