const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
      },
    ],
    total: { type: Number, required: true },
    status: { type: String, default: "pending" },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    zip: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    orderNumber: { type: String, required: true, unique: true, index: true },
    paymentMethod: { type: String, required: true }, // This line is added
    paymentReceipt: { type: String },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },
    receipt: {
      type: String,
    },
    subtotal: { type: Number, required: true, default: 0.0 },
    deliveryFee: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
