import { describe, it, expect } from 'vitest';
import { keepRow, parseGenres, toMovie } from '../src/import/rules.js';

// A good row from the CSV; each test changes one field.
const good = {
  id: '27205',
  title: 'Inception',
  vote_average: '8.364',
  vote_count: '34495',
  status: 'Released',
  release_date: '2010-07-15',
  runtime: '148',
  adult: 'False',
  backdrop_path: '/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg',
  imdb_id: 'tt1375666',
  original_language: 'en',
  original_title: 'Inception',
  overview: 'A thief enters dreams.',
  popularity: '83.952',
  poster_path: '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
  tagline: '',
  genres: 'Action, Science Fiction, Adventure',
};

describe('keepRow', () => {
  it('keeps a good row', () => {
    expect(keepRow(good, new Set())).toEqual({ keep: true });
  });

  it('rejects each kind of bad row with a reason', () => {
    expect(keepRow({ ...good, id: 'abc' }, new Set()).reason).toBe('bad_id');
    expect(keepRow({ ...good, adult: 'True' }, new Set()).reason).toBe('adult');
    expect(keepRow({ ...good, vote_count: '99' }, new Set()).reason).toBe('low_votes');
    expect(keepRow({ ...good, vote_count: '' }, new Set()).reason).toBe('low_votes');
    expect(keepRow(good, new Set([27205])).reason).toBe('duplicate_id');
  });
});

describe('toMovie', () => {
  it('converts a good row and turns empty text into null', () => {
    const result = toMovie(good);
    expect(result.ok).toBe(true);
    expect(result.movie).toMatchObject({ id: 27205, runtime: 148, vote_average: 8.364, tagline: null });
  });

  it('keeps a missing poster as null', () => {
    expect(toMovie({ ...good, poster_path: '' }).movie.poster_path).toBeNull();
  });

  it('turns an impossible date into null', () => {
    expect(toMovie({ ...good, release_date: '2010-13-45' }).movie.release_date).toBeNull();
  });

  it('rejects a row without a title', () => {
    expect(toMovie({ ...good, title: '' })).toEqual({ ok: false, reason: 'invalid_row' });
  });

  it('rejects values the database columns cannot hold (INT UNSIGNED, TEXT)', () => {
    const invalid = { ok: false, reason: 'invalid_row' };
    expect(toMovie({ ...good, id: '4294967296' })).toEqual(invalid);
    expect(toMovie({ ...good, vote_count: '5000000000' })).toEqual(invalid);
    expect(toMovie({ ...good, overview: 'x'.repeat(65536) })).toEqual(invalid);
    expect(toMovie({ ...good, tagline: 'x'.repeat(65536) })).toEqual(invalid);
    // 20,000 emoji are only 20,000 characters but 80,000 bytes in utf8mb4.
    expect(toMovie({ ...good, overview: '😀'.repeat(20000) })).toEqual(invalid);
  });

  it('accepts values exactly at the column limits', () => {
    expect(toMovie({ ...good, id: '4294967295' }).ok).toBe(true);
    expect(toMovie({ ...good, vote_count: '4294967295' }).ok).toBe(true);
    expect(toMovie({ ...good, overview: 'x'.repeat(65535) }).ok).toBe(true);
  });
});

describe('parseGenres', () => {
  it('maps names to TMDB ids', () => {
    expect(parseGenres('Action, Science Fiction')).toEqual({ ids: [28, 878], unknown: [] });
  });

  it('reports unknown names and handles empty text', () => {
    expect(parseGenres('Action, Space Opera')).toEqual({ ids: [28], unknown: ['Space Opera'] });
    expect(parseGenres('')).toEqual({ ids: [], unknown: [] });
  });
});
