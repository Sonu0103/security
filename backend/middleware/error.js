const ErrorHandler = require("../utils/errorHandler");

module.exports = (err, req, res, next) => {
  console.error("Error:", {
    message: err.message,
    stack: err.stack,
  });

  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // Mongoose duplicate key error
  if (err.code === 11000) {
    err.message = `Duplicate ${Object.keys(err.keyValue)} entered`;
    err.statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    err.message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    err.statusCode = 400;
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    ...(process.env.NODE_ENV === "development" && {
      error: err,
      stack: err.stack,
    }),
  });
};
