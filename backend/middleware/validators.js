const { check, validationResult } = require("express-validator");
const ErrorHandler = require("../utils/errorHandler");

exports.registerValidator = [
  check("name", "Name is required").notEmpty().trim(),
  check("email", "Please include a valid email").isEmail().normalizeEmail(),
  check("password", "Password must be at least 6 characters").isLength({
    min: 6,
  }),
];

exports.loginValidator = [
  check("email", "Please include a valid email").isEmail().normalizeEmail(),
  check("password", "Password is required").notEmpty(),
];

exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new ErrorHandler(errors.array()[0].msg, 400);
    return next(error);
  }
  next();
};
