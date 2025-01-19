const Product = require("../models/Product");
const ErrorHandler = require("../utils/errorHandler");
const path = require("path");
const fs = require("fs");

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res, next) => {
  try {
    console.log("Request body:", req.body); // For debugging
    console.log("Request files:", req.files); // For debugging

    // Check if files exist in the request
    if (!req.files || !req.files.image) {
      return next(new ErrorHandler("Please upload product image", 400));
    }

    const image = req.files.image;

    // Validate file type
    if (!image.mimetype.startsWith("image/")) {
      return next(new ErrorHandler("Please upload an image file", 400));
    }

    // Validate file size (max 2MB)
    if (image.size > 2 * 1024 * 1024) {
      return next(new ErrorHandler("Image size should be less than 2MB", 400));
    }

    // Validate required fields
    if (
      !req.body.name ||
      !req.body.description ||
      !req.body.category ||
      !req.body.price ||
      !req.body.stock
    ) {
      return next(new ErrorHandler("Please provide all required fields", 400));
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, "../uploads/products");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const filename = `product_${Date.now()}${path.extname(image.name)}`;
    const filepath = path.join(uploadDir, filename);
    const imageUrl = `/uploads/products/${filename}`;

    // Move file to upload folder
    await image.mv(filepath);

    // Create product with image path
    const product = await Product.create({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      price: Number(req.body.price),
      stock: Number(req.body.stock),
      isFeatured: req.body.isFeatured === "true",
      image: imageUrl,
    });

    // Add full URL to image path in response
    const productWithFullUrl = {
      ...product.toObject(),
      image: `${process.env.BACKEND_URL}${imageUrl}`,
    };

    res.status(201).json({
      success: true,
      product: productWithFullUrl,
    });
  } catch (error) {
    console.error("Product creation error:", error);
    next(error);
  }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find();

    // Add full URL to image paths
    const productsWithFullUrls = products.map((product) => ({
      ...product.toObject(),
      image: product.image.startsWith("http")
        ? product.image
        : `${process.env.BACKEND_URL}${product.image}`,
    }));

    res.status(200).json({
      success: true,
      count: products.length,
      products: productsWithFullUrls,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    // Handle image update
    if (req.files && req.files.image) {
      const image = req.files.image;

      if (!image.mimetype.startsWith("image")) {
        return next(new ErrorHandler("Please upload an image file", 400));
      }

      const filename = `product_${Date.now()}${path.extname(image.name)}`;
      await image.mv(`uploads/products/${filename}`);
      req.body.image = `/uploads/products/${filename}`;
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
exports.getProductsByCategory = async (req, res, next) => {
  try {
    const products = await Product.find({ category: req.params.category });

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isFeatured: true });

    // Add full URL to image paths
    const productsWithFullUrls = products.map((product) => ({
      ...product.toObject(),
      image: product.image.startsWith("http")
        ? product.image
        : `${process.env.BACKEND_URL}${product.image}`,
    }));

    res.status(200).json({
      success: true,
      products: productsWithFullUrls,
    });
  } catch (error) {
    next(error);
  }
};
