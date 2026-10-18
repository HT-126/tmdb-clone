import { z } from 'zod';

// Params of GET /api/movies/:id
export const getMovieSchema = z.object({
  id: z.coerce.number().int().positive(),
});
