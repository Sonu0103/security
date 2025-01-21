const Order = require("../models/Order");
const Cart = require("../models/Cart");
const ErrorHandler = require("../utils/errorHandler");

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

    if (order.status === "delivered") {
      return next(new ErrorHandler("You cannot update a delivered order", 400));
    }

    // Update order status
    order.status = req.body.status;

    // If order is marked as delivered, update payment status to completed
    if (req.body.status === "delivered") {
      order.paymentStatus = "completed";
    }

    // Add tracking info if provided
    if (req.body.trackingInfo) {
      order.trackingInfo = req.body.trackingInfo;
    }

    await order.save();

    res.status(200).json({
      success: true,
      order,
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
    const { shippingAddress, paymentMethod } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product"
    );
    if (!cart || cart.items.length === 0) {
      return next(new ErrorHandler("Cart is empty", 400));
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
      paymentMethod,
      totalAmount,
      shippingFee,
      status: paymentMethod === "cash" ? "processing" : "Payment Pending",
      isPaid: paymentMethod === "cash",
      paidAt: paymentMethod === "cash" ? Date.now() : null,
    });

    // If payment method is cash, create order directly and clear cart
    if (paymentMethod === "cash") {
      // Clear the cart
      await Cart.findOneAndUpdate(
        { user: req.user._id },
        { $set: { items: [] } }
      );

      res.status(201).json({
        success: true,
        order,
      });
    }
    // If payment method is esewa, initiate esewa payment
    else if (paymentMethod === "esewa") {
      // eSewa configuration
      const ESEWA_TEST_URL = process.env.ESEWA_TEST_URL;
      const MERCHANT_CODE = process.env.ESEWA_MERCHANT_CODE;
      const BACKEND_URL = process.env.BACKEND_URL;

      // Create eSewa payment data
      const esewaData = {
        amt: totalAmount - shippingFee, // actual amount
        pdc: shippingFee, // delivery charge
        psc: 0, // service charge
        txAmt: 0, // tax amount
        tAmt: totalAmount, // total amount
        pid: order._id.toString(), // unique order id
        scd: MERCHANT_CODE,
        su: `${BACKEND_URL}/api/orders/esewa/success`,
        fu: `${BACKEND_URL}/api/orders/esewa/failure?oid=${order._id}`,
      };

      res.status(201).json({
        success: true,
        order,
        esewaData,
        esewaUrl: ESEWA_TEST_URL,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Handle eSewa payment success
// @route   GET /api/orders/esewa/success
// @access  Public
exports.handleEsewaSuccess = async (req, res, next) => {
  try {
    const { oid, amt, refId } = req.query;
    console.log("eSewa success params:", { oid, amt, refId });

    const order = await Order.findById(oid);
    if (!order) {
      return next(new ErrorHandler("Order not found", 404));
    }

    // Update order with payment details
    order.isPaid = true;
    order.paidAt = Date.now();
    order.status = "processing";
    order.paymentResult = {
      status: "Success",
      transactionId: refId,
      amount: parseFloat(amt),
      referenceId: refId,
    };

    await order.save();
    console.log("Order updated successfully:", order._id);

    // Clear the cart after successful payment
    await Cart.findOneAndUpdate(
      { user: order.user },
      { $set: { items: [] } },
      { new: true }
    );
    console.log("Cart cleared for user:", order.user);

    // Send HTML response with redirect script
    res.send(`
      <html>
        <head>
          <title>Payment Successful</title>
          <script>
            function handlePaymentSuccess() {
              // Clear cart data from localStorage if any
              localStorage.removeItem('cart');
              sessionStorage.setItem('paymentSuccess', 'true');
              window.location.href = "${process.env.FRONTEND_URL}/orders?from=payment";
            }
            window.onload = handlePaymentSuccess;
          </script>
        </head>
        <body>
          <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif;">
            <div style="text-align: center;">
              <h2 style="color: #4CAF50;">Payment Successful!</h2>
              <p>Redirecting to your orders...</p>
            </div>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    next(error);
  }
};

// @desc    Handle eSewa payment failure
// @route   GET /api/orders/esewa/failure
// @access  Public
exports.handleEsewaFailure = async (req, res, next) => {
  try {
    const { oid } = req.query;
    console.log("eSewa failure params:", { oid });

    if (oid) {
      // Delete the pending order
      await Order.findOneAndDelete({ _id: oid, status: "Payment Pending" });
      console.log("Temporary order deleted:", oid);
    }

    // Send HTML response with redirect script
    res.send(`
      <html>
        <head>
          <title>Payment Failed</title>
          <script>
            sessionStorage.setItem('paymentError', 'Payment failed. Please try again.');
            window.location.href = "${process.env.FRONTEND_URL}/checkout";
          </script>
        </head>
        <body>
          <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif;">
            <div style="text-align: center;">
              <h2 style="color: #DC2626;">Payment Failed</h2>
              <p>Redirecting back to checkout...</p>
            </div>
          </div>
        </body>
      </html>
    `);
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
