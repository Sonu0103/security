const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate wishlist entries
wishlistSchema.index({ user: 1, product: 1 }, { unique: true });

module.exports = mongoose.model("Wishlist", wishlistSchema);
