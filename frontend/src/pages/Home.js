import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/Home.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import { API_URL } from "../config";

const menuCategories = [
  {
    label: "Cupcakes",
    options: ["Red Velvet", "Chocolate", "Vanilla", "Lemon"],
  },
  {
    label: "Cookies",
    options: ["Chocolate Chip", "Oatmeal", "Sugar", "Custom"],
  },
  { label: "Cakes", options: ["Vanilla", "Carrot", "Chocolate", "Custom"] },
  { label: "Tarts", options: ["Lemon", "Fruit", "Chocolate"] },
  { label: "Brownies", options: ["Classic", "Walnut", "Blondie"] },
];

export default function Home() {
  const [user, setUser] = useState(null);

  // Dynamic content states
  const [story, setStory] = useState(null);
  const [storyLoading, setStoryLoading] = useState(true);
  const [storyError, setStoryError] = useState("");

  const [showcase, setShowcase] = useState([]);
  const [showcaseLoading, setShowcaseLoading] = useState(true);
  const [showcaseError, setShowcaseError] = useState("");

  const [testimonials, setTestimonials] = useState([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);
  const [testimonialsError, setTestimonialsError] = useState("");

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch {}
    }
  }, []);

  // Fetch Our Story
  useEffect(() => {
    setStoryLoading(true);
    setStoryError("");
    axios
      .get("/api/home-content")
      .then((res) => setStory(res.data))
      .catch(() => setStoryError("Failed to load story."))
      .finally(() => setStoryLoading(false));
  }, []);

  // Fetch Product Showcase
  useEffect(() => {
    setShowcaseLoading(true);
    setShowcaseError("");
    axios
      .get("/api/product-showcase")
      .then((res) => setShowcase(res.data))
      .catch(() => setShowcaseError("Failed to load showcase."))
      .finally(() => setShowcaseLoading(false));
  }, []);

  // Fetch Testimonials
  useEffect(() => {
    setTestimonialsLoading(true);
    setTestimonialsError("");
    axios
      .get("/api/testimonials")
      .then((res) => setTestimonials(res.data))
      .catch(() => setTestimonialsError("Failed to load testimonials."))
      .finally(() => setTestimonialsLoading(false));
  }, []);

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section
        className="bakery-hero-section"
        style={{
          backgroundImage:
            story && story.image
              ? `url(${story.image})`
              : "url(https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          minHeight: 450,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          paddingBottom: 0,
          marginBottom: 0,
        }}
      >
        <div
          className="bakery-hero-overlay"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(40, 0, 30, 0.45)",
            zIndex: 1,
          }}
        />
        {user && (
          <div
            className="bakery-hero-welcome"
            style={{
              position: "relative",
              zIndex: 2,
              marginBottom: 24,
              alignSelf: "center",
              background:
                "linear-gradient(90deg, #fbb6cecc 0%, #fef9c3cc 100%)",
              color: "#be185d",
              fontWeight: 700,
              fontSize: "1.35rem",
              borderRadius: "1.5rem",
              padding: "1rem 2.5rem",
              boxShadow: "0 4px 24px #f472b633",
              display: "inline-block",
              textAlign: "center",
              maxWidth: 420,
              marginTop: 3,
            }}
          >
            Welcome, {user.name}!
          </div>
        )}
        <div
          className="bakery-hero-content"
          style={{
            position: "relative",
            zIndex: 2,
            color: "#fff",
            textAlign: "center",
            maxWidth: 700,
          }}
        >
          <h1
            className="bakery-hero-title"
            style={{
              fontSize: "3.2rem",
              fontWeight: 800,
              marginBottom: 12,
              fontFamily: "cursive",
            }}
          >
            {story?.title || "TreatsByShawty"}
          </h1>
          <h2
            className="bakery-hero-headline"
            style={{
              fontSize: "2.1rem",
              fontWeight: 600,
              marginBottom: 18,
              fontFamily: "Dancing Script, cursive",
            }}
          >
            {story?.subtitle || "Cakes Heaven"}
          </h2>
          <p
            className="bakery-hero-desc"
            style={{
              fontSize: "1.18rem",
              marginBottom: 28,
              color: "#fff7f7",
              textShadow: "0 2px 8px #00000044",
            }}
          >
            {story?.text || (
              <>
                Delicious, handcrafted bakery and catering treats for every
                occasion.
                <br />
                Made with love, delivered with care.
              </>
            )}
          </p>
          {story?.buttonText && story?.buttonLink ? (
            <a href={story.buttonLink} className="btn-order">
              {story.buttonText}
            </a>
          ) : (
            <a href="/menu" className="btn-order">
              <FontAwesomeIcon
                icon={faShoppingCart}
                style={{ marginRight: "0.75rem" }}
              />
              <span>Shop Now</span>
            </a>
          )}
        </div>
      </section>
      {/* Our Story Section */}
      <section
        className="bakery-story-section"
        style={{
          background: "#fff",
          padding: "3rem 0 2.5rem 0",
          textAlign: "center",
        }}
      >
        <h2
          className="bakery-story-title"
          style={{
            fontFamily: "Dancing Script, cursive",
            color: "#be185d",
            fontSize: "2.2rem",
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          Our Story
        </h2>
        <div
          className="bakery-story-divider"
          style={{
            width: 80,
            height: 4,
            background: "linear-gradient(90deg, #be185d 0%, #fbbf24 100%)",
            borderRadius: 2,
            margin: "0 auto 2.2rem auto",
          }}
        />
        {storyLoading ? (
          <div className="loading-state">Loading Our Story...</div>
        ) : storyError ? (
          <div className="error-state">{storyError}</div>
        ) : story ? (
          <div
            className="bakery-story-content"
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
              gap: 32,
              maxWidth: 900,
              margin: "0 auto",
            }}
          >
            {story.image && (
              <img
                src={story.image}
                alt="Our Story"
                className="bakery-story-img"
                style={{
                  width: 220,
                  height: 220,
                  objectFit: "cover",
                  borderRadius: 18,
                  boxShadow: "0 2px 16px #fbb6ce33",
                  marginBottom: 16,
                }}
              />
            )}
            <div
              className="bakery-story-text"
              style={{
                flex: 1,
                minWidth: 260,
                maxWidth: 420,
                textAlign: "left",
                background: "#fff0f6",
                borderRadius: 14,
                padding: "2rem 1.5rem",
                boxShadow: "0 2px 12px #fbb6ce22",
              }}
            >
              <h3
                style={{
                  color: "#be185d",
                  fontWeight: 700,
                  fontSize: "1.25rem",
                  marginBottom: 10,
                }}
              >
                {story.title || "Few Words About Us"}
              </h3>
              <p
                style={{
                  color: "#be185d",
                  fontWeight: 600,
                  fontSize: "1.08rem",
                  marginBottom: 8,
                }}
              >
                {story.subtitle ||
                  "TreatsByShawty is simply the best in custom cakes, cupcakes, and sweet treats for every event."}
              </p>
              <p
                style={{
                  color: "#6b7280",
                  fontSize: "1.05rem",
                  marginBottom: 18,
                }}
              >
                {story.text ||
                  "We've been serving up smiles and delicious memories for years. Our passion for baking and attention to detail means every treat is made with love and care. Whether it's a birthday, wedding, or just because, we're here to make your day sweeter!"}
              </p>
              <a
                href={story.buttonLink || "/about"}
                className="btn-order"
                style={{
                  background: "#be185d",
                  color: "#fff",
                  fontWeight: 700,
                  borderRadius: 9999,
                  fontSize: "1rem",
                  padding: "0.7rem 2.2rem",
                }}
              >
                {story.buttonText || "Read More"}
              </a>
            </div>
          </div>
        ) : null}
      </section>
      <div className="section-divider" />
      {/* Product Showcase */}
      <section className="products-grid">
        {showcaseLoading ? (
          <div className="loading-state">Loading Product Showcase...</div>
        ) : showcaseError ? (
          <div className="error-state">{showcaseError}</div>
        ) : showcase.length === 0 ? (
          <div className="error-state">No showcase items available.</div>
        ) : (
          showcase.map((item, index) => (
            <div key={item._id || index} className="product-card">
              {testimonials[index] && testimonials[index].image ? (
                <img
                  src={
                    testimonials[index].image.startsWith("http")
                      ? testimonials[index].image
                      : `${API_URL}/${testimonials[index].image}`
                  }
                  alt={item.title}
                  className="product-image"
                />
              ) : (
                item.image && (
                  <img
                    src={
                      item.image.startsWith("http")
                        ? item.image
                        : `${API_URL}/${item.image}`
                    }
                    alt={item.title}
                    className="product-image"
                  />
                )
              )}
              <h2 className="product-title">{item.title}</h2>
              <p className="product-description">
                {item.subtitle || item.description}
              </p>
            </div>
          ))
        )}
      </section>
      <div className="section-divider" />
      {/* Testimonials Section */}
      <section className="home-testimonials-section">
        <div className="home-testimonials-header">
          <div className="home-testimonials-slider-track">
            <div className="home-testimonials-slider-thumb"></div>
          </div>
          <h2 className="home-testimonials-title">What Our Customers Say</h2>
        </div>
        {testimonialsLoading ? (
          <div className="loading-state">Loading testimonials...</div>
        ) : testimonialsError ? (
          <div className="error-state">{testimonialsError}</div>
        ) : (
          <div className="home-testimonials-grid">
            {showcase.map((item, index) => (
              <div key={item._id || index} className="home-testimonial-card">
                <div className="home-testimonial-quote-icon">”</div>
                <img
                  src={
                    item.image &&
                    (item.image.startsWith("http")
                      ? item.image
                      : `${API_URL}/${item.image}`)
                  }
                  alt={item.title}
                  className="home-testimonial-avatar"
                />
                <p className="home-testimonial-text">
                  "{item.subtitle || item.description || item.title}"
                </p>
                <p className="home-testimonial-author">- {item.title}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
