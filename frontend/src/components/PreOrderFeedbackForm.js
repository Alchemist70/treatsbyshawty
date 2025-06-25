import axiosInstance from "../config";
import React, { useState } from "react";
import "../css/Checkout.css"; // Re-use styles
import "../css/PreOrderFeedbackForm.css";

function PreOrderFeedbackForm({ preOrderId, user, onSubmitSuccess }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axiosInstance.post(
        `/api/preorders/${preOrderId}/feedback`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Thank you for your feedback!");
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit feedback.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="feedback-thanks">
        <h3 className="text-xl font-bold text-pink-700">{success}</h3>
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
      <button type="submit" className="feedback-submit-btn" disabled={loading}>
        Submit Feedback
      </button>
    </form>
  );
}

export default PreOrderFeedbackForm;
