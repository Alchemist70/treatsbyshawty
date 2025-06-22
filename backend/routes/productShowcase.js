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
  const filePath = req.file.path.replace(/\\/g, "/").split("backend/")[1];
  res.json({ url: filePath });
});

// @route   GET api/product-showcase
// @desc    Get all showcase items
// ... existing code ...
