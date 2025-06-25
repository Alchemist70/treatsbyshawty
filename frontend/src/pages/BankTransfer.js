import React, { useState, useEffect } from "react";
import axiosInstance from "../config";
import { useLocation, useNavigate } from "react-router-dom";
import "../css/BankTransfer.css";

export default function BankTransfer() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);
  const [orderId, setOrderId] = useState(location.state?.orderId || null);
  const {
    cartItems = [],
    form,
    subtotal,
    deliveryFee,
    total,
  } = location.state || {};

  if (!location.state) {
    navigate("/checkout");
    return null;
  }

  const handleFileChange = (e) => {
    setReceipt(e.target.files[0]);
  };

  const handleUploadReceipt = async () => {
    if (!cartItems || cartItems.length === 0) {
      setError("Your cart is empty. Please go back and add items.");
      return;
    }

    if (!receipt) {
      setError("Please choose a file to upload.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to place an order.");
        setLoading(false);
        return;
      }

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const orderData = {
        items: cartItems.map((item) => ({
          product: item.product._id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          image: item.product.image,
        })),
        address: form.address,
        city: form.city,
        state: form.state,
        zip: form.zip,
        phone: form.phone,
        paymentMethod: "Bank Transfer",
        subtotal,
        deliveryFee,
        total: total,
      };

      const { data: order } = await axiosInstance.post(
        "/api/orders",
        orderData,
        config
      );

      const receiptData = new FormData();
      receiptData.append("receipt", receipt);

      await axiosInstance.post(
        `/api/orders/${order._id}/upload-receipt`,
        receiptData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setLoading(false);
      localStorage.removeItem("cartItems");
      window.dispatchEvent(new Event("cart-updated"));

      // Also clear the cart on the server
      try {
        await axiosInstance.delete("/api/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (cartClearError) {
        // Log this error but don't block the user flow
        console.error("Failed to clear server-side cart:", cartClearError);
      }

      const orderSummary = {
        orderId: order._id,
        cartItems: order.items,
        total: order.total,
        payType: "Bank Transfer",
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
      };

      localStorage.setItem("latestOrderSummary", JSON.stringify(orderSummary));
      setOrderId(order._id);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "An error occurred."
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!orderId) return;
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.get(`/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrder(res.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to fetch order details."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handleConfirmPayment = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axiosInstance.post(
        `/api/orders/${orderId}/confirm-payment`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/thank-you");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to confirm payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bank-transfer-container">
      <h1>Bank Transfer</h1>
      <div className="bank-transfer-card">
        <h2 className="bank-transfer-title">Total Amount</h2>
        <div className="amount-display">
          <span className="amount-label">Total:</span>
          <span className="amount-value">₦{total.toFixed(2)}</span>
        </div>
        <div className="bank-details">
          <h3>Bank Account Details</h3>
          <p>
            <strong>Bank Name:</strong> TreatsByShawty Bank
          </p>
          <p>
            <strong>Account Number:</strong> 1234567890
          </p>
          <p>
            <strong>Account Name:</strong> TreatsByShawty
          </p>
        </div>
        <div className="transfer-instructions">
          Please transfer the total amount to the account above. Then upload
          your payment receipt below for verification.
        </div>
      </div>
      <div className="bank-transfer-card">
        <h2 className="bank-transfer-title">Upload Payment Receipt</h2>
        <div className="upload-section">
          <input
            type="file"
            id="receipt-upload"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <label htmlFor="receipt-upload" className="file-label">
            Choose File
          </label>
          {receipt && <span className="file-name">{receipt.name}</span>}
        </div>
        {error && <p className="error-message">{error}</p>}
        <button
          className="upload-btn"
          onClick={handleUploadReceipt}
          disabled={loading}
        >
          {loading ? "Processing..." : "Upload Receipt & Place Order"}
        </button>
      </div>
    </div>
  );
}
