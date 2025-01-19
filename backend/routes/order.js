const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getAllOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  getMyOrders,
} = require("../controllers/orderController");

// Customer routes
router.post("/", protect, createOrder);
router.get("/my-orders", protect, getMyOrders);

// Admin routes
router.get("/", protect, authorize("admin"), getAllOrders);
router.get("/:id", protect, authorize("admin"), getOrder);
router.put("/:id", protect, authorize("admin"), updateOrder);
router.delete("/:id", protect, authorize("admin"), deleteOrder);

module.exports = router;
