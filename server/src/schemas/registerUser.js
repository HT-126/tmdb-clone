import { z } from 'zod';

// Emails are stored lowercase, so "A@B.com" and "a@b.com" are the same account.
export const emailSchema = z.string().trim().toLowerCase().pipe(z.email().max(255));

// bcrypt only uses the first 72 BYTES of a password, so limit bytes, not characters.
export const passwordMaxBytes = (value) => Buffer.byteLength(value, 'utf8') <= 72;

// Body of POST /api/auth/register
export const registerUserSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .refine(passwordMaxBytes, 'Password must be at most 72 bytes'),
});
