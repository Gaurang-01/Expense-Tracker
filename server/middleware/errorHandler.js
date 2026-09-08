const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  const errors = [];
  const isDev = process.env.NODE_ENV === 'development';

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    for (const field of Object.values(err.errors)) {
      errors.push({
        field: field.path,
        message: field.message,
      });
    }
  }

  // Mongoose bad ObjectId (CastError)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
  }

  // In production, don't leak internal error details for 500s
  if (!isDev && statusCode === 500) {
    message = 'Something went wrong. Please try again later.';
  }

  const response = {
    success: false,
    message,
  };

  if (errors.length > 0) {
    response.errors = errors;
  }

  // Show stack trace only in development
  if (isDev) {
    response.stack = err.stack;
  }

  // Log the error in development
  if (isDev) {
    console.error('Error:', err);
  }

  res.status(statusCode).json(response);
};

export default errorHandler;
