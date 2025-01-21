const Cart = require("../models/Cart");
const Product = require("../models/Product");
const ErrorHandler = require("../utils/errorHandler");

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
      "name price image"
    );

    // If cart doesn't exist, create one
    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
      });
    }

    res.status(200).json({
      success: true,
      items: cart.items,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    let cart = await Cart.findOne({ user: req.user._id });

    // If cart doesn't exist, create one
    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
      });
    }

    // Check if product already exists in cart
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      // Update quantity if product exists
      existingItem.quantity += quantity;
    } else {
      // Add new item if product doesn't exist
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();

    // Populate product details before sending response
    cart = await cart.populate("items.product", "name price image");

    res.status(200).json({
      success: true,
      items: cart.items,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params;

    // Validate quantity
    if (quantity < 1) {
      return next(new ErrorHandler("Quantity must be at least 1", 400));
    }

    // Check product stock
    const product = await Product.findById(productId);
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    // Check if quantity is within stock limits
    if (quantity > product.stock) {
      return next(
        new ErrorHandler(`Only ${product.stock} items available`, 400)
      );
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return next(new ErrorHandler("Cart not found", 404));
    }

    // Find the item in cart
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return next(new ErrorHandler("Item not found in cart", 404));
    }

    // Update quantity
    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    // Populate product details before sending response
    cart = await cart.populate("items.product", "name price image stock");

    res.status(200).json({
      success: true,
      items: cart.items,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
exports.removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return next(new ErrorHandler("Cart not found", 404));
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== req.params.productId
    );
    await cart.save();
    await cart.populate("items.product", "name price image stock");

    res.status(200).json({
      success: true,
      items: cart.items,
    });
  } catch (error) {
    next(error);
  }
};
