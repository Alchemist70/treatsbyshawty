import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useLocation, Navigate } from "react-router-dom";
import "../css/Menu.css";

const Menu = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const location = useLocation();
  const [justAdded, setJustAdded] = useState(null);
  const [redirectToLogin, setRedirectToLogin] = useState(false);
  const [selected, setSelected] = useState("All");
  const productRefs = useRef({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get("/api/products");
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [location]);

  // Set selected category from URL query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get("category");
    if (cat) {
      // Capitalize first letter for match
      const formatted =
        cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
      setSelected(formatted);
    } else {
      setSelected("All");
    }
  }, [location]);

  // Scroll to item if present in query after filtering
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const item = params.get("item");
    if (item && productRefs.current[item.toLowerCase()]) {
      setTimeout(() => {
        productRefs.current[item.toLowerCase()].scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 200);
    }
  }, [products, location]);

  const handleAddToCart = (product) => {
    if (!localStorage.getItem("token")) {
      setRedirectToLogin(true);
      return;
    }
    try {
      let cart = JSON.parse(localStorage.getItem("cartItems")) || [];
      const normalizedCart = cart.map((item) => {
        if (item.product && item.product._id) {
          return item;
        }
        const { quantity, ...productDetails } = item;
        return { product: productDetails, quantity: quantity || 1 };
      });

      const itemIndex = normalizedCart.findIndex(
        (item) => item.product._id === product._id
      );
      let newQuantity = 1;

      if (itemIndex > -1) {
        newQuantity = normalizedCart[itemIndex].quantity + 1;
        normalizedCart[itemIndex].quantity = newQuantity;
      } else {
        normalizedCart.push({ product: product, quantity: 1 });
      }

      localStorage.setItem("cartItems", JSON.stringify(normalizedCart));
      window.dispatchEvent(new Event("cart-updated"));

      const token = localStorage.getItem("token");
      if (token) {
        const itemToSync = normalizedCart.find(
          (item) => item.product._id === product._id
        );
        if (itemToSync) {
          axios
            .post(
              "/api/cart",
              { productId: product._id, quantity: itemToSync.quantity },
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            )
            .catch((err) =>
              console.error("Failed to sync cart with server", err)
            );
        }
      }

      setJustAdded(product._id);
      setTimeout(() => setJustAdded(null), 2000);
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    }
  };

  if (redirectToLogin) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  if (loading) return <div className="menu-loading">Loading products...</div>;
  if (error) return <div className="menu-error">{error}</div>;

  const categories = [
    "All",
    "Cupcakes",
    "Cookies",
    "Cakes",
    "Tarts",
    "Brownies",
  ];

  const filteredProducts =
    selected === "All"
      ? products
      : products.filter((p) => p.category === selected);

  return (
    <div className="menu-page-container">
      <h1 className="menu-page-title">Our Menu</h1>
      <div className="menu-filter-bar">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`menu-filter-btn${selected === cat ? " selected" : ""}`}
            onClick={() => setSelected(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="menu-products-grid">
        {filteredProducts.map((product) => (
          <div
            key={product._id}
            className="menu-product-card"
            ref={(el) => {
              if (el) productRefs.current[product.name.toLowerCase()] = el;
            }}
          >
            <img
              src={product.image}
              alt={product.name}
              className="menu-product-image"
            />
            <div className="menu-product-details">
              <h2 className="menu-product-title">{product.name}</h2>
              <p className="menu-product-desc">{product.description}</p>
              <div className="menu-product-rating">
                {product.rating > 0 && (
                  <span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={
                          star <= Math.round(product.rating)
                            ? "star-filled"
                            : "star-empty"
                        }
                        style={{
                          color:
                            star <= Math.round(product.rating)
                              ? "#facc15"
                              : "#d1d5db",
                          fontSize: "1.2em",
                        }}
                      >
                        ★
                      </span>
                    ))}
                    <span
                      style={{
                        marginLeft: 6,
                        fontSize: "0.95em",
                        color: "#be185d",
                      }}
                    >
                      ({product.numReviews})
                    </span>
                  </span>
                )}
              </div>
              {product.reviews && product.reviews.length > 0 && (
                <div className="menu-product-review">
                  <span style={{ fontWeight: 500, color: "#be185d" }}>
                    "{product.reviews[0].comment}"
                  </span>
                </div>
              )}
              <div className="menu-product-price">
                ₦{product.price.toFixed(2)}
              </div>
            </div>
            <button
              className={`menu-add-btn ${
                justAdded === product._id ? "added" : ""
              }`}
              onClick={() => handleAddToCart(product)}
            >
              {justAdded === product._id ? "Added!" : "Add to Cart"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Menu;
