const { AppError } = require('../lib/app-error');

function routeNotFound(_req, _res, next) {
  next(new AppError(404, 'TODO_NOT_FOUND', 'Route not found.'));
}

function errorHandler(err, _req, res, _next) {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const code = err instanceof AppError ? err.code : 'INTERNAL_ERROR';
  const message = err instanceof AppError ? err.message : 'An unexpected error occurred.';

  if (statusCode >= 500) {
    console.error(`[${new Date().toISOString()}] ${err.name || 'Error'}: ${err.message}`);
  }

  res.status(statusCode).json({
    error: {
      code,
      message
    }
  });
}

module.exports = {
  errorHandler,
  routeNotFound
};
