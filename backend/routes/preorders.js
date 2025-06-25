const express = require("express");
const PreOrder = require("../models/PreOrder");
const Product = require("../models/Product");
const { auth } = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const axios = require("axios");
const PreOrderFeedback = require("../models/PreOrderFeedback");
const fs = require("fs");

const router = express.Router();

// Consolidated Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let dest = "uploads/";
    if (file.fieldname === "receipt") {
      dest += "receipts/";
    } else if (file.fieldname === "customImage") {
      dest += "preorders/";
    }
    fs.mkdirSync(path.join(__dirname, "..", dest), { recursive: true });
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    const prefix =
      file.fieldname === "receipt" ? "preorder-receipt-" : "preorder-";
    cb(
      null,
      `${prefix}${Date.now()}${require("path").extname(file.originalname)}`
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "receipt") {
    // Allow images and PDFs for receipts
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype === "application/pdf"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only images and PDFs are allowed for receipts."));
    }
  } else if (file.fieldname === "customImage") {
    // Only allow images for customImage
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed for custom order images."));
    }
  } else {
    cb(null, true);
  }
};

const upload = multer({ storage, fileFilter });

function isAdmin(req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

// User: Create pre-order (Consolidated Endpoint)
router.post(
  "/",
  auth,
  upload.fields([
    { name: "customImage", maxCount: 1 },
    { name: "receipt", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        eventType,
        eventDate,
        eventLocation,
        contact,
        notes,
        items,
        customOrder,
        total,
        deposit,
        paymentMethod,
        paymentRef,
      } = req.body;

      let customOrderObj = {};
      if (customOrder) {
        customOrderObj = JSON.parse(customOrder);
        if (req.files && req.files.customImage) {
          customOrderObj.image = `uploads/preorders/${req.files.customImage[0].filename}`;
        }
      }

      let depositPaid = false;
      let depositReceipt = "";

      if (paymentMethod === "Card" && paymentRef) {
        const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
        const verifyRes = await axios.get(
          `https://api.paystack.co/transaction/verify/${paymentRef}`,
          { headers: { Authorization: `Bearer ${paystackSecret}` } }
        );
        if (verifyRes.data?.data?.status === "success") {
          depositPaid = true;
        } else {
          return res
            .status(400)
            .json({ message: "Card payment verification failed." });
        }
      } else if (paymentMethod === "Bank Transfer") {
        if (req.files && req.files.receipt) {
          depositReceipt = `uploads/receipts/${req.files.receipt[0].filename}`;
        } else {
          return res
            .status(400)
            .json({ message: "Bank transfer receipt is required." });
        }
      }

      const preOrder = await PreOrder.create({
        user: req.user.id,
        eventType,
        eventDate,
        eventLocation,
        contact,
        notes,
        items: items ? JSON.parse(items) : [],
        customOrder: customOrderObj,
        total: total || 0,
        deposit: deposit || 0,
        paymentMethod,
        paymentRef: depositPaid ? paymentRef : undefined,
        depositPaid,
        depositReceipt,
        status: "pending",
      });

      res.status(201).json(preOrder);
    } catch (err) {
      res.status(400).json({ message: "Invalid data", error: err.message });
    }
  }
);

// User: Get own pre-orders
router.get("/my", auth, async (req, res) => {
  try {
    const preorders = await PreOrder.find({ user: req.user.id })
      .populate("items.product")
      .sort({ createdAt: -1 });
    res.json(preorders);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/preorders/:id/feedback
// @desc    Create a new feedback for a pre-order
// @access  Private
router.post("/:id/feedback", auth, async (req, res) => {
  const { rating, comment } = req.body;
  const preOrderId = req.params.id;

  if (!rating) {
    return res.status(400).json({ message: "Rating is required." });
  }

  try {
    const preOrder = await PreOrder.findById(preOrderId);
    if (!preOrder) {
      return res.status(404).json({ message: "Pre-order not found." });
    }

    if (preOrder.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "User not authorized." });
    }

    const alreadySubmitted = await PreOrderFeedback.findOne({
      preOrder: preOrderId,
      user: req.user.id,
    });

    if (alreadySubmitted) {
      return res.status(400).json({
        message: "You have already submitted feedback for this pre-order.",
      });
    }

    const feedback = new PreOrderFeedback({
      user: req.user.id,
      preOrder: preOrderId,
      rating: Number(rating),
      comment,
    });

    await feedback.save();
    res.status(201).json({ message: "Feedback submitted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// --- Admin Routes ---

// Admin: Get all pre-order feedback
router.get("/feedback/all", auth, isAdmin, async (req, res) => {
  try {
    const feedbacks = await PreOrderFeedback.find()
      .populate("user", "name email")
      .populate({
        path: "preOrder",
        select: "eventType items customOrder",
        populate: { path: "items.product", select: "name" },
      })
      .sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Admin: List all pre-orders
router.get("/", auth, isAdmin, async (req, res) => {
  try {
    const preorders = await PreOrder.find()
      .populate("user", "name email")
      .populate("items.product")
      .sort({ createdAt: -1 });
    res.json(preorders);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Admin: Get single pre-order
router.get("/:id", auth, isAdmin, async (req, res) => {
  try {
    const preorder = await PreOrder.findById(req.params.id)
      .populate("user", "name email")
      .populate("items.product");
    if (!preorder)
      return res.status(404).json({ message: "Pre-order not found" });
    res.json(preorder);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Admin: Delete pre-order
router.delete("/:id", auth, isAdmin, async (req, res) => {
  try {
    const preorder = await PreOrder.findById(req.params.id);
    if (!preorder) {
      return res.status(404).json({ message: "Pre-order not found" });
    }
    await preorder.deleteOne();
    res.json({ message: "Pre-order deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Admin: Update status, mark deposit, refund
router.put("/:id/status", auth, isAdmin, async (req, res) => {
  try {
    const { status, depositPaid, paymentRef } = req.body;
    const preorder = await PreOrder.findById(req.params.id);
    if (!preorder)
      return res.status(404).json({ message: "Pre-order not found" });
    if (status) preorder.status = status;
    if (typeof depositPaid === "boolean") preorder.depositPaid = depositPaid;
    if (paymentRef) preorder.paymentRef = paymentRef;
    await preorder.save();
    res.json(preorder);
  } catch (err) {
    res.status(400).json({ message: "Invalid data" });
  }
});

module.exports = router;
