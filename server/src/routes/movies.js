import { Router } from 'express';
import { getMovie, listMovies } from '../controllers/movieController.js';
import { validate } from '../middleware/validate.js';
import { getMovieSchema } from '../schemas/getMovie.js';
import { listMoviesSchema } from '../schemas/listMovies.js';

const router = Router();

router.get('/', validate(listMoviesSchema, 'query'), listMovies);
router.get('/:id', validate(getMovieSchema, 'params'), getMovie);

export default router;
