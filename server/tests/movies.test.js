import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { pool } from '../src/db/pool.js';
import { resetAndSeedTestDb } from './helpers/db.js';

// Real test database with a known data set (see helpers/db.js): 25 movies, 3 genres.
beforeAll(resetAndSeedTestDb);
afterAll(() => pool.end());

const ids = (res) => res.body.results.map((m) => m.id);

describe('GET /api/movies', () => {
  it('returns page 1 sorted by popularity, 20 per page', async () => {
    const res = await request(app).get('/api/movies');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ page: 1, total_results: 25, total_pages: 2 });
    expect(res.body.results).toHaveLength(20);
    expect(ids(res).slice(0, 7)).toEqual([1, 2, 3, 4, 5, 25, 24]);
  });

  it('returns numbers and plain dates, not strings or timestamps', async () => {
    const res = await request(app).get('/api/movies');
    expect(res.body.results[0]).toMatchObject({
      id: 1,
      title: 'Inception',
      release_date: '2010-07-15',
      vote_average: 8.4,
      popularity: 90,
      poster_path: '/inception.jpg',
    });
  });

  it('returns page 2, and an empty page past the end', async () => {
    const page2 = await request(app).get('/api/movies').query({ page: 2 });
    expect(ids(page2)).toEqual([10, 9, 8, 7, 6]);

    const page3 = await request(app).get('/api/movies').query({ page: 3 });
    expect(page3.status).toBe(200);
    expect(page3.body).toMatchObject({ page: 3, results: [], total_results: 25 });
  });

  it('filters by one genre', async () => {
    const res = await request(app).get('/api/movies').query({ genre: '28' });
    expect(res.body.total_results).toBe(11); // Inception + even ids 6..24
  });

  it('filters by two genres: a movie needs both', async () => {
    const res = await request(app).get('/api/movies').query({ genre: '28,878' });
    expect(ids(res)).toEqual([1, 20, 10]);
  });

  it('returns no results for an unknown genre id', async () => {
    const res = await request(app).get('/api/movies').query({ genre: '99999' });
    expect(res.status).toBe(200);
    expect(res.body.total_results).toBe(0);
  });

  it('searches title and original title, ignoring case and accents', async () => {
    expect(ids(await request(app).get('/api/movies').query({ q: 'INCEP' }))).toEqual([1]);
    expect(ids(await request(app).get('/api/movies').query({ q: 'amelie' }))).toEqual([2]);
    expect(ids(await request(app).get('/api/movies').query({ q: 'Fabuleux' }))).toEqual([2]);
  });

  it('treats % in the search text as a normal character', async () => {
    const res = await request(app).get('/api/movies').query({ q: '100%' });
    expect(ids(res)).toEqual([3]); // not "1000 Days"
  });

  it('treats SQL in the search text as plain text', async () => {
    const res = await request(app).get('/api/movies').query({ q: "' OR 1=1 --" });
    expect(res.status).toBe(200);
    expect(res.body.total_results).toBe(0);
  });

  it('combines search, genre and sort', async () => {
    const res = await request(app)
      .get('/api/movies')
      .query({ q: 'movie', genre: '878', sort: 'popularity.asc' });
    expect(ids(res)).toEqual([10, 15, 20, 25]);
  });

  it.each([
    ['popularity.desc', 1],
    ['popularity.asc', 6],
    ['vote_average.desc', 9],
    ['vote_average.asc', 10],
    ['primary_release_date.desc', 25],
    ['primary_release_date.asc', 2],
    ['title.desc', 5],
  ])('sorts by %s (first movie id %i)', async (sort, firstId) => {
    const res = await request(app).get('/api/movies').query({ sort });
    expect(res.status).toBe(200);
    expect(ids(res)[0]).toBe(firstId);
  });

  it('sorts by title A-Z (digits come first)', async () => {
    const res = await request(app).get('/api/movies').query({ sort: 'title.asc' });
    expect([3, 4]).toContain(ids(res)[0]);
  });

  it('puts movies without a release date last', async () => {
    for (const sort of ['primary_release_date.desc', 'primary_release_date.asc']) {
      const res = await request(app).get('/api/movies').query({ sort, page: 2 });
      expect(ids(res).at(-1)).toBe(5);
    }
  });

  it.each([
    ['page=0', { page: 0 }],
    ['page=abc', { page: 'abc' }],
    ['page=1001', { page: 1001 }],
    ['sort=evil', { sort: 'evil' }],
    ['genre=abc', { genre: 'abc' }],
    ['genre with SQL', { genre: '1;DROP TABLE movies' }],
    ['q over 100 characters', { q: 'x'.repeat(101) }],
  ])('returns 400 for %s', async (label, query) => {
    const res = await request(app).get('/api/movies').query(query);
    expect(res.status).toBe(400);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });
});

describe('GET /api/movies/:id', () => {
  it('returns the movie with its genres', async () => {
    const res = await request(app).get('/api/movies/1');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: 1,
      title: 'Inception',
      genres: [
        { id: 28, name: 'Action' },
        { id: 878, name: 'Science Fiction' },
      ],
    });
  });

  it('returns null for a missing poster and an empty genre list', async () => {
    const res = await request(app).get('/api/movies/5');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ poster_path: null, backdrop_path: null, release_date: null, genres: [] });
  });

  it('returns 404 for an unknown id', async () => {
    const res = await request(app).get('/api/movies/999999');
    expect(res.status).toBe(404);
  });

  it.each(['abc', '-1', '0', '1.5'])('returns 400 for id "%s"', async (id) => {
    const res = await request(app).get(`/api/movies/${id}`);
    expect(res.status).toBe(400);
  });
});

describe('GET /api/genres', () => {
  it('returns all genres sorted by name', async () => {
    const res = await request(app).get('/api/genres');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { id: 28, name: 'Action' },
      { id: 18, name: 'Drama' },
      { id: 878, name: 'Science Fiction' },
    ]);
  });
});

describe('unknown routes', () => {
  it('return a JSON 404', async () => {
    const res = await request(app).get('/api/nope');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Not found' });
  });
});
