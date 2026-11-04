import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useCart } from "../CartContext";

export default function Header() {
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef(null);
  const toggleRef = useRef(null);
  const location = useLocation();
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);
  useEffect(() => {
    const closeOutside = (event) => {
      if (!headerRef.current?.contains(event.target)) setMenuOpen(false);
    };
    const escape = (event) => {
      if (event.key === "Escape" && menuOpen) {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", escape);
    };
  }, [menuOpen]);
  return (
    <header className="header" ref={headerRef}>
      <div className="container header-content">
        <Link to="/" className="logo-link" aria-label="ShopSphere home">
          <img
            src={`${process.env.PUBLIC_URL}/Shopsphere-logo2.png`}
            alt="ShopSphere"
            className="logo"
          />
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          <NavLink to="/" end>
            Shop
          </NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>
        <div className="header-actions">
          <Link
            className="cart-link"
            to="/cart"
            aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}
          >
            <svg
              aria-hidden="true"
              width="23"
              height="23"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <path d="M3 3h2l2.5 12h11l2-8H6" />
              <circle cx="9" cy="20" r="1" />
              <circle cx="18" cy="20" r="1" />
            </svg>
            <span>Cart</span>
            <span className="cart-count" aria-hidden="true">
              {count}
            </span>
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className="menu-toggle"
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
        <nav
          id="mobile-nav"
          className="mobile-nav"
          aria-label="Mobile navigation"
          hidden={!menuOpen}
        >
          <NavLink to="/" end>
            Shop
          </NavLink>
          <NavLink to="/cart">Cart</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>
      </div>
    </header>
  );
}
