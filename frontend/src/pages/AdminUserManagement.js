import React, { useState, useEffect } from "react";
import axiosInstance from "../config";
import { useNavigate, Link } from "react-router-dom";
import "../css/AdminUserManagement.css";

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  // Use only localStorage for user and token
  let token = null;
  let user = null;
  try {
    token = localStorage.getItem("token");
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    token = null;
    user = null;
  }
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setError("You must be logged in as an admin to view this page.");
      return;
    }
    if (!user.isAdmin) {
      setLoading(false);
      setError("You do not have permission to view this page.");
      return;
    }
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get("/api/users", {
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
    fetchUsers();
  }, [token, user]);

  const handleDelete = async (userId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      try {
        await axiosInstance.delete(`/api/users/${userId}`, {
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

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axiosInstance.put(
        `/api/users/${userId}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(
        users.map((user) =>
          user._id === userId ? { ...user, isAdmin: newRole } : user
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change role.");
    }
  };

  return (
    <div className="admin-user-management">
      <h2>User Management</h2>
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
      ) : !user ? (
        <div>
          <p className="error-message">
            You must be logged in as an admin to view this page.
          </p>
          <Link to="/login">Go to Login</Link>
        </div>
      ) : !user.isAdmin ? (
        <p className="error-message">
          You do not have permission to view this page.
        </p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
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
                    <button
                      onClick={() => handleRoleChange(user._id, !user.isAdmin)}
                      className="role-btn"
                    >
                      {user.isAdmin ? "Remove Admin" : "Make Admin"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminUserManagement;
