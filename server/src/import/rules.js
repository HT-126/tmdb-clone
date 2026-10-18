import { importMovieSchema } from '../schemas/importMovie.js';

// TMDB genre ids by name (the CSV only has names).
export const GENRES = {
  Action: 28,
  Adventure: 12,
  Animation: 16,
  Comedy: 35,
  Crime: 80,
  Documentary: 99,
  Drama: 18,
  Family: 10751,
  Fantasy: 14,
  History: 36,
  Horror: 27,
  Music: 10402,
  Mystery: 9648,
  Romance: 10749,
  'Science Fiction': 878,
  'TV Movie': 10770,
  Thriller: 53,
  War: 10752,
  Western: 37,
};

// Decide if a CSV row is kept. seenIds holds ids of rows already kept (the caller adds to it).
export function keepRow(row, seenIds) {
  if (!/^\d+$/.test(row.id ?? '')) return { keep: false, reason: 'bad_id' };
  if (row.adult !== 'False') return { keep: false, reason: 'adult' };
  const votes = Number.parseInt(row.vote_count, 10);
  if (!(votes >= 100)) return { keep: false, reason: 'low_votes' };
  if (seenIds.has(Number(row.id))) return { keep: false, reason: 'duplicate_id' };
  return { keep: true };
}

// Empty text -> null.
const text = (value) => (value === undefined || value === '' ? null : value);

// Empty or non-numeric -> null; the Zod schema decides if a number is acceptable.
const num = (value) => {
  if (value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

// Keep a date only if it is a real calendar date (YYYY-MM-DD).
const date = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? '')) return null;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(value) ? value : null;
};

// Turn a CSV row into a movies row. Returns { ok: true, movie } or { ok: false, reason }.
export function toMovie(row) {
  const candidate = {
    id: Number(row.id),
    imdb_id: text(row.imdb_id),
    title: row.title ?? '',
    original_title: text(row.original_title),
    overview: text(row.overview),
    tagline: text(row.tagline),
    release_date: date(row.release_date),
    runtime: num(row.runtime),
    vote_average: num(row.vote_average) ?? 0,
    vote_count: num(row.vote_count) ?? 0,
    popularity: num(row.popularity) ?? 0,
    original_language: text(row.original_language),
    status: text(row.status),
    poster_path: text(row.poster_path),
    backdrop_path: text(row.backdrop_path),
  };
  const result = importMovieSchema.safeParse(candidate);
  if (!result.success) return { ok: false, reason: 'invalid_row' };
  return { ok: true, movie: result.data };
}

// "Action, Science Fiction" -> { ids: [28, 878], unknown: [] }
export function parseGenres(value) {
  const ids = [];
  const unknown = [];
  for (const name of (value ?? '').split(',').map((s) => s.trim()).filter(Boolean)) {
    if (Object.hasOwn(GENRES, name)) {
      if (!ids.includes(GENRES[name])) ids.push(GENRES[name]);
    } else {
      unknown.push(name);
    }
  }
  return { ids, unknown };
}
