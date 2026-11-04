import React from "react";
import { Link } from "react-router-dom";
export default function Footer() {
  return (
    <footer>
      <div className="container footer-content">
        <div>
          <strong>ShopSphere</strong>
          <p>Everyday finds. A little more you.</p>
        </div>
        <Link to="/contact">Contact us</Link>
        <p>© {new Date().getFullYear()} ShopSphere · Portfolio demo</p>
      </div>
    </footer>
  );
}
