import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import "../css/AdminUserManagement.css";
import { API_URL } from "../config";

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  // Fallback to localStorage if redux is not set up
  const reduxToken = useSelector((state) => state.auth?.token);
  const reduxUser = useSelector((state) => state.auth?.user);
  const token = reduxToken || localStorage.getItem("token");
  let user = reduxUser;
  if (!user) {
    try {
      user = JSON.parse(localStorage.getItem("user"));
    } catch {
      user = null;
    }
  }

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
        setError("");
      } catch (err) {
        setError(
          "Failed to fetch users. " +
            (err?.response?.data?.message || err.message)
        );
      } finally {
        setLoading(false);
      }
    };
    if (token && user && user.isAdmin) {
      fetchUsers();
    } else if (!user || !user.isAdmin) {
      setLoading(false);
      setError("You do not have permission to view this page.");
    } else {
      setLoading(false);
      setError("Not authenticated.");
    }
  }, [token, user]);

  const handleDelete = async (userId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      try {
        await axios.delete(`${API_URL}/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(users.filter((user) => user._id !== userId));
      } catch (err) {
        setError(
          "Failed to delete user. " +
            (err?.response?.data?.message || err.message)
        );
      }
    }
  };

  return (
    <div className="admin-user-management">
      <h2>User Management</h2>
      {/* Debug output for troubleshooting */}
      <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>
        <div>
          <b>Debug:</b>
        </div>
        <div>user: {JSON.stringify(user)}</div>
        <div>token: {token ? token.substring(0, 12) + "..." : "none"}</div>
        <div>error: {error}</div>
      </div>
      {loading ? (
        <p>Loading users...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : user && user.isAdmin ? (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Admin</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center" }}>
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.isAdmin ? "Yes" : "No"}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      ) : null}
    </div>
  );
};

export default AdminUserManagement;
