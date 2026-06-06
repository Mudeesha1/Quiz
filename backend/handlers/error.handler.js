const errorHandler = (error, req, res, next) => {
  let statusCode = 500;
  let message = "Internal Server Error";
  let details = null;

  // Validation errors
  if (error.name === "ValidationError") {
    statusCode = 400;
    message = "Validation Error";
    details = error.message;
  }
  // Not found errors
  else if (error.statusCode === 404 || error.name === "NotFoundError") {
    statusCode = 404;
    message = "Not Found";
    details = error.message;
  }
  // Unauthorized errors
  else if (error.statusCode === 401 || error.name === "UnauthorizedError") {
    statusCode = 401;
    message = "Unauthorized";
    details = error.message;
  }
  // Forbidden errors
  else if (error.statusCode === 403) {
    statusCode = 403;
    message = "Forbidden";
    details = error.message;
  }
  // Bad request
  else if (error.statusCode === 400) {
    statusCode = 400;
    message = error.message || "Bad Request";
    details = error.details;
  }
  // Generic error with message
  else if (error.message) {
    statusCode = error.statusCode || 500;
    message = error.message;
  }

  // Send error response
  res.status(statusCode).json({
    status: "ERROR",
    statusCode,
    message,
    ...(details && { details }),
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
};

module.exports = errorHandler;