import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../css/Header.css";
import {
  faShoppingCart,
  faUser,
  faSignOutAlt,
  faBoxOpen,
  faUserCircle,
  faClipboardList,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Sidebar from "./Sidebar";

const navLinks = [
  { to: "/", label: "Home", icon: "fa-home" },
  { to: "/menu", label: "Menu", icon: "fa-utensils" },
  { to: "/preorder", label: "Pre-Order", icon: "fa-calendar-check" },
  { to: "/cart", label: "Cart", icon: "fa-shopping-cart" },
];

const menuCategories = [
  {
    label: "Cupcakes",
    options: ["Red Velvet", "Chocolate", "Vanilla", "Lemon", "Carrot"],
  },
  {
    label: "Cookies",
    options: ["Chocolate Chip", "Oatmeal", "Sugar", "Snickerdoodle", "Macaron"],
  },
  {
    label: "Cakes",
    options: ["Birthday", "Wedding", "Cheesecake", "Pound Cake", "Custom"],
  },
  {
    label: "Tarts",
    options: ["Fruit Tart", "Lemon Tart", "Chocolate Tart", "Mini Tart"],
  },
  {
    label: "Brownies",
    options: ["Classic", "Walnut", "Blondie", "Fudge"],
  },
];

const formatUserName = (name) => {
  if (!name) return "";
  const parts = name.trim().split(" ");
  // Only abbreviate if more than one name part and total length is long
  if (parts.length > 1 && name.length > 15) {
    return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
  }
  return name;
};

function HeaderDropdowns() {
  const navigate = useNavigate();

  const handleCategoryClick = (label) => {
    navigate(`/menu?category=${label.toLowerCase()}`);
  };

  const handleItemClick = (catLabel, item) => {
    navigate(
      `/menu?category=${catLabel.toLowerCase()}&item=${encodeURIComponent(
        item.toLowerCase()
      )}`
    );
  };

  return (
    <div className="header-dropdowns-bar">
      <div className="header-dropdowns-container">
        {menuCategories.map((cat) => (
          <div key={cat.label} className="header-dropdown">
            <div
              className="header-dropdown-label"
              onClick={() => handleCategoryClick(cat.label)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) =>
                e.key === "Enter" && handleCategoryClick(cat.label)
              }
            >
              {cat.label}
            </div>
            <div className="header-dropdown-content">
              <div className="category-items">
                {cat.options.map((option) => (
                  <div
                    key={option}
                    className="category-item"
                    onClick={() => handleItemClick(cat.label, option)}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleItemClick(cat.label, option)
                    }
                  >
                    {option}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null); // null = logged out, {name: ...} = logged in
  const [search, setSearch] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Sync user state with localStorage
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
  }, [location]);

  useEffect(() => {
    // Update cart count on mount and when location changes
    const updateCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem("cartItems")) || [];
        setCartCount(cart.reduce((sum, item) => sum + (item.quantity || 0), 0));
      } catch {
        setCartCount(0);
      }
    };
    updateCartCount();
    // Listen for our custom event
    window.addEventListener("cart-updated", updateCartCount);
    // Also listen for storage events for cross-tab updates
    window.addEventListener("storage", updateCartCount);

    return () => {
      window.removeEventListener("cart-updated", updateCartCount);
      window.removeEventListener("storage", updateCartCount);
    };
  }, []);

  const closeMenu = () => setMobileOpen(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
      setSearch(""); // Clear search input after navigating
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // We no longer clear cartItems on logout. It will be handled on login.
    window.dispatchEvent(new Event("cart-updated")); // Update UI immediately
    setUser(null);
    navigate("/login");
  };

  // Admin header mode
  const isAdminPage = location.pathname.startsWith("/admin");
  const isAdmin = user && user.isAdmin;

  const handleProfileClick = () => {
    if (user) {
      setSidebarOpen(true);
    }
  };

  return (
    <>
      <header className="site-header">
        <div className="header-content">
          <Link
            to={isAdminPage ? "/admin" : "/"}
            className="logo"
            onClick={closeMenu}
          >
            TreatsByShawty
            {isAdminPage && isAdmin && (
              <span className="admin-badge">Admin</span>
            )}
          </Link>
          <nav className="nav-links desktop-nav">
            {isAdminPage && isAdmin ? (
              <>
                <Link
                  to="/admin"
                  className={`nav-link${
                    location.pathname === "/admin" ? " active" : ""
                  }`}
                  onClick={closeMenu}
                >
                  <i
                    className="fas fa-tachometer-alt nav-link-icon"
                    aria-hidden="true"
                  ></i>
                  <span className="nav-link-label">Dashboard</span>
                </Link>
                <Link
                  to="/admin/products"
                  className={`nav-link${
                    location.pathname === "/admin/products" ? " active" : ""
                  }`}
                  onClick={closeMenu}
                >
                  <i
                    className="fas fa-box-open nav-link-icon"
                    aria-hidden="true"
                  ></i>
                  <span className="nav-link-label">Products</span>
                </Link>
                <Link
                  to="/admin/orders"
                  className={`nav-link${
                    location.pathname === "/admin/orders" ? " active" : ""
                  }`}
                  onClick={closeMenu}
                >
                  <i
                    className="fas fa-clipboard-list nav-link-icon"
                    aria-hidden="true"
                  ></i>
                  <span className="nav-link-label">Orders</span>
                </Link>
              </>
            ) : (
              navLinks.map((link) =>
                link.to === "/cart" ? (
                  <span
                    key={link.to}
                    className={`nav-link${
                      location.pathname === link.to ? " active" : ""
                    }`}
                    onClick={() => {
                      if (!user) navigate("/login");
                      else navigate("/cart");
                      closeMenu();
                    }}
                    style={{ position: "relative", cursor: "pointer" }}
                  >
                    <i
                      className={`fas ${link.icon} nav-link-icon`}
                      aria-hidden="true"
                    ></i>
                    <span className="nav-link-label">{link.label}</span>
                    {cartCount > 0 && (
                      <span
                        style={{
                          position: "absolute",
                          top: -8,
                          right: -10,
                          background: "#be185d",
                          color: "#fff",
                          borderRadius: "999px",
                          fontSize: "0.85em",
                          fontWeight: 700,
                          padding: "2px 8px",
                          minWidth: 22,
                          textAlign: "center",
                          boxShadow: "0 2px 8px #fbb6ce33",
                          zIndex: 2,
                        }}
                      >
                        {cartCount}
                      </span>
                    )}
                  </span>
                ) : (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`nav-link${
                      location.pathname === link.to ? " active" : ""
                    }`}
                    onClick={closeMenu}
                  >
                    <i
                      className={`fas ${link.icon} nav-link-icon`}
                      aria-hidden="true"
                    ></i>
                    <span className="nav-link-label">{link.label}</span>
                  </Link>
                )
              )
            )}
          </nav>
          {/* Only show search on non-admin pages */}
          {!isAdminPage && (
            <form className="header-search" onSubmit={handleSearch}>
              <input
                type="text"
                className="header-search-input"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search"
              />
              <button
                type="submit"
                className="header-search-btn"
                aria-label="Search"
              >
                <i className="fas fa-search"></i>
              </button>
            </form>
          )}
          <div className="header-actions">
            {user ? (
              <div className="user-menu">
                <button
                  onClick={handleProfileClick}
                  className="user-menu-button"
                >
                  <FontAwesomeIcon icon={faUserCircle} />
                  <span className="profile-username">
                    {isAdminPage ? user.name : formatUserName(user.name)}
                  </span>
                </button>
              </div>
            ) : (
              <div className="auth-actions">
                <Link to="/login" className="auth-link login">
                  Login
                </Link>
                <Link to="/signup" className="auth-link signup">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
          <button
            className={`hamburger${mobileOpen ? " open" : ""}`}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </button>
        </div>
        {/* Only show dropdowns on non-admin pages */}
        {!isAdminPage && <HeaderDropdowns />}
        <nav className={`mobile-nav${mobileOpen ? " show" : ""}`}>
          {isAdminPage && isAdmin ? (
            <>
              <Link
                to="/admin"
                className={`nav-link${
                  location.pathname === "/admin" ? " active" : ""
                }`}
                onClick={closeMenu}
              >
                <i
                  className="fas fa-tachometer-alt nav-link-icon"
                  aria-hidden="true"
                ></i>
                <span className="nav-link-label">Dashboard</span>
              </Link>
              <Link
                to="/admin/products"
                className={`nav-link${
                  location.pathname === "/admin/products" ? " active" : ""
                }`}
                onClick={closeMenu}
              >
                <i
                  className="fas fa-box-open nav-link-icon"
                  aria-hidden="true"
                ></i>
                <span className="nav-link-label">Products</span>
              </Link>
              <Link
                to="/admin/orders"
                className={`nav-link${
                  location.pathname === "/admin/orders" ? " active" : ""
                }`}
                onClick={closeMenu}
              >
                <i
                  className="fas fa-clipboard-list nav-link-icon"
                  aria-hidden="true"
                ></i>
                <span className="nav-link-label">Orders</span>
              </Link>
            </>
          ) : (
            navLinks.map((link) =>
              link.to === "/cart" ? (
                <span
                  key={link.to}
                  className={`nav-link${
                    location.pathname === link.to ? " active" : ""
                  }`}
                  onClick={() => {
                    if (!user) navigate("/login");
                    else navigate("/cart");
                    closeMenu();
                  }}
                  style={{ position: "relative", cursor: "pointer" }}
                >
                  <i
                    className={`fas ${link.icon} nav-link-icon`}
                    aria-hidden="true"
                  ></i>
                  <span className="nav-link-label">{link.label}</span>
                  {cartCount > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: -8,
                        right: -10,
                        background: "#be185d",
                        color: "#fff",
                        borderRadius: "999px",
                        fontSize: "0.85em",
                        fontWeight: 700,
                        padding: "2px 8px",
                        minWidth: 22,
                        textAlign: "center",
                        boxShadow: "0 2px 8px #fbb6ce33",
                        zIndex: 2,
                      }}
                    >
                      {cartCount}
                    </span>
                  )}
                </span>
              ) : (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`nav-link${
                    location.pathname === link.to ? " active" : ""
                  }`}
                  onClick={closeMenu}
                >
                  <i
                    className={`fas ${link.icon} nav-link-icon`}
                    aria-hidden="true"
                  ></i>
                  <span className="nav-link-label">{link.label}</span>
                </Link>
              )
            )
          )}
          {/* Only show search on non-admin pages */}
          {!isAdminPage && (
            <form
              className="header-search mobile-header-search"
              onSubmit={handleSearch}
            >
              <input
                type="text"
                className="header-search-input"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search"
              />
              <button
                type="submit"
                className="header-search-btn"
                aria-label="Search"
              >
                <i className="fas fa-search"></i>
              </button>
            </form>
          )}
          <div className="mobile-profile">
            {user ? (
              <div
                className="header-profile-area flex items-center"
                onClick={handleProfileClick}
                style={{ cursor: "pointer" }}
              >
                <FontAwesomeIcon
                  icon={faUserCircle}
                  className="profile-icon-large mr-2"
                />
                <span className="profile-username">
                  {isAdminPage ? user.name : formatUserName(user.name)}
                </span>
              </div>
            ) : (
              <div className="flex items-center">
                <Link to="/login" className="header-link">
                  Login
                </Link>
                <Link to="/signup" className="header-signup-btn">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </nav>
        {mobileOpen && (
          <div
            className="mobile-nav-backdrop"
            onClick={closeMenu}
            tabIndex={-1}
            aria-hidden="true"
          ></div>
        )}
        {/* Font Awesome CDN for icons */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
        />
      </header>
      {user && (
        <Sidebar
          user={user}
          isOpen={isSidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}
