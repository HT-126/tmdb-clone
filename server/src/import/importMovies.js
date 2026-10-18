import { createReadStream } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "csv-parse";
import { pool } from "../db/pool.js";
import { GENRES, keepRow, parseGenres, toMovie } from "./rules.js";

const BATCH_SIZE = 1000;
const MOVIE_COLUMNS = [
  "id",
  "imdb_id",
  "title",
  "original_title",
  "overview",
  "tagline",
  "release_date",
  "runtime",
  "vote_average",
  "vote_count",
  "popularity",
  "original_language",
  "status",
  "poster_path",
  "backdrop_path",
];
const defaultCsv = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../data/TMDB_movie_dataset_v11.csv",
);

// Save the genre list. Safe to repeat.
async function saveGenres() {
  const rows = Object.entries(GENRES).map(([name, id]) => [id, name]);
  await pool.query(
    "INSERT INTO genres (id, name) VALUES ? ON DUPLICATE KEY UPDATE name = VALUES(name)",
    [rows],
  );
  return rows.length;
}

// One transaction per batch: movies first, then their genre links.
// "ON DUPLICATE KEY UPDATE id = id" makes a re-run skip rows that already exist.
async function saveBatch(batch) {
  const movieRows = batch.map((b) => MOVIE_COLUMNS.map((c) => b.movie[c]));
  const linkRows = batch.flatMap((b) => b.genreIds.map((g) => [b.movie.id, g]));
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      `INSERT INTO movies (${MOVIE_COLUMNS.join(", ")}) VALUES ? ON DUPLICATE KEY UPDATE id = id`,
      [movieRows],
    );
    if (linkRows.length > 0) {
      await conn.query(
        "INSERT INTO movie_genres (movie_id, genre_id) VALUES ? ON DUPLICATE KEY UPDATE movie_id = movie_id",
        [linkRows],
      );
    }
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

const countMovies = async () =>
  (await pool.query("SELECT COUNT(*) AS n FROM movies"))[0][0].n;

export async function importMovies(csvPath = defaultCsv) {
  const stats = {
    read: 0,
    kept: 0,
    saved: 0,
    genres: 0,
    skipped: {},
    unknownGenres: {},
  };
  const skip = (reason) => {
    stats.skipped[reason] = (stats.skipped[reason] ?? 0) + 1;
  };

  stats.genres = await saveGenres();
  // New rows = table size after minus before (affectedRows also counts rows that already existed).
  const moviesBefore = await countMovies();

  // Streamed, so the 600+ MB file is never held in memory. A broken CSV record is skipped and counted.
  const parser = createReadStream(csvPath).pipe(
    parse({
      columns: true,
      bom: true,
      relax_column_count: true,
      skip_records_with_error: true,
      on_skip: () => skip("malformed_csv"),
    }),
  );

  const seenIds = new Set();
  let batch = [];
  for await (const row of parser) {
    stats.read += 1;
    if (stats.read % 200000 === 0) console.log(`... read ${stats.read} rows`);

    const decision = keepRow(row, seenIds);
    if (!decision.keep) {
      skip(decision.reason);
      continue;
    }
    const converted = toMovie(row);
    if (!converted.ok) {
      skip(converted.reason);
      continue;
    }
    const { ids, unknown } = parseGenres(row.genres);
    for (const name of unknown)
      stats.unknownGenres[name] = (stats.unknownGenres[name] ?? 0) + 1;

    seenIds.add(converted.movie.id);
    stats.kept += 1;
    batch.push({ movie: converted.movie, genreIds: ids });
    if (batch.length >= BATCH_SIZE) {
      await saveBatch(batch);
      batch = [];
    }
  }
  if (batch.length > 0) await saveBatch(batch);
  stats.saved = (await countMovies()) - moviesBefore;

  return stats;
}

// Run when called as `npm run import [path-to-csv]`, not when imported.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const started = Date.now();
  importMovies(process.argv[2])
    .then(async (stats) => {
      const skippedTotal = Object.values(stats.skipped).reduce(
        (a, b) => a + b,
        0,
      );
      console.log("--- import finished");
      console.log(`read:    ${stats.read}`);
      console.log(`skipped: ${skippedTotal}`, stats.skipped);
      console.log(`kept:    ${stats.kept}`);
      console.log(
        `saved:   ${stats.saved} new movies (${stats.kept - stats.saved} already existed)`,
      );
      console.log(`genres:  ${stats.genres}`);
      if (Object.keys(stats.unknownGenres).length > 0)
        console.log("unknown genre names:", stats.unknownGenres);
      console.log(`time:    ${Math.round((Date.now() - started) / 1000)} s`);
      await pool.end();
    })
    .catch(async (err) => {
      console.error("Import failed:", err.message);
      await pool.end();
      process.exit(1);
    });
}
