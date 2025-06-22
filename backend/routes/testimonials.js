const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const auth = require("../middleware/auth");
const Testimonial = require("../models/Testimonial");

// Multer storage for testimonial images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "..", "uploads", "testimonials");
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, `testimonial-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

// @route   POST api/testimonials/upload
// @desc    Upload a testimonial image
// @access  Private (Admin)
router.post("/upload", auth, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }
  // Return the web-accessible path
  const filePath = req.file.path.replace(/\\/g, "/").split("backend/")[1];
  res.json({ url: filePath });
});

// @route   GET api/testimonials
// @desc    Get all testimonials
// @access  Public
router.get("/", async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ order: "asc" });
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST api/testimonials
// @desc    Create a testimonial
// @access  Private (Admin)
router.post("/", auth, async (req, res) => {
  const { name, text, image, order } = req.body;
  try {
    const newTestimonial = new Testimonial({ name, text, image, order });
    const testimonial = await newTestimonial.save();
    res.json(testimonial);
  } catch (err) {
    res.status(400).json({ message: "Invalid data" });
  }
});

// @route   PUT api/testimonials/:id
// @desc    Update a testimonial
// @access  Private (Admin)
router.put("/:id", auth, async (req, res) => {
  const { name, text, image, order } = req.body;
  try {
    let testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }
    testimonial.name = name;
    testimonial.text = text;
    testimonial.image = image;
    testimonial.order = order;
    await testimonial.save();
    res.json(testimonial);
  } catch (err) {
    res.status(400).json({ message: "Invalid data" });
  }
});

// @route   DELETE api/testimonials/:id
// @desc    Delete a testimonial
// @access  Private (Admin)
router.delete("/:id", auth, async (req, res) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ message: "Testimonial deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
