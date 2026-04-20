import { Router } from 'express';
import * as authController from '../controller/authController';
import { validateToken } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/otp/request', authController.requestOTP);
router.post('/otp/verify', authController.verifyOTP);

// Protected routes
router.get('/me', validateToken, authController.getCurrentUser);
router.put('/profile', validateToken, authController.updateProfile);

export default router;
