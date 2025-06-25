import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../css/PaymentPage.css";
import axiosInstance from "../config";
import { PaystackButton } from "react-paystack";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const PAYSTACK_PUBLIC_KEY = "pk_test_2582112c79618f9222da1eebdac2b5535be052d4";

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    form = {},
    total = 0,
    cartItems = [],
    orderId,
  } = location.state || {};

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [step, setStep] = useState(1);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!location.state || !cartItems.length) {
      navigate("/checkout");
    }
  }, [location.state, cartItems, navigate]);

  const paystackConfig = {
    reference: new Date().getTime().toString(),
    email: form.email,
    amount: Math.round(total * 100),
    publicKey: PAYSTACK_PUBLIC_KEY,
    currency: "NGN",
  };

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axiosInstance.get(`/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const orderData = res.data;
      setOrder(orderData);

      const paystackRes = await axiosInstance.post(
        `/api/orders/${orderId}/create-payment-intent`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

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
        ...location.state,
        orderId: orderData._id,
        payType: "Card",
      };

      localStorage.setItem("latestOrderSummary", JSON.stringify(orderSummary));
      navigate("/thank-you", { state: orderSummary });
    } catch (err) {
      setError(err.response?.data?.message || "Payment verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaystackSuccess = async (reference) => {
    try {
      const token = localStorage.getItem("token");
      await axiosInstance.put(
        `/api/orders/${orderId}/pay`,
        { reference },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      setError(err.response?.data?.message || "Payment verification failed.");
    }
  };

  const handleContinue = () => {
    if (paymentMethod) {
      setStep(2);
    }
  };

  if (step === 2) {
    return (
      <div className="payment-page-container">
        <div className="payment-card">
          <h2 className="payment-card-title">Secure Payment</h2>
          <PaystackButton
            className="payment-action-btn primary"
            {...paystackConfig}
            onSuccess={handlePaystackSuccess}
            onClose={() => setError("Payment was cancelled.")}
            text={`Pay Total ₦${total.toFixed(2)}`}
          />
          <button
            className="payment-action-btn secondary"
            onClick={() => setStep(1)}
          >
            Cancel payment
          </button>
          {loading && <p>Processing...</p>}
          {error && <div className="payment-error">{error}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page-container">
      <div className="payment-card">
        <button
          onClick={() =>
            navigate("/payment-options", { state: location.state })
          }
          className="back-link"
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Back to payment options
        </button>
        <h2 className="payment-card-title">How would you like to pay?</h2>

        <div className="payment-method-options">
          <div
            className={`payment-method-option ${
              paymentMethod === "card" ? "selected" : ""
            }`}
            onClick={() => setPaymentMethod("card")}
          >
            <span>💳</span> Visa / MasterCard
          </div>
          <div className={`payment-method-option disabled`}>
            <span>🅿️</span> PayPal
          </div>
          <div className={`payment-method-option disabled`}>
            <span>💶</span> iDeal
          </div>
        </div>

        <button
          className="payment-action-btn primary"
          onClick={handleContinue}
          disabled={!paymentMethod}
        >
          Continue to secure payment
        </button>
        <button
          className="payment-action-btn secondary"
          onClick={() => navigate("/cart")}
        >
          Cancel payment
        </button>
      </div>
    </div>
  );
}
