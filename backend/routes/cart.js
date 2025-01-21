const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
} = require("../controllers/cartController");

router.use(protect);

router.route("/").get(getCart).post(addToCart);
router.route("/:productId").put(updateCartItem).delete(removeFromCart);

module.exports = router;
