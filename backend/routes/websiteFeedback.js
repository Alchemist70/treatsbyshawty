const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const WebsiteFeedback = require("../models/WebsiteFeedback");
const Order = require("../models/Order");

// @route   POST api/website-feedback
// @desc    Submit feedback for an order
// @access  Private
router.post("/", auth, async (req, res) => {
  const { orderId, rating, comment } = req.body;

  if (!orderId || !rating) {
    return res
      .status(400)
      .json({ message: "Order ID and rating are required." });
  }

  try {
    // Check if the order exists and belongs to the user
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "User not authorized." });
    }

    const newFeedback = new WebsiteFeedback({
      user: req.user.id,
      orderId,
      rating,
      comment,
    });

    await newFeedback.save();
    res.status(201).json(newFeedback);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/website-feedback
// @desc    Get all feedback
// @access  Admin
router.get("/", auth, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  try {
    const feedbacks = await WebsiteFeedback.find()
      .populate("user", "name email")
      .populate("orderId", "orderId")
      .sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
