import React, { useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../config";
import "../css/Login.css"; // Reusing login styles for consistency
import Logo from "../assets/logo.png";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      setLoading(true);
      await axiosInstance.post("/api/auth/forgot-password", { email });
      setMessage("A password reset link has been sent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <img src={Logo} alt="TreatsByShawty" className="auth-logo" />
        <h2 className="auth-title">Forgot Password</h2>
        <p className="auth-subtitle">
          Enter your email to receive a reset link.
        </p>

        {message && <div className="auth-success">{message}</div>}
        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="auth-switch-link">
          Remember your password? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
