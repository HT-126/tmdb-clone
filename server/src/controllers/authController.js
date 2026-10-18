import bcrypt from 'bcrypt';
import { clearAuthCookie, setAuthCookie, signToken } from '../services/authToken.js';
import { createUser, findUserWithHashByEmail } from '../services/userService.js';

const BCRYPT_COST = 10;

// Compared against when the email is unknown, so the response takes about as long as a real check.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', BCRYPT_COST);

const INVALID_LOGIN = { error: 'Invalid email or password' };

export async function register(req, res) {
  const { email, password } = req.validated.body;
  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
  try {
    const user = await createUser(email, passwordHash);
    setAuthCookie(res, signToken(user.id));
    res.status(201).json(user);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email already registered' });
    throw err;
  }
}

export async function login(req, res) {
  const { email, password } = req.validated.body;
  const user = await findUserWithHashByEmail(email);
  const passwordOk = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);
  // Unknown email and wrong password give the same answer.
  if (!user || !passwordOk) return res.status(401).json(INVALID_LOGIN);
  setAuthCookie(res, signToken(user.id));
  res.json({ id: user.id, email: user.email });
}

export function logout(req, res) {
  clearAuthCookie(res);
  res.status(204).end();
}

// requireAuth already loaded the user (and rejected dead sessions).
export function me(req, res) {
  res.json(req.user);
}
