const User = require("../models/User");
const Cart = require("../models/Cart");
const ErrorHandler = require("../utils/errorHandler");
const generateToken = require("../utils/jwtToken");

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    console.log("Registration attempt:", { name, email, phone }); // Log registration attempt

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log("User already exists:", email);
      return next(new ErrorHandler("Email already registered", 400));
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      passwordHistory: [], // Initialize password history
    });

    // Create empty cart for new user
    await Cart.create({
      user: user._id,
      items: [],
    });

    console.log("User created successfully:", user._id);

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user and include password field
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      // If user doesn't exist, return generic message for security
      return next(new ErrorHandler("Invalid email or password", 401));
    }

    // Check if account is locked
    if (user.accountLockUntil && user.accountLockUntil > Date.now()) {
      const waitTime = Math.ceil(
        (user.accountLockUntil - Date.now()) / 1000 / 60
      );
      return next(
        new ErrorHandler(
          `Account is locked. Please try again after ${waitTime} minutes`,
          401
        )
      );
    }

    // Check if password is expired
    if (user.isPasswordExpired()) {
      return next(
        new ErrorHandler(
          "Your password has expired. Please reset your password",
          401
        )
      );
    }

    // Check password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      // Increment failed login attempts
      await user.handleFailedLogin();

      // If account is now locked, return appropriate message
      if (user.failedLoginAttempts >= 5) {
        return next(
          new ErrorHandler(
            "Account locked due to too many failed attempts. Please try again after 15 minutes",
            401
          )
        );
      }

      // Return remaining attempts message
      return next(
        new ErrorHandler(
          `Invalid password. ${
            5 - user.failedLoginAttempts
          } attempts remaining`,
          401
        )
      );
    }

    // Reset failed attempts on successful login
    await user.resetFailedAttempts();

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        failedLoginAttempts: user.failedLoginAttempts,
        accountLockUntil: user.accountLockUntil,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        joinDate: user.joinDate,
        lastLogin: user.lastLogin,
        passwordExpiresAt: user.passwordExpiresAt,
        passwordChangedAt: user.passwordChangedAt,
        failedLoginAttempts: user.failedLoginAttempts,
        accountLockUntil: user.accountLockUntil,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate new password
    if (!newPassword || newPassword.length < 8) {
      return next(
        new ErrorHandler("Password must be at least 8 characters long", 400)
      );
    }

    // Check password complexity
    const passwordRegex = {
      uppercase: /[A-Z]/,
      lowercase: /[a-z]/,
      number: /[0-9]/,
      special: /[!@#$%^&*(),.?":{}|<>]/,
      spaces: /\s/,
    };

    if (!passwordRegex.uppercase.test(newPassword)) {
      return next(
        new ErrorHandler(
          "Password must contain at least one uppercase letter",
          400
        )
      );
    }
    if (!passwordRegex.lowercase.test(newPassword)) {
      return next(
        new ErrorHandler(
          "Password must contain at least one lowercase letter",
          400
        )
      );
    }
    if (!passwordRegex.number.test(newPassword)) {
      return next(
        new ErrorHandler("Password must contain at least one number", 400)
      );
    }
    if (!passwordRegex.special.test(newPassword)) {
      return next(
        new ErrorHandler(
          "Password must contain at least one special character",
          400
        )
      );
    }
    if (passwordRegex.spaces.test(newPassword)) {
      return next(new ErrorHandler("Password cannot contain spaces", 400));
    }
    if (newPassword.length > 30) {
      return next(
        new ErrorHandler("Password cannot exceed 30 characters", 400)
      );
    }

    const user = await User.findById(req.user.id).select("+password");

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return next(new ErrorHandler("Current password is incorrect", 401));
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now()),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};
