import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/Login.css"; // Reuse shared auth styles
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import Logo from "../assets/logo.png";

export default function AdminSignup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    secretCode: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (form.password !== form.confirm) {
      setError("Passwords do not match. Please try again.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          isAdmin: true,
          secretCode: form.secretCode,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");
      setSuccess("Admin account created! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <img src={Logo} alt="TreatsByShawty" className="auth-logo" />
        <h2 className="auth-title">Admin Registration</h2>
        <p className="auth-subtitle">Create a new administrator account.</p>

        <div className="auth-warning">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <p>This form is for authorized personnel only.</p>
        </div>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="e.g., Admin User"
            />
          </div>
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="admin@example.com"
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="password-wrapper">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle-icon"
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </span>
            </div>
          </div>
          <div className="input-group">
            <label htmlFor="confirm">Confirm Password</label>
            <div className="password-wrapper">
              <input
                id="confirm"
                name="confirm"
                type={showConfirmPassword ? "text" : "password"}
                value={form.confirm}
                onChange={handleChange}
                required
                placeholder="••••••••"
              />
              <span
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="password-toggle-icon"
              >
                <FontAwesomeIcon
                  icon={showConfirmPassword ? faEyeSlash : faEye}
                />
              </span>
            </div>
          </div>
          <div className="input-group">
            <label htmlFor="secretCode">Admin Secret Code</label>
            <input
              id="secretCode"
              name="secretCode"
              type="password"
              value={form.secretCode}
              onChange={handleChange}
              required
              placeholder="Enter admin secret"
            />
          </div>
          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Create Admin Account"}
          </button>
        </form>

        <div className="auth-switch-link">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
