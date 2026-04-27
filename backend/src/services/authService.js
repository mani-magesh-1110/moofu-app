const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const otpRepository = require('../repositories/otpRepository');
const env = require('../config/env');
const { HttpError } = require('../utils/http');
const { USER_ROLES } = require('../models/userModel');
const {
  ensureEmail,
  ensureNonEmptyString,
  ensurePhoneNumber,
} = require('../utils/validation');

if (!env.jwtSecret) {
  throw new Error('JWT_SECRET is required');
}

function buildAuthResponse(user) {
  const token = jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phone_number,
      role: user.role,
      location: user.location,
      vehicleNumber: user.vehicle_number,
    },
    token,
  };
}

async function findOrCreateOtpUser(phoneNumber) {
  const existingUser = await userRepository.findByPhone(phoneNumber);
  if (existingUser) {
    return existingUser;
  }

  return userRepository.createUser({
    name: 'MOOFU User',
    email: `otp-${phoneNumber}@moofu.app`,
    phone_number: phoneNumber,
    password_hash: await bcrypt.hash(`otp-${phoneNumber}`, 12),
    role: USER_ROLES.CUSTOMER,
  });
}

function generateOtpCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

async function signup(payload) {
  const name = ensureNonEmptyString(payload.name, 'name');
  const email = ensureEmail(payload.email);
  const phoneNumber = ensurePhoneNumber(payload.phoneNumber);
  const password = ensureNonEmptyString(payload.password, 'password');
  const requestedRole = payload.role || USER_ROLES.CUSTOMER;

  if (password.length < 8) {
    throw new HttpError(400, 'password must be at least 8 characters long');
  }

  let role = USER_ROLES.CUSTOMER;
  if (requestedRole === USER_ROLES.ADMIN) {
    if (!env.adminSignupSecret || payload.adminSignupSecret !== env.adminSignupSecret) {
      throw new HttpError(403, 'Admin signup is not allowed without a valid admin signup secret');
    }
    role = USER_ROLES.ADMIN;
  } else if (requestedRole !== USER_ROLES.CUSTOMER) {
    throw new HttpError(400, 'role must be either admin or customer');
  }

  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw new HttpError(409, 'Email already registered');
  }

  const existingByPhone = await userRepository.findByPhone(phoneNumber);
  if (existingByPhone) {
    throw new HttpError(409, 'Phone number already registered');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await userRepository.createUser({
    name,
    email,
    phone_number: phoneNumber,
    password_hash: passwordHash,
    role: role || USER_ROLES.CUSTOMER,
  });

  return buildAuthResponse(user);
}

async function login(payload) {
  const email = ensureEmail(payload.email);
  const password = ensureNonEmptyString(payload.password, 'password');
  const user = await userRepository.findByEmail(email);

  if (!user) {
    throw new HttpError(401, 'Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw new HttpError(401, 'Invalid email or password');
  }

  return buildAuthResponse(user);
}

async function requestOtp(phoneNumber) {
  const normalizedPhoneNumber = ensurePhoneNumber(phoneNumber);
  const user = await findOrCreateOtpUser(normalizedPhoneNumber);
  const otp = env.nodeEnv === 'production' ? generateOtpCode() : env.devOtpCode;
  const expiresAt = new Date(Date.now() + env.otpTtlMinutes * 60 * 1000);

  await otpRepository.deleteOtpCodesForUser(user.id);
  await otpRepository.createOtpCode({
    userId: user.id,
    code: otp,
    expiresAt,
  });

  console.log(`[OTP] ${normalizedPhoneNumber}: ${otp}`);

  return {
    message: `OTP sent to +91${normalizedPhoneNumber}`,
    expiresAt: expiresAt.toISOString(),
  };
}

async function verifyOtp(phoneNumber, otp) {
  const normalizedPhoneNumber = ensurePhoneNumber(phoneNumber);
  const normalizedOtp = ensureNonEmptyString(String(otp), 'otp');
  const user = await userRepository.findByPhone(normalizedPhoneNumber);

  if (!user) {
    throw new HttpError(404, 'User not found for requested OTP');
  }

  const otpRecord = await otpRepository.getLatestOtpCodeByUserId(user.id);
  if (!otpRecord) {
    throw new HttpError(401, 'OTP expired or not requested');
  }

  if (new Date(otpRecord.expires_at).getTime() <= Date.now()) {
    await otpRepository.deleteOtpCodesForUser(user.id);
    throw new HttpError(401, 'OTP expired or not requested');
  }

  if (otpRecord.attempts >= env.otpMaxAttempts) {
    await otpRepository.deleteOtpCodesForUser(user.id);
    throw new HttpError(429, 'Too many OTP attempts. Request a new OTP.');
  }

  if (otpRecord.code !== normalizedOtp) {
    const updatedOtpRecord = await otpRepository.incrementAttempts(otpRecord.id);
    if (updatedOtpRecord && updatedOtpRecord.attempts >= env.otpMaxAttempts) {
      await otpRepository.deleteOtpCodesForUser(user.id);
      throw new HttpError(429, 'Too many OTP attempts. Request a new OTP.');
    }

    throw new HttpError(401, 'Invalid OTP');
  }

  await otpRepository.deleteOtpCodesForUser(user.id);
  return buildAuthResponse(user);
}

async function getMyProfile(userId) {
  const user = await userRepository.findById(userId);
  if (!user) throw new HttpError(404, 'User not found');

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phoneNumber: user.phone_number,
    role: user.role,
    location: user.location,
    vehicleNumber: user.vehicle_number,
  };
}

async function updateMyProfile(userId, payload) {
  const user = await userRepository.updateProfile(userId, {
    name: payload.name,
    location: payload.location,
    vehicle_number: payload.vehicleNumber,
  });

  if (!user) throw new HttpError(404, 'User not found');

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phoneNumber: user.phone_number,
    role: user.role,
    location: user.location,
    vehicleNumber: user.vehicle_number,
  };
}

module.exports = {
  signup,
  login,
  requestOtp,
  verifyOtp,
  getMyProfile,
  updateMyProfile,
};
