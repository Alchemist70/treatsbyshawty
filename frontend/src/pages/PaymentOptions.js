import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../css/Checkout.css";
import "../css/PaymentOptions.css";
import axiosInstance from "../config";

function ConfirmationModal({ open, onConfirm, onCancel, loading }) {
  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2 className="modal-title">Confirm Your Order</h2>
        <p className="modal-text">
          Are you sure you want to proceed with this order?
        </p>
        <div className="modal-actions">
          <button
            className="modal-btn cancel"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="modal-btn confirm"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Placing Order..." : "Proceed"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentOptions() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState("paystack");

  // Get order details from location state
  const { order } = location.state || {};

  if (!order) {
    // Redirect if no order details are found
    navigate("/checkout");
    return null;
  }

  const handleContinue = async () => {
    if (selectedOption === "paystack") {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.post(
          "/api/orders/create",
          { ...order, paymentMethod: "Paystack" },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        navigate(`/payment/${res.data.orderId}`);
      } catch (error) {
        console.error("Failed to create order", error);
        // Handle error, maybe show a message to the user
      }
    } else if (selectedOption === "bank_transfer") {
      navigate("/bank-transfer", { state: { order } });
    }
  };

  return (
    <div className="payment-options-container">
      <div className="payment-options-card">
        <h2>Choose Payment Method</h2>
        <div className="payment-options-list">
          <div
            className={`payment-option ${
              selectedOption === "paystack" ? "selected" : ""
            }`}
            onClick={() => setSelectedOption("paystack")}
          >
            <input
              type="radio"
              id="paystack"
              name="payment-method"
              value="paystack"
              checked={selectedOption === "paystack"}
              onChange={() => setSelectedOption("paystack")}
            />
            <label htmlFor="paystack">Pay with Card (Paystack)</label>
          </div>
          <div
            className={`payment-option ${
              selectedOption === "bank_transfer" ? "selected" : ""
            }`}
            onClick={() => setSelectedOption("bank_transfer")}
          >
            <input
              type="radio"
              id="bank_transfer"
              name="payment-method"
              value="bank_transfer"
              checked={selectedOption === "bank_transfer"}
              onChange={() => setSelectedOption("bank_transfer")}
            />
            <label htmlFor="bank_transfer">Bank Transfer</label>
          </div>
        </div>
        <button
          className="continue-btn"
          onClick={handleContinue}
          disabled={!selectedOption}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
