const { logError } = require('../utils/logger');
const { sendError } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  logError(message, err);

  // Mongoose Bad ObjectId
  if (err.name === 'CastError') {
    message = 'Resource not found. Invalid ID format.';
    statusCode = 404;
  }

  // Mongoose Duplicate Key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value entered for ${field} field.`;
    statusCode = 400;
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors).map(val => val.message).join(', ');
    statusCode = 400;
  }

  return sendError(res, message, statusCode);
};

const notFound = (req, res, next) => {
  return sendError(res, `Route Not Found - ${req.originalUrl}`, 404);
};

module.exports = {
  errorHandler,
  notFound
};
