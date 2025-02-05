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
      "name price image stock _id"
    );

    // If cart doesn't exist, create one
    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
      });
    }

    // Filter out any items where product is null (in case product was deleted)
    if (cart.items) {
      cart.items = cart.items.filter((item) => item.product != null);
      await cart.save();
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

    // Check if product is in stock
    if (product.stock < quantity) {
      return next(
        new ErrorHandler(`Only ${product.stock} items available`, 400)
      );
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

      // Verify the new quantity doesn't exceed stock
      if (existingItem.quantity > product.stock) {
        return next(
          new ErrorHandler(`Only ${product.stock} items available`, 400)
        );
      }
    } else {
      // Add new item if product doesn't exist
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();

    // Populate product details before sending response
    cart = await cart.populate("items.product", "name price image stock _id");

    // Filter out any items where product is null
    cart.items = cart.items.filter((item) => item.product != null);
    await cart.save();

    res.status(200).json({
      success: true,
      items: cart.items,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item
// @route   PUT /api/cart/:productId
// @access  Private
exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params;

    // Validate product exists and has enough stock
    const product = await Product.findById(productId);
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    if (quantity > product.stock) {
      return next(
        new ErrorHandler(`Only ${product.stock} items available`, 400)
      );
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return next(new ErrorHandler("Cart not found", 404));
    }

    const cartItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (!cartItem) {
      return next(new ErrorHandler("Item not found in cart", 404));
    }

    cartItem.quantity = quantity;
    await cart.save();

    // Populate product details before sending response
    await cart.populate("items.product", "name price image stock _id");

    // Filter out any items where product is null
    cart.items = cart.items.filter((item) => item.product != null);
    await cart.save();

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

    // Populate product details before sending response
    await cart.populate("items.product", "name price image stock _id");

    // Filter out any items where product is null
    cart.items = cart.items.filter((item) => item.product != null);
    await cart.save();

    res.status(200).json({
      success: true,
      items: cart.items,
    });
  } catch (error) {
    next(error);
  }
};
