import { COOKIE_NAME, clearAuthCookie, verifyToken } from '../services/authToken.js';
import { findUserById } from '../services/userService.js';

// Routes behind this middleware get req.user = { id, email } for a logged-in user.
// Never take the user id from the body, query or URL.
// The token is valid for 7 days, so also check that the user still exists:
// a deleted user must not keep working with an old cookie.
export async function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  const userId = token ? verifyToken(token) : null;
  const user = userId ? await findUserById(userId) : null;

  if (!user) {
    // Dead session: tell the browser to drop the cookie.
    if (token) clearAuthCookie(res);
    return res.status(401).json({ error: 'Not logged in' });
  }

  req.user = user;
  next();
}
