import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../config";
import "../css/PaymentMethodSelection.css";

export default function PaymentMethodSelection() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { order, cartItems, form, subtotal, deliveryFee, total } =
    location.state || {};

  if (!order) {
    navigate("/checkout");
    return null;
  }

  const handlePaymentMethod = async (method) => {
    const stateToPass = { cartItems, form, subtotal, deliveryFee, total };
    if (method === "card") {
      navigate("/payment", { state: stateToPass });
    } else if (method === "bank") {
      navigate("/bank-transfer", { state: stateToPass });
    }
  };

  const handleOrderCreation = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const orderData = {
        ...order,
        paymentMethod: selectedMethod,
        items: cartItems.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.price,
        })),
        shippingAddress: {
          address: form.address,
          city: form.city,
          postalCode: form.zip,
          country: "Nigeria",
        },
        totalPrice: total,
      };

      if (selectedMethod === "Card") {
        const res = await axiosInstance.post("/api/orders", orderData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        navigate(`/payment/${res.data._id}`);
      } else if (selectedMethod === "Bank Transfer") {
        const res = await axiosInstance.post("/api/orders", orderData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        navigate(`/bank-transfer/${res.data._id}`);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "An error occurred while creating your order."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-method-container">
      <div className="payment-method-card">
        <h2 className="payment-method-title">Order Summary</h2>
        <div className="summary-details">
          {cartItems.map((item, index) => (
            <div key={index} className="summary-item">
              <span>
                {item.product.name} x {item.quantity}
              </span>
              <span>₦{(item.product.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="summary-item">
            <span>Subtotal</span>
            <span>₦{subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-item">
            <span>Delivery Fee</span>
            <span>₦{deliveryFee.toFixed(2)}</span>
          </div>
          <div className="summary-total">
            <span>Total</span>
            <span>₦{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="payment-method-card">
        <h2 className="payment-method-title">Choose Payment Method</h2>
        <div className="payment-method-buttons">
          <button
            className="payment-method-btn"
            onClick={() => handlePaymentMethod("card")}
          >
            <i className="fas fa-credit-card"></i> Card Payment
          </button>
          <button
            className="payment-method-btn"
            onClick={() => handlePaymentMethod("bank")}
          >
            <i className="fas fa-university"></i> Bank Transfer
          </button>
        </div>
      </div>
    </div>
  );
}
