const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
const allowedOrigins = [
  "https://treatsbyshawty-45r0.onrender.com",
  "http://localhost:3000",
];
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(cookieParser());

// Serve static files from the 'uploads' directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check route
app.get("/", (req, res) => {
  res.send("TreatsByShawty API is running");
});

// Connect to MongoDB
connectDB();

// API Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/preorders", require("./routes/preorders"));
app.use("/api/delivery", require("./routes/delivery"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/website-feedback", require("./routes/websiteFeedback"));
app.use("/api/home-content", require("./routes/homeContent"));
app.use("/api/product-showcase", require("./routes/productShowcase"));
app.use("/api/testimonials", require("./routes/testimonials"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/users", require("./routes/users"));
app.use("/api", require("./routes/index"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Serve frontend
if (process.env.NODE_ENV === "production") {
  // ... existing code ...
}
