const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} = require("../controllers/wishlistController");

router.use(protect);

router.route("/").get(getWishlist).post(addToWishlist);
router.route("/:productId").delete(removeFromWishlist);

module.exports = router;
