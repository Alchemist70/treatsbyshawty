const mongoose = require("mongoose");

const PreOrderFeedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    preOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PreOrder",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PreOrderFeedback", PreOrderFeedbackSchema);
