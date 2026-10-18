// Unknown route -> JSON 404.
export function notFound(req, res) {
  res.status(404).json({ error: 'Not found' });
}

// Any error thrown in a route (Express 5 forwards async errors here).
// The four arguments are required: Express knows an error handler by them.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // Client mistakes (for example broken JSON) keep their 4xx status.
  if (err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({ error: 'Bad request' });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
}
