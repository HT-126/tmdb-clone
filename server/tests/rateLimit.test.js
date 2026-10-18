import express from 'express';
import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { createRateLimiter } from '../src/middleware/rateLimit.js';

// A tiny app with only the limiter: no database needed.
function makeApp({ windowMs, max }) {
  const app = express();
  app.post('/try', createRateLimiter({ windowMs, max }), (req, res) => res.json({ ok: true }));
  return app;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe('createRateLimiter', () => {
  it('allows `max` requests, then answers 429 with Retry-After', async () => {
    const app = makeApp({ windowMs: 60000, max: 3 });

    for (let i = 0; i < 3; i += 1) {
      expect((await request(app).post('/try')).status).toBe(200);
    }
    const blocked = await request(app).post('/try');
    expect(blocked.status).toBe(429);
    expect(blocked.body).toEqual({ error: 'Too many attempts, try again later' });
    expect(Number(blocked.headers['retry-after'])).toBeGreaterThan(0);
  });

  it('allows requests again after the window has passed', async () => {
    const app = makeApp({ windowMs: 100, max: 1 });

    expect((await request(app).post('/try')).status).toBe(200);
    expect((await request(app).post('/try')).status).toBe(429);
    await sleep(150);
    expect((await request(app).post('/try')).status).toBe(200);
  });

  it('keeps a separate counter for each limiter', async () => {
    const a = makeApp({ windowMs: 60000, max: 1 });
    const b = makeApp({ windowMs: 60000, max: 1 });

    await request(a).post('/try');
    expect((await request(a).post('/try')).status).toBe(429);
    expect((await request(b).post('/try')).status).toBe(200);
  });
});
