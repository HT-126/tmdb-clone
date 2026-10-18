import { z } from 'zod';
import { emailSchema, passwordMaxBytes } from './registerUser.js';

// Body of POST /api/auth/login. No minimum length here: a wrong password is a 401, not a 400.
export const loginUserSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).refine(passwordMaxBytes, 'Password must be at most 72 bytes'),
});
