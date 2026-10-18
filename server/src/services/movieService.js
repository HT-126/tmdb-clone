import { pool } from '../db/pool.js';

const PAGE_SIZE = 20;

// ORDER BY cannot use a placeholder, so each allowed sort value maps to a fixed SQL string.
// Movies without a release date go last; id keeps the paging order stable.
const ORDER_BY = {
  'popularity.desc': 'm.popularity DESC',
  'popularity.asc': 'm.popularity ASC',
  'vote_average.desc': 'm.vote_average DESC',
  'vote_average.asc': 'm.vote_average ASC',
  'primary_release_date.desc': 'm.release_date IS NULL, m.release_date DESC',
  'primary_release_date.asc': 'm.release_date IS NULL, m.release_date ASC',
  'title.asc': 'm.title ASC',
  'title.desc': 'm.title DESC',
};

export const LIST_COLUMNS = `m.id, m.title, m.original_title, m.overview, m.release_date, m.vote_average,
  m.vote_count, m.popularity, m.original_language, m.poster_path, m.backdrop_path`;

// Make %, _ and \ in the user's text match themselves inside LIKE.
const escapeLike = (text) => text.replace(/[\\%_]/g, '\\$&');

export async function listMovies({ page, sort, genre, q }) {
  // WHERE is built from fixed pieces; every value goes in the params array.
  const where = [];
  const params = [];
  if (q) {
    const pattern = `%${escapeLike(q)}%`;
    where.push('(m.title LIKE ? OR m.original_title LIKE ?)');
    params.push(pattern, pattern);
  }
  if (genre && genre.length > 0) {
    where.push(
      `m.id IN (SELECT movie_id FROM movie_genres WHERE genre_id IN (?)
                GROUP BY movie_id HAVING COUNT(DISTINCT genre_id) = ?)`
    );
    params.push(genre, genre.length);
  }
  const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM movies m ${whereSql}`, params);
  const [results] = await pool.query(
    `SELECT ${LIST_COLUMNS} FROM movies m ${whereSql}
     ORDER BY ${ORDER_BY[sort]}, m.id ASC LIMIT ? OFFSET ?`,
    [...params, PAGE_SIZE, (page - 1) * PAGE_SIZE]
  );

  return {
    page,
    results,
    total_pages: Math.ceil(total / PAGE_SIZE),
    total_results: total,
  };
}

// One movie with its genres, or null when the id does not exist.
export async function getMovieById(id) {
  const [movies] = await pool.query('SELECT * FROM movies WHERE id = ?', [id]);
  if (movies.length === 0) return null;
  const [genres] = await pool.query(
    `SELECT g.id, g.name FROM genres g
     JOIN movie_genres mg ON mg.genre_id = g.id
     WHERE mg.movie_id = ? ORDER BY g.name`,
    [id]
  );
  return { ...movies[0], genres };
}

export async function listGenres() {
  const [genres] = await pool.query('SELECT id, name FROM genres ORDER BY name');
  return genres;
}
