import express from "express";
import {
  protect,
  rateLimiters,
  errorHandler,
  configureSecurityMiddleware,
} from "./middleware/authMiddleware.js";

const app = express();

// Configure security middleware
configureSecurityMiddleware(app);

// Apply rate limiters to specific routes
app.use("/api/auth/login", rateLimiters.loginLimiter);
app.use("/api", rateLimiters.apiLimiter);
app.use("/api/auth/reset-password", rateLimiters.passwordResetLimiter);

// Protected routes example
app.use("/api/protected", protect, (req, res) => {
  res.json({ message: "Protected route accessed successfully" });
});

// Error handler should be the last middleware
app.use(errorHandler);

export default app;
