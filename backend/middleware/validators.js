const { check, validationResult } = require("express-validator");
const ErrorHandler = require("../utils/errorHandler");

// Password validation rules
const passwordRules = [
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
];

exports.registerValidator = [
  check("name", "Name is required").notEmpty().trim(),
  check("email", "Please include a valid email").isEmail().normalizeEmail(),
  ...passwordRules,
];

exports.loginValidator = [
  check("email", "Please include a valid email").isEmail().normalizeEmail(),
  check("password", "Password is required").notEmpty(),
];

exports.changePasswordValidator = [
  check("currentPassword", "Current password is required").notEmpty(),
  ...passwordRules,
];

exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new ErrorHandler(errors.array()[0].msg, 400);
    return next(error);
  }
  next();
};
