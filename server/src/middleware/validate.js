// Check req.body, req.query or req.params with a Zod schema.
// On success the parsed result is stored in req.validated[source]
// (Express 5 makes req.query read-only, so it cannot be overwritten).
export const validate =
  (schema, source = 'body') =>
  (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.issues });
    }
    req.validated = { ...req.validated, [source]: result.data };
    next();
  };
