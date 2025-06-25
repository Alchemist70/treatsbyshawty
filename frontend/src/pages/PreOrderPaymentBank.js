import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../config";
import "../css/BankTransfer.css";

export default function PreOrderPaymentBank() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preOrder, setPreOrder] = useState(null);
  const [preOrderId, setPreOrderId] = useState(location.state?.preOrderId);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchPreOrder = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/api/preorders/${preOrderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPreOrder(res.data);
      } catch (err) {
        setError(
          err.response?.data?.message || err.message || "An error occurred."
        );
      } finally {
        setLoading(false);
      }
    };

    if (preOrderId) {
      fetchPreOrder();
    }
  }, [preOrderId, token]);

  const handlePaymentConfirm = async () => {
    try {
      setLoading(true);
      await axiosInstance.post(
        `/api/preorders/confirm-deposit`,
        { preOrderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/thank-you", {
        state: {
          orderId: preOrderId,
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

  if (!location.state) {
    return (
      <div className="bank-transfer-container">
        <h2>Error</h2>
        <p>No pre-order information found. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="bank-transfer-container">
      <div className="bank-transfer-card">
        <h2>Bank Transfer for Pre-Order Deposit</h2>
        {loading && <p>Loading pre-order details...</p>}
        {error && <p className="error-message">{error}</p>}
        {preOrder && (
          <>
            <div className="bank-details">
              <h3>Bank Account Details</h3>
              <p>
                <strong>Account Name:</strong> TreatsByShawty
              </p>
              <p>
                <strong>Account Number:</strong> 1234567890
              </p>
              <p>
                <strong>Bank:</strong> GTBank
              </p>
              <p>
                <strong>Amount to Pay:</strong> NGN{" "}
                {preOrder.depositAmount.toFixed(2)}
              </p>
            </div>
            <div className="payment-instructions">
              <h3>Instructions</h3>
              <p>
                Please transfer the deposit amount to the account above. Use
                your pre-order ID <strong>{preOrder._id}</strong> as the payment
                reference.
              </p>
              <p>
                After making the payment, click the button below to confirm.
              </p>
            </div>
            <button
              onClick={handlePaymentConfirm}
              className="confirm-payment-btn"
              disabled={loading}
            >
              {loading ? "Confirming..." : "I have made the payment"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
