const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const auth = require("../middleware/auth");
const ProductShowcase = require("../models/ProductShowcase");

// Multer storage for showcase images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "..", "uploads", "showcase");
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, `showcase-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

// @route   POST api/product-showcase/upload
// @desc    Upload a showcase image
// @access  Private (Admin)
router.post("/upload", auth, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }
  const filePath = `uploads/showcase/${req.file.filename}`;
  res.json({ url: filePath });
});

// @route   GET api/product-showcase
// @desc    Get all showcase items
// @access  Public
router.get("/", async (req, res) => {
  try {
    const items = await ProductShowcase.find().sort({ order: "asc" });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST api/product-showcase
// @desc    Create a showcase item
// @access  Private (Admin)
router.post("/", auth, async (req, res) => {
  try {
    const newItem = new ProductShowcase(req.body);
    const item = await newItem.save();
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: "Invalid data" });
  }
});

// @route   PUT api/product-showcase/:id
// @desc    Update a showcase item
// @access  Private (Admin)
router.put("/:id", auth, async (req, res) => {
  try {
    const item = await ProductShowcase.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: "Invalid data" });
  }
});

// @route   DELETE api/product-showcase/:id
// @desc    Delete a showcase item
// @access  Private (Admin)
router.delete("/:id", auth, async (req, res) => {
  try {
    await ProductShowcase.findByIdAndDelete(req.params.id);
    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
