const mongoose = require("mongoose");

const preOrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    eventType: { type: String, required: true },
    eventDate: { type: Date, required: true },
    eventLocation: { type: String, required: true },
    contact: { type: String, required: true },
    notes: { type: String },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number },
      },
    ],
    customOrder: {
      description: String,
      image: String, // file path or URL
    },
    orderType: {
      type: String,
      enum: ["Menu", "Custom"],
      required: true,
      default: "Menu",
    },
    total: { type: Number, required: true },
    deposit: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    depositPaid: { type: Boolean, default: false },
    depositReceipt: { type: String },
    paymentRef: { type: String },
    status: {
      type: String,
      enum: [
        "pending",
        "pending-quote",
        "deposit-paid",
        "confirmed",
        "completed",
        "cancelled",
        "refunded",
      ],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PreOrder", preOrderSchema);
