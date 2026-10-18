# Safety

Ask first (name the exact action, then wait). A specific request for it counts as a yes.
- Deleting or overwriting user data; discarding unrelated work.
- Resetting, dropping, or migrating a database that may hold real data: `DROP`, `TRUNCATE`,
  `DELETE` without `WHERE`, rolling back migrations, `docker compose down -v`,
  `docker volume rm`.
- Force-push, rewriting history, deleting a shared branch.
- Deploys, publishing, sending messages, paid services, sending private data elsewhere.
- Adding a dependency (`npm install <pkg>`): say why it is needed first.
- Calling a paid or rate-limited API in bulk: confirm the count and add a delay.

Secrets: never in code, logs, tests, commits, or replies. Use env vars and a `.env.example`
(names only); `.env` stays in `.gitignore`. Do not read `.env*` or key files; read
`.env.example`. If you find a committed secret, report it without repeating the value.

Git: commit or push only when asked. Small commits, imperative subject, no `--no-verify`.

Tests: never pass a check by hard-coding values, skipping the test, or weakening validation.
If the test is wrong, say so and fix it openly.
