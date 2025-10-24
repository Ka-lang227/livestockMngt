const AppError = require('../utils/appError');

/**
 * Error response formatter
 * @private
 */
const formatError = (err, includeDetails = false) => {
  const response = {
    status: err.status || 'error',
    message: err.message,
    code: err.statusCode || 500
  };

  // Include error details in development
  if (includeDetails) {
    response.error = err;
    response.stack = err.stack;
  }

  return response;
};

/**
 * Handle Mongoose validation errors
 * @private
 */
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  return new AppError(`Invalid input data: ${errors.join('. ')}`, 400);
};

/**
 * Handle Mongoose cast errors (invalid IDs)
 * @private
 */
const handleCastError = (err) => {
  return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
};

/**
 * Handle duplicate key errors
 * @private
 */
const handleDuplicateFieldsError = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  return new AppError(`Duplicate field value: ${value}. Please use another value`, 400);
};

/**
 * Handle JWT errors
 * @private
 */
const handleJWTError = () => new AppError('Invalid token. Please log in again', 401);

/**
 * Handle expired JWT
 * @private
 */
const handleJWTExpiredError = () => new AppError('Your token has expired. Please log in again', 401);

/**
 * Main error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Are we in development mode?
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Handle specific errors
  let error = { ...err };
  error.message = err.message;
  error.name = err.name;

  // Mongoose validation error
  if (error.name === 'ValidationError') error = handleValidationError(error);
  // Mongoose bad ObjectId
  if (error.name === 'CastError') error = handleCastError(error);
  // Mongoose duplicate key
  if (error.code === 11000) error = handleDuplicateFieldsError(error);
  // JWT errors
  if (error.name === 'JsonWebTokenError') error = handleJWTError();
  if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

  // Send error response
  if (error.isOperational) {
    // Operational, trusted error: send message to client
    console.log(err)
    res.status(error.statusCode).json(formatError(error, isDevelopment));
  } else {
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥:', error);
    
    // Send generic message
    res.status(500).json({
      status: 'error',
      message: isDevelopment ? error.message : 'Something went wrong!'
    });
  }
};

/**
 * Catch async errors (to be used as a wrapper for async route handlers)
 */
const catchAsync = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Handle unhandled route (404)
 */
const notFound = (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
};

/**
 * Handle uncaught exceptions (should be at top of app)
 */
const handleUncaughtException = () => {
  process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error(err.name, err.message);
    console.error(err.stack);
    process.exit(1);
  });
};

/**
 * Handle unhandled promise rejections (should be at bottom of app)
 */
const handleUnhandledRejection = (server) => {
  process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! 💥 Shutting down...');
    console.error(err.name, err.message);
    console.error(err.stack);
    server.close(() => {
      process.exit(1);
    });
  });
};

module.exports = {
  errorHandler,
  catchAsync,
  notFound,
  handleUncaughtException,
  handleUnhandledRejection
};
