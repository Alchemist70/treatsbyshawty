import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../config";
import { PaystackButton } from "react-paystack";
import "../css/PaymentPage.css";

const PAYSTACK_PUBLIC_KEY = "pk_test_2582112c79618f9222da1eebdac2b5535be052d4";

export default function PreOrderPaymentCard() {
  const location = useLocation();
  const navigate = useNavigate();

  const { event, menuItems, customOrder, useCustom, total, deposit } =
    location.state || {};

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!location.state) {
    navigate("/preorder");
    return null;
  }

  const paystackConfig = {
    reference: new Date().getTime().toString(),
    email: event.contact.includes("@")
      ? event.contact
      : `user${Date.now()}@treatsbyshawty.com`,
    amount: Math.round(deposit * 100), // in kobo
    publicKey: PAYSTACK_PUBLIC_KEY,
    currency: "NGN",
    metadata: {
      custom_fields: [
        {
          display_name: "Event Type",
          variable_name: "event_type",
          value: event.type,
        },
        {
          display_name: "Event Date",
          variable_name: "event_date",
          value: event.date,
        },
      ],
    },
  };

  const handlePaystackSuccess = async (ref) => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("eventType", event.type);
      formData.append("eventDate", event.date);
      formData.append("eventLocation", event.location);
      formData.append("contact", event.contact);
      formData.append("notes", event.notes);
      formData.append("total", total);
      formData.append("deposit", deposit);
      formData.append("paymentMethod", "Card");
      formData.append("paymentRef", ref.reference);

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

      const res = await axiosInstance.post("/api/preorders", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      navigate("/thank-you", {
        state: {
          orderId: res.data._id,
          isPreOrder: true,
          paystackRef: ref.reference,
        },
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePaystackClose = () => {
    setError("Payment was cancelled. Please try again.");
  };

  return (
    <div className="payment-page-container">
      <div className="payment-card">
        <h2 className="payment-card-title">Pay with Card</h2>
        <div className="payment-card-icons">
          <i className="fab fa-cc-visa"></i>
          <i className="fab fa-cc-mastercard"></i>
          <i className="fab fa-cc-amex"></i>
        </div>
        <p className="payment-summary-text">
          You are about to pay a 60% deposit of{" "}
          <strong>₦{deposit.toFixed(2)}</strong> for your pre-order.
        </p>
        <PaystackButton
          className="payment-action-btn primary"
          {...paystackConfig}
          onSuccess={handlePaystackSuccess}
          onClose={handlePaystackClose}
          text={`Pay Deposit ₦${deposit.toFixed(2)}`}
          disabled={loading}
        />
        <button
          className="payment-action-btn secondary"
          onClick={() =>
            navigate("/preorder-payment-options", { state: location.state })
          }
        >
          Go Back
        </button>
        {loading && <p>Processing...</p>}
        {error && <div className="payment-error">{error}</div>}
      </div>
    </div>
  );
}
