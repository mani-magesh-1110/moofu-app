const authService = require('../services/authService');
const { successResponse, HttpError } = require('../utils/http');

async function signup(req, res, next) {
  try {
    const { name, email, phoneNumber, password, role, adminSignupSecret } = req.body;
    if (!name || !email || !phoneNumber || !password) {
      throw new HttpError(400, 'name, email, phoneNumber and password are required');
    }

    const data = await authService.signup({ name, email, phoneNumber, password, role, adminSignupSecret });
    return successResponse(res, data, 201);
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new HttpError(400, 'email and password are required');

    const data = await authService.login({ email, password });
    return successResponse(res, data);
  } catch (error) {
    next(error);
  }
}

async function requestOtp(req, res, next) {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) throw new HttpError(400, 'phoneNumber is required');

    const data = await authService.requestOtp(phoneNumber);
    return successResponse(res, data);
  } catch (error) {
    next(error);
  }
}

async function verifyOtp(req, res, next) {
  try {
    const { phoneNumber, otp } = req.body;
    if (!phoneNumber || !otp) throw new HttpError(400, 'phoneNumber and otp are required');

    const data = await authService.verifyOtp(phoneNumber, otp);
    return successResponse(res, data);
  } catch (error) {
    next(error);
  }
}

async function me(req, res, next) {
  try {
    const data = await authService.getMyProfile(req.user.id);
    return successResponse(res, data);
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const data = await authService.updateMyProfile(req.user.id, req.body);
    return successResponse(res, data);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  signup,
  login,
  requestOtp,
  verifyOtp,
  me,
  updateProfile,
};
