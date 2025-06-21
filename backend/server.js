const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Serve uploaded files statically
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
app.use("/api/cart", require("./routes/cart"));
app.use("/api", require("./routes/index"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
