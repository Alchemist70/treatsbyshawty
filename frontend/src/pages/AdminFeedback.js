import React, { useState, useEffect } from "react";
import axios from "axios";
import "./../css/AdminFeedback.css";

const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // 'all', 'website', 'preorder'

  useEffect(() => {
    const fetchFeedbacks = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const reviewsRes = await axios.get("/api/reviews/all", { headers });
        const preorderFeedbackRes = await axios.get(
          "/api/preorders/feedback/all",
          { headers }
        );

        const websiteFeedbacks = reviewsRes.data.map((fb) => ({
          ...fb,
          type: "Website Order",
        }));
        const preorderFeedbacks = preorderFeedbackRes.data.map((fb) => ({
          ...fb,
          type: "Pre-Order",
        }));

        const allFeedbacks = [...websiteFeedbacks, ...preorderFeedbacks];
        allFeedbacks.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setFeedbacks(allFeedbacks);
      } catch (err) {
        setError("Failed to load feedbacks. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  const filteredFeedbacks = feedbacks.filter((fb) => {
    if (filter === "all") return true;
    if (filter === "website") return fb.type === "Website Order";
    if (filter === "preorder") return fb.type === "Pre-Order";
    return true;
  });

  return (
    <div className="admin-feedback-container">
      <h1 className="admin-feedback-title">User Feedbacks</h1>

      <div className="admin-feedback-filters">
        <button
          onClick={() => setFilter("all")}
          className={filter === "all" ? "active" : ""}
        >
          All
        </button>
        <button
          onClick={() => setFilter("website")}
          className={filter === "website" ? "active" : ""}
        >
          Website Orders
        </button>
        <button
          onClick={() => setFilter("preorder")}
          className={filter === "preorder" ? "active" : ""}
        >
          Pre-Orders
        </button>
      </div>

      {loading && <p>Loading feedbacks...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <div className="feedback-list">
          {filteredFeedbacks.length === 0 ? (
            <p>No feedbacks to display.</p>
          ) : (
            filteredFeedbacks.map((fb) => {
              let itemName = "";
              if (fb.type === "Website Order") {
                itemName = fb.product?.name || "";
              } else if (fb.type === "Pre-Order") {
                if (fb.preOrder?.items && fb.preOrder.items.length > 0) {
                  const firstItem = fb.preOrder.items[0];
                  itemName = firstItem.product?.name || firstItem.name || "";
                } else if (
                  fb.preOrder?.customOrder &&
                  fb.preOrder.customOrder.description
                ) {
                  itemName = fb.preOrder.customOrder.description;
                } else {
                  itemName = fb.preOrder?.eventType || "";
                }
              }
              return (
                <div key={fb._id} className="feedback-card">
                  <div className="feedback-card-header">
                    <span
                      className={`feedback-type ${fb.type
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {fb.type}
                    </span>
                    <span className="feedback-rating">
                      {Array(fb.rating).fill("★").join("")}
                      {Array(5 - fb.rating)
                        .fill("☆")
                        .join("")}
                    </span>
                  </div>
                  {itemName && (
                    <div className="feedback-item-name">
                      <strong>Item:</strong> {itemName}
                    </div>
                  )}
                  <p className="feedback-comment">
                    {fb.comment || "No comment provided."}
                  </p>
                  <div className="feedback-card-footer">
                    <span className="feedback-user">
                      by <strong>{fb.user?.name || "Unknown User"}</strong> (
                      {fb.user?.email || "No email"})
                    </span>
                    <span className="feedback-date">
                      {new Date(fb.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default AdminFeedback;
