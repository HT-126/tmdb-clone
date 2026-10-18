import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import { dbConfig, pool } from './pool.js';

const defaultDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'migrations');
const LOCK_NAME = 'tmdb_clone_migrate';

// Apply numbered .sql files in order. Files already recorded in schema_migrations are skipped.
//
// - One dedicated connection with multipleStatements, so a whole file is sent as it is
//   (no splitting on ";", which breaks on ";" inside strings, comments or triggers).
// - A MySQL advisory lock (GET_LOCK), so two processes that start together (for example two
//   backend containers) cannot apply the same file twice. The second one waits, then sees the
//   file as already applied.
// - MySQL commits DDL (CREATE TABLE) by itself, so a file that fails halfway can leave partial
//   changes; fix the cause, drop the partial tables, and run again.
export async function migrate(dir = defaultDir) {
  const conn = await mysql.createConnection({ ...dbConfig, multipleStatements: true });
  try {
    const [[{ locked }]] = await conn.query('SELECT GET_LOCK(?, 30) AS locked', [LOCK_NAME]);
    if (locked !== 1) {
      throw new Error('Could not get the migration lock: another migration is still running');
    }

    try {
      await conn.query(
        `CREATE TABLE IF NOT EXISTS schema_migrations (
           name VARCHAR(255) NOT NULL PRIMARY KEY,
           applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
         ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
      );

      // Read the list after taking the lock, so it is up to date.
      const [rows] = await conn.query('SELECT name FROM schema_migrations');
      const applied = new Set(rows.map((r) => r.name));

      const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort();
      let count = 0;
      for (const file of files) {
        if (applied.has(file)) continue;
        await conn.query(await readFile(path.join(dir, file), 'utf8'));
        await conn.query('INSERT INTO schema_migrations (name) VALUES (?)', [file]);
        console.log(`applied ${file}`);
        count += 1;
      }
      console.log(count === 0 ? 'nothing to apply' : `applied ${count} migration(s)`);
    } finally {
      await conn.query('SELECT RELEASE_LOCK(?)', [LOCK_NAME]);
    }
  } finally {
    await conn.end();
  }
}

// Run when called as `npm run db:migrate`, not when imported by tests.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  migrate()
    .then(() => pool.end())
    .catch(async (err) => {
      console.error('Migration failed:', err.message);
      await pool.end();
      process.exit(1);
    });
}
