const express = require("express");
const Review = require("../models/Review");
const auth = require("../middleware/auth");

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
    const reviews = await Review.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
