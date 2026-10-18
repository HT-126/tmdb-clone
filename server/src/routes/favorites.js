import { Router } from 'express';
import {
  addFavorite,
  clearFavorites,
  listFavorites,
  removeFavorite,
} from '../controllers/favoriteController.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { validate } from '../middleware/validate.js';
import { favoriteMovieSchema } from '../schemas/favoriteMovie.js';

const router = Router();

// Every favorites route needs a logged-in user.
router.use(requireAuth);

router.get('/', listFavorites);
router.delete('/', clearFavorites);
router.put('/:movieId', validate(favoriteMovieSchema, 'params'), addFavorite);
router.delete('/:movieId', validate(favoriteMovieSchema, 'params'), removeFavorite);

export default router;
