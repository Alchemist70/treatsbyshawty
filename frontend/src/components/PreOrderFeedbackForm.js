import React, { useState } from "react";
import axios from "axios";
import "../css/Checkout.css"; // Re-use styles

function PreOrderFeedbackForm({ preOrderId, user }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/preorders/${preOrderId}/feedback`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubmitted(true);
    } catch (err) {
      setError(
        err.response?.data?.message || "An error occurred submitting feedback."
      );
    }
  };

  if (submitted) {
    return (
      <div className="feedback-thanks">
        <h3 className="text-xl font-bold text-pink-700">
          Thanks for your feedback!
        </h3>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="feedback-form">
      <h3 className="text-xl font-bold text-pink-700 mb-3">
        How was your pre-order experience?
      </h3>
      <div className="star-rating mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= rating ? "star-filled" : "star-empty"}
            onClick={() => setRating(star)}
          >
            ★
          </span>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Tell us about your experience (optional)"
        rows="3"
        className="feedback-textarea"
      ></textarea>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      <button type="submit" className="feedback-submit-btn">
        Submit Feedback
      </button>
    </form>
  );
}

export default PreOrderFeedbackForm;
