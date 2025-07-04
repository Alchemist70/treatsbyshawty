const express = require("express");
const Product = require("../models/Product");
const Review = require("../models/Review");
const auth = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Multer storage for product images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "..", "uploads", "products");
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, `product-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

const router = express.Router();

// Get all products
router.get("/", async (req, res) => {
  try {
    // Get all products
    const products = await Product.find();
    // For each product, fetch its reviews, rating, and numReviews
    const productsWithReviews = await Promise.all(
      products.map(async (product) => {
        // Get latest 3 reviews for this product
        const reviews = await Review.find({ product: product._id })
          .sort({ createdAt: -1 })
          .limit(3)
          .populate("user", "name");
        return {
          ...product.toObject(),
          reviews,
          rating: product.rating,
          numReviews: product.numReviews,
        };
      })
    );
    res.json(productsWithReviews);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Admin check middleware
function isAdmin(req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

// Create product (admin only)
router.post("/", auth, isAdmin, upload.single("image"), async (req, res) => {
  try {
    const productData = { ...req.body };

    // If a file was uploaded, its path will be in req.file.path
    if (req.file) {
      // The path should be accessible from the frontend, e.g., /uploads/image-123.jpg
      // Ensure the path separator is correct for URLs
      productData.image = `/${req.file.path.replace(/\\\\/g, "/")}`;
    }
    // If req.file is not present, it means an image URL was sent in req.body.image

    const product = await Product.create(productData);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: "Invalid data", error: err.message });
  }
});

// Update product (admin only)
router.put("/:id", auth, isAdmin, upload.single("image"), async (req, res) => {
  try {
    const productData = { ...req.body };

    if (req.file) {
      productData.image = `/${req.file.path.replace(/\\\\/g, "/")}`;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      productData,
      {
        new: true,
      }
    );
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: "Invalid data", error: err.message });
  }
});

// Delete product (admin only)
router.delete("/:id", auth, isAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/products/:id/reviews
// @desc    Create a new review for a product
// @access  Private
router.post("/:id/reviews", auth, async (req, res) => {
  const { rating, comment, orderId } = req.body;
  const productId = req.params.id;

  if (!rating || !comment || !orderId) {
    return res
      .status(400)
      .json({ message: "Rating, comment, and orderId are required." });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const order = await require("../models/Order").findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }
    // Ensure the order contains the product
    const orderedProduct = order.items.find(
      (item) => item.product.toString() === productId
    );
    if (!orderedProduct) {
      return res
        .status(400)
        .json({ message: "This product is not in the specified order." });
    }

    // Check if the user has already reviewed this product for this specific order
    const alreadyReviewed = await Review.findOne({
      product: productId,
      user: req.user.id,
      order: orderId,
    });

    if (alreadyReviewed) {
      return res.status(400).json({
        message: "You have already reviewed this product for this order.",
      });
    }

    // Fetch user name if not present in req.user
    let userName = req.user.name;
    if (!userName) {
      const User = require("../models/User");
      const userDoc = await User.findById(req.user.id);
      userName = userDoc ? userDoc.name : "User";
    }

    // Create a new review document
    const review = new Review({
      user: req.user.id,
      product: productId,
      order: orderId,
      rating: Number(rating),
      comment,
    });

    await review.save();

    // Push the review into the product's embedded reviews array
    product.reviews.push({
      user: req.user.id,
      name: userName,
      rating: Number(rating),
      comment,
      createdAt: new Date(),
    });

    // Recalculate the product's average rating
    const reviews = await Review.find({ product: productId });
    product.numReviews = reviews.length;
    product.rating =
      reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

    await product.save();

    res.status(201).json({ message: "Review added successfully." });
  } catch (error) {
    console.error("Review submission error:", error);
    res.status(500).send("Server Error: " + (error.message || error));
  }
});

// @route   POST api/products/upload
// @desc    Upload a product image
// @access  Private (Admin)
router.post("/upload", auth, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }
  const filePath = `uploads/products/${req.file.filename}`;
  res.json({ url: filePath });
});

module.exports = router;
