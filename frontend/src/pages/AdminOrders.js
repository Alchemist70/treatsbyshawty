import React, { useEffect, useState } from "react";
import "../css/Admin.css";
import "../css/AdminOrders.css";
import axiosInstance from "../config";
import { Link } from "react-router-dom";

function StatusModal({ order, onSave, onClose, loading }) {
  // Only allow valid next statuses
  let ORDER_STATUSES = ["pending", "paid", "shipped", "completed", "cancelled"];
  if (order.status === "paid") {
    ORDER_STATUSES = ["paid", "shipped", "completed", "cancelled"];
  } else if (order.status === "shipped") {
    ORDER_STATUSES = ["shipped", "completed", "cancelled"];
  } else if (order.status === "completed" || order.status === "cancelled") {
    ORDER_STATUSES = [order.status];
  }
  const [status, setStatus] = useState(order.status);
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Update Order Status</h2>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="admin-form"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
        <div className="modal-actions">
          <button
            onClick={onClose}
            className="signup-btn"
            style={{ background: "#eee", color: "#be185d" }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(status)}
            className="signup-btn"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [errorOrders, setErrorOrders] = useState("");
  const [showStatusModal, setShowStatusModal] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Fetch orders
  const fetchOrders = async () => {
    setLoadingOrders(true);
    setErrorOrders("");
    try {
      const token = localStorage.getItem("token");
      const res = await axiosInstance.get("/api/orders/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (err) {
      setErrorOrders(err.response?.data?.message || err.message);
    } finally {
      setLoadingOrders(false);
    }
  };
  useEffect(() => {
    fetchOrders();
  }, []);

  // Order status update
  const handleUpdateStatus = async (orderId, status) => {
    setUpdatingStatus(true);
    try {
      const token = localStorage.getItem("token");
      await axiosInstance.put(
        `/api/orders/${orderId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowStatusModal(null);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Delete order
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      const token = localStorage.getItem("token");
      await axiosInstance.delete(`/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(orders.filter((o) => o._id !== orderId));
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="admin-orders-container">
      <div className="max-w-7xl mx-auto">
        <div className="admin-orders-header">
          <h2>Orders</h2>
          <button
            className="signup-btn"
            onClick={fetchOrders}
            style={{ marginLeft: "auto" }}
          >
            Refresh
          </button>
        </div>
        {loadingOrders ? (
          <div>Loading orders...</div>
        ) : errorOrders ? (
          <div className="signup-error">{errorOrders}</div>
        ) : (
          <div className="admin-orders-table-container">
            <table className="admin-orders-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Order #</th>
                  <th>Address</th>
                  <th>Receipt</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order.user?.name || "-"}</td>
                    <td>{order.user?.email || "-"}</td>
                    <td>
                      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                        {order.items.map((item, idx) => (
                          <li key={idx}>
                            {item.product?.name || "-"} x {item.quantity}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td>₦{order.total.toFixed(2)}</td>
                    <td>
                      <span className={`status-badge status-${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleString()}</td>
                    <td>{order.orderNumber || "-"}</td>
                    <td>
                      {order.address && <div>{order.address}</div>}
                      {order.city && order.state && (
                        <div>
                          {order.city}, {order.state}
                        </div>
                      )}
                      {order.zip && <div>ZIP: {order.zip}</div>}
                      {order.phone && <div>Phone: {order.phone}</div>}
                    </td>
                    <td>
                      <div className="order-receipt">
                        {order.paymentReceipt || order.receipt ? (
                          <a
                            href={`/uploads/${
                              order.paymentReceipt || order.receipt
                            }`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="receipt-link"
                          >
                            View Receipt
                          </a>
                        ) : (
                          "N/A"
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="edit-btn"
                          onClick={() => setShowStatusModal(order)}
                        >
                          Update Status
                        </button>
                        {Date.now() - new Date(order.createdAt).getTime() >
                          2 * 60 * 1000 && (
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteOrder(order._id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {showStatusModal && (
          <StatusModal
            order={showStatusModal}
            onSave={(status) => handleUpdateStatus(showStatusModal._id, status)}
            onClose={() => setShowStatusModal(null)}
            loading={updatingStatus}
          />
        )}
      </div>
    </div>
  );
}
