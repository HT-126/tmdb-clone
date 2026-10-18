# Before saying "done"

- Does the result meet the request? Did you run a test or command that proves it, including
  one failure case? Did tests, lint, and build pass? Separate old failures from new ones.
- Stack: JavaScript only; no needless library; every POST/PUT/PATCH body validated with Zod;
  server data in TanStack Query, not copied into Zustand.
- `git diff` shows only your intended changes. No secrets, no debug code left.
- The reply matches the evidence. If a check could not run, say so. Then stop.
