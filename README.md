# TMDB clone with its own backend

A movie website in the style of TMDB. The React app talks to its own Express and MySQL API, which is filled
from a public movie dataset. It has search, filters, accounts, and per-user favorites. Built as a full-stack
portfolio project.

- [Features](#features) · [Tech stack](#tech-stack) · [How it works](#how-it-works) · [Project structure](#project-structure)
- [Database](#database) · [API](#api) · [Getting started](#getting-started) · [Tests and checks](#tests-and-checks)
- [Design decisions](#design-decisions) · [Security notes](#security-notes) · [Data source and credits](#data-source-and-credits) · [Known gaps](#known-gaps)

## Features

**Browsing**
- Home page with the most popular movies and a search box.
- Movie list: search by title (also the original title, ignoring case and accents), filter by one or more genres
  (a movie must have all the chosen genres), 8 sort orders (popularity, rating, release date, title; each up or down),
  and paging with 20 movies per page.
- Movie page: poster, backdrop, title and year, release date, runtime, user score, genres, tagline, and overview.
- A movie without a poster or backdrop shows a placeholder, and the page still works.
- About 18,000 movies in 19 genres, imported from a Kaggle dataset.

**Accounts and favorites**
- Register, log in, and log out. The login lives in an httpOnly cookie, so JavaScript cannot read it.
- A show/hide button on the password fields.
- Favorites are saved on the server for each user. They survive a refresh and show up in any browser you log in with.
  The newest favorite is first, and "Clear all" empties the list.
- `/favorites` needs login. A logged-out click on the heart sends you to the login page and back.
- If the session ends (cookie expired, deleted user), the app notices and shows you as logged out.

**Quality**
- 90 server tests and 17 client tests. The server tests use a real, separate MySQL test database.
- One command starts MySQL, the API, and the website with Docker Compose.

## Tech stack

| Part | What it uses |
|---|---|
| Client | React 19, Vite 8, MUI 9, React Router 7, TanStack Query 5, react-hook-form, Axios |
| Server | Node.js, Express 5, `mysql2` (plain SQL, no ORM), Zod 4, `jsonwebtoken`, `bcrypt`, `cookie-parser`, `cors`, `csv-parse` |
| Database | MySQL 8.4 (utf8mb4), numbered `.sql` migrations |
| Tests | Vitest, Supertest (server), React Testing Library with jsdom (client) |
| Run | Docker Compose, nginx for the built client |

The code is JavaScript only (no TypeScript).

## How it works

```
Browser ──► client (React app, port 5173)
   │
   ├──► server (Express API, port 8080) ──► MySQL (port 3306)
   │
   └──► image.tmdb.org (posters and backdrops)
```

- **Data:** `npm run import` streams the Kaggle CSV, keeps movies that pass a few rules (see [Database](#database)),
  and saves them in MySQL in batches. You can run it again safely: rows that already exist are skipped.
- **Server data in the client:** TanStack Query loads and caches movies, genres, "who is logged in", and favorites.
  Nothing is copied into another store.
- **Login:** `POST /api/auth/login` checks the password with bcrypt and sets a `token` cookie that holds a signed JWT
  (7 days). The browser sends it automatically. The client cannot read it, so it asks `GET /api/auth/me` who is logged in.
- **Favorites:** every favorites route reads the user id from the verified token, never from the request, so a user
  can only see and change their own list.

## Project structure

```
.
├── client/                      React app
│   ├── src/
│   │   ├── api/                 axios client (base URL, cookie, readable errors)
│   │   ├── app/                 config, TanStack Query client (resets login on a 401)
│   │   ├── components/          MovieCard, MovieList, MovieFilter, MovieSort, MovieSearch,
│   │   │                        FavoriteButton, PasswordField, RequireAuth, LoadingScreen
│   │   ├── contexts/            FavoritesProvider (favorites through the API)
│   │   ├── hooks/               useMovies, useMovie, useGenres, useMe, useAuthActions, useFavorites
│   │   ├── layouts/             MainLayout (header with login state, footer)
│   │   ├── pages/               Home, Movies, MovieDetail, Favorites, Login, Register, NotFound
│   │   ├── routes/              React Router routes
│   │   ├── sections/home/       hero and "Popular" section
│   │   ├── services/            API calls: movieService, authService, favoriteService
│   │   ├── test/                test setup and render helper
│   │   └── utils/               image URL, date and rating helpers
│   ├── Dockerfile, nginx.conf   build the app, serve it with nginx
│   └── .env.example
├── server/                      Express API
│   ├── src/
│   │   ├── app.js, server.js    the app (exported for tests) and the process that listens
│   │   ├── config/env.js        checks environment variables at startup (Zod)
│   │   ├── routes/              health, movies, genres, auth, favorites
│   │   ├── controllers/         read the request, call a service, send the response
│   │   ├── services/            the SQL: movieService, userService, favoriteService, authToken
│   │   ├── schemas/             Zod schemas for query, params, and body
│   │   ├── middleware/          validate, requireAuth, rateLimit, errorHandlers
│   │   ├── db/                  connection pool, migration runner, migrations/001..003
│   │   └── import/              CSV import and its row rules
│   ├── tests/                   Vitest + Supertest, helpers/db.js seeds the test database
│   ├── Dockerfile, .env.example
├── docker/mysql-init/           creates the separate test database on a new MySQL volume
├── docker-compose.yml           mysql, backend (server/), frontend (client/)
├── data/                        the movie CSV (git-ignored, you download it)
└── .agent/, AGENTS.md, CLAUDE.md  project rules and notes for AI coding assistants
```

## Database

| Table | Content |
|---|---|
| `movies` | id (the TMDB id), title, original title, overview, tagline, release date, runtime, vote average and count, popularity, language, status, poster and backdrop path. Indexed on the sort columns. |
| `genres` | the 19 genres with their TMDB ids |
| `movie_genres` | which movie has which genre (both foreign keys) |
| `users` | id, email (unique, lowercase), bcrypt hash, created time |
| `favorites` | user id and movie id (primary key on both), created time. Deleting a user or a movie deletes its rows. |
| `schema_migrations` | which migration files were applied |

- **Migrations** are numbered `.sql` files in `server/src/db/migrations/`. `npm run db:migrate` applies the new ones.
  The runner uses a MySQL lock, so two processes starting together cannot apply the same file twice.
  Never edit a file that was already applied; add a new one.
- **Import rules:** a CSV row is kept only if its id is a number, it has at least 100 votes, it is not marked adult,
  and its id was not seen before. The result is 18,185 movies, 19 genres, and 44,551 movie-genre links. The rest of the
  1.5 million rows are skipped and counted by reason (adult, too few votes, and so on).

## API

| Request | Result |
|---|---|
| `GET /api/health` | `{ status, db }` |
| `GET /api/movies?page=&genre=&q=&sort=` | `{ page, results, total_pages, total_results }`, 20 per page. `genre` = comma-separated TMDB genre ids (a movie needs all of them). `sort` = `popularity`, `vote_average`, `primary_release_date`, or `title`, each with `.asc` or `.desc` |
| `GET /api/movies/:id` | the movie with `genres: [{ id, name }]`, or 404 |
| `GET /api/genres` | `[{ id, name }]` |
| `POST /api/auth/register`, `/login` | body `{ email, password }`; sets the `token` cookie. 201 or 200; 409 (email taken), 401 (wrong login), 429 (too many tries), 400 (bad input) |
| `POST /api/auth/logout`, `GET /api/auth/me` | logout (204) / who is logged in (401 if nobody) |
| `GET /api/favorites`, `PUT` / `DELETE /api/favorites/:movieId`, `DELETE /api/favorites` | the logged-in user's favorites, newest first (401 without login; 404 for an unknown movie) |

Bad input returns 400 with the Zod issues. Field names follow TMDB's API (snake_case), so the client needs no renaming.

Try it with curl:

```bash
curl http://localhost:8080/api/health                       # {"status":"ok","db":"up"}
curl "http://localhost:8080/api/movies?q=inception"         # search
curl "http://localhost:8080/api/movies?genre=28,878&sort=vote_average.desc&page=2"
curl http://localhost:8080/api/movies/27205                 # Inception, with its genres
```

## Getting started

Run every command from the repo root (the folder with `docker-compose.yml`) unless the block says `cd`.

### 1. Get the movie data

Download the Kaggle dataset **"TMDB Movie Dataset"** (file `TMDB_movie_dataset_v11.csv`, about 670 MB)
and put the file in `data/`. It is git-ignored because it is larger than GitHub's file limit.

### 2. Environment files

```bash
cp server/.env.example server/.env       # fill in the empty values
cp client/.env.example client/.env
```

- `server/.env`: database names and passwords, `CORS_ORIGIN=http://localhost:5173` (the exact frontend address),
  and `JWT_SECRET` (at least 32 random characters, for example `openssl rand -hex 32`).
  `DB_USER` must not be `root`. Use `DB_PORT` to pick another host port if 3306 is taken.
- `client/.env`: `VITE_API_BASE_URL=http://localhost:8080`. `VITE_*` values are public, so no secrets there.
- `.env` files are git-ignored. Never commit them.

### 3. Run

`--env-file server/.env` is needed because Compose only reads a root `.env` on its own.
If Docker is not available inside your WSL distro, run the `docker compose` lines from Windows PowerShell
(use the same paths) and the `npm` lines inside WSL.

#### Option A: everything in Docker (MySQL, server, client)

```bash
docker compose --env-file server/.env up --build -d       # build and start all three services
docker compose --env-file server/.env run --rm backend npm run import   # load the movies, once (about 25 s)
```

- App: http://localhost:5173 · API: http://localhost:8080/api/health
- The server applies the database migrations by itself when it starts.
- The ports are published on `127.0.0.1` only (this computer), not on your network.
- Stop (the data is kept): `docker compose --env-file server/.env down`
- Compose runs the server with `NODE_ENV=development` on purpose: this is a local demo over plain http, and the
  production setting makes the login cookie `Secure`, which some browsers refuse on http://localhost.
- The Compose services are still called `backend` and `frontend`.

#### Option B: develop locally (only MySQL in Docker)

Terminal 1, the database:

```bash
docker compose --env-file server/.env up -d mysql
docker compose --env-file server/.env ps                  # wait until mysql shows "healthy"
```

Terminal 2, the server (set `DB_HOST=127.0.0.1` in `server/.env` for this option):

```bash
cd server
npm install
npm run db:migrate          # create the tables (safe to repeat)
npm run import              # load the movies, once (about 25 s)
npm run dev                 # API on http://localhost:8080, restarts when you edit files
```

Terminal 3, the client:

```bash
cd client
npm install
npm run dev                 # app on http://localhost:5173
```

- Use `npm start` instead of `npm run dev` for a server that does not restart on file changes.
  After you edit server code, a server started with `npm start` keeps running the old code until you restart it.
- Stop a server with Ctrl+C. Stop MySQL with `docker compose --env-file server/.env down` (data is kept).

### Scripts

| In `server/` | Does |
|---|---|
| `npm run dev` / `npm start` | start the API (with or without restart on change) |
| `npm run db:migrate` | apply new migrations |
| `npm run import` | load the movie CSV (optional argument: path to the file) |
| `npm test` | run the server tests |

| In `client/` | Does |
|---|---|
| `npm run dev` | start the app with hot reload |
| `npm run build` / `npm run preview` | build the app / preview the build |
| `npm run lint` | ESLint |
| `npm test` | run the client tests |

### Ports

| Service | Default port | Change it with |
|---|---|---|
| MySQL | 3306 | `DB_PORT` in `server/.env` (host port only) |
| Server | 8080 | `PORT` (Option B) or `BACKEND_PORT` (Docker) |
| Client | 5173 | `--port` (Option B) or `FRONTEND_PORT` (Docker) |

If you change the client port, also change `CORS_ORIGIN` in `server/.env`. If you change the server port, also change
`VITE_API_BASE_URL` in `client/.env`.

### Common problems

| Message | Cause and fix |
|---|---|
| `Cannot start server: listen EADDRINUSE ... :8080` | Another server already uses the port. Stop it, or pick another port. |
| `Invalid environment variables: JWT_SECRET ...` | `JWT_SECRET` is missing or shorter than 32 characters. |
| `MYSQL_USER="root" ... cannot be used for the root user` | Set `DB_USER` to a normal name such as `tmdb`, not `root`. |
| `Bind for 0.0.0.0:3306 failed: port is already allocated` | Another MySQL uses port 3306. Set `DB_PORT=3307` (or any free port) in `server/.env`. |
| The browser shows a CORS error | `CORS_ORIGIN` in `server/.env` must be exactly the address of the client, for example `http://localhost:5173`. |
| `/api/auth/...` or `/api/favorites` returns 404 | The server process is older than the code. Restart it. |
| `429 Too many attempts, try again later` | The login and register limit was reached for your address. Wait for the time in the `Retry-After` header (seconds), or restart the server. Change the limit with `AUTH_RATE_LIMIT_MAX` and `AUTH_RATE_LIMIT_WINDOW_MINUTES` in `server/.env`. |

## Tests and checks

```bash
cd server && npm test                       # needs MySQL running; uses TEST_DB_NAME, never the dev database
cd client && npm test && npm run lint && npm run build
```

- **Server (90 tests):** every endpoint with success, bad input (400), and 401 or 404 cases; login and cookie flags;
  two users that cannot touch each other's favorites; the migration runner (including two runs at once); the CSV row
  rules; the rate limiter.
- **Client (17 tests):** the movie card (poster and placeholder), the movie list page, the login form and the
  show/hide password button, the login guard, the footer layout, and the query client.
- The server tests run against a real MySQL test database (no database mocks). A guard refuses to clear any
  database that is not the test one.

## Design decisions

- **Plain SQL, no ORM.** Every value goes through a `?` placeholder. `ORDER BY` cannot use a placeholder, so each allowed
  sort value maps to a fixed SQL string.
- **Login in an httpOnly cookie, not localStorage.** Page scripts cannot steal it. The cost is that the client asks the
  server who is logged in.
- **Favorites are stored on the server per user,** not in a cookie (a cookie is limited to about 4 KB and is sent with
  every request) and not in localStorage (it would not follow the user to another browser).
- **TanStack Query owns all server data** (movies, genres, login state, favorites). No copy in another store.
- **The API keeps TMDB's response shape** (`page`, `results`, `total_pages`, `total_results`, snake_case fields), so the
  original React app needed few changes when it moved from TMDB's API to this server.
- **The home page shows "Popular", not "Trending".** The dataset has no per-day data, so a Today / This Week toggle
  would be fake.
- **The import is streamed and safe to repeat.** The CSV is 670 MB, so it is read row by row and saved in batches of
  1,000, one transaction each.
- **Tests use a real database.** Mocking MySQL would hide wrong SQL.

## Security notes

- Every request body, query string, and URL parameter is checked with Zod. Bad input returns 400.
- Passwords are stored only as bcrypt hashes, and are never returned or logged. Unknown email and wrong password give
  the same 401 message (and the password is compared in both cases, so the answer takes a similar time).
- The cookie is `HttpOnly` and `SameSite=Lax` (and `Secure` in production). CORS allows only the exact client address.
- `requireAuth` checks that the user still exists, so the cookie of a deleted user stops working at once.
- Login and register are rate limited per client address.
- Secrets live only in `.env` files (git-ignored). `.env.example` lists the names with no values.
- In Docker, the server runs as a non-root user and all ports are published on `127.0.0.1` only.

## Data source and credits

- Movie data comes from the Kaggle dataset **"TMDB Movie Dataset"**, which is built from TMDB. Check the dataset's
  license on Kaggle before you reuse the data.
- Posters and backdrops are loaded from TMDB's image server (`image.tmdb.org`).
- This product is not endorsed or certified by TMDB.

## Known gaps

This is a prototype.

- Login and register are limited to 20 tries per client address per 15 minutes. The counters are in memory, so they
  reset when the server restarts and are not shared between several server processes.
- No email verification and no password reset.
- CSRF protection is `SameSite=Lax` only.
- Registering with a known email returns 409, so it shows which emails have accounts.
- The dataset has no cast, videos, or user ratings, so the movie page does not show them.
- Compose needs `--env-file server/.env`, because the `.env` file lives in `server/`.
