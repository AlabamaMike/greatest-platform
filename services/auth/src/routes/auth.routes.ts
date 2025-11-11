import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';
import { rateLimit } from '../middleware/rateLimit';
import Joi from 'joi';

const router = Router();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  fullName: Joi.string().min(2).required(),
  phoneNumber: Joi.string().optional(),
  countryCode: Joi.string().optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

// Routes
router.post(
  '/register',
  rateLimit({ windowMs: 60000, max: 5 }), // 5 requests per minute
  validateRequest(registerSchema),
  authController.register.bind(authController)
);

router.post(
  '/login',
  rateLimit({ windowMs: 60000, max: 10 }), // 10 requests per minute
  validateRequest(loginSchema),
  authController.login.bind(authController)
);

router.post(
  '/refresh',
  validateRequest(refreshTokenSchema),
  authController.refreshToken.bind(authController)
);

router.post('/logout', authenticate, authController.logout.bind(authController));

router.get('/profile', authenticate, authController.getProfile.bind(authController));

export { router as authRoutes };
