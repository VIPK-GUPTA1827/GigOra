class AppError extends Error {
  constructor(message, statusCode = 500, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code; // optional, e.g. 'TOKEN_EXPIRED'
    this.isOperational = true; // explicitly thrown application error
  }
}

module.exports = AppError;
