# Gotchas

- `VITE_*` variables are bundled into the browser code, so they are public. No secrets there.
- Express: check the installed version. v5 forwards async errors; v4 does not (wrap handlers).
- Backend tests: export `app` separately from `listen()`. Use a separate test database. Vitest +
  Supertest (Jest needs `--experimental-vm-modules` for an ESM backend; it failed without the
  flag in a test I ran). Do not mock the database in API tests.
- SQL (`mysql2`, no ORM): every value goes through a `?` placeholder; never join user input into
  SQL. `ORDER BY` columns and directions cannot be placeholders: map a Zod enum to a fixed SQL
  string. Build `WHERE` from fixed fragments plus a params array.
- `mysql2`: one shared pool from `mysql2/promise`. Set `charset: 'utf8mb4'` and create tables as
  utf8mb4 (titles contain unicode). `LIMIT ? OFFSET ?` with `execute()` can fail on some MySQL
  versions: pass integers and test it.
- Bulk import: stream the file, validate each row with Zod, insert in batches of about 1000 with
  one multi-row `INSERT` (`VALUES ?` with `query()`), `ON DUPLICATE KEY UPDATE id = id` so a
  re-run skips rows, one transaction per batch. Print counts (read, skipped with reason, saved).
- Migrations are numbered `.sql` files. Never edit one that was applied; add a new file.
- CORS: allow the exact frontend origin, not `*`.
- Docker Compose: containers reach each other by service name, not `localhost`. Add a
  `.dockerignore` with `node_modules` and `.env`.
