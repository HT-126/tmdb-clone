import jwt from 'jsonwebtoken';
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { env } from '../src/config/env.js';
import { pool } from '../src/db/pool.js';
import { clearUsers } from './helpers/db.js';

// Real test database. request.agent(app) keeps cookies like a browser does.
beforeEach(clearUsers);
afterAll(() => pool.end());

const creds = { email: 'Person@Example.com', password: 'password123' };

const tokenCookie = (res) => (res.headers['set-cookie'] ?? []).find((c) => c.startsWith('token='));
const tokenValue = (res) => tokenCookie(res).split(';')[0].slice('token='.length);

describe('POST /api/auth/register', () => {
  it('creates the user, sets an httpOnly cookie, and never returns the token or hash', async () => {
    const res = await request(app).post('/api/auth/register').send(creds);
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: expect.any(Number), email: 'person@example.com' });

    const cookie = tokenCookie(res);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Lax/i);
    expect(cookie).toMatch(/Path=\//i);
    expect(JSON.stringify(res.body)).not.toContain(tokenValue(res));
    expect(JSON.stringify(res.body)).not.toMatch(/password|hash/i);
  });

  it('stores a bcrypt hash and a lowercase email, never the password', async () => {
    await request(app).post('/api/auth/register').send(creds);
    const [rows] = await pool.query('SELECT email, password_hash FROM users');
    expect(rows).toHaveLength(1);
    expect(rows[0].email).toBe('person@example.com');
    expect(rows[0].password_hash).toMatch(/^\$2[aby]\$10\$/);
    expect(rows[0].password_hash).not.toContain('password123');
  });

  it('returns 409 for a duplicate email, also in a different letter case', async () => {
    await request(app).post('/api/auth/register').send(creds);
    const again = await request(app)
      .post('/api/auth/register')
      .send({ email: 'PERSON@example.COM', password: 'another-password' });
    expect(again.status).toBe(409);
    expect(tokenCookie(again)).toBeUndefined();
  });

  it.each([
    ['missing body', {}],
    ['bad email', { email: 'not-an-email', password: 'password123' }],
    ['password of 7 characters', { email: 'a@b.co', password: '1234567' }],
    ['password of 73 characters', { email: 'a@b.co', password: 'x'.repeat(73) }],
    ['password over 72 bytes', { email: 'a@b.co', password: 'é'.repeat(37) }], // 37 x 2 bytes
    ['password is not text', { email: 'a@b.co', password: 12345678 }],
  ])('returns 400 for %s', async (label, body) => {
    const res = await request(app).post('/api/auth/register').send(body);
    expect(res.status).toBe(400);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(creds);
  });

  it('logs in (email in any letter case) and sets the cookie', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'person@EXAMPLE.com', password: creds.password });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: expect.any(Number), email: 'person@example.com' });
    expect(tokenCookie(res)).toMatch(/HttpOnly/i);
    expect(JSON.stringify(res.body)).not.toContain(tokenValue(res));
  });

  it('gives the same 401 for a wrong password and an unknown email', async () => {
    const wrongPassword = await request(app)
      .post('/api/auth/login')
      .send({ email: creds.email, password: 'wrong-password' });
    const unknownEmail = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'password123' });

    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.status).toBe(401);
    expect(wrongPassword.body).toEqual({ error: 'Invalid email or password' });
    expect(unknownEmail.body).toEqual(wrongPassword.body);
    expect(tokenCookie(wrongPassword)).toBeUndefined();
  });

  it('returns 400 for bad input', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'nope' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/auth/me and POST /api/auth/logout', () => {
  it('returns the user after register, and 401 after logout', async () => {
    const browser = request.agent(app);
    await browser.post('/api/auth/register').send(creds);

    const me = await browser.get('/api/auth/me');
    expect(me.status).toBe(200);
    expect(me.body).toEqual({ id: expect.any(Number), email: 'person@example.com' });

    const out = await browser.post('/api/auth/logout');
    expect(out.status).toBe(204);
    expect(tokenCookie(out)).toMatch(/Expires=Thu, 01 Jan 1970/i);

    const after = await browser.get('/api/auth/me');
    expect(after.status).toBe(401);
  });

  it('returns 401 without a cookie', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Not logged in' });
  });

  it('returns 401 for a tampered, wrongly signed, or expired token', async () => {
    const reg = await request(app).post('/api/auth/register').send(creds);
    const good = tokenValue(reg);
    const userId = reg.body.id;

    const tampered = `${good.slice(0, -2)}xx`;
    const wrongSecret = jwt.sign({ sub: String(userId) }, 'x'.repeat(40));
    const expired = jwt.sign({ sub: String(userId) }, env.JWT_SECRET, { expiresIn: -10 });
    const noAlgorithm = jwt.sign({ sub: String(userId) }, '', { algorithm: 'none' });

    for (const token of [tampered, wrongSecret, expired, noAlgorithm]) {
      const res = await request(app).get('/api/auth/me').set('Cookie', `token=${token}`);
      expect(res.status).toBe(401);
    }
    // The untouched token still works.
    const ok = await request(app).get('/api/auth/me').set('Cookie', `token=${good}`);
    expect(ok.status).toBe(200);
  });

  it('returns 401 for a valid token of a user that no longer exists', async () => {
    const reg = await request(app).post('/api/auth/register').send(creds);
    await pool.query('DELETE FROM users WHERE id = ?', [reg.body.id]);
    const res = await request(app).get('/api/auth/me').set('Cookie', `token=${tokenValue(reg)}`);
    expect(res.status).toBe(401);
  });

  it('logout works without being logged in', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(204);
  });
});
