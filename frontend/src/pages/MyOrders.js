import React, { useState, useEffect } from "react";
import "../css/MyOrders.css";
import axios from "axios";

function ReviewModal({ product, orderId, onClose, onReviewSubmit }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `/api/products/${product._id}/reviews`,
        { rating, comment, orderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status >= 200 && response.status < 300) {
        onReviewSubmit();
        onClose();
      } else {
        setError(response.data?.message || "Failed to submit review.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Review: {product.name}</h2>
        <form onSubmit={handleSubmit} className="admin-form">
          <label>Rating</label>
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
          <label>Comment</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          />
          {error && <div className="signup-error">{error}</div>}
          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="signup-btn"
              style={{ background: "#eee", color: "#be185d" }}
            >
              Cancel
            </button>
            <button type="submit" className="signup-btn" disabled={loading}>
              {loading ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PreOrderFeedbackModal({ preOrderId, onClose, onFeedbackSubmit }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `/api/preorders/${preOrderId}/feedback`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status >= 200 && response.status < 300) {
        onFeedbackSubmit();
        onClose();
      } else {
        setError(response.data?.message || "Failed to submit feedback.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit feedback.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Feedback for your Pre-order</h2>
        <form onSubmit={handleSubmit} className="admin-form">
          <label>Overall Rating</label>
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
          <label>Comment</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="How was your experience with this pre-order?"
          />
          {error && <div className="signup-error">{error}</div>}
          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="signup-btn"
              style={{ background: "#eee", color: "#be185d" }}
            >
              Cancel
            </button>
            <button type="submit" className="signup-btn" disabled={loading}>
              {loading ? "Submitting..." : "Submit Feedback"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [preorders, setPreorders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewingProduct, setReviewingProduct] = useState(null);
  const [feedbackPreOrder, setFeedbackPreOrder] = useState(null);
  const [userReviews, setUserReviews] = useState([]);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const [res1, res2] = await Promise.all([
        axios.get("/api/orders/my", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("/api/preorders/my", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setOrders(res1.data);
      setPreorders(res2.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReviews = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/reviews/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserReviews(res.data);
    } catch {}
  };

  useEffect(() => {
    fetchOrders();
    fetchUserReviews();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this order? This cannot be undone."
      )
    )
      return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/api/orders/${orderId}/cancel`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchOrders(); // Refresh the list
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="myorders-container">
      <div className="myorders-main-content">
        <div className="myorders-header">
          <h2 className="myorders-title">My Orders</h2>
        </div>
        {loading ? (
          <div>Loading your orders...</div>
        ) : error ? (
          <div className="signup-error">{error}</div>
        ) : orders.length === 0 && preorders.length === 0 ? (
          <div className="myorders-empty">You have no orders yet.</div>
        ) : (
          <>
            {orders.length > 0 && (
              <div className="orders-list-container">
                <div className="order-header">
                  <div>Order #</div>
                  <div>Date</div>
                  <div>Delivery</div>
                  <div>Total</div>
                  <div>Status</div>
                  <div className="action-col">Action</div>
                </div>
                {orders.map((order) => (
                  <div key={order._id} className="order-card">
                    <div className="order-body">
                      <div>{order.orderNumber || "-"}</div>
                      <div>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                      <div>₦{order.deliveryFee?.toFixed(2) || "0.00"}</div>
                      <div>₦{order.total.toFixed(2)}</div>
                      <div>
                        <span
                          className={`status status-${order.status.toLowerCase()}`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <div className="action-col">
                        {order.status === "pending" && (
                          <button
                            className="myorders-cancel-btn"
                            onClick={() => handleCancelOrder(order._id)}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>

                    {order.items && order.items.length > 0 && (
                      <div className="order-items-container">
                        <h4>Items in this order:</h4>
                        <ul>
                          {order.items.map((item) => {
                            const review = userReviews.find(
                              (r) =>
                                r.product === (item.product?._id || item._id) &&
                                r.order === order._id
                            );
                            return (
                              <li key={item.product?._id || item._id}>
                                <div className="item-details">
                                  {(item.image || item.product?.image) && (
                                    <img
                                      src={item.image || item.product.image}
                                      alt={item.name || item.product?.name}
                                      className="item-image"
                                    />
                                  )}
                                  <span>
                                    {item.name || item.product?.name} x{" "}
                                    {item.quantity}
                                  </span>
                                </div>
                                {review && (
                                  <div className="item-review-display">
                                    <span className="star-rating">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <span
                                          key={star}
                                          className={
                                            star <= review.rating
                                              ? "star-filled"
                                              : "star-empty"
                                          }
                                        >
                                          ★
                                        </span>
                                      ))}
                                    </span>
                                    <span className="item-review-comment">
                                      "{review.comment}"
                                    </span>
                                  </div>
                                )}
                                {!["pending", "cancelled"].includes(
                                  order.status
                                ) && (
                                  <button
                                    className="review-btn"
                                    onClick={() =>
                                      setReviewingProduct({
                                        product: item.product
                                          ? item.product
                                          : item,
                                        orderId: order._id,
                                      })
                                    }
                                  >
                                    Leave a Review
                                  </button>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {preorders.length > 0 && (
              <>
                <h3
                  style={{
                    marginTop: 32,
                    color: "#be185d",
                    fontWeight: 700,
                    fontSize: "1.2rem",
                  }}
                >
                  Event Pre-Orders
                </h3>
                <table className="myorders-table">
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Date</th>
                      <th>Order</th>
                      <th>Total</th>
                      <th>Deposit</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preorders.map((po) => (
                      <tr key={po._id}>
                        <td>
                          <b>{po.eventType}</b>
                          <br />
                          <span style={{ fontSize: "0.9em", color: "#666" }}>
                            {po.eventLocation}
                          </span>
                        </td>
                        <td>{new Date(po.eventDate).toLocaleDateString()}</td>
                        <td>
                          {po.orderType === "Menu" &&
                          po.items &&
                          po.items.length > 0 ? (
                            <ul className="preorder-item-list">
                              {po.items.map((item) => (
                                <li
                                  key={item.product?._id || item._id}
                                  className="preorder-item"
                                >
                                  {item.product?.image && (
                                    <img
                                      src={item.product.image}
                                      alt={item.product.name}
                                      className="preorder-item-image"
                                    />
                                  )}
                                  <span>
                                    {item.product?.name || "N/A"} &times;{" "}
                                    {item.quantity}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : po.orderType === "Custom" && po.customOrder ? (
                            <div style={{ fontSize: "0.9em" }}>
                              <div>Custom: {po.customOrder.description}</div>
                              {po.customOrder.image && (
                                <img
                                  src={po.customOrder.image}
                                  alt="Custom Order"
                                  className="custom-order-image"
                                />
                              )}
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td>₦{po.total?.toFixed(2) || "0.00"}</td>
                        <td>₦{po.deposit?.toFixed(2) || "0.00"}</td>
                        <td style={{ textTransform: "capitalize" }}>
                          {po.status}
                        </td>
                        <td>
                          {po.status === "completed" && (
                            <button
                              className="review-btn"
                              onClick={() => setFeedbackPreOrder(po._id)}
                            >
                              Leave Feedback
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </>
        )}
      </div>

      {reviewingProduct && (
        <ReviewModal
          product={reviewingProduct.product}
          orderId={reviewingProduct.orderId}
          onClose={() => setReviewingProduct(null)}
          onReviewSubmit={fetchOrders}
        />
      )}

      {feedbackPreOrder && (
        <PreOrderFeedbackModal
          preOrderId={feedbackPreOrder}
          onClose={() => setFeedbackPreOrder(null)}
          onFeedbackSubmit={fetchOrders}
        />
      )}
    </div>
  );
}
