import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/Login.css"; // Reuse the login CSS for consistent styling
import axiosInstance from "../config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import Logo from "../assets/logo.png";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
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
      await axiosInstance.post("/api/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
      });

      // After successful registration, log the user in to get a token and sync the cart
      const loginRes = await axiosInstance.post("/api/auth/login", {
        email: form.email,
        password: form.password,
      });

      const { token, user } = loginRes.data;

      // --- Cart Sync Logic ---
      const localCart = JSON.parse(localStorage.getItem("cartItems")) || [];
      if (localCart.length > 0) {
        await axiosInstance.put(
          "/api/cart",
          { cartItems: localCart },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <img src={Logo} alt="TreatsByShawty" className="auth-logo" />
        <h2 className="auth-title">Create Your Account</h2>
        <p className="auth-subtitle">
          Get started with the best treats in town!
        </p>

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
              placeholder="e.g., Jane Doe"
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
              placeholder="you@example.com"
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
          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="auth-switch-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
