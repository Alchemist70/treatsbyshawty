import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/Login.css";
import axiosInstance from "../config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import Logo from "../assets/logo.png";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedEmail = localStorage.getItem("rememberedEmail");
    if (storedEmail) {
      setForm((f) => ({ ...f, email: storedEmail }));
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleRememberMe = () => {
    setRememberMe(!rememberMe);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axiosInstance.post("/api/auth/login", form);
      const data = res.data;

      // Save token and user info
      const token = data.token;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", form.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      // --- Cart Sync Logic ---
      const localCart = JSON.parse(localStorage.getItem("cartItems")) || [];
      const serverCartRes = await axiosInstance.get("/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const serverCart = serverCartRes.data;

      // Merge server and local cart. Server cart is the source of truth for structure.
      const finalCart = [...serverCart.filter((item) => item.product)];
      const serverProductIds = new Set(
        serverCart
          .filter((item) => item.product)
          .map((item) => item.product._id)
      );

      localCart.forEach((localItem) => {
        // Local cart item structure is { _id, name, ..., quantity }
        // We need to check against the product ID, which is just _id
        if (localItem._id && !serverProductIds.has(localItem._id)) {
          // Normalize the local item and add to cart
          finalCart.push({
            product: localItem,
            quantity: localItem.quantity,
          });
        }
      });

      // Sync the final merged cart back to the server if it has changed
      if (finalCart.length > serverCart.length) {
        await axiosInstance.put(
          "/api/cart",
          { cartItems: finalCart },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      localStorage.setItem("cartItems", JSON.stringify(finalCart));
      window.dispatchEvent(new Event("cart-updated"));
      // --- End Cart Sync Logic ---

      if (data.user && data.user.isAdmin) {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <img src={Logo} alt="TreatsByShawty" className="auth-logo" />
        <h2 className="auth-title">Welcome Back!</h2>
        <p className="auth-subtitle">Sign in to continue to your account.</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label htmlFor="email">Email</label>
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

          <div className="auth-options">
            <div className="remember-me">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={handleRememberMe}
              />
              <label htmlFor="remember">Remember me</label>
            </div>
            <Link
              to="/forgot-password"
              disabled
              className="forgot-password-link"
            >
              Forgot password?
            </Link>
          </div>

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="auth-switch-link">
          Don't have an account? <Link to="/signup">Create one now</Link>
        </div>
      </div>
    </div>
  );
}
