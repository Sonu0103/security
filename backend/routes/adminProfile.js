const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  updateAdminAvatar,
} = require("../controllers/adminProfileController");

// All routes are protected and require admin access
router.use(protect, authorize("admin"));

router.get("/", getAdminProfile);
router.put("/", updateAdminProfile);
router.put("/password", changeAdminPassword);
router.put("/avatar", updateAdminAvatar);

module.exports = router;
