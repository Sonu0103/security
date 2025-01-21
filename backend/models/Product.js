const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter product name"],
      trim: true,
      maxLength: [100, "Product name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Please enter product description"],
      minLength: [20, "Description should be at least 20 characters"],
      maxLength: [1000, "Description cannot exceed 1000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Please enter product price"],
      min: [0, "Price cannot be negative"],
    },
    image: {
      type: String,
      required: [true, "Please upload product image"],
    },
    category: {
      type: String,
      required: [true, "Please select category"],
      enum: {
        values: [
          "Bats",
          "Balls",
          "Protection Gear",
          "Clothing",
          "Accessories",
          "Training Equipment",
        ],
        message: "Please select correct category",
      },
    },
    stock: {
      type: Number,
      required: [true, "Please enter product stock"],
      min: [0, "Stock cannot be negative"],
      default: 1,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    specifications: [
      {
        key: String,
        value: String,
      },
    ],
    brand: {
      type: String,
    },
    weight: {
      type: String,
    },
    dimensions: {
      type: String,
    },
    material: {
      type: String,
    },
    warranty: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
