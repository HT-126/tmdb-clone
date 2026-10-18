import { pool } from '../db/pool.js';
import { LIST_COLUMNS } from './movieService.js';

// Every query filters on userId, which the caller takes from the verified token.

// The user's favorites in the same shape as movie list items, newest added first.
export async function listFavorites(userId) {
  const [rows] = await pool.query(
    `SELECT ${LIST_COLUMNS} FROM favorites f
     JOIN movies m ON m.id = f.movie_id
     WHERE f.user_id = ?
     ORDER BY f.created_at DESC, f.movie_id DESC`,
    [userId]
  );
  return rows;
}

// Returns false when the movie does not exist. Adding twice changes nothing.
export async function addFavorite(userId, movieId) {
  try {
    await pool.query(
      'INSERT INTO favorites (user_id, movie_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE user_id = user_id',
      [userId, movieId]
    );
    return true;
  } catch (err) {
    // A foreign key failed. requireAuth already proved the user exists, so the movie is missing.
    if (err.code === 'ER_NO_REFERENCED_ROW_2') return false;
    throw err;
  }
}

export async function removeFavorite(userId, movieId) {
  await pool.query('DELETE FROM favorites WHERE user_id = ? AND movie_id = ?', [userId, movieId]);
}

export async function clearFavorites(userId) {
  await pool.query('DELETE FROM favorites WHERE user_id = ?', [userId]);
}
