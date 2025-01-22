const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  createOrder,
  getUserOrders,
  getAllOrders,
  getOrderDetails,
  updateOrder,
  deleteOrder,
  handleEsewaSuccess,
  handleEsewaFailure,
  getRecentDeliveries,
} = require("../controllers/orderController");

// Public routes for eSewa callbacks
router.get("/esewa/success", handleEsewaSuccess);
router.get("/esewa/failure", handleEsewaFailure);

// Protected routes
router.use(protect);
router.route("/").post(createOrder).get(getUserOrders);

// Admin routes
router.route("/admin").get(authorize("admin"), getAllOrders);
router.get("/admin/recent-deliveries", authorize("admin"), getRecentDeliveries);

router
  .route("/admin/:id")
  .get(authorize("admin"), getOrderDetails)
  .put(authorize("admin"), updateOrder)
  .delete(authorize("admin"), deleteOrder);

module.exports = router;
