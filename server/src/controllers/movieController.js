import * as movieService from '../services/movieService.js';

export async function listMovies(req, res) {
  res.json(await movieService.listMovies(req.validated.query));
}

export async function getMovie(req, res) {
  const movie = await movieService.getMovieById(req.validated.params.id);
  if (!movie) return res.status(404).json({ error: 'Movie not found' });
  res.json(movie);
}

export async function listGenres(req, res) {
  res.json(await movieService.listGenres());
}
