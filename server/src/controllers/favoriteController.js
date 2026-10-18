import * as favoriteService from '../services/favoriteService.js';

// The user id is always req.user.id (from the verified token), never from the request.

export async function listFavorites(req, res) {
  res.json(await favoriteService.listFavorites(req.user.id));
}

export async function addFavorite(req, res) {
  const added = await favoriteService.addFavorite(req.user.id, req.validated.params.movieId);
  if (!added) return res.status(404).json({ error: 'Movie not found' });
  res.status(204).end();
}

export async function removeFavorite(req, res) {
  await favoriteService.removeFavorite(req.user.id, req.validated.params.movieId);
  res.status(204).end();
}

export async function clearFavorites(req, res) {
  await favoriteService.clearFavorites(req.user.id);
  res.status(204).end();
}
