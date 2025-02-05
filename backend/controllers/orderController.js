const Order = require("../models/Order");
const Cart = require("../models/Cart");
const ErrorHandler = require("../utils/errorHandler");
const Product = require("../models/Product");

// @desc    Get all orders (admin)
// @route   GET /api/orders/admin
// @access  Private/Admin
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product", "name price image")
      .sort("-createdAt");

    // Calculate total amount of all orders
    const totalAmount = orders.reduce(
      (total, order) => total + order.totalAmount,
      0
    );

    res.status(200).json({
      success: true,
      totalAmount,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order (admin)
// @route   GET /api/orders/admin/:id
// @access  Private/Admin
exports.getOrderDetails = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("items.product", "name price image");

    if (!order) {
      return next(new ErrorHandler("Order not found", 404));
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (admin)
// @route   PUT /api/orders/admin/:id
// @access  Private/Admin
exports.updateOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ErrorHandler("Order not found", 404));
    }

    // Update order status
    if (req.body.status) {
      order.status = req.body.status;

      // If order is marked as delivered
      if (req.body.status === "delivered") {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
      }
    }

    // Update payment status
    if (req.body.isPaid !== undefined) {
      order.isPaid = req.body.isPaid;
      if (req.body.isPaid) {
        order.paidAt = Date.now();
        // Update payment result if payment is marked as paid
        order.paymentResult = {
          status: "Success",
          transactionId: `MANUAL-${Date.now()}`,
          amount: order.totalAmount,
          referenceId: `ADMIN-${Date.now()}`,
        };
      }
    }

    await order.save();

    // Populate user and product details before sending response
    const updatedOrder = await Order.findById(order._id)
      .populate("user", "name email")
      .populate("items.product", "name price image");

    res.status(200).json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete order (admin)
// @route   DELETE /api/orders/admin/:id
// @access  Private/Admin
exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ErrorHandler("Order not found", 404));
    }

    await order.deleteOne();

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort("-createdAt");

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const { shippingAddress } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product"
    );
    if (!cart || cart.items.length === 0) {
      return next(new ErrorHandler("Cart is empty", 400));
    }

    // Check stock availability for all items
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return next(
          new ErrorHandler(
            `Only ${item.product.stock} items available for ${item.product.name}`,
            400
          )
        );
      }
    }

    // Calculate totals
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    const shippingFee = 10;
    const totalAmount = subtotal + shippingFee;

    // Create order items from cart
    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price,
    }));

    // Create order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod: "cash",
      totalAmount,
      shippingFee,
      status: "processing",
      isPaid: true,
      paidAt: Date.now(),
    });

    // Update product stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    // Clear the cart
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $set: { items: [] } }
    );

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
exports.getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product")
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent deliveries
// @route   GET /api/orders/admin/recent-deliveries
// @access  Private/Admin
exports.getRecentDeliveries = async (req, res, next) => {
  try {
    const recentDeliveries = await Order.find({
      isDelivered: true,
      status: "delivered",
    })
      .populate("user", "name email")
      .populate("items.product", "name price image")
      .sort("-deliveredAt")
      .limit(10); // Get last 10 deliveries

    res.status(200).json({
      success: true,
      count: recentDeliveries.length,
      recentDeliveries,
    });
  } catch (error) {
    next(error);
  }
};
