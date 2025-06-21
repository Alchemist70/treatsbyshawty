import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../css/BankTransfer.css";
import axios from "axios";

export default function PreOrderPaymentBank() {
  const location = useLocation();
  const navigate = useNavigate();

  const { event, menuItems, customOrder, useCustom, total, deposit } =
    location.state || {};

  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!location.state) {
    navigate("/preorder");
    return null;
  }

  const handleFileChange = (e) => {
    setReceipt(e.target.files[0]);
  };

  const handleUploadReceipt = async () => {
    if (!receipt) {
      setError("Please upload a payment receipt to continue.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      // Append all data
      formData.append("eventType", event.type);
      formData.append("eventDate", event.date);
      formData.append("eventLocation", event.location);
      formData.append("contact", event.contact);
      formData.append("notes", event.notes);
      formData.append("total", total);
      formData.append("deposit", deposit);
      formData.append("paymentMethod", "Bank Transfer");
      formData.append("receipt", receipt);

      if (useCustom) {
        formData.append(
          "customOrder",
          JSON.stringify({ description: customOrder.description })
        );
        if (customOrder.image) {
          formData.append("customImage", customOrder.image);
        }
        formData.append("items", JSON.stringify([]));
      } else {
        formData.append(
          "items",
          JSON.stringify(
            menuItems.map((i) => ({
              product: i.product._id,
              quantity: i.quantity,
            }))
          )
        );
        formData.append("customOrder", JSON.stringify({}));
      }

      const res = await axios.post("/api/preorders", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status < 200 || res.status >= 300) {
        throw new Error(res.data?.message || "Failed to submit pre-order");
      }

      navigate("/thank-you", {
        state: {
          orderId: res.data._id,
          isPreOrder: true,
          isBankTransfer: true,
        },
      });
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "An error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bank-transfer-container">
      <h1 className="bank-transfer-page-title">Bank Transfer Deposit</h1>
      <div className="bank-transfer-card">
        <h2 className="bank-transfer-title">Deposit Amount</h2>
        <div className="amount-display">
          <span className="amount-label">60% Deposit Due:</span>
          <span className="amount-value">₦{deposit.toFixed(2)}</span>
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
          Please transfer the deposit amount to the account above, then upload
          your receipt below.
        </div>
      </div>
      <div className="bank-transfer-card">
        <h2 className="bank-transfer-title">Upload Payment Receipt</h2>
        <div className="upload-section">
          <input
            type="file"
            id="receipt-upload"
            onChange={handleFileChange}
            accept="image/*,.pdf"
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
          {loading ? "Submitting..." : "Submit Pre-Order"}
        </button>
        <button
          className="back-btn"
          onClick={() =>
            navigate("/preorder-payment-options", { state: location.state })
          }
          disabled={loading}
        >
          Back
        </button>
      </div>
    </div>
  );
}
