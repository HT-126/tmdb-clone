import { Router } from 'express';
import { listGenres } from '../controllers/movieController.js';

const router = Router();

router.get('/', listGenres);

export default router;
