import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../css/Cart.css";
import axios from "axios";

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ maxWidth: 400, padding: "2rem" }}>
        <p style={{ marginBottom: "2rem", fontSize: "1.1rem" }}>{message}</p>
        <div className="modal-actions">
          <button
            onClick={onCancel}
            className="signup-btn"
            style={{ background: "#eee", color: "#be185d" }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="signup-btn"
            style={{ background: "#ef4444" }}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    try {
      const localData = JSON.parse(localStorage.getItem("cartItems")) || [];
      // Normalize cart items to ensure consistent structure { product: {}, quantity: X }
      const normalizedCart = localData
        .map((item) => {
          if (item.product && item.product._id) {
            // Already in correct format
            return item;
          }
          // Is a flat product, needs normalization
          const { quantity, ...productDetails } = item;
          return { product: productDetails, quantity: quantity || 1 };
        })
        .filter(
          (item) =>
            item.product &&
            item.product._id &&
            item.product.name &&
            typeof item.product.price === "number"
        ); // Filter out any malformed items

      setCartItems(normalizedCart);
    } catch (e) {
      console.error("Could not parse cart items from localStorage", e);
      setCartItems([]);
    }
  }, []);

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + (item.product.price || 0) * item.quantity,
      0
    );
  };

  const total = calculateTotal();

  const handleRemove = (idx) => {
    const item = cartItems[idx];
    if (item) {
      setItemToDelete({ index: idx, name: item.product.name });
    }
  };

  const confirmRemove = () => {
    if (itemToDelete === null) return;
    const { index } = itemToDelete;
    const newCart = cartItems.filter((_, i) => i !== index);
    setCartItems(newCart);
    localStorage.setItem("cartItems", JSON.stringify(newCart));
    window.dispatchEvent(new Event("cart-updated"));
    // Sync with server
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .put(
          "/api/cart",
          { cartItems: newCart },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .catch((err) => console.error("Failed to sync cart with server", err));
    }
    setItemToDelete(null);
  };

  const cancelRemove = () => {
    setItemToDelete(null);
  };

  const handleQuantityChange = (idx, newQty) => {
    if (newQty < 1) return;
    const newCart = cartItems.map((item, i) =>
      i === idx ? { ...item, quantity: newQty } : item
    );
    setCartItems(newCart);
    localStorage.setItem("cartItems", JSON.stringify(newCart));
    window.dispatchEvent(new Event("cart-updated"));
    // Sync with server
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .put(
          "/api/cart",
          { cartItems: newCart },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .catch((err) => console.error("Failed to sync cart with server", err));
    }
  };

  const removeFromCart = (productId) => {
    const updatedCart = cartItems.filter(
      (item) => item.product._id !== productId
    );
    setCartItems(updatedCart);
    localStorage.setItem("cartItems", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cart-updated"));
    // Sync with server
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .delete(`/api/cart/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .catch((err) => console.error("Failed to sync cart with server", err));
    }
  };

  const proceedToCheckout = () => {
    navigate("/checkout");
  };

  return (
    <div className="cart-container">
      <h1 className="cart-title">Your Cart</h1>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <h2 className="empty-cart-title">Your cart is empty.</h2>
          <Link to="/menu" className="empty-cart-link">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items-list">
            {cartItems.map((item, idx) => (
              <div key={item.product._id} className="cart-item-card">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="cart-item-image"
                />
                <div className="cart-item-info">
                  <Link
                    to={`/product/${item.product._id}`}
                    className="cart-item-name"
                  >
                    {item.product.name}
                  </Link>
                  <span className="cart-item-price">
                    ₦{item.product.price.toFixed(2)}
                  </span>
                  <div className="cart-qty-controls">
                    <button
                      className="cart-qty-btn"
                      onClick={() =>
                        handleQuantityChange(idx, item.quantity - 1)
                      }
                    >
                      -
                    </button>
                    <span className="cart-item-quantity">{item.quantity}</span>
                    <button
                      className="cart-qty-btn"
                      onClick={() =>
                        handleQuantityChange(idx, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => handleRemove(idx)}
                    className="cart-item-remove"
                  >
                    Remove
                  </button>
                </div>
                <div className="cart-item-total">
                  ₦{(item.product.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2 className="cart-summary-title">Order Summary</h2>
            <div className="cart-summary-row">
              <span>Subtotal</span>
              <span>₦{total.toFixed(2)}</span>
            </div>
            {/* Future-proofing for delivery fee if added to cart page */}
            {/* <div className="cart-summary-row">
              <span>Delivery</span>
              <span>Calculated at next step</span>
            </div> */}
            <div className="cart-summary-total">
              <span>Total</span>
              <span>₦{total.toFixed(2)}</span>
            </div>
            <button
              onClick={proceedToCheckout}
              className="cart-summary-btn"
              disabled={cartItems.length === 0}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}

      {itemToDelete && (
        <ConfirmModal
          message={`Are you sure you want to remove "${itemToDelete.name}"?`}
          onConfirm={confirmRemove}
          onCancel={cancelRemove}
        />
      )}
    </div>
  );
}
