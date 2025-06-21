import React from "react";
import "../css/Footer.css";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-col footer-brand-col">
          <div className="footer-brand">
            &copy; {new Date().getFullYear()} TreatsByShawty
          </div>
          <div className="footer-address">
            <span>123 Sweet Lane, Dessert City</span>
            <br />
            <span>
              Phone: <a href="tel:+2348165116078">(234)816 511 6078</a>
            </span>
            <br />
            <span>
              Email: <a href="mailto:.com">adegokekafayat097@gmail.com</a>
            </span>
          </div>
        </div>
        <div className="footer-col footer-links-col">
          <div className="footer-links-title">Quick Links</div>
          <ul className="footer-links">
            <li>
              <a href="/menu">Menu</a>
            </li>
            <li>
              <a href="/about">About</a>
            </li>
            <li>
              <a href="/cart">Cart</a>
            </li>
            <li>
              <a href="/checkout">Checkout</a>
            </li>
            <li>
              <a href="/admin">Admin</a>
            </li>
          </ul>
        </div>
        <div className="footer-col footer-newsletter-col">
          <div className="footer-newsletter-title">
            Subscribe for Sweet Deals
          </div>
          <form
            className="footer-newsletter-form"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="Your email"
              className="footer-newsletter-input"
              required
            />
            <button type="submit" className="footer-newsletter-btn">
              Subscribe
            </button>
          </form>
          <div className="footer-social">
            <a
              href="https://www.instagram.com/treatsby_shawty/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-link"
            >
              <i className="fab fa-instagram"></i>
            </a>
            <a
              href="https://x.com/treatsby_shawty"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-link"
            >
              <i className="fab fa-twitter"></i>
            </a>
            <a
              href="https://tiktok.com/@treatsbyshawty"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-link"
            >
              <i className="fab fa-tiktok"></i>
            </a>
            <a
              href="https://wa.me/+2348165116078"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-link"
            >
              <i className="fab fa-whatsapp"></i>
            </a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>
          &copy; {new Date().getFullYear()} TreatsByShawty. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
