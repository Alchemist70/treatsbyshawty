const mongoose = require("mongoose");

const ProductShowcaseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    image: { type: String, required: true }, // image URL or path
    description: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProductShowcase", ProductShowcaseSchema);
