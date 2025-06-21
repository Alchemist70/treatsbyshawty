import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserCircle,
  faClipboardList,
  faSignOutAlt,
  faTimes,
  faTachometerAlt,
  faBoxOpen,
  faListAlt,
  faInfoCircle,
  faCalendarCheck,
} from "@fortawesome/free-solid-svg-icons";
import "../css/Sidebar.css";

export default function Sidebar({ user, isOpen, onClose, onLogout }) {
  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? "open" : ""}`}
        onClick={onClose}
      ></div>
      <div className={`sidebar-container ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">Welcome, {user.name}</h2>
          <button className="sidebar-close-btn" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <nav className="sidebar-nav">
          {user.isAdmin ? (
            <>
              <Link to="/admin" className="sidebar-link" onClick={onClose}>
                <FontAwesomeIcon
                  icon={faTachometerAlt}
                  className="sidebar-icon"
                />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/admin/products"
                className="sidebar-link"
                onClick={onClose}
              >
                <FontAwesomeIcon icon={faBoxOpen} className="sidebar-icon" />
                <span>Products</span>
              </Link>
              <Link
                to="/admin/orders"
                className="sidebar-link"
                onClick={onClose}
              >
                <FontAwesomeIcon icon={faListAlt} className="sidebar-icon" />
                <span>Orders</span>
              </Link>
              <Link
                to="/admin/preorders"
                className="sidebar-link"
                onClick={onClose}
              >
                <FontAwesomeIcon
                  icon={faCalendarCheck}
                  className="sidebar-icon"
                />
                <span>Pre-Orders</span>
              </Link>
              <Link
                to="/admin/feedback"
                className="sidebar-link"
                onClick={onClose}
              >
                <FontAwesomeIcon icon={faInfoCircle} className="sidebar-icon" />
                <span>Feedback</span>
              </Link>
            </>
          ) : (
            <>
              <Link to="/profile" className="sidebar-link" onClick={onClose}>
                <FontAwesomeIcon icon={faUserCircle} className="sidebar-icon" />
                <span>Profile</span>
              </Link>
              <Link to="/my-orders" className="sidebar-link" onClick={onClose}>
                <FontAwesomeIcon
                  icon={faClipboardList}
                  className="sidebar-icon"
                />
                <span>My Orders</span>
              </Link>
              <Link to="/about" className="sidebar-link" onClick={onClose}>
                <FontAwesomeIcon icon={faInfoCircle} className="sidebar-icon" />
                <span>About</span>
              </Link>
            </>
          )}
        </nav>
        <div className="sidebar-footer">
          <button className="sidebar-logout-btn" onClick={onLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} className="sidebar-icon" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}
