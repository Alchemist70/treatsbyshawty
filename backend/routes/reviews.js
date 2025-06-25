const express = require("express");
const Review = require("../models/Review");
const { auth } = require("../middleware/auth");

const router = express.Router();

// Admin check middleware
function isAdmin(req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

// @route   GET /api/reviews/all
// @desc    Get all reviews (admin only)
// @access  Private (Admin)
router.get("/all", auth, isAdmin, async (req, res) => {
  try {
    // Get all reviews, populate user and order (with items.product)
    const reviews = await Review.find()
      .populate("user", "name email")
      .populate({
        path: "order",
        select: "items",
        populate: { path: "items.product", select: "name" },
      })
      .sort({ createdAt: -1 });

    // For each review, extract the product name(s) from the order's items
    const reviewsWithProduct = reviews.map((review) => {
      let productNames = [];
      if (review.order && review.order.items && review.order.items.length > 0) {
        // If only one product per order, just use the first
        if (review.order.items.length === 1) {
          const prod = review.order.items[0].product;
          productNames = [prod && prod.name ? prod.name : "Unknown Product"];
        } else {
          // If multiple products, try to match by review.comment mentioning product, else list all
          productNames = review.order.items
            .map((item) =>
              item.product && item.product.name ? item.product.name : null
            )
            .filter(Boolean);
        }
      }
      return {
        ...review.toObject(),
        productNames,
      };
    });

    res.json(reviewsWithProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/reviews/my
// @desc    Get all reviews by the current user
// @access  Private
router.get("/my", auth, async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id })
      .select("product order rating comment createdAt")
      .lean();
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
