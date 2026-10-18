import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { migrate } from '../src/db/migrate.js';
import { pool } from '../src/db/pool.js';
import { assertTestDatabase } from './helpers/db.js';

const FILE = '900_test_semicolons.sql';
let dir;

// A migration with ";" inside a comment and inside a string value.
const SQL = `CREATE TABLE tmp_migration_test (id INT PRIMARY KEY, note VARCHAR(100));
-- a comment; with a semicolon
INSERT INTO tmp_migration_test (id, note) VALUES (1, 'a;b;c');
`;

async function cleanUp() {
  await assertTestDatabase();
  await pool.query('DROP TABLE IF EXISTS tmp_migration_test');
  await pool.query('DELETE FROM schema_migrations WHERE name = ?', [FILE]);
}

beforeAll(async () => {
  await assertTestDatabase();
  await migrate(); // the real migrations, so schema_migrations exists
  await cleanUp();
  dir = await mkdtemp(path.join(os.tmpdir(), 'migrations-'));
  await writeFile(path.join(dir, FILE), SQL);
});

afterAll(async () => {
  await cleanUp();
  await rm(dir, { recursive: true, force: true });
  await pool.end();
});

describe('migrate', () => {
  it('runs a file with semicolons in strings and comments, once, even when started twice at the same time', async () => {
    // Two runs at once, like two backend containers starting together.
    await Promise.all([migrate(dir), migrate(dir)]);

    const [rows] = await pool.query('SELECT note FROM tmp_migration_test');
    expect(rows).toEqual([{ note: 'a;b;c' }]);

    const [recorded] = await pool.query('SELECT name FROM schema_migrations WHERE name = ?', [FILE]);
    expect(recorded).toHaveLength(1);
  });

  it('skips a file that is already applied', async () => {
    await migrate(dir);
    const [rows] = await pool.query('SELECT COUNT(*) AS n FROM tmp_migration_test');
    expect(rows[0].n).toBe(1);
  });
});
