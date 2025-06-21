import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import "../css/Checkout.css";
import axios from "axios";
import "../css/ThankYou.css";

function ThankYou() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, isPreOrder, isBankTransfer, paystackRef } =
    location.state || {};

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [feedbackError, setFeedbackError] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState("");

  const handleRating = (rate) => {
    setRating(rate);
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setFeedbackError("");
    setFeedbackSuccess("");

    if (rating === 0) {
      setFeedbackError("Please select a rating.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const url = isPreOrder
        ? `/api/preorders/${orderId}/feedback`
        : `/api/orders/${orderId}/feedback`;

      await axios.post(
        url,
        { rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFeedbackSuccess("Thank you for your feedback!");
    } catch (err) {
      setFeedbackError(
        err.response?.data?.message || "Failed to submit feedback."
      );
    }
  };

  const renderMessage = () => {
    if (isPreOrder) {
      if (isBankTransfer) {
        return (
          <>
            <h2>Pre-Order Submitted!</h2>
            <p>
              Your pre-order and bank transfer receipt have been submitted for
              verification. We will contact you shortly to confirm.
            </p>
          </>
        );
      }
      return (
        <>
          <h2>Deposit Paid Successfully!</h2>
          <p>
            Your pre-order deposit has been received (Ref: {paystackRef}). We
            will contact you to finalize the details.
          </p>
        </>
      );
    }
    // Default order confirmation
    return (
      <>
        <h2>Thank You for Your Order!</h2>
        <p>
          Your order has been placed successfully. You will receive a
          confirmation email shortly.
        </p>
      </>
    );
  };

  const showFeedbackForm = orderId;

  return (
    <div className="thank-you-container">
      <div className="thank-you-card">
        <div className="thank-you-icon">🎉</div>
        {renderMessage()}
        <Link to="/my-orders" className="cta-link">
          View My Orders
        </Link>
        <Link to="/" className="cta-link secondary">
          Back to Home
        </Link>
      </div>

      {showFeedbackForm && (
        <div className="feedback-form-card">
          <h3>Leave Feedback for Your Order</h3>
          <form onSubmit={handleFeedbackSubmit}>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={star <= rating ? "star-filled" : "star-empty"}
                  onClick={() => handleRating(star)}
                >
                  ★
                </span>
              ))}
            </div>
            <textarea
              placeholder="Tell us about your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            {feedbackError && <p className="feedback-error">{feedbackError}</p>}
            {feedbackSuccess && (
              <p className="feedback-success">{feedbackSuccess}</p>
            )}
            <button type="submit" className="submit-feedback-btn">
              Submit Feedback
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default ThankYou;
