const Wishlist = require("../models/Wishlist");
const ErrorHandler = require("../utils/errorHandler");

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
exports.addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    const wishlistItem = await Wishlist.create({
      user: req.user._id,
      product: productId,
    });

    await wishlistItem.populate("product");

    res.status(201).json({
      success: true,
      wishlistItem,
    });
  } catch (error) {
    // Handle duplicate entry error
    if (error.code === 11000) {
      return next(new ErrorHandler("Product already in wishlist", 400));
    }
    next(error);
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
exports.removeFromWishlist = async (req, res, next) => {
  try {
    const wishlistItem = await Wishlist.findOneAndDelete({
      user: req.user._id,
      product: req.params.productId,
    });

    if (!wishlistItem) {
      return next(new ErrorHandler("Product not found in wishlist", 404));
    }

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = async (req, res, next) => {
  try {
    const wishlistItems = await Wishlist.find({ user: req.user._id })
      .populate("product")
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      count: wishlistItems.length,
      wishlistItems,
    });
  } catch (error) {
    next(error);
  }
};
