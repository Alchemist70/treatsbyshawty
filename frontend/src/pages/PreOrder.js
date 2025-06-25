import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/PreOrder.css";
import axios from "axios";

const EVENT_TYPES = [
  "Birthday",
  "Wedding",
  "Corporate",
  "Anniversary",
  "Baby Shower",
  "Other",
];

const PAYSTACK_PUBLIC_KEY = "pk_test_2582112c79618f9222da1eebdac2b5535be052d4";

export default function PreOrder() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [event, setEvent] = useState({
    type: "Birthday",
    date: "",
    location: "",
    contact: "",
    notes: "",
  });
  const [menuItems, setMenuItems] = useState([]); // [{product, quantity}]
  const [customOrder, setCustomOrder] = useState({
    description: "",
    image: null,
  });
  const [useCustom, setUseCustom] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState("");
  const [depositPaid, setDepositPaid] = useState(false);
  const [paystackRef, setPaystackRef] = useState("");
  const [deliveryFee, setDeliveryFee] = useState(0);

  // Fetch menu products on mount
  React.useEffect(() => {
    setLoadingProducts(true);
    axios
      .get("/api/products")
      .then((res) => setAllProducts(res.data))
      .catch((err) => setError("Failed to load menu items."))
      .finally(() => setLoadingProducts(false));
  }, []);

  // Helper: min event date (5 days from now)
  const minEventDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().split("T")[0];
  })();

  // Calculate total and deposit
  const subtotal = useCustom
    ? 0 // Custom orders get a quote later
    : menuItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );
  const total = subtotal + deliveryFee;
  const deposit = useCustom ? 0 : Math.ceil(total * 0.6 * 100) / 100;

  // Paystack config
  const paystackConfig = {
    reference: new Date().getTime().toString(),
    email: event.contact.includes("@")
      ? event.contact
      : `user${Date.now()}@treatsbyshawty.com`,
    amount: Math.round(deposit * 100), // in kobo
    publicKey: PAYSTACK_PUBLIC_KEY,
    currency: "NGN",
    metadata: {
      custom_fields: [
        {
          display_name: "Event Type",
          variable_name: "event_type",
          value: event.type,
        },
        {
          display_name: "Event Date",
          variable_name: "event_date",
          value: event.date,
        },
      ],
    },
  };

  // Handlers
  const handleEventChange = (e) => {
    setEvent({ ...event, [e.target.name]: e.target.value });
  };
  const handleMenuQty = (product, delta) => {
    setMenuItems((prev) => {
      const idx = prev.findIndex((i) => i.product._id === product._id);
      if (idx === -1 && delta > 0) return [...prev, { product, quantity: 1 }];
      if (idx !== -1) {
        const updated = [...prev];
        const newQty = updated[idx].quantity + delta;
        if (newQty <= 0) {
          updated.splice(idx, 1);
        } else {
          updated[idx].quantity = newQty;
        }
        return updated;
      }
      return prev;
    });
  };
  const handleCustomImage = (e) => {
    setCustomOrder({ ...customOrder, image: e.target.files[0] });
  };

  // Validation
  const canProceedStep1 = () => {
    if (!event.type || !event.date || !event.location || !event.contact)
      return false;
    if (new Date(event.date) < new Date(minEventDate)) return false;
    return true;
  };
  const canProceedStep2 = () => {
    if (useCustom) {
      return customOrder.description.length > 5;
    } else {
      return menuItems.length > 0;
    }
  };

  const handleProceedFromStep2 = async () => {
    if (useCustom) {
      // For custom orders, we reset the delivery fee as it will be part of the quote
      setDeliveryFee(0);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append("eventType", event.type);
        formData.append("eventDate", event.date);
        formData.append("eventLocation", event.location);
        formData.append("contact", event.contact);
        formData.append("notes", event.notes);
        formData.append("orderType", "Custom");
        formData.append("total", 0); // No total yet
        formData.append("deposit", 0); // No deposit yet
        formData.append(
          "customOrder",
          JSON.stringify({ description: customOrder.description })
        );
        if (customOrder.image) {
          formData.append("customImage", customOrder.image);
        }
        formData.append("items", JSON.stringify([]));

        await axios.post("/api/preorders", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        navigate("/custom-order-summary", {
          state: { event, customOrder },
        });
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      }
    } else {
      // For menu-based orders, calculate delivery fee based on location
      if (event.location.toLowerCase().includes("ibadan")) {
        setDeliveryFee(2000);
      } else {
        setDeliveryFee(4000);
      }
      setStep(3);
    }
  };

  // UI
  return (
    <div className="preorder-container">
      <h1 className="preorder-title">Event Pre-Order</h1>
      <div className="preorder-steps">
        <div className={`preorder-step ${step === 1 ? "active" : ""}`}>
          <span className="preorder-step-number">1</span> Event Details
        </div>
        <div className={`preorder-step ${step === 2 ? "active" : ""}`}>
          <span className="preorder-step-number">2</span> Order
        </div>
        <div className={`preorder-step ${step === 3 ? "active" : ""}`}>
          <span className="preorder-step-number">3</span> Summary & Deposit
        </div>
        <div className={`preorder-step ${step === 4 ? "active" : ""}`}>
          <span className="preorder-step-number">4</span> Done
        </div>
      </div>

      {step === 1 && (
        <div className="preorder-card">
          <h2 className="preorder-section-title">Event Details</h2>
          <div className="preorder-form-group">
            <label className="preorder-label">Event Type</label>
            <select
              name="type"
              value={event.type}
              onChange={handleEventChange}
              className="preorder-input"
            >
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="preorder-form-group">
            <label className="preorder-label">Event Date</label>
            <input
              type="date"
              name="date"
              value={event.date}
              min={minEventDate}
              onChange={handleEventChange}
              className="preorder-input"
              required
            />
          </div>
          <div className="preorder-form-group">
            <label className="preorder-label">Event Location / Address</label>
            <input
              type="text"
              name="location"
              value={event.location}
              onChange={handleEventChange}
              className="preorder-input"
              placeholder="e.g., Lagos Hall, Ikeja"
              required
            />
          </div>
          <div className="preorder-form-group">
            <label className="preorder-label">Contact (Email or Phone)</label>
            <input
              type="text"
              name="contact"
              value={event.contact}
              onChange={handleEventChange}
              className="preorder-input"
              placeholder="your@email.com or 080..."
              required
            />
          </div>
          <div className="preorder-form-group">
            <label className="preorder-label">Additional Notes</label>
            <textarea
              name="notes"
              value={event.notes}
              onChange={handleEventChange}
              className="preorder-textarea"
              placeholder="Any other details..."
            />
          </div>

          <div className="preorder-actions">
            <div></div>
            <button
              onClick={() => setStep(2)}
              disabled={!canProceedStep1()}
              className="preorder-btn preorder-btn-primary"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="preorder-card">
          <h2 className="preorder-section-title">Order Items</h2>
          <div className="preorder-order-choice">
            <button
              className={`preorder-choice-btn ${!useCustom ? "active" : ""}`}
              onClick={() => setUseCustom(false)}
            >
              Choose from Menu
            </button>
            <button
              className={`preorder-choice-btn ${useCustom ? "active" : ""}`}
              onClick={() => setUseCustom(true)}
            >
              Custom Order
            </button>
          </div>

          {useCustom ? (
            <div className="preorder-custom-form">
              <div className="preorder-form-group">
                <label className="preorder-label">
                  Describe your custom order
                </label>
                <textarea
                  value={customOrder.description}
                  onChange={(e) =>
                    setCustomOrder({
                      ...customOrder,
                      description: e.target.value,
                    })
                  }
                  className="preorder-textarea"
                  placeholder="Describe your custom cake, cookies, etc."
                />
              </div>
              <div className="preorder-form-group">
                <label className="preorder-label">
                  Upload reference image (optional)
                </label>
                <label className="preorder-file-input-label">
                  Choose File
                  <input
                    type="file"
                    onChange={handleCustomImage}
                    className="preorder-file-input"
                    accept="image/*"
                  />
                </label>
                {customOrder.image && (
                  <span className="preorder-file-name">
                    {customOrder.image.name}
                  </span>
                )}
                {customOrder.image && (
                  <img
                    src={URL.createObjectURL(customOrder.image)}
                    alt="preview"
                    className="preorder-custom-img-preview"
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="preorder-menu-list">
              {loadingProducts ? (
                <p>Loading menu...</p>
              ) : (
                allProducts.map((p) => {
                  const itemInMenu = menuItems.find(
                    (i) => i.product._id === p._id
                  );
                  return (
                    <div key={p._id} className="preorder-menu-item">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="preorder-menu-img"
                      />
                      <div className="preorder-menu-info">
                        <span className="preorder-menu-name">{p.name}</span>
                        <span className="preorder-menu-price">
                          ₦{p.price.toFixed(2)}
                        </span>
                      </div>
                      <div className="preorder-menu-qty">
                        <button onClick={() => handleMenuQty(p, -1)}>-</button>
                        <span>{itemInMenu?.quantity || 0}</span>
                        <button onClick={() => handleMenuQty(p, 1)}>+</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          <div className="preorder-actions">
            <button
              onClick={() => setStep(1)}
              className="preorder-btn preorder-btn-secondary"
            >
              Back
            </button>
            <button
              onClick={handleProceedFromStep2}
              disabled={!canProceedStep2()}
              className="preorder-btn preorder-btn-primary"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="preorder-card">
          <h2 className="preorder-section-title">Summary & Deposit</h2>
          <div className="preorder-summary">
            <h4>Event Details:</h4>
            <p>
              <strong>Type:</strong> {event.type}
            </p>
            <p>
              <strong>Date:</strong> {event.date}
            </p>
            <p>
              <strong>Location:</strong> {event.location}
            </p>
            <hr />
            <h4>Order:</h4>
            {useCustom ? (
              <p>Custom order (details submitted, quote pending)</p>
            ) : (
              <ul>
                {menuItems.map((i) => (
                  <li key={i.product._id}>
                    {i.product.name} x {i.quantity}
                  </li>
                ))}
              </ul>
            )}
            <hr />
            <p>
              <strong>Subtotal:</strong> ₦{subtotal.toFixed(2)}
            </p>
            <p>
              <strong>Delivery Fee:</strong> ₦{deliveryFee.toFixed(2)}
            </p>
            <p>
              <strong>Total:</strong> ₦{total.toFixed(2)}
            </p>
            <p>
              <strong>60% Deposit Due:</strong> ₦{deposit.toFixed(2)}
            </p>
          </div>

          {error && <p style={{ color: "red" }}>{error}</p>}

          <div className="preorder-actions">
            <button
              onClick={() => setStep(2)}
              className="preorder-btn preorder-btn-secondary"
            >
              Back
            </button>
            <button
              onClick={() =>
                navigate("/preorder-payment-options", {
                  state: {
                    event,
                    menuItems,
                    customOrder,
                    useCustom,
                    subtotal,
                    deliveryFee,
                    total,
                    deposit,
                  },
                })
              }
              className="preorder-btn preorder-btn-primary"
              disabled={depositPaid || useCustom}
            >
              {useCustom ? "Quote Pending" : "Proceed to Payment"}
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="preorder-card preorder-thankyou">
          <h2>Thank You!</h2>
          <p>
            Your pre-order has been submitted.
            <br />
            We will be in touch shortly to confirm all details.
          </p>
        </div>
      )}
    </div>
  );
}

function ItemRow({ product, quantity, onQtyChange }) {
  return (
    <div className="preorder-item-row">
      <img src={product.image} alt={product.name} />
      <span className="item-name">{product.name}</span>
      <span className="item-price">₦{product.price.toFixed(2)}</span>
      <div className="item-qty-controls">
        <button onClick={() => onQtyChange(product, -1)}>-</button>
        <span>{quantity}</span>
        <button onClick={() => onQtyChange(product, 1)}>+</button>
      </div>
    </div>
  );
}
