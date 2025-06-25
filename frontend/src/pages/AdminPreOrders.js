import React, { useEffect, useState } from "react";
import "../css/Admin.css";
import "../css/AdminPreOrders.css";
import axiosInstance from "../config";

const STATUS_OPTIONS = [
  "pending",
  "deposit-paid",
  "confirmed",
  "completed",
  "cancelled",
  "refunded",
];

function ConfirmModal({ message, onConfirm, onCancel, loading }) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <p>{message}</p>
        <div className="modal-actions">
          <button
            onClick={onCancel}
            className="signup-btn"
            style={{ background: "#eee", color: "#be185d" }}
          >
            Cancel
          </button>
          <button onClick={onConfirm} className="signup-btn" disabled={loading}>
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPreOrders() {
  const [preorders, setPreorders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState("");
  const [deletingPreOrder, setDeletingPreOrder] = useState(null);

  const fetchPreOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await axiosInstance.get("/api/preorders/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPreorders(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreOrders();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    setUpdating(id);
    try {
      const token = localStorage.getItem("token");
      await axiosInstance.put(
        `/api/preorders/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPreOrders();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setUpdating("");
    }
  };

  const handleMarkDeposit = async (id) => {
    setUpdating(id);
    try {
      const token = localStorage.getItem("token");
      await axiosInstance.put(
        `/api/preorders/${id}/status`,
        { depositPaid: true, status: "deposit-paid" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPreOrders();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setUpdating("");
    }
  };

  const handleDelete = async () => {
    if (!deletingPreOrder) return;
    setUpdating(deletingPreOrder._id);
    try {
      const token = localStorage.getItem("token");
      await axiosInstance.delete(`/api/preorders/${deletingPreOrder._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeletingPreOrder(null);
      fetchPreOrders();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setUpdating("");
    }
  };

  return (
    <div className="admin-preorders-container">
      <div className="max-w-7xl mx-auto">
        <div className="admin-preorders-header">
          <h2>Pre-Orders</h2>
          <button
            className="signup-btn"
            onClick={fetchPreOrders}
            style={{ marginLeft: "auto" }}
          >
            Refresh
          </button>
        </div>
        {loading ? (
          <div>Loading pre-orders...</div>
        ) : error ? (
          <div className="signup-error">{error}</div>
        ) : (
          <div className="admin-preorders-table-container">
            <table className="admin-preorders-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Order Type</th>
                  <th>Order</th>
                  <th>Total</th>
                  <th>Deposit</th>
                  <th>Deposit Receipt</th>
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
                      <span>{po.eventLocation}</span>
                    </td>
                    <td>{new Date(po.eventDate).toLocaleDateString()}</td>
                    <td>
                      {po.user?.name}
                      <br />
                      <span>{po.user?.email}</span>
                    </td>
                    <td>{po.orderType}</td>
                    <td>
                      {po.items && po.items.length > 0 ? (
                        <ul>
                          {po.items.map((item) => (
                            <li key={item.product?._id || item._id}>
                              {item.product?.name} × {item.quantity}
                            </li>
                          ))}
                        </ul>
                      ) : po.customOrder?.description ? (
                        <div>
                          <b>Custom:</b> {po.customOrder.description}
                          {po.customOrder.image && (
                            <div>
                              <img
                                src={`${API_URL}/${po.customOrder.image}`}
                                alt="Custom"
                                style={{
                                  width: 60,
                                  borderRadius: 8,
                                  marginTop: 4,
                                }}
                                className="preorder-image"
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                    <td>₦{po.total?.toFixed(2)}</td>
                    <td>
                      {po.deposit ? `₦${po.deposit.toFixed(2)}` : "N/A"}
                      <br />
                      {po.depositPaid ? (
                        <span className="status-paid">Paid</span>
                      ) : (
                        <button
                          className="signup-btn"
                          onClick={() => handleMarkDeposit(po._id)}
                          disabled={updating === po._id}
                        >
                          Mark as Paid
                        </button>
                      )}
                    </td>
                    <td>
                      {po.depositReceipt ? (
                        <a
                          href={`${API_URL}/${po.depositReceipt}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="receipt-link"
                        >
                          View Receipt
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td style={{ textTransform: "capitalize" }}>{po.status}</td>
                    <td>
                      <select
                        value={po.status}
                        onChange={(e) =>
                          handleStatusUpdate(po._id, e.target.value)
                        }
                        disabled={updating === po._id}
                        className="status-select"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                      <button
                        className="delete-btn"
                        style={{ marginTop: "0.5rem" }}
                        onClick={() => setDeletingPreOrder(po)}
                        disabled={updating === po._id}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {deletingPreOrder && (
          <ConfirmModal
            message={`Are you sure you want to delete the pre-order for ${
              deletingPreOrder.user?.name || deletingPreOrder.contact
            } on ${new Date(deletingPreOrder.eventDate).toLocaleDateString()}?`}
            onConfirm={handleDelete}
            onCancel={() => setDeletingPreOrder(null)}
            loading={updating === deletingPreOrder._id}
          />
        )}
      </div>
    </div>
  );
}
