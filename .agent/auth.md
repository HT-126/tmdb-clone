# Login: JWT in an httpOnly cookie (read before build-order step 4)

## Decisions
- The cookie holds only the JWT. Favorites live in the database, per user. They are not in a
  cookie: JavaScript cannot read an httpOnly cookie, a cookie is limited to about 4 KB, and the
  browser sends it with every request.
- Plain SQL with `mysql2`; every value goes through a `?` placeholder.

## Tables (new migration)
- `users`: id (auto-increment PK), email (unique; store lowercase), password_hash, created_at.
- `favorites`: user_id -> users(id) and movie_id -> movies(id), both `ON DELETE CASCADE`,
  created_at, PK (user_id, movie_id).

## Endpoints
- `POST /api/auth/register` `{ email, password }` -> 201 and sets the cookie; 409 duplicate
  email; 400 bad input.
- `POST /api/auth/login` -> 200 and sets the cookie. Unknown email and wrong password both give
  401 `Invalid email or password`.
- `POST /api/auth/logout` -> 204 and clears the cookie. `GET /api/auth/me` -> `{ id, email }`
  or 401.
- `GET /api/favorites` -> movies in the same shape as the list results. `PUT
  /api/favorites/:movieId` -> 204, idempotent; 404 if the movie does not exist. `DELETE
  /api/favorites/:movieId` -> 204. If the UI uses `clearFavorites`, add `DELETE /api/favorites`.
- Favorites routes use an auth middleware and always take the user id from the verified JWT
  (`req.user.id`), never from the request body, query, or URL.

## Rules
- Zod: valid email; password 8 to 72 characters (bcrypt ignores bytes after 72).
- bcrypt (package `bcrypt`), cost 10 to 12. Never log or return `password_hash`; select explicit
  columns.
- JWT (`jsonwebtoken`): payload `{ sub: userId }`, expires in 7 days, no refresh token.
  `JWT_SECRET` comes from env, at least 32 random characters, validated by Zod at startup.
- Cookie `token`: `httpOnly: true`, `sameSite: 'lax'`, `secure: true` when `NODE_ENV` is
  `production`, `maxAge` equal to the JWT expiry, `path: '/'`. Read it with `cookie-parser`.
- CORS: `origin` is the exact `CORS_ORIGIN` and `credentials: true`. Axios on the frontend uses
  `withCredentials: true`. In development `localhost:5173` and `localhost:8080` are the same
  site, so the cookie works. On different domains you would need `sameSite: 'none'` + `secure`.
- CSRF: `SameSite=Lax` stops cross-site POST, PUT, and DELETE requests from sending the
  cookie. That is enough for a prototype; write it down, do not oversell it.
- Known gaps (prototype): no email verification, no password reset. Login and register have a small
  in-memory rate limit (20 tries per address per 15 minutes; counters reset on restart and are not
  shared between processes).
- `requireAuth` also checks that the user still exists (a deleted user's cookie gets 401).

## Frontend
- Login and register pages with react-hook-form (already in the app). No Zod on the frontend.
- Who is logged in: `useQuery(['me'])` on `GET /api/auth/me` (TanStack Query owns it).
- `FavoritesProvider` keeps its public API (`favorites`, `favoriteCount`, `isFavorite`,
  `addFavorite`, `removeFavorite`, `toggleFavorite`, `clearFavorites`) so components do not
  change. Inside, use TanStack Query (`['favorites']`), mutations, and `invalidateQueries`.
  When logged out, `toggleFavorite` sends the user to `/login`. Delete the old `localStorage`
  code (key `tmdb-favorite-movies`).
- The `/favorites` route needs login: redirect to `/login`.

## Tests
Register, login, `me`, and logout (check `Set-Cookie` has `HttpOnly` and `SameSite=Lax`);
401 without the cookie; 409 duplicate email; the same 401 message for unknown email and wrong
password; user A cannot see or change user B's favorites.
