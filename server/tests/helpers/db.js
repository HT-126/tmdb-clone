import { env } from '../../src/config/env.js';
import { migrate } from '../../src/db/migrate.js';
import { pool } from '../../src/db/pool.js';

// Refuse to touch anything unless the pool points at the test database.
export async function assertTestDatabase() {
  const [[{ name }]] = await pool.query('SELECT DATABASE() AS name');
  if (name !== env.TEST_DB_NAME) {
    throw new Error(`Refusing to clear "${name}": it is not the test database`);
  }
}

async function prepareTestDb() {
  await assertTestDatabase();
  await migrate();
}

// Empty the users table (test database only).
export async function clearUsers() {
  await prepareTestDb();
  await pool.query('DELETE FROM users');
}

// Empty the movie tables, then insert a small known data set.
export async function resetAndSeedTestDb() {
  await prepareTestDb();
  await pool.query('DELETE FROM movie_genres');
  await pool.query('DELETE FROM movies');
  await pool.query('DELETE FROM genres');

  await pool.query('INSERT INTO genres (id, name) VALUES ?', [
    [
      [28, 'Action'],
      [878, 'Science Fiction'],
      [18, 'Drama'],
    ],
  ]);

  // id, title, original_title, release_date, vote_average, popularity, poster_path
  const movies = [
    [1, 'Inception', 'Inception', '2010-07-15', 8.4, 90, '/inception.jpg'],
    [2, 'Amélie', "Le Fabuleux Destin d'Amélie Poulain", '2001-04-25', 7.9, 80, '/amelie.jpg'],
    [3, '100% Wolf', '100% Wolf', '2003-01-01', 6, 70, '/wolf.jpg'],
    [4, '1000 Days', '1000 Days', '2004-01-01', 5.5, 60, '/days.jpg'],
    [5, 'No Poster', 'No Poster', null, 3.3, 50, null],
  ];
  const links = [
    [1, 28],
    [1, 878],
    [2, 18],
  ];
  // Movies 6..25: popularity = id, rating = id % 10, released 2000 + id.
  // All Drama; even ids also Action; ids divisible by 5 also Science Fiction.
  for (let id = 6; id <= 25; id += 1) {
    const label = `Movie ${String(id).padStart(2, '0')}`;
    movies.push([id, label, label, `${2000 + id}-01-01`, id % 10, id, `/m${id}.jpg`]);
    links.push([id, 18]);
    if (id % 2 === 0) links.push([id, 28]);
    if (id % 5 === 0) links.push([id, 878]);
  }

  await pool.query(
    `INSERT INTO movies (id, title, original_title, release_date, vote_average, popularity,
                         poster_path, vote_count)
     VALUES ?`,
    [movies.map((m) => [...m, 1000])]
  );
  await pool.query('INSERT INTO movie_genres (movie_id, genre_id) VALUES ?', [links]);
}
