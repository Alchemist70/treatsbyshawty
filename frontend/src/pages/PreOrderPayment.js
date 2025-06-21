import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../css/PaymentOptions.css";

export default function PreOrderPayment() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    event = {},
    menuItems = [],
    customOrder = {},
    deposit = 0,
    total = 0,
    useCustom = false,
  } = location.state || {};

  return (
    <div className="payment-options-container">
      <h1 className="payment-options-title">Deposit Payment</h1>
      <div className="payment-options-summary-card">
        <h2>Pre-Order Summary</h2>
        <div style={{ marginBottom: 10 }}>
          <b>Event:</b> {event.type} on {event.date} at {event.location}
        </div>
        <div style={{ marginBottom: 10 }}>
          <b>Contact:</b> {event.contact}
        </div>
        {event.notes && (
          <div style={{ marginBottom: 10 }}>
            <b>Notes:</b> {event.notes}
          </div>
        )}
        <div style={{ marginBottom: 10 }}>
          <b>Order:</b>
        </div>
        {!useCustom ? (
          <ul className="payment-options-summary-list">
            {menuItems.map((item, idx) => (
              <li key={idx}>
                <span className="font-semibold">
                  {item.product?.name}{" "}
                  <span className="item-qty">× {item.quantity}</span>
                </span>
                <span style={{ color: "#be185d", fontWeight: 700 }}>
                  ₦{(item.product?.price * item.quantity).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div style={{ marginBottom: 10 }}>
            <b>Custom:</b> {customOrder.description}
          </div>
        )}
        <div className="payment-options-total-row">
          <span>Total:</span>
          <span>₦{total.toFixed(2)}</span>
        </div>
        <div className="payment-options-total-row">
          <span>Deposit (60%):</span>
          <span style={{ color: "#be185d" }}>₦{deposit.toFixed(2)}</span>
        </div>
      </div>
      <div className="payment-options-choice-card">
        <h2 className="payment-options-choice-title">Choose Payment Method</h2>
        <button
          className="payment-options-btn"
          onClick={() =>
            navigate("/preorder-deposit-payment", { state: location.state })
          }
        >
          <span style={{ fontSize: 22, marginRight: 10 }}>💳</span> Card Payment
        </button>
        <button
          className="payment-options-btn"
          onClick={() =>
            navigate("/preorder-payment-bank", { state: location.state })
          }
        >
          <span style={{ fontSize: 22, marginRight: 10 }}>🏦</span> Bank
          Transfer
        </button>
      </div>
    </div>
  );
}
