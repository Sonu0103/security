const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getProfile,
  updateProfile,
  changePassword,
  updateAvatar,
} = require("../controllers/profileController");

router.get("/", protect, getProfile);
router.put("/", protect, updateProfile);
router.put("/password", protect, changePassword);
router.put("/avatar", protect, updateAvatar);

module.exports = router;
