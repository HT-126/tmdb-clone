import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { pool } from '../src/db/pool.js';
import { clearUsers, resetAndSeedTestDb } from './helpers/db.js';

// Real test database. Each "browser" is a request.agent that keeps its own cookie.
beforeAll(resetAndSeedTestDb);
beforeEach(clearUsers); // removes users and, by cascade, their favorites
afterAll(() => pool.end());

async function newUser(email) {
  const browser = request.agent(app);
  const res = await browser.post('/api/auth/register').send({ email, password: 'password123' });
  return { browser, id: res.body.id };
}

const listIds = async (browser) => (await browser.get('/api/favorites')).body.map((m) => m.id);

describe('favorites need login', () => {
  it.each([
    ['get', '/api/favorites'],
    ['put', '/api/favorites/1'],
    ['delete', '/api/favorites/1'],
    ['delete', '/api/favorites'],
  ])('%s %s returns 401 without a cookie', async (method, path) => {
    const res = await request(app)[method](path);
    expect(res.status).toBe(401);
  });
});

describe('add, list, remove', () => {
  it('adds a favorite and lists it in the movie list shape', async () => {
    const { browser } = await newUser('a@example.com');
    expect((await browser.put('/api/favorites/1')).status).toBe(204);

    const res = await browser.get('/api/favorites');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({
      id: 1,
      title: 'Inception',
      release_date: '2010-07-15',
      vote_average: 8.4,
      poster_path: '/inception.jpg',
    });
  });

  it('lists an empty array when there are no favorites', async () => {
    const { browser } = await newUser('a@example.com');
    const res = await browser.get('/api/favorites');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('adding the same movie twice is fine and keeps one row', async () => {
    const { browser } = await newUser('a@example.com');
    expect((await browser.put('/api/favorites/1')).status).toBe(204);
    expect((await browser.put('/api/favorites/1')).status).toBe(204);
    expect(await listIds(browser)).toEqual([1]);
  });

  it('lists the newest added first', async () => {
    const { browser } = await newUser('a@example.com');
    for (const id of [5, 1, 3]) await browser.put(`/api/favorites/${id}`);
    expect(await listIds(browser)).toEqual([3, 1, 5]);
  });

  it('returns 404 for a movie that does not exist', async () => {
    const { browser } = await newUser('a@example.com');
    const res = await browser.put('/api/favorites/999999');
    expect(res.status).toBe(404);
    expect(await listIds(browser)).toEqual([]);
  });

  it.each(['abc', '0', '-1', '1.5'])('returns 400 for movie id "%s"', async (id) => {
    const { browser } = await newUser('a@example.com');
    expect((await browser.put(`/api/favorites/${id}`)).status).toBe(400);
    expect((await browser.delete(`/api/favorites/${id}`)).status).toBe(400);
  });

  it('removes one favorite, also when it was not a favorite', async () => {
    const { browser } = await newUser('a@example.com');
    await browser.put('/api/favorites/1');
    await browser.put('/api/favorites/2');
    expect((await browser.delete('/api/favorites/1')).status).toBe(204);
    expect((await browser.delete('/api/favorites/1')).status).toBe(204);
    expect(await listIds(browser)).toEqual([2]);
  });

  it('clears all favorites of the user', async () => {
    const { browser } = await newUser('a@example.com');
    await browser.put('/api/favorites/1');
    await browser.put('/api/favorites/2');
    expect((await browser.delete('/api/favorites')).status).toBe(204);
    expect(await listIds(browser)).toEqual([]);
  });
});

describe('one user cannot see or change another user favorites', () => {
  it('keeps each list private', async () => {
    const a = await newUser('a@example.com');
    const b = await newUser('b@example.com');
    await a.browser.put('/api/favorites/1');
    await b.browser.put('/api/favorites/2');

    expect(await listIds(a.browser)).toEqual([1]);
    expect(await listIds(b.browser)).toEqual([2]);
  });

  it('B removing or clearing does not touch A', async () => {
    const a = await newUser('a@example.com');
    const b = await newUser('b@example.com');
    await a.browser.put('/api/favorites/1');
    await a.browser.put('/api/favorites/2');
    await b.browser.put('/api/favorites/1');

    await b.browser.delete('/api/favorites/1'); // same movie id as A's favorite
    expect(await listIds(a.browser)).toEqual([2, 1]); // newest first
    expect(await listIds(b.browser)).toEqual([]);

    await b.browser.put('/api/favorites/3');
    await b.browser.delete('/api/favorites'); // clear B
    expect(await listIds(a.browser)).toEqual([2, 1]);
  });

  it('ignores a user id sent in the query or body', async () => {
    const a = await newUser('a@example.com');
    const b = await newUser('b@example.com');

    await b.browser.put(`/api/favorites/4?user_id=${a.id}&userId=${a.id}`).send({ user_id: a.id, userId: a.id });
    expect(await listIds(a.browser)).toEqual([]);
    expect(await listIds(b.browser)).toEqual([4]);

    await a.browser.put('/api/favorites/1');
    await b.browser.delete(`/api/favorites/1?user_id=${a.id}`).send({ user_id: a.id });
    expect(await listIds(a.browser)).toEqual([1]);
  });
});

describe('a user that was deleted while the cookie is still valid', () => {
  it('gets 401 (not 404 or 204) on every favorites route, and the dead cookie is cleared', async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ email: 'gone@example.com', password: 'password123' });
    const cookie = reg.headers['set-cookie'].find((c) => c.startsWith('token=')).split(';')[0];

    // The cookie works while the user exists.
    const before = await request(app).put('/api/favorites/1').set('Cookie', cookie);
    expect(before.status).toBe(204);

    await pool.query('DELETE FROM users WHERE id = ?', [reg.body.id]);

    for (const [method, path] of [
      ['get', '/api/favorites'],
      ['put', '/api/favorites/1'],
      ['delete', '/api/favorites/1'],
      ['delete', '/api/favorites'],
    ]) {
      const res = await request(app)[method](path).set('Cookie', cookie);
      expect(res.status).toBe(401);
      expect(res.headers['set-cookie'].join(';')).toMatch(/token=;.*Expires=Thu, 01 Jan 1970/i);
    }
  });
});

describe('database rules', () => {
  it('deleting a user deletes that user favorites', async () => {
    const a = await newUser('a@example.com');
    await a.browser.put('/api/favorites/1');
    await pool.query('DELETE FROM users WHERE id = ?', [a.id]);
    const [[{ n }]] = await pool.query('SELECT COUNT(*) AS n FROM favorites');
    expect(n).toBe(0);
  });
});
