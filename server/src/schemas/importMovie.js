import { z } from 'zod';

const UINT32_MAX = 4294967295; // INT UNSIGNED
const TEXT_MAX_BYTES = 65535; // MySQL TEXT column

// TEXT limits are in bytes, and one emoji is 4 bytes in utf8mb4.
const fitsInText = (value) => Buffer.byteLength(value, 'utf8') <= TEXT_MAX_BYTES;

// Shape of one movie row before it goes into the movies table.
// Limits match the column types in 001_create_movies_genres.sql, so a bad row is skipped
// as "invalid_row" here instead of making the whole batch insert fail.
export const importMovieSchema = z.object({
  id: z.number().int().positive().max(UINT32_MAX),
  imdb_id: z.string().max(20).nullable(),
  title: z.string().min(1).max(500),
  original_title: z.string().max(500).nullable(),
  overview: z.string().refine(fitsInText, 'overview is too long').nullable(),
  tagline: z.string().refine(fitsInText, 'tagline is too long').nullable(),
  release_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  runtime: z.number().int().min(0).max(100000).nullable(),
  vote_average: z.number().min(0).max(10),
  vote_count: z.number().int().min(0).max(UINT32_MAX),
  popularity: z.number().min(0).max(99999999),
  original_language: z.string().max(10).nullable(),
  status: z.string().max(50).nullable(),
  poster_path: z.string().max(255).nullable(),
  backdrop_path: z.string().max(255).nullable(),
});
