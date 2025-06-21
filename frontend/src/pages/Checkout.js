import React, { useState, useEffect, useCallback } from "react";
import "../css/Checkout.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Debounce helper function
function debounce(func, delay) {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
}

export default function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
    zip: "",
    city: "",
    state: "",
    notes: "",
  });
  const [useProfileAddress, setUseProfileAddress] = useState(true);
  const [profile, setProfile] = useState(null);
  const [profileAddress, setProfileAddress] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Delivery Fee State
  const [deliveryFee, setDeliveryFee] = useState(null);
  const [isCalculatingFee, setIsCalculatingFee] = useState(false);

  useEffect(() => {
    try {
      const localData = JSON.parse(localStorage.getItem("cartItems")) || [];
      // Normalize cart items to ensure consistent structure { product: {}, quantity: X }
      const normalizedCart = localData
        .map((item) => {
          if (item.product && item.product._id) {
            // Already in correct format
            return item;
          }
          // Is a flat product, needs normalization
          const { quantity, ...productDetails } = item;
          return { product: productDetails, quantity: quantity || 1 };
        })
        .filter(
          (item) =>
            item.product &&
            item.product._id &&
            item.product.name &&
            typeof item.product.price === "number"
        ); // Filter out any malformed items

      setCartItems(normalizedCart);
    } catch (e) {
      console.error("Could not parse cart items from localStorage", e);
      setCartItems([]);
    }
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        try {
          const localData = JSON.parse(localStorage.getItem("cartItems")) || [];
          // Normalize cart items to ensure consistent structure { product: {}, quantity: X }
          const normalizedCart = localData
            .map((item) => {
              if (item.product && item.product._id) {
                // Already in correct format
                return item;
              }
              // Is a flat product, needs normalization
              const { quantity, ...productDetails } = item;
              return { product: productDetails, quantity: quantity || 1 };
            })
            .filter(
              (item) =>
                item.product &&
                item.product._id &&
                item.product.name &&
                typeof item.product.price === "number"
            ); // Filter out any malformed items

          setCartItems(normalizedCart);
        } catch (e) {
          console.error("Could not parse cart items from localStorage", e);
          setCartItems([]);
        }
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + (item.product.price || 0) * item.quantity,
    0
  );

  const calculatedDeliveryFee = subtotal > 0 && subtotal < 25000 ? 1000 : 0;
  const total =
    subtotal + (deliveryFee === null ? calculatedDeliveryFee : deliveryFee);

  const calculateFee = useCallback(
    debounce(async (city, currentSubtotal) => {
      if (!city || currentSubtotal === 0) {
        setDeliveryFee(null);
        return;
      }
      setIsCalculatingFee(true);
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.post(
          "/api/delivery/calculate",
          { city, subtotal: currentSubtotal },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDeliveryFee(data.deliveryFee);
      } catch (err) {
        console.error("Failed to calculate delivery fee", err);
        setDeliveryFee(null); // Or set a default/error state
      } finally {
        setIsCalculatingFee(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setProfile(u);
        setForm((f) => ({ ...f, name: u.name || "", email: u.email || "" }));
        const saved = localStorage.getItem(`profile_${u.id || u.email}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          setProfileAddress(parsed);
          setForm((f) => ({ ...f, ...parsed }));
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (useProfileAddress && profileAddress) {
      setForm((f) => ({ ...f, ...profileAddress }));
    } else if (!useProfileAddress) {
      setForm((f) => ({
        ...f,
        address: "",
        phone: "",
        zip: "",
        city: "",
        state: "",
      }));
    }
  }, [useProfileAddress, profileAddress]);

  useEffect(() => {
    if (form.city && subtotal > 0) {
      calculateFee(form.city, subtotal);
    } else {
      setDeliveryFee(null);
    }
  }, [form.city, subtotal, calculateFee]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!form.city) {
      setError("City is required to calculate delivery.");
      return;
    }
    if (deliveryFee === null) {
      setError("Please wait for delivery fee calculation.");
      return;
    }
    if (!useProfileAddress) {
      if (!form.address || !form.phone || !form.zip || !form.state) {
        setError("Please fill in all address fields.");
        return;
      }
    } else if (
      useProfileAddress &&
      (!profileAddress || !profileAddress.address)
    ) {
      setError(
        "No profile address found. Please add your address in your profile."
      );
      return;
    }
    setError("");
    navigate("/payment-options", {
      state: {
        cartItems,
        form,
        useProfileAddress,
        profileAddress,
        subtotal,
        deliveryFee,
        total,
      },
    });
  };

  if (submitted) {
    return (
      <div className="checkout-container text-center">
        <h1 className="text-4xl font-extrabold text-pink-700 mb-8">
          Thank You!
        </h1>
        <p className="text-lg text-gray-700 mb-4">
          Your order has been placed. We'll contact you soon!
        </p>
        <a
          href="/menu"
          className="inline-block mt-6 bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all text-lg"
        >
          Back to Menu
        </a>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h1 className="checkout-title">Checkout</h1>
      <form onSubmit={handleSubmit}>
        <div className="checkout-content">
          <div className="checkout-form-container">
            <h2 className="checkout-section-title">Shipping Information</h2>

            <div className="address-radio-group">
              <label className="address-radio-label">
                <input
                  type="radio"
                  name="addressType"
                  value="profile"
                  checked={useProfileAddress}
                  onChange={() => setUseProfileAddress(true)}
                />
                Use Profile Address
              </label>
              <label className="address-radio-label">
                <input
                  type="radio"
                  name="addressType"
                  value="different"
                  checked={!useProfileAddress}
                  onChange={() => setUseProfileAddress(false)}
                />
                Use a Different Address
              </label>
            </div>

            {useProfileAddress && profileAddress && (
              <div className="profile-address-box">
                <p>
                  <strong>Address:</strong> {profileAddress.address}
                </p>
                <p>
                  <strong>City:</strong> {profileAddress.city}
                </p>
                <p>
                  <strong>State:</strong> {profileAddress.state}
                </p>
                <p>
                  <strong>Zip:</strong> {profileAddress.zip}
                </p>
                <p>
                  <strong>Phone:</strong> {profileAddress.phone}
                </p>
              </div>
            )}

            <div className="checkout-form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="name">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className="form-input"
                  required
                  disabled={!!profile}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="form-input"
                  required
                  disabled={!!profile}
                />
              </div>

              {!useProfileAddress && (
                <>
                  <div className="form-group full-width">
                    <label className="form-label" htmlFor="address">
                      Address
                    </label>
                    <input
                      id="address"
                      type="text"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Address"
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="phone">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      type="text"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="Phone Number"
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="zip">
                      ZIP Code
                    </label>
                    <input
                      id="zip"
                      type="text"
                      name="zip"
                      value={form.zip}
                      onChange={handleChange}
                      placeholder="ZIP Code"
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="city">
                      City
                    </label>
                    <input
                      id="city"
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="City"
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="state">
                      State
                    </label>
                    <input
                      id="state"
                      type="text"
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      placeholder="State"
                      className="form-input"
                      required
                    />
                  </div>
                </>
              )}

              {useProfileAddress && !profileAddress && (
                <div className="error-message full-width">
                  Please add an address to your profile to use this option.
                </div>
              )}

              <div className="form-group full-width">
                <label className="form-label" htmlFor="notes">
                  Order Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Order Notes (optional)"
                  className="form-textarea form-notes"
                  rows="4"
                />
              </div>
              {error && <p className="error-message">{error}</p>}
              <button type="submit" className="checkout-button">
                Proceed to Payment
              </button>
            </div>
          </div>
          <div className="checkout-summary-container">
            <h2 className="checkout-section-title">Order Summary</h2>
            {cartItems.map((item) => (
              <div key={item.product._id} className="summary-item">
                <span className="summary-item-name">
                  {item.product.name} x {item.quantity}
                </span>
                <span className="summary-item-price">
                  ₦{(item.product.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
            <div className="summary-divider" />
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₦{subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery Fee</span>
              {isCalculatingFee ? (
                <span className="text-gray-500">Calculating...</span>
              ) : (
                <span>
                  {deliveryFee !== null
                    ? `₦${deliveryFee.toFixed(2)}`
                    : "Enter city"}
                </span>
              )}
            </div>
            <div className="summary-divider" />
            <div className="summary-total">
              <span>Total</span>
              <span>₦{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
