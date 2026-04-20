import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';
import * as jwt from 'jsonwebtoken';
import { validatePhoneNumber, validateOTP } from '../utils/validators';
import { AppError } from '../utils/response';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_change_in_production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

// Generate random OTP
const generateOTP = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Generate JWT token
export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
};

// Verify JWT token
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new AppError('Invalid or expired token', 401);
  }
};

// Request OTP for phone number login
export const requestOTP = async (phoneNumber: string): Promise<{ message: string }> => {
  if (!phoneNumber) {
    throw new AppError('Phone number is required', 400);
  }

  const normalizedPhone = phoneNumber.replace(/\D/g, '');
  if (!validatePhoneNumber(normalizedPhone)) {
    throw new AppError('Invalid phone number format', 400);
  }

  const userRepo = AppDataSource.getRepository(User);

  // Generate OTP
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

  // Find or create user with phone
  let user = await userRepo.findOne({ where: { phoneNumber: normalizedPhone } });

  if (!user) {
    user = userRepo.create({
      phoneNumber: normalizedPhone,
      otp,
      otpExpiry,
      name: 'MOOFU User',
      location: 'Not specified',
      vehicleNumber: 'Not specified',
    });
  } else {
    user.otp = otp;
    user.otpExpiry = otpExpiry;
  }

  await userRepo.save(user);

  // In production, send OTP via Twilio/SMS
  // For now, log it (REMOVE IN PRODUCTION)
  console.log(`[DEV] OTP for ${normalizedPhone}: ${otp}`);

  return {
    message: `OTP sent to ${normalizedPhone}`,
  };
};

// Verify OTP and login
export const verifyOTPAndLogin = async (
  phoneNumber: string,
  otp: string
): Promise<{ user: any; token: string }> => {
  if (!phoneNumber || !otp) {
    throw new AppError('Phone number and OTP are required', 400);
  }

  if (!validateOTP(otp)) {
    throw new AppError('Invalid OTP format', 400);
  }

  const normalizedPhone = phoneNumber.replace(/\D/g, '');
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOne({ where: { phoneNumber: normalizedPhone } });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Check OTP
  if (user.otp !== otp) {
    throw new AppError('Invalid OTP', 401);
  }

  // Check OTP expiry
  if (!user.otpExpiry || new Date() > user.otpExpiry) {
    throw new AppError('OTP has expired', 401);
  }

  // Clear OTP
  user.otp = null;
  user.otpExpiry = null;
  await userRepo.save(user);

  // Generate token
  const token = generateToken(user.id);

  return {
    user: {
      id: user.id,
      phoneNumber: user.phoneNumber,
      name: user.name,
      location: user.location,
      vehicleNumber: user.vehicleNumber,
    },
    token,
  };
};

// Get user by ID
export const getUserById = async (userId: string): Promise<any> => {
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOne({ where: { id: userId } });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return {
    id: user.id,
    phoneNumber: user.phoneNumber,
    name: user.name,
    location: user.location,
    vehicleNumber: user.vehicleNumber,
  };
};

// Update user profile
export const updateUserProfile = async (
  userId: string,
  updates: { name?: string; location?: string; vehicleNumber?: string }
): Promise<any> => {
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOne({ where: { id: userId } });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (updates.name) user.name = updates.name;
  if (updates.location) user.location = updates.location;
  if (updates.vehicleNumber) user.vehicleNumber = updates.vehicleNumber;

  await userRepo.save(user);

  return {
    id: user.id,
    phoneNumber: user.phoneNumber,
    name: user.name,
    location: user.location,
    vehicleNumber: user.vehicleNumber,
  };
};

