// Global error handling middleware

class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // Wrong MongoDB ID error
  if (err.name === 'CastError') {
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const message = `Duplicate field value entered`;
    err = new ErrorHandler(message, 400);
  }

  // Wrong JWT error
  if (err.name === 'JsonWebTokenError') {
    const message = `Json Web Token is invalid, try again`;
    err = new ErrorHandler(message, 401);
  }

  // JWT EXPIRE error
  if (err.name === 'TokenExpiredError') {
    const message = `Json Web Token is expired, try again`;
    err = new ErrorHandler(message, 401);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map(value => value.message)
      .join(', ');
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    error: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Catch async errors
const catchAsyncErrors = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { ErrorHandler, errorHandler, catchAsyncErrors };