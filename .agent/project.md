# Project facts: TMDB clone with its own backend
`<>` = unknown (discover, don't guess). Update a line when a fact changes.

## Purpose and risk
Movie website like TMDB. The React app exists (repo `HT-126/movie-clone`) and calls the TMDB
API directly. Now add an Express + MySQL backend (raw SQL, no ORM) seeded from a Kaggle
dataset, add JWT login, and switch the app to that backend. Goal: full-stack portfolio
project. Risk: prototype (public movie data; user accounts are practice data).

## Stack picks
MySQL with `mysql2` and plain SQL (no ORM) · backend ESM · tests: Vitest + Supertest (API),
Vitest + React Testing Library (UI) · login: yes (JWT in an httpOnly cookie + bcrypt) · Node: <>
Approved libraries (no need to ask): express, cors, mysql2, zod, dotenv, csv-parse, vitest,
supertest; for login: bcrypt, jsonwebtoken, cookie-parser. Any other library: ask first.

## Deviations from the default stack
- No ORM: raw SQL with `mysql2` (stack.md lists Sequelize or Prisma). Owner's choice.
- Backend tests use Vitest + Supertest, not Jest (ESM backend; Jest needs an experimental flag).
- UI is MUI, not Tailwind. Keep it; do not restyle.
- New data fetching uses TanStack Query. Who is logged in also comes from the API
  (`GET /api/auth/me`), because the httpOnly cookie is invisible to JavaScript.
- `FavoritesProvider` keeps its public API but stores favorites through the API, per user.

## Data (checked on the real file)
- `data/TMDB_movie_dataset_v11.csv`: 1,299,600 rows, 582 MB (Kaggle "TMDB Movie Dataset").
  Git-ignored (over GitHub's 100 MB file limit); document the download in README. Stream it
  with `csv-parse`; never load it whole (a Node test read all rows in about 20 s).
- Keep a row only if: `id` is digits, `vote_count >= 100`, `adult` is `False`, and the `id`
  was not seen before. Result: 18,185 movies and 19 genres. The rest is junk (128k adult,
  34% without poster, dates up to 2099, 1,069 duplicate ids).
- `genres` holds names only, comma-separated ("Action, Science Fiction"). Map to TMDB ids:
  Action 28, Adventure 12, Animation 16, Comedy 35, Crime 80, Documentary 99, Drama 18,
  Family 10751, Fantasy 14, History 36, Horror 27, Music 10402, Mystery 9648, Romance 10749,
  Science Fiction 878, TV Movie 10770, Thriller 53, War 10752, Western 37.
- Images: `poster_path` and `backdrop_path` work as given (100 of 100 sampled URLs returned an
  image on 2026-10-18). Store them as they are. 12 kept movies have no poster and 69 no
  backdrop: store null and show a placeholder. No TMDB API call and no TMDB token in the
  backend. Image URL: `https://image.tmdb.org/t/p/{size}{path}` (already in the frontend).
- Not in this file: cast, videos, user ratings. Not in v1.

## Database (MySQL, utf8mb4, plain SQL)
Column names are snake_case like TMDB's API, so rows go to the API without renaming.
`movies`: id (PK = TMDB id, not auto-increment), imdb_id, title, original_title, overview,
tagline, release_date, runtime, vote_average, vote_count, popularity, original_language,
status, poster_path, backdrop_path (most are nullable); index the sort columns · `genres`: id
(TMDB genre id), name · `movie_genres`: movie_id, genre_id, PK on both, foreign keys.
Skip budget and revenue (revenue passes 2 billion). Login adds `users` and `favorites`: see
[auth](auth.md). Schema = numbered `.sql` files in `server/src/db/migrations/`, applied by
`npm run db:migrate`.

## API (keep TMDB's shape so the frontend changes little)
- `GET /api/movies?page=&genre=&q=&sort=` -> `{ page, results, total_pages, total_results }`.
  Replaces popular, discover, search, and trending. Built in step 3: 20 per page, `page` 1-1000,
  `genre` = comma-separated TMDB ids and a movie needs all of them (the UI sends several),
  `q` matches title or original title, `sort` = the 8 values in `MovieSort.jsx`
  (`primary_release_date.*` included).
- `GET /api/movies/:id` -> movie with `genres: [{ id, name }]`; unknown id returns 404.
- `GET /api/genres` -> `[{ id, name }]`.
- Login and favorites endpoints: see [auth](auth.md).
- Validate `body`, `query`, and `params` with Zod; bad input returns 400 with `error.issues`.

## Acceptance criteria
1. `npm run import` loads 18,185 movies and 19 genres, prints counts (read, skipped with
   reason, saved), and is safe to run twice.
2. Movie endpoints work: paging, genre filter, title search, sort, 400 on bad input, 404 on
   unknown id. Vitest + Supertest tests pass against a separate test database.
3. Login: register (201, 409 on a duplicate email, 400 on bad input), login (200; wrong
   password and unknown email both give the same 401), logout, and `me`. The JWT is only in an
   httpOnly cookie and never in a response body. Passwords are stored only as bcrypt hashes.
4. Favorites: add, remove, list. All need login (401 without). A user cannot read or change
   another user's favorites (test it with two users). Adding twice is fine.
5. The frontend uses only the backend (TanStack Query). No browser request goes to
   `api.themoviedb.org`; `VITE_TMDB_READ_TOKEN` is removed. Login and register pages work,
   `/favorites` needs login, and favorites survive a refresh and a second browser.
6. A movie without a poster or backdrop shows a placeholder. The detail page works without
   cast and videos (it asks for them today; hide those sections).
7. `docker compose up --build` starts mysql, backend, and frontend from a fresh clone.

## Build order (one small step at a time; commit only when asked)
1) backend skeleton, MySQL in compose, `mysql2` pool, migration runner + first migration,
health route · 2) import · 3) movie endpoints + Zod + tests · 4) login (read
[auth](auth.md) first) + tests · 5) favorites endpoints + tests · 6) switch the frontend to
the backend: TanStack Query, login and register pages, `FavoritesProvider` through the API ·
7) cleanup: remove the unused `server` script (json-server, no `db.json`), add `.env.example`,
replace the Vite README.

## Tests (keep them small)
- API: Vitest + Supertest on a separate test database (`TEST_DB_NAME`). Run the migrations
  first, clear the tables between test files, do not mock the database. Per endpoint:
  success, 400, 401 or 404 where they apply.
- Import helpers (no database): the row filter and the genre-name mapping, with a few sample
  rows including a bad one.
- UI: Vitest + React Testing Library for `MovieCard` (placeholder when there is no poster)
  and one list page. Check the API by hand with Postman too.

## Commands
Run from the repo root unless the Command column says `cd`. Compose needs `--env-file server/.env`.
Node 24 and npm run inside WSL; `docker` runs from Windows PowerShell (not installed in WSL).
Results are from this build session (dates are the user's local time).

| Task | Command | Result |
| --- | --- | --- |
| Frontend dev server | `cd client && npm run dev` | 2026-10-19, run as `npm run dev -- --port 5199`: "Local: http://localhost:5199/", `GET /` returns 200 |
| Frontend build | `cd client && npm run build` | 2026-10-19: "built in 1.29s", no errors (bundle about 663 kB, Vite warns it is over 500 kB) |
| Frontend lint | `cd client && npm run lint` | 2026-10-19: no output, 0 errors, 0 warnings (baseline before the work was 1 warning) |
| Frontend test | `cd client && npm test` | 2026-10-19: 6 files, 17 tests passed |
| Backend start | `cd server && npm start` | 2026-10-19, run as `PORT=8081 npm start`: "Backend listening on port 8081", `/api/health` returns `{"status":"ok","db":"up"}` |
| Backend dev (restart on change) | `cd server && npm run dev` | 2026-10-19, same `PORT=8081` check: listens, health ok |
| Backend test | `cd server && npm test` | 2026-10-19: 7 files, 90 tests passed (needs MySQL up; uses `TEST_DB_NAME`). Also passes against a MySQL published only on 127.0.0.1 |
| Backend lint | none configured | not run: the backend has no ESLint setup |
| DB migrate | `cd server && npm run db:migrate` | 2026-10-19 on the dev DB: "nothing to apply" (001-003 already applied). On an empty DB (Docker, 2026-10-19): applied 001, 002, 003 |
| Import movies | `cd server && npm run import` | 2026-10-18 on the dev DB, twice: read 1,517,961 rows, kept 18,185, skipped 149,993 adult + 1,349,783 low votes; 1st run saved 18,185, 2nd run saved 0; 23-24 s, about 153 MB RAM. Same result inside Docker on 2026-10-19 |
| MySQL only | `docker compose --env-file server/.env up -d mysql` | 2026-10-18: container healthy, databases `tmdb_clone` and `tmdb_clone_test` exist |
| All services | `docker compose --env-file server/.env up --build -d` | 2026-10-19 on a throwaway project (`-p tmdbfresh`, other ports, empty volume): images built, 3 containers up, migrations applied, `/api/health` 200, frontend `/` and `/movie/27205` 200 |
| Import in Docker | `docker compose --env-file server/.env run --rm backend npm run import` | 2026-10-19 in that throwaway project: 18,185 movies, 19 genres, 44,551 genre links; 2nd run saved 0 |
| Stop, keep data | `docker compose --env-file server/.env down` | not run on the dev project (the dev MySQL is still up); documented in the README |
| Remove a test stack | `docker compose -p tmdbfresh --env-file server/.env down -v --rmi local` | 2026-10-19: removed only the throwaway project; the dev DB still had 18,185 movies afterwards |
| Frontend preview | `cd client && npm run preview` | not run |

## Structure and environment
Folders: `client/` (the existing app), `server/` (`src/routes`, `controllers`, `services`,
`schemas`, `middleware`, `db`), `data/` (ignored), `docker-compose.yml`.
Env names: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, TEST_DB_NAME, MYSQL_ROOT_PASSWORD,
JWT_SECRET, CORS_ORIGIN, PORT, NODE_ENV · frontend: VITE_API_BASE_URL. Ports: MySQL 3306,
backend 8080, frontend 5173 (Vite default; confirm). Never commit `.env` or the CSV file.

## Status
Hardening done 2026-10-19: `requireAuth` checks the user exists; the client resets `['me']` on any
401; login/register rate limit (`AUTH_RATE_LIMIT_MAX`, `AUTH_RATE_LIMIT_WINDOW_MINUTES`, in memory);
the migration runner uses one multi-statement connection and an advisory lock; the import schema
checks column limits; the server image runs as `node` and runs migrations in its own `CMD`; compose
ports bind to 127.0.0.1 and the MySQL healthcheck uses TCP; nginx 404s missing assets and sets cache
headers; `npm audit` is clean in both projects.

Folders renamed 2026-10-19 (owner's choice): `backend/` is now `server/`, `frontend/` is now
`client/`. Older lines below still say "backend" and "frontend" as plain words; Compose service
names are still `backend` and `frontend`. Tests, lint, build and `docker compose config` were
re-run after the rename and pass.

(Original status, kept for history:) Frontend exists (calls TMDB directly, favorites in
`localStorage`, no login). Build step 1
(backend skeleton), step 2 (import), step 3 (movie endpoints), step 4 (login) and step 5
(favorites) done and checked 2026-10-18. The backend is finished. `JWT_SECRET` (32+
characters) is required in `server/.env`. Migrations 001-003 are applied to the dev and test
databases. `GET /api/favorites` returns a plain array of movies (list-item shape), newest added
first (owner's choice); `DELETE /api/favorites` clears the caller's list. Step 6a (frontend
data: movies, genres, detail, home via TanStack Query) is done; the home "Trending" toggle
became "Popular" because the data has no per-day trend. Step 6b is done (login and register
pages, `FavoritesProvider` through the API, `RequireAuth`, auth buttons in the header); checked
by tests and HTTP calls, NOT yet by a person clicking in a browser. Step 7 is done: root
README, frontend Dockerfile (nginx), compose frontend service, migrations run when the backend
container starts, `server` script removed. All 7 build steps are finished. Compose needs
`--env-file server/.env` (the `.env` lives in `server/`), a small deviation from criterion 7.
Frontend libs added with approval:
`@tanstack/react-query`, `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`.
The local CSV now has 1,517,961 rows (669 MB), more than the 1,299,600 noted
above; the kept result is still 18,185 movies, 44,551 genre links, 12 without poster, 69
without backdrop. Skipped: 149,993 adult, 1,349,783 low votes (no duplicate-id skips
remained after the vote filter). `.env` lives in `server/` (not the root), so compose needs `--env-file server/.env`;
`DB_USER` must not be `root`; host MySQL port comes from `DB_PORT` (3306 was taken locally).
Node 24 runs inside WSL; Docker runs from Windows PowerShell only.
