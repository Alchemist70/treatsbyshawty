import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../css/PaymentMethodSelection.css";
import axios from "axios";

export default function PaymentMethodSelection() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems, form, subtotal, deliveryFee, total } =
    location.state || {};

  if (!location.state) {
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
