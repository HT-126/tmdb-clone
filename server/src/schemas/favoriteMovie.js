import { z } from 'zod';

// Params of PUT and DELETE /api/favorites/:movieId
export const favoriteMovieSchema = z.object({
  movieId: z.coerce.number().int().positive(),
});
