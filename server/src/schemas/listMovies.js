import { z } from 'zod';

// The sort values the frontend sends (MovieSort.jsx). movieService.js maps each to fixed SQL.
export const SORT_OPTIONS = [
  'popularity.desc',
  'popularity.asc',
  'vote_average.desc',
  'vote_average.asc',
  'primary_release_date.desc',
  'primary_release_date.asc',
  'title.asc',
  'title.desc',
];

// Query string of GET /api/movies.
export const listMoviesSchema = z.object({
  page: z.coerce.number().int().min(1).max(1000).default(1),
  sort: z.enum(SORT_OPTIONS).default('popularity.desc'),
  // "28,878" -> [28, 878]. A movie must have all the genres listed.
  genre: z
    .string()
    .regex(/^\d+(,\d+)*$/, 'genre must be comma-separated numbers')
    .transform((value) => [...new Set(value.split(',').map(Number))])
    .pipe(z.array(z.number().int().positive()).max(10))
    .optional(),
  q: z.string().trim().max(100).optional(),
});
