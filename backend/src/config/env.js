const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  adminSignupSecret: process.env.ADMIN_SIGNUP_SECRET || '',
  otpTtlMinutes: Number(process.env.OTP_TTL_MINUTES) || 5,
  devOtpCode: process.env.DEV_OTP_CODE || '1234',
  otpMaxAttempts: Number(process.env.OTP_MAX_ATTEMPTS) || 5,
};
