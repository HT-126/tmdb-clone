import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const COOKIE_NAME = 'token';
const EXPIRES_IN_SECONDS = 7 * 24 * 60 * 60; // 7 days, no refresh token

// The token only says who the user is: { sub: "<user id>" }.
export function signToken(userId) {
  return jwt.sign({ sub: String(userId) }, env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: EXPIRES_IN_SECONDS,
  });
}

// Returns the user id, or null when the token is missing, wrong, tampered or expired.
export function verifyToken(token) {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
    const id = Number(payload.sub);
    return Number.isInteger(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
}

// httpOnly: JavaScript in the page cannot read the token.
// sameSite lax: the browser does not send it on cross-site POST/PUT/DELETE requests.
const cookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: env.NODE_ENV === 'production',
  path: '/',
});

export function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, { ...cookieOptions(), maxAge: EXPIRES_IN_SECONDS * 1000 });
}

export function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, cookieOptions());
}
