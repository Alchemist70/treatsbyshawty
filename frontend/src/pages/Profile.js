import React, { useEffect, useState } from "react";
import "../css/Login.css";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    address: "",
    phone: "",
    zip: "",
    city: "",
    state: "",
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setUser(u);
        const saved = localStorage.getItem(`profile_${u.id || u.email}`);
        if (saved) {
          setForm(JSON.parse(saved));
        }
      } catch {}
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (
      !form.address.trim() ||
      !form.phone.trim() ||
      !form.zip.trim() ||
      !form.city.trim() ||
      !form.state.trim()
    ) {
      setError("Please fill out all address fields.");
      setSuccess("");
      return;
    }
    if (user) {
      localStorage.setItem(
        `profile_${user.id || user.email}`,
        JSON.stringify(form)
      );
      setSuccess("Profile details saved successfully!");
      setError("");
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  if (!user) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2 className="auth-title">Profile</h2>
          <p className="auth-subtitle">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: "600px" }}>
        <h2 className="auth-title">My Profile</h2>
        <div className="profile-details">
          <p>
            <strong>Name:</strong> {user.name}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
        </div>

        <hr className="profile-divider" />

        <h3
          className="auth-subtitle"
          style={{ textAlign: "left", marginBottom: "1.5rem" }}
        >
          Shipping & Contact Information
        </h3>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        <form onSubmit={handleSave} className="auth-form">
          <div className="input-group">
            <label htmlFor="address">Delivery/Shipping Address</label>
            <textarea
              id="address"
              name="address"
              value={form.address}
              onChange={handleChange}
              rows={3}
              placeholder="123 Sweet Lane"
              required
            />
          </div>
          <div className="form-row">
            <div className="input-group">
              <label htmlFor="city">City</label>
              <input
                id="city"
                name="city"
                type="text"
                value={form.city}
                onChange={handleChange}
                placeholder="Dessert City"
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="state">State</label>
              <input
                id="state"
                name="state"
                type="text"
                value={form.state}
                onChange={handleChange}
                placeholder="CA"
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="input-group">
              <label htmlFor="zip">Zip Code</label>
              <input
                id="zip"
                name="zip"
                type="text"
                value={form.zip}
                onChange={handleChange}
                placeholder="90210"
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="(123) 456-7890"
                required
              />
            </div>
          </div>

          <button className="auth-btn" type="submit">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
