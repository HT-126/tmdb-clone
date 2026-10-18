import { Router } from 'express';
import { env } from '../config/env.js';
import { login, logout, me, register } from '../controllers/authController.js';
import { createRateLimiter } from '../middleware/rateLimit.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { validate } from '../middleware/validate.js';
import { loginUserSchema } from '../schemas/loginUser.js';
import { registerUserSchema } from '../schemas/registerUser.js';

const router = Router();

// Slows down password guessing and mass sign-ups (each try also costs a bcrypt round).
const limitAuthAttempts = createRateLimiter({
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
  max: env.AUTH_RATE_LIMIT_MAX,
});

router.post('/register', limitAuthAttempts, validate(registerUserSchema), register);
router.post('/login', limitAuthAttempts, validate(loginUserSchema), login);
router.post('/logout', logout);
router.get('/me', requireAuth, me);

export default router;
