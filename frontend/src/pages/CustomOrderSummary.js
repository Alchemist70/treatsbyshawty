import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import "../css/PreOrder.css"; // Reuse some styles

export default function CustomOrderSummary() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const { event, customOrder } = location.state || {
    event: {},
    customOrder: {},
  };

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    }
  }, []);

  return (
    <div className="preorder-container">
      <div
        className="preorder-card"
        style={{ maxWidth: 600, textAlign: "center" }}
      >
        <h1
          style={{ color: "#22c55e", fontSize: "2rem", marginBottom: "1rem" }}
        >
          Request Received!
        </h1>
        <p
          style={{
            fontSize: "1.1rem",
            color: "#4b5563",
            marginBottom: "1rem",
            lineHeight: 1.6,
          }}
        >
          Thank you for your custom order request. We will review the details
          and get back to you with a quote and further instructions within 6
          hours.
        </p>

        <p
          style={{
            fontSize: "1.1rem",
            color: "#4b5563",
            marginBottom: "2rem",
            lineHeight: 1.6,
          }}
        >
          We'll get back to you on your registered email
          {user?.email && <b style={{ color: "#be185d" }}> {user.email}</b>} or
          via our WhatsApp number{" "}
          <b style={{ color: "#be185d" }}>+1234567890</b>.
        </p>

        <div
          style={{
            borderTop: "1px solid #f3f4f6",
            borderBottom: "1px solid #f3f4f6",
            padding: "1.5rem 0",
            marginBottom: "2rem",
            textAlign: "left",
          }}
        >
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "#be185d",
              marginBottom: "1rem",
            }}
          >
            Your Request Summary
          </h2>
          {event.type && (
            <p>
              <strong>Event Type:</strong> {event.type}
            </p>
          )}
          {event.date && (
            <p>
              <strong>Event Date:</strong>{" "}
              {new Date(event.date).toLocaleDateString()}
            </p>
          )}
          {customOrder.description && (
            <p>
              <strong>Order Description:</strong> {customOrder.description}
            </p>
          )}
        </div>

        <Link to="/" className="signup-btn">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
