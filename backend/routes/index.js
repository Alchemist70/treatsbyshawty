const express = require("express");
const router = express.Router();
const HomeContent = require("../models/HomeContent");
const ProductShowcase = require("../models/ProductShowcase");
const Testimonial = require("../models/Testimonial");
const auth = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Example route
router.get("/health", (req, res) => {
  res.json({ status: "ok", message: "API is healthy" });
});

router.use("/auth", require("./auth"));
router.use("/products", require("./products"));
router.use("/orders", require("./orders"));
router.use("/preorders", require("./preorders"));
router.use("/delivery", require("./delivery"));

// Add CORS headers for image upload support (if needed)
router.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Multer setup for image uploads
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, "img-" + Date.now() + ext);
  },
});
const upload = multer({ storage });

// Image upload endpoint
router.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// --- HomeContent (Our Story) ---
router.get("/home-content", async (req, res) => {
  try {
    let content = await HomeContent.findOne();
    if (!content) content = await HomeContent.create({});
    res.json(content);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.put("/home-content", auth, async (req, res) => {
  try {
    let content = await HomeContent.findOne();
    if (!content) content = new HomeContent();
    Object.assign(content, req.body);
    await content.save();
    res.json(content);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- ProductShowcase ---
router.get("/product-showcase", async (req, res) => {
  try {
    const products = await ProductShowcase.find().sort({ order: 1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.post("/product-showcase", auth, async (req, res) => {
  try {
    const product = new ProductShowcase(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
router.put("/product-showcase/:id", auth, async (req, res) => {
  try {
    const product = await ProductShowcase.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
router.delete("/product-showcase/:id", auth, async (req, res) => {
  try {
    await ProductShowcase.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- Testimonials ---
router.get("/testimonials", async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ order: 1 });
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.post("/testimonials", auth, async (req, res) => {
  try {
    const testimonial = new Testimonial(req.body);
    await testimonial.save();
    res.status(201).json(testimonial);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
router.put("/testimonials/:id", auth, async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(testimonial);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
router.delete("/testimonials/:id", auth, async (req, res) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
