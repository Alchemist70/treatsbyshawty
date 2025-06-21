import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../css/PaymentMethodSelection.css"; // Reusing existing styles

export default function PreOrderDepositPayment() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    event,
    menuItems,
    customOrder,
    useCustom,
    subtotal,
    deliveryFee,
    total,
    deposit,
  } = location.state || {};

  // If state is missing, redirect to the start of the pre-order flow
  if (!location.state) {
    navigate("/preorder");
    return null;
  }

  const handlePaymentMethod = (method) => {
    // Pass all the state along to the next step
    const stateToPass = {
      event,
      menuItems,
      customOrder,
      useCustom,
      subtotal,
      deliveryFee,
      total,
      deposit,
    };
    if (method === "card") {
      navigate("/preorder-payment-card", { state: stateToPass });
    } else if (method === "bank") {
      navigate("/preorder-payment-bank", { state: stateToPass });
    }
  };

  return (
    <div className="payment-method-container">
      <div className="payment-method-card">
        <h2 className="payment-method-title">Pre-Order Summary</h2>
        <div className="summary-details">
          {useCustom ? (
            <div className="summary-item">
              <span>Custom Order</span>
              <span>(Quote to be provided)</span>
            </div>
          ) : (
            menuItems.map((item, index) => (
              <div key={index} className="summary-item">
                <span>
                  {item.product.name} x {item.quantity}
                </span>
                <span>₦{(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            ))
          )}
          <div className="summary-divider" />
          <div className="summary-item">
            <span>Subtotal</span>
            <span>₦{subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-item">
            <span>Delivery Fee</span>
            <span>₦{deliveryFee.toFixed(2)}</span>
          </div>
          <div className="summary-divider" />
          <div className="summary-total">
            <span>Total Order</span>
            <span>₦{total.toFixed(2)}</span>
          </div>
          <div className="summary-total deposit-due">
            <span>60% Deposit Due</span>
            <span>₦{deposit.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="payment-method-card">
        <h2 className="payment-method-title">Choose Deposit Payment Method</h2>
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
