const User = require("../models/User");
const Order = require("../models/Order");
const Product = require("../models/Product");
const ErrorHandler = require("../utils/errorHandler");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Private/Admin
exports.getAdminProfile = async (req, res, next) => {
  try {
    const admin = await User.findById(req.user.id).select("-password");

    if (!admin || admin.role !== "admin") {
      return next(new ErrorHandler("Not authorized as admin", 403));
    }

    // Get additional admin stats
    const stats = {
      totalOrders: await Order.countDocuments(),
      totalUsers: await User.countDocuments({ role: "user" }),
      totalProducts: await Product.countDocuments(),
      recentOrders: await Order.find().sort("-createdAt").limit(5),
      // Add more stats as needed
    };

    res.status(200).json({
      success: true,
      admin,
      stats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update admin profile
// @route   PUT /api/admin/profile
// @access  Private/Admin
exports.updateAdminProfile = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    const admin = await User.findById(req.user.id);

    if (!admin || admin.role !== "admin") {
      return next(new ErrorHandler("Not authorized as admin", 403));
    }

    // Update basic info
    admin.name = name || admin.name;
    admin.email = email || admin.email;
    admin.phone = phone || admin.phone;

    await admin.save();

    res.status(200).json({
      success: true,
      admin,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change admin password
// @route   PUT /api/admin/profile/password
// @access  Private/Admin
exports.changeAdminPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const admin = await User.findById(req.user.id).select("+password");

    if (!admin || admin.role !== "admin") {
      return next(new ErrorHandler("Not authorized as admin", 403));
    }

    // Check current password
    const isMatch = await admin.matchPassword(currentPassword);
    if (!isMatch) {
      return next(new ErrorHandler("Current password is incorrect", 401));
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update admin avatar
// @route   PUT /api/admin/profile/avatar
// @access  Private/Admin
exports.updateAdminAvatar = async (req, res, next) => {
  try {
    const admin = await User.findById(req.user.id);

    if (!admin || admin.role !== "admin") {
      return next(new ErrorHandler("Not authorized as admin", 403));
    }

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
    if (admin.avatar && admin.avatar !== "default-avatar.jpg") {
      const oldAvatarPath = path.join(__dirname, "..", admin.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    const filename = `avatar_${admin._id}${path.extname(avatar.name)}`;
    const uploadDir = path.join(__dirname, "../uploads/avatars");

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filepath = path.join(uploadDir, filename);

    // Move file to upload folder
    await avatar.mv(filepath);

    // Update admin avatar field
    admin.avatar = `/uploads/avatars/${filename}`;
    await admin.save();

    res.status(200).json({
      success: true,
      admin,
    });
  } catch (error) {
    next(error);
  }
};
