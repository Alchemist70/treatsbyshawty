// This file now only contains the dashboard summary. Product and order management logic has been moved to their respective pages.

import React, { useEffect, useState, useRef } from "react";
import "../css/Admin.css";
import axios from "axios";
import { API_URL } from "../config";
import { Link } from "react-router-dom";

export default function Admin() {
  const [user, setUser] = useState(undefined);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [tab, setTab] = useState("home"); // 'home', 'story', 'showcase', 'testimonials'

  // Our Story state
  const [story, setStory] = useState({
    title: "",
    subtitle: "",
    image: "",
    text: "",
    buttonText: "",
    buttonLink: "",
  });
  const [storyLoading, setStoryLoading] = useState(false);
  const [storySaving, setStorySaving] = useState(false);
  const [storySuccess, setStorySuccess] = useState("");
  const [storyError, setStoryError] = useState("");

  // Refs for file inputs
  const storyImageRef = useRef();

  // --- Product Showcase State ---
  const [showcaseItems, setShowcaseItems] = useState([]);
  const [showcaseLoading, setShowcaseLoading] = useState(false);
  const [showcaseError, setShowcaseError] = useState("");
  const [showcaseForm, setShowcaseForm] = useState({
    _id: null,
    title: "",
    subtitle: "",
    image: "",
    order: 0,
  });
  const [showcaseSaving, setShowcaseSaving] = useState(false);
  const [showcaseSuccess, setShowcaseSuccess] = useState("");
  const showcaseImageRef = useRef();
  const [showcaseImageSource, setShowcaseImageSource] = useState("url"); // 'url' or 'upload'

  // --- Testimonials State ---
  const [testimonials, setTestimonials] = useState([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(false);
  const [testimonialsError, setTestimonialsError] = useState("");
  const [testimonialForm, setTestimonialForm] = useState({
    _id: null,
    name: "",
    text: "",
    image: "",
    order: 0,
  });
  const [testimonialSaving, setTestimonialSaving] = useState(false);
  const [testimonialSuccess, setTestimonialSuccess] = useState("");
  const testimonialImageRef = useRef();
  const [testimonialImageSource, setTestimonialImageSource] = useState("url"); // 'url' or 'upload'

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [ordersRes, productsRes] = await Promise.all([
          axios.get("/api/orders", config),
          axios.get("/api/products", config),
        ]);
        setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
        setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
      } catch {
        setOrders([]);
        setProducts([]);
      }
    }
    fetchStats();
  }, []);

  // Fetch Our Story content
  useEffect(() => {
    if (tab !== "story") return;
    setStoryLoading(true);
    setStoryError("");
    axios
      .get("/api/home-content")
      .then((res) => {
        setStory({
          title: res.data.title || "",
          subtitle: res.data.subtitle || "",
          image: res.data.image || "",
          text: res.data.text || "",
          buttonText: res.data.buttonText || "",
          buttonLink: res.data.buttonLink || "",
        });
      })
      .catch(() => setStoryError("Failed to load content."))
      .finally(() => setStoryLoading(false));
  }, [tab]);

  // Fetch Product Showcase items
  useEffect(() => {
    if (tab !== "showcase") return;
    setShowcaseLoading(true);
    setShowcaseError("");
    axios
      .get("/api/product-showcase")
      .then((res) => setShowcaseItems(res.data))
      .catch(() => setShowcaseError("Failed to load showcase items."))
      .finally(() => setShowcaseLoading(false));
  }, [tab]);

  // Fetch Testimonials
  useEffect(() => {
    if (tab !== "testimonials") return;
    setTestimonialsLoading(true);
    setTestimonialsError("");
    axios
      .get("/api/testimonials")
      .then((res) => setTestimonials(res.data))
      .catch(() => setTestimonialsError("Failed to load testimonials."))
      .finally(() => setTestimonialsLoading(false));
  }, [tab]);

  // Handle form field changes
  function handleStoryChange(e) {
    const { name, value } = e.target;
    setStory((prev) => ({ ...prev, [name]: value }));
  }

  // Handle image upload
  async function handleStoryImageUpload(file) {
    const formData = new FormData();
    formData.append("image", file);
    const token = localStorage.getItem("token");
    const res = await axios.post("/api/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data.url;
  }

  // Handle form submit
  async function handleStorySubmit(e) {
    e.preventDefault();
    setStorySaving(true);
    setStorySuccess("");
    setStoryError("");
    let imageUrl = story.image;
    try {
      // If a new image is selected, upload it
      const file = storyImageRef.current?.files?.[0];
      if (file) {
        imageUrl = await handleStoryImageUpload(file);
      }
      const token = localStorage.getItem("token");
      await axios.put(
        "/api/home-content",
        {
          ...story,
          image: imageUrl,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStory((prev) => ({ ...prev, image: imageUrl }));
      setStorySuccess("Saved successfully!");
    } catch (err) {
      setStoryError(
        err?.response?.data?.message || "Failed to save. Please try again."
      );
    } finally {
      setStorySaving(false);
    }
  }

  // --- Product Showcase Handlers ---
  function handleShowcaseFormChange(e) {
    const { name, value } = e.target;
    setShowcaseForm((prev) => ({ ...prev, [name]: value }));
  }
  async function handleShowcaseImageUpload(file) {
    const formData = new FormData();
    formData.append("image", file);
    const token = localStorage.getItem("token");
    const res = await axios.post("/api/product-showcase/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data.url;
  }
  async function handleShowcaseSubmit(e) {
    e.preventDefault();
    setShowcaseSaving(true);
    setShowcaseSuccess("");
    setShowcaseError("");
    let imageUrl = showcaseForm.image;
    try {
      if (showcaseImageSource === "upload") {
        const file = showcaseImageRef.current?.files?.[0];
        if (file) {
          imageUrl = await handleShowcaseImageUpload(file);
        }
      }
      // If 'url', use showcaseForm.image directly
      const token = localStorage.getItem("token");
      if (showcaseForm._id) {
        // Edit
        await axios.put(
          `/api/product-showcase/${showcaseForm._id}`,
          { ...showcaseForm, image: imageUrl },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setShowcaseSuccess("Updated!");
      } else {
        // Add
        const { _id, ...newShowcaseItem } = showcaseForm;
        await axios.post(
          "/api/product-showcase",
          { ...newShowcaseItem, image: imageUrl },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setShowcaseSuccess("Added!");
      }
      // Refresh list
      const res = await axios.get("/api/product-showcase");
      setShowcaseItems(res.data);
      setShowcaseForm({
        _id: null,
        title: "",
        subtitle: "",
        image: "",
        order: 0,
      });
      if (showcaseImageRef.current) showcaseImageRef.current.value = "";
    } catch (err) {
      setShowcaseError(err?.response?.data?.message || "Failed to save.");
    } finally {
      setShowcaseSaving(false);
    }
  }
  function handleShowcaseEdit(item) {
    setShowcaseForm({ ...item });
    if (showcaseImageRef.current) showcaseImageRef.current.value = "";
    // Set image source radio based on image value
    if (
      item.image &&
      (item.image.startsWith("http://") || item.image.startsWith("https://"))
    ) {
      setShowcaseImageSource("url");
    } else {
      setShowcaseImageSource("upload");
    }
  }
  async function handleShowcaseDelete(id) {
    if (!window.confirm("Delete this showcase item?")) return;
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`/api/product-showcase/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowcaseItems((prev) => prev.filter((i) => i._id !== id));
    } catch {}
  }

  // --- Testimonials Handlers ---
  function handleTestimonialFormChange(e) {
    const { name, value } = e.target;
    setTestimonialForm((prev) => ({ ...prev, [name]: value }));
  }
  async function handleTestimonialImageUpload(file) {
    const formData = new FormData();
    formData.append("image", file);
    const token = localStorage.getItem("token");
    const res = await axios.post("/api/testimonials/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data.url;
  }
  async function handleTestimonialSubmit(e) {
    e.preventDefault();
    setTestimonialSaving(true);
    setTestimonialSuccess("");
    setTestimonialsError("");
    let imageUrl = testimonialForm.image;
    try {
      if (testimonialImageSource === "upload") {
        const file = testimonialImageRef.current?.files?.[0];
        if (file) {
          imageUrl = await handleTestimonialImageUpload(file);
        }
      }
      // If 'url', use testimonialForm.image directly
      const token = localStorage.getItem("token");
      if (testimonialForm._id) {
        // Edit
        await axios.put(
          `/api/testimonials/${testimonialForm._id}`,
          { ...testimonialForm, image: imageUrl },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTestimonialSuccess("Updated!");
      } else {
        // Add
        const { _id, ...newTestimonial } = testimonialForm;
        await axios.post(
          "/api/testimonials",
          { ...newTestimonial, image: imageUrl },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTestimonialSuccess("Added!");
      }
      // Refresh list
      const res = await axios.get("/api/testimonials");
      setTestimonials(res.data);
      setTestimonialForm({
        _id: null,
        name: "",
        text: "",
        image: "",
        order: 0,
      });
      if (testimonialImageRef.current) {
        testimonialImageRef.current.value = "";
      }
    } catch (err) {
      setTestimonialsError(
        err?.response?.data?.message || "Failed to save. Please try again."
      );
    } finally {
      setTestimonialSaving(false);
    }
  }
  function handleTestimonialEdit(item) {
    setTestimonialForm({ ...item });
    if (testimonialImageRef.current) testimonialImageRef.current.value = "";
    // Set image source radio based on image value
    if (
      item.image &&
      (item.image.startsWith("http://") || item.image.startsWith("https://"))
    ) {
      setTestimonialImageSource("url");
    } else {
      setTestimonialImageSource("upload");
    }
  }
  async function handleTestimonialDelete(id) {
    if (!window.confirm("Delete this testimonial?")) return;
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`/api/testimonials/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTestimonials((prev) => prev.filter((i) => i._id !== id));
    } catch {}
  }

  if (!user) {
    return <div>Loading...</div>; // Or a login prompt
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome, {user ? user.name : "Admin"}. Manage your store here.</p>
      </header>

      <main className="admin-main">
        {/* Quick Stats */}
        <div className="admin-stats">
          <div className="stat-card">
            <h2>{Array.isArray(orders) ? orders.length : 0}</h2>
            <p>Total Orders</p>
          </div>
          <div className="stat-card">
            <h2>{Array.isArray(products) ? products.length : 0}</h2>
            <p>Total Products</p>
          </div>
        </div>

        {/* Navigation Grid */}
        <div className="admin-grid">
          <Link to="/admin/products" className="admin-card">
            <h3>Product Management</h3>
            <p>Add, edit, and manage store products.</p>
          </Link>
          <Link to="/admin/orders" className="admin-card">
            <h3>Order Fulfillment</h3>
            <p>View and process customer orders.</p>
          </Link>
          <Link to="/admin/pre-orders" className="admin-card">
            <h3>Pre-Order Management</h3>
            <p>Manage all pre-order requests.</p>
          </Link>
          <Link to="/admin/feedback" className="admin-card">
            <h3>Feedback & Reviews</h3>
            <p>View and manage customer feedback.</p>
          </Link>
          <Link to="/admin/users" className="admin-card">
            <h3>User Management</h3>
            <p>View and manage user accounts.</p>
          </Link>
        </div>

        {/* Content Management Tabs */}
        <div className="admin-content-tabs">
          <button
            className={tab === "home" ? "admin-tab-active" : "admin-tab"}
            onClick={() => setTab("home")}
          >
            Dashboard
          </button>
          <button
            className={tab === "story" ? "admin-tab-active" : "admin-tab"}
            onClick={() => setTab("story")}
          >
            Our Story
          </button>
          <button
            className={tab === "showcase" ? "admin-tab-active" : "admin-tab"}
            onClick={() => setTab("showcase")}
          >
            Product Showcase
          </button>
          <button
            className={
              tab === "testimonials" ? "admin-tab-active" : "admin-tab"
            }
            onClick={() => setTab("testimonials")}
          >
            Testimonials
          </button>
        </div>

        {/* Tab Content */}
        {tab === "home" && (
          <div
            style={{ color: "#d81b60", fontWeight: 600, fontSize: "1.1rem" }}
          >
            Select a tab to manage homepage content.
          </div>
        )}
        {tab === "story" && (
          <div className="admin-section-card">
            <h2>Edit Our Story</h2>
            {storyLoading ? (
              <div className="loading-state">Loading...</div>
            ) : (
              <form onSubmit={handleStorySubmit}>
                <div className="form-field">
                  <label>Title</label>
                  <input
                    type="text"
                    className="admin-input"
                    name="title"
                    value={story.title}
                    onChange={handleStoryChange}
                  />
                </div>
                <div className="form-field">
                  <label>Subtitle</label>
                  <input
                    type="text"
                    className="admin-input"
                    name="subtitle"
                    value={story.subtitle}
                    onChange={handleStoryChange}
                  />
                </div>
                <div className="form-field">
                  <label>Image</label>
                  <input
                    type="file"
                    ref={storyImageRef}
                    className="admin-input"
                    accept="image/*"
                  />
                  {story.image && (
                    <div className="image-preview-container">
                      <img
                        src={story.image}
                        alt="Story Preview"
                        className="image-preview"
                      />
                    </div>
                  )}
                </div>
                <div className="form-field">
                  <label>Text</label>
                  <textarea
                    className="admin-input"
                    rows={4}
                    name="text"
                    value={story.text}
                    onChange={handleStoryChange}
                  />
                </div>
                <div className="button-row">
                  <div className="form-field">
                    <label>Button Text</label>
                    <input
                      type="text"
                      className="admin-input"
                      name="buttonText"
                      value={story.buttonText}
                      onChange={handleStoryChange}
                    />
                  </div>
                  <div className="form-field">
                    <label>Button Link</label>
                    <input
                      type="text"
                      className="admin-input"
                      name="buttonLink"
                      value={story.buttonLink}
                      onChange={handleStoryChange}
                    />
                  </div>
                </div>
                <button
                  className="save-button"
                  type="submit"
                  disabled={storySaving}
                >
                  {storySaving ? "Saving..." : "Save"}
                </button>
                {storySuccess && (
                  <div style={{ color: "#059669", marginTop: 12 }}>
                    {storySuccess}
                  </div>
                )}
                {storyError && (
                  <div style={{ color: "#be185d", marginTop: 12 }}>
                    {storyError}
                  </div>
                )}
              </form>
            )}
          </div>
        )}
        {tab === "showcase" && (
          <div
            className="admin-section-card"
            style={{
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 2px 12px #fbb6ce22",
              padding: "2.5rem 2rem",
              margin: "0 auto",
              maxWidth: 700,
            }}
          >
            <h2
              style={{
                color: "#be185d",
                fontWeight: 700,
                fontSize: 22,
                marginBottom: 18,
              }}
            >
              Manage Product Showcase
            </h2>
            {showcaseLoading ? (
              <div style={{ color: "#be185d", fontWeight: 600 }}>
                Loading...
              </div>
            ) : (
              <>
                <form
                  onSubmit={handleShowcaseSubmit}
                  style={{ marginBottom: 24 }}
                >
                  <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                    <input
                      type="text"
                      name="title"
                      placeholder="Title"
                      className="admin-input"
                      style={{ flex: 2 }}
                      value={showcaseForm.title}
                      onChange={handleShowcaseFormChange}
                    />
                    <input
                      type="text"
                      name="subtitle"
                      placeholder="Subtitle"
                      className="admin-input"
                      style={{ flex: 2 }}
                      value={showcaseForm.subtitle}
                      onChange={handleShowcaseFormChange}
                    />
                    <input
                      type="number"
                      name="order"
                      placeholder="Order"
                      className="admin-input"
                      style={{ width: 80 }}
                      value={showcaseForm.order}
                      onChange={handleShowcaseFormChange}
                    />
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                      }}
                    >
                      <div>
                        <label>
                          <input
                            type="radio"
                            name="showcaseImageSource"
                            value="url"
                            checked={showcaseImageSource === "url"}
                            onChange={() => setShowcaseImageSource("url")}
                          />
                          Image URL
                        </label>
                        <label style={{ marginLeft: 8 }}>
                          <input
                            type="radio"
                            name="showcaseImageSource"
                            value="upload"
                            checked={showcaseImageSource === "upload"}
                            onChange={() => setShowcaseImageSource("upload")}
                          />
                          Upload Image
                        </label>
                      </div>
                      {showcaseImageSource === "url" ? (
                        <input
                          type="text"
                          name="image"
                          placeholder="Image URL"
                          className="admin-input"
                          value={showcaseForm.image}
                          onChange={handleShowcaseFormChange}
                          style={{ width: 180 }}
                        />
                      ) : (
                        <input
                          type="file"
                          ref={showcaseImageRef}
                          className="admin-input"
                          style={{ width: 180 }}
                          accept="image/*"
                        />
                      )}
                    </div>
                  </div>
                  <button
                    className="signup-btn"
                    type="submit"
                    disabled={showcaseSaving}
                  >
                    {showcaseForm._id ? "Update" : "Add"}
                  </button>
                  {showcaseSuccess && (
                    <span style={{ color: "#059669", marginLeft: 16 }}>
                      {showcaseSuccess}
                    </span>
                  )}
                  {showcaseError && (
                    <span style={{ color: "#be185d", marginLeft: 16 }}>
                      {showcaseError}
                    </span>
                  )}
                </form>
                <div>
                  {showcaseItems.length === 0 ? (
                    <div style={{ color: "#be185d", fontWeight: 600 }}>
                      No showcase items.
                    </div>
                  ) : (
                    <table
                      style={{ width: "100%", borderCollapse: "collapse" }}
                    >
                      <thead>
                        <tr style={{ background: "#fce7f3" }}>
                          <th style={{ padding: 8 }}>Image</th>
                          <th style={{ padding: 8 }}>Title</th>
                          <th style={{ padding: 8 }}>Subtitle</th>
                          <th style={{ padding: 8 }}>Order</th>
                          <th style={{ padding: 8 }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {showcaseItems.map((item) => (
                          <tr
                            key={item._id}
                            style={{ borderBottom: "1px solid #f3f4f6" }}
                          >
                            <td style={{ padding: 8 }}>
                              {item.image && (
                                <img
                                  src={
                                    item.image.startsWith("http")
                                      ? item.image
                                      : `${API_URL}/${item.image}`
                                  }
                                  alt={item.title}
                                  className="showcase-admin-image"
                                />
                              )}
                            </td>
                            <td style={{ padding: 8 }}>{item.title}</td>
                            <td style={{ padding: 8 }}>{item.subtitle}</td>
                            <td style={{ padding: 8 }}>{item.order}</td>
                            <td style={{ padding: 8 }}>
                              <button
                                className="admin-tab"
                                style={{ marginRight: 8 }}
                                onClick={() => handleShowcaseEdit(item)}
                              >
                                Edit
                              </button>
                              <button
                                className="admin-tab"
                                style={{ color: "#be185d" }}
                                onClick={() => handleShowcaseDelete(item._id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            )}
          </div>
        )}
        {tab === "testimonials" && (
          <div
            className="admin-section-card"
            style={{
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 2px 12px #fbb6ce22",
              padding: "2.5rem 2rem",
              margin: "0 auto",
              maxWidth: 700,
            }}
          >
            <h2
              style={{
                color: "#be185d",
                fontWeight: 700,
                fontSize: 22,
                marginBottom: 18,
              }}
            >
              Manage Testimonials
            </h2>
            {testimonialsLoading ? (
              <div style={{ color: "#be185d", fontWeight: 600 }}>
                Loading...
              </div>
            ) : (
              <>
                <form
                  onSubmit={handleTestimonialSubmit}
                  style={{ marginBottom: 24 }}
                >
                  <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                    <input
                      type="text"
                      name="name"
                      placeholder="Name"
                      className="admin-input"
                      style={{ flex: 1 }}
                      value={testimonialForm.name}
                      onChange={handleTestimonialFormChange}
                    />
                    <input
                      type="number"
                      name="order"
                      placeholder="Order"
                      className="admin-input"
                      style={{ width: 80 }}
                      value={testimonialForm.order}
                      onChange={handleTestimonialFormChange}
                    />
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                      }}
                    >
                      <div>
                        <label>
                          <input
                            type="radio"
                            name="testimonialImageSource"
                            value="url"
                            checked={testimonialImageSource === "url"}
                            onChange={() => setTestimonialImageSource("url")}
                          />
                          Image URL
                        </label>
                        <label style={{ marginLeft: 8 }}>
                          <input
                            type="radio"
                            name="testimonialImageSource"
                            value="upload"
                            checked={testimonialImageSource === "upload"}
                            onChange={() => setTestimonialImageSource("upload")}
                          />
                          Upload Image
                        </label>
                      </div>
                      {testimonialImageSource === "url" ? (
                        <input
                          type="text"
                          name="image"
                          placeholder="Image URL"
                          className="admin-input"
                          value={testimonialForm.image}
                          onChange={handleTestimonialFormChange}
                          style={{ width: 180 }}
                        />
                      ) : (
                        <input
                          type="file"
                          ref={testimonialImageRef}
                          className="admin-input"
                          style={{ width: 180 }}
                          accept="image/*"
                        />
                      )}
                    </div>
                  </div>
                  <textarea
                    name="text"
                    placeholder="Testimonial text"
                    className="admin-input"
                    style={{ width: "100%", marginBottom: 8 }}
                    rows={2}
                    value={testimonialForm.text}
                    onChange={handleTestimonialFormChange}
                  />
                  <button
                    className="signup-btn"
                    type="submit"
                    disabled={testimonialSaving}
                  >
                    {testimonialForm._id ? "Update" : "Add"}
                  </button>
                  {testimonialSuccess && (
                    <span style={{ color: "green", marginLeft: 16 }}>
                      {testimonialSuccess}
                    </span>
                  )}
                  {testimonialsError && (
                    <span style={{ color: "#be185d", marginLeft: 16 }}>
                      {testimonialsError}
                    </span>
                  )}
                </form>
                <div>
                  {testimonials.length === 0 ? (
                    <div style={{ color: "#be185d", fontWeight: 600 }}>
                      No testimonials.
                    </div>
                  ) : (
                    <table
                      style={{ width: "100%", borderCollapse: "collapse" }}
                    >
                      <thead>
                        <tr style={{ background: "#fce7f3" }}>
                          <th style={{ padding: 8 }}>Image</th>
                          <th style={{ padding: 8 }}>Name</th>
                          <th style={{ padding: 8 }}>Text</th>
                          <th style={{ padding: 8 }}>Order</th>
                          <th style={{ padding: 8 }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {testimonials.map((t) => (
                          <tr key={t._id}>
                            <td>
                              {t.image && (
                                <img
                                  src={
                                    t.image.startsWith("http")
                                      ? t.image
                                      : `${API_URL}/${t.image}`
                                  }
                                  alt={t.name}
                                  className="testimonial-admin-image"
                                />
                              )}
                            </td>
                            <td>{t.name}</td>
                            <td>{t.text}</td>
                            <td>{t.order}</td>
                            <td>
                              <button
                                className="admin-tab"
                                style={{ marginRight: 8 }}
                                onClick={() => handleTestimonialEdit(t)}
                              >
                                Edit
                              </button>
                              <button
                                className="admin-tab"
                                style={{ color: "#be185d" }}
                                onClick={() => handleTestimonialDelete(t._id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
