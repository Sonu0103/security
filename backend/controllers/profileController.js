const User = require("../models/User");
const ErrorHandler = require("../utils/errorHandler");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    // Update basic info
    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;

    await user.save();

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/profile/password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select("+password");

    // Check current password
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

// @desc    Upload profile avatar
// @route   PUT /api/profile/avatar
// @access  Private
exports.updateAvatar = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!req.files || !req.files.avatar) {
      return next(new ErrorHandler("Please upload an image", 400));
    }

    const avatar = req.files.avatar;

    // Validate file type
    if (!avatar.mimetype.startsWith("image/")) {
      return next(new ErrorHandler("Please upload an image file", 400));
    }

    // Validate file size (max 2MB)
    if (avatar.size > 2 * 1024 * 1024) {
      return next(new ErrorHandler("Image size should be less than 2MB", 400));
    }

    // Delete old avatar if it exists and is not the default
    if (user.avatar && user.avatar !== "default-avatar.jpg") {
      const oldAvatarPath = path.join(__dirname, "..", user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    const filename = `avatar_${user._id}${path.extname(avatar.name)}`;
    const uploadDir = path.join(__dirname, "../uploads/avatars");

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filepath = path.join(uploadDir, filename);

    // Move file to upload folder
    await avatar.mv(filepath);

    // Update user avatar field
    user.avatar = `/uploads/avatars/${filename}`;
    await user.save();

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};
