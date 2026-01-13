
const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || err.status || 500;
  const message = status >= 500 ? 'Internal server error' : err.message || 'Error';

  // Show stack trace in non-production
  const response = { statusCode: status, message };
  if (process.env.NODE_ENV !== 'production') {
    response.error = err.message;
    response.stack = err.stack;
    if (err.errors) response.errors = err.errors;
  }

  res.status(status).json(response);
};

module.exports = { errorHandler };
