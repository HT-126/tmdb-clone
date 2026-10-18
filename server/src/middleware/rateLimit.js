// Limit how often one client address can call a route: at most `max` requests per `windowMs`.
// Counters live in memory, so they reset when the server restarts and are not shared between
// several server processes. That is enough for a single-process prototype.
// Behind a reverse proxy, call app.set('trust proxy', 1) so req.ip is the real client address.
export function createRateLimiter({ windowMs, max }) {
  const hits = new Map(); // address -> { count, resetAt }

  return function rateLimit(req, res, next) {
    const now = Date.now();

    // Drop expired entries now and then so the map cannot grow forever.
    if (hits.size > 10000) {
      for (const [key, entry] of hits) {
        if (entry.resetAt <= now) hits.delete(key);
      }
    }

    let entry = hits.get(req.ip);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(req.ip, entry);
    }
    entry.count += 1;

    if (entry.count > max) {
      res.set('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
      return res.status(429).json({ error: 'Too many attempts, try again later' });
    }
    next();
  };
}
