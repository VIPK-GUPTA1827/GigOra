// validate({ body, query, params }) -> zod schemas
const validate = (schemas) => (req, res, next) => {
  for (const key of ['params', 'query', 'body']) {
    const schema = schemas[key];
    if (!schema) continue;
    const result = schema.safeParse(req[key] ?? {});
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input',
        errors: result.error.issues.map((i) => ({
          field: i.path.join('.'),
          message: i.message
        }))
      });
    }
    // Express 5 me req.query read-only hai, isliye alag
    if (key === 'body') req.body = result.data;
    else req.valid = { ...(req.valid || {}), [key]: result.data };
  }
  next();
};

module.exports = validate;
