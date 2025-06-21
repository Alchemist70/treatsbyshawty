import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../css/Checkout.css";
import "../css/PaymentOptions.css";
import axios from "axios";

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

  // Get all data from the previous page
  const {
    cartItems = [],
    form = {},
    subtotal = 0,
    deliveryFee = 0,
    total = 0,
  } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    // If state is empty, maybe the user refreshed the page.
    // We should redirect them back to checkout to be safe.
    if (!location.state) {
      navigate("/checkout");
    }
  }, [location.state, navigate]);

  const placeOrder = async (payType) => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const items = cartItems.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        image: item.product.image,
        price: item.product.price,
        product: item.product._id,
      }));

      if (!items.length) {
        setError("No valid items in cart. Please re-add products.");
        setLoading(false);
        return;
      }

      const res = await axios.post(
        "/api/orders",
        {
          items,
          subtotal, // Pass subtotal
          deliveryFee, // Pass delivery fee
          total, // Pass final total
          address: form.address,
          phone: form.phone,
          zip: form.zip,
          city: form.city,
          state: form.state,
          paymentMethod: payType,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      localStorage.setItem(
        "latestOrderSummary",
        JSON.stringify({ cartItems, subtotal, deliveryFee, total, payType })
      );
      localStorage.removeItem("cartItems");
      window.dispatchEvent(new Event("cart-updated"));

      navigate("/thank-you", {
        state: {
          cartItems,
          form,
          subtotal,
          deliveryFee,
          total,
          payType,
          orderId: res.data._id,
        },
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOption = (option) => {
    const stateToPass = { cartItems, form, subtotal, deliveryFee, total };
    if (option === "pay-now") {
      navigate("/payment-method-selection", { state: stateToPass });
    } else if (option === "pay-on-delivery") {
      setIsConfirming(true);
    }
  };

  const handleConfirmOrder = () => {
    placeOrder("Pay on Delivery");
  };

  return (
    <div className="payment-options-container">
      <ConfirmationModal
        open={isConfirming}
        onConfirm={handleConfirmOrder}
        onCancel={() => setIsConfirming(false)}
        loading={loading}
      />
      <h1 className="payment-options-title">Payment Options</h1>
      <div className="payment-options-card">
        <h2 className="payment-options-card-title">Order Summary</h2>
        <ul className="summary-list">
          {cartItems.map((item, idx) => (
            <li key={idx} className="summary-item">
              <span className="summary-item-name">
                {item.product.name} × {item.quantity}
              </span>
              <span className="summary-item-price">
                ₦{(item.product.price * item.quantity).toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
        <div className="summary-divider" />
        <div className="summary-row">
          <span>Subtotal</span>
          <span>₦{subtotal.toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span>Delivery Fee</span>
          <span>₦{deliveryFee.toFixed(2)}</span>
        </div>
        <div className="summary-divider" />
        <div className="summary-total">
          <span>Total</span>
          <span>₦{total.toFixed(2)}</span>
        </div>
      </div>
      <div className="payment-options-card">
        <h2 className="payment-options-card-title">Choose Payment Option</h2>
        {error && <div className="error-message">{error}</div>}
        <div className="payment-buttons-container">
          <button
            className="payment-option-btn"
            onClick={() => handleOption("pay-on-delivery")}
            disabled={loading}
          >
            {loading ? "Placing Order..." : "Pay on Delivery"}
          </button>
          <button
            className="payment-option-btn"
            onClick={() => handleOption("pay-now")}
            disabled={loading}
          >
            {loading ? "Processing..." : "Pay Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
