const rateLimit = require("express-rate-limit");

// Login rate limiter
exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window per IP
  message: {
    success: false,
    message: "Too many login attempts, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// API rate limiter
exports.apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute per IP
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Password reset rate limiter
exports.passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour per IP
  message: {
    success: false,
    message: "Too many password reset attempts, please try again after an hour",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
