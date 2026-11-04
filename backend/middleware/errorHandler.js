const isProd = () => process.env.NODE_ENV === 'production';

const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
};

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  let status = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose / Mongo / JSON errors -> 4xx
  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid ID or value format';
  } else if (err.code === 11000) {
    status = 409;
    message = 'Duplicate entry';
  } else if (err.type === 'entity.too.large') {
    status = 413;
    message = 'Request body too large';
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Invalid JSON body';
  }

  if (status >= 500) {
    // Full error details only in server logs, never exposed to clients
    console.error(`[${req.method} ${req.originalUrl}]`, err.stack || err);
    if (isProd() && !err.isOperational) {
      message = 'Internal Server Error';
    }
  }

  const body = { success: false, message };
  if (err.isOperational && err.code) body.code = err.code;
  res.status(status).json(body);
};

module.exports = { notFound, errorHandler };
