import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { pool } from '../src/db/pool.js';
import { migrate } from '../src/db/migrate.js';

// These tests use the real test database (TEST_DB_NAME). No mocks.
describe('GET /api/health', () => {
  afterAll(async () => {
    await pool.end().catch(() => {});
  });

  it('returns 200 when the database is up', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', db: 'up' });
  });

  it('migrations are safe to run twice and create the tables', async () => {
    await migrate();
    await migrate();
    const [rows] = await pool.query(
      `SELECT table_name AS name FROM information_schema.tables
       WHERE table_schema = DATABASE() AND table_name IN ('movies', 'genres', 'movie_genres')`
    );
    expect(rows.map((r) => r.name).sort()).toEqual(['genres', 'movie_genres', 'movies']);
  });

  // Keep this test last: it closes the pool, so the next query fails for real.
  it('returns 503 when the database cannot be reached', async () => {
    await pool.end();
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(503);
    expect(res.body).toEqual({ status: 'error', db: 'down' });
  });
});
