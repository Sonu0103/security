import jwt from "jsonwebtoken";
import { check, validationResult } from "express-validator";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import session from "express-session";
import MongoStore from "connect-mongo";
import crypto from "crypto";

// Error Handler Class
class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Main Authentication Middleware
export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    } else {
      token = req.cookies.token;
    }

    if (!token) {
      return next(new ErrorHandler("Not authorized to access this route", 401));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      return next(new ErrorHandler("Not authorized, token failed", 401));
    }
  } catch (error) {
    next(error);
  }
};

// Role Authorization
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

// Rate Limiters
export const rateLimiters = {
  loginLimiter: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
      success: false,
      message: "Too many login attempts, please try again after 15 minutes",
    },
  }),

  apiLimiter: rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    message: {
      success: false,
      message: "Too many requests, please try again later",
    },
  }),

  passwordResetLimiter: rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: {
      success: false,
      message:
        "Too many password reset attempts, please try again after an hour",
    },
  }),
};

// Validation Middleware
export const validators = {
  registerValidator: [
    check("name", "Name is required").notEmpty().trim(),
    check("email", "Please include a valid email").isEmail().normalizeEmail(),
    check("password")
      .isLength({ min: 8, max: 30 })
      .withMessage("Password must be between 8 and 30 characters")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter")
      .matches(/[a-z]/)
      .withMessage("Password must contain at least one lowercase letter")
      .matches(/[0-9]/)
      .withMessage("Password must contain at least one number")
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage("Password must contain at least one special character")
      .not()
      .matches(/\s/)
      .withMessage("Password cannot contain spaces"),
  ],

  loginValidator: [
    check("email", "Please include a valid email").isEmail().normalizeEmail(),
    check("password", "Password is required").notEmpty(),
  ],

  validate: (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ErrorHandler(errors.array()[0].msg, 400));
    }
    next();
  },
};

// Error Middleware
export const errorHandler = (err, req, res, next) => {
  console.error("Error:", {
    message: err.message,
    stack: err.stack,
  });

  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    err.message = `Duplicate ${Object.keys(err.keyValue)} entered`;
    err.statusCode = 400;
  }

  // Handle Mongoose validation error
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

// Security Middleware Configuration
export const configureSecurityMiddleware = (app) => {
  // Helmet configuration
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "blob:", "http://localhost:5000", "*"],
          connectSrc: ["'self'", "http://localhost:5000"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
    })
  );

  // Session configuration
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        ttl: 24 * 60 * 60,
      }),
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      },
      name: "sessionId",
    })
  );

  // CORS configuration
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL);
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-XSRF-TOKEN"
    );
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  });

  // CSRF Protection
  app.use((req, res, next) => {
    const excludedPaths = ["/api/auth/login", "/api/auth/register"];
    if (excludedPaths.includes(req.path)) {
      return next();
    }

    if (req.method === "GET") {
      const token = crypto.randomBytes(32).toString("hex");
      res.cookie("XSRF-TOKEN", token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
      next();
    } else {
      const cookie = req.cookies["XSRF-TOKEN"];
      const header = req.headers["x-xsrf-token"];

      if (!cookie || !header || cookie !== header) {
        return res
          .status(403)
          .json({ message: "CSRF token validation failed" });
      }
      next();
    }
  });
};

export default {
  protect,
  authorize,
  rateLimiters,
  validators,
  errorHandler,
  configureSecurityMiddleware,
};
