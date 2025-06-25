import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axiosInstance from "../config";
import "../css/Search.css"; // Using the new Search CSS

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data } = await axiosInstance.get("/api/products");
        setProducts(data);
        setError("");
      } catch (err) {
        setError("Could not fetch products. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (query && products.length > 0) {
      const lowercasedQuery = query.toLowerCase();
      const results = products.filter(
        (product) =>
          product.name.toLowerCase().includes(lowercasedQuery) ||
          (product.description &&
            product.description.toLowerCase().includes(lowercasedQuery)) ||
          (product.category &&
            product.category.toLowerCase().includes(lowercasedQuery))
      );
      setFilteredProducts(results);
    } else {
      setFilteredProducts([]);
    }
  }, [query, products]);

  const addToCartHandler = (product) => {
    // This is a placeholder. You would implement your cart logic here.
    console.log("Added to cart:", product);
    alert(`${product.name} added to cart!`);
  };

  const renderContent = () => {
    if (loading) {
      return <p className="search-loading">Loading products...</p>;
    }
    if (error) {
      return <p className="search-error">{error}</p>;
    }
    if (filteredProducts.length > 0) {
      return (
        <div className="search-results-grid">
          {filteredProducts.map((product) => (
            <div key={product._id} className="search-product-card">
              <Link to={`/product/${product._id}`}>
                <img
                  src={product.image}
                  alt={product.name}
                  className="search-product-image"
                />
              </Link>
              <Link
                to={`/product/${product._id}`}
                style={{ textDecoration: "none" }}
              >
                <h2 className="search-product-title">{product.name}</h2>
              </Link>
              <p className="search-product-description">
                {product.category || "Sweet"}
              </p>
              <div className="search-product-footer">
                <span className="search-product-price">
                  ₦{product.price.toFixed(2)}
                </span>
                <button
                  onClick={() => addToCartHandler(product)}
                  className="search-add-to-cart-btn"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      );
    }
    return (
      <p className="search-no-results">
        No products found matching your search term "{query}".
      </p>
    );
  };

  return (
    <div className="search-page-container">
      <h1 className="search-page-title">
        {query ? `Search Results for "${query}"` : "Search"}
      </h1>
      <div className="search-results-container">{renderContent()}</div>
    </div>
  );
}
