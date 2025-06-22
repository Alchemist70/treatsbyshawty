const express = require("express");
const Order = require("../models/Order");
const auth = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const Product = require("../models/Product");
const Review = require("../models/Review");
const fs = require("fs");

const router = express.Router();

// Set up storage for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "..", "uploads", "receipts");
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, `receipt-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpg|jpeg|png|pdf|webp/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb("Images, PDFs, and WebP only!");
    }
  },
});

// Admin check middleware
function isAdmin(req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

// Get all orders (admin only)
router.get("/", auth, isAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get orders for current user
router.get("/my", auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate(
      "items.product"
    );
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get order by ID (owner or admin)
router.get("/:id", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("items.product");
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (!req.user.isAdmin && order.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Create a new order
router.post("/", auth, async (req, res) => {
  const {
    items,
    address,
    phone,
    zip,
    city,
    state,
    deliveryFee,
    paymentMethod,
  } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: "No order items" });
  }

  try {
    // Security: Recalculate subtotal on the backend
    const productIds = items.map((item) => item.product);
    const products = await Product.find({ _id: { $in: productIds } });

    let subtotal = 0;
    for (const item of items) {
      const product = products.find((p) => p._id.toString() === item.product);
      if (!product) {
        return res
          .status(404)
          .json({ message: `Product with id ${item.product} not found` });
      }
      subtotal += product.price * item.quantity;
    }

    // Calculate final total
    const finalTotal = subtotal + (deliveryFee || 0);

    const orderNumber = `TBS-${Date.now()}`;

    // Map items to include all necessary fields for the order
    const orderItems = items.map((item) => {
      const product = products.find((p) => p._id.toString() === item.product);
      return {
        name: product.name,
        quantity: item.quantity,
        image: product.image,
        price: product.price,
        product: product._id,
      };
    });

    const newOrder = new Order({
      user: req.user.id,
      items: orderItems, // Use the new mapped items
      subtotal, // You might want to save this for clarity
      deliveryFee,
      total: finalTotal, // Use the secure, backend-calculated total
      totalPrice: finalTotal,
      status: "pending", // Default status, can be updated by payment flow
      address,
      phone,
      zip,
      city,
      state,
      orderNumber,
      paymentMethod,
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server Error" });
  }
});

// Update order status (admin only)
router.put("/:id/status", auth, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: "Invalid data" });
  }
});

// Cancel an order (user only, only if pending)
router.put("/:id/cancel", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    console.log(
      "CANCEL DEBUG: order.user=",
      order.user,
      typeof order.user,
      "req.user.id=",
      req.user.id,
      typeof req.user.id
    );
    console.log("CANCEL DEBUG: order=", order);
    console.log(
      "CANCEL DEBUG: order.user.toString() === req.user.id.toString() ?",
      order.user.toString() === req.user.id.toString()
    );
    console.log("CANCEL DEBUG: order.status =", order.status);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    // Ensure the user owns this order
    if (order.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    // Only allow cancellation if the order is pending
    if (order.status !== "pending") {
      return res.status(403).json({
        message: "Order cannot be cancelled once it has been processed",
      });
    }
    // If order number is missing (for old orders), generate one
    if (!order.orderNumber) {
      order.orderNumber = `TBS${Date.now()}${Math.floor(
        1000 + Math.random() * 9000
      )}`;
    }
    order.status = "cancelled";
    await order.save();
    res.json(order);
  } catch (err) {
    console.error("CANCEL ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete order (admin only, only if older than 2 minutes for testing)
router.delete("/:id", auth, isAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    const twoMinutes = 2 * 60 * 1000; // 2 minutes for testing
    if (Date.now() - new Date(order.createdAt).getTime() < twoMinutes) {
      return res
        .status(403)
        .json({ message: "Order can only be deleted after 2 minutes" });
    }
    await order.deleteOne();
    res.json({ message: "Order deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/orders/:id/feedback
// @desc    Create a new feedback for an order
// @access  Private
router.post("/:id/feedback", auth, async (req, res) => {
  const { rating, comment } = req.body;
  const orderId = req.params.id;

  if (!rating) {
    return res.status(400).json({ message: "Rating is required." });
  }

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "User not authorized." });
    }

    const alreadySubmitted = await Review.findOne({
      order: orderId,
      user: req.user.id,
    });

    if (alreadySubmitted) {
      return res.status(400).json({
        message: "You have already submitted feedback for this order.",
      });
    }

    const review = new Review({
      user: req.user.id,
      order: orderId,
      rating: Number(rating),
      comment,
    });

    await review.save();
    res.status(201).json({ message: "Feedback submitted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// Upload payment receipt
router.post(
  "/:id/upload-receipt",
  auth,
  upload.single("receipt"),
  async (req, res) => {
    try {
      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      if (order.user.toString() !== req.user.id.toString()) {
        return res.status(403).json({ message: "Not authorized" });
      }
      order.paymentReceipt = `uploads/receipts/${req.file.filename}`;
      order.paymentResult = {
        status: "Receipt uploaded. Pending verification.",
      };
      await order.save();
      res.json(order);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
