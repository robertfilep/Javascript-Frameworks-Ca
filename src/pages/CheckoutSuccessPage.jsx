import React from "react";
import { Link, useLocation } from "react-router-dom";
import { normalizeCart, totalCents, money, lineTotalCents } from "../shop";
import ProductImage from "../components/ProductImage";

function savedOrder() {
  try {
    return JSON.parse(sessionStorage.getItem("shopsphere-demo-order"));
  } catch {
    return null;
  }
}
export default function CheckoutSuccessPage() {
  const location = useLocation();
  const order = location.state?.orderData || savedOrder();
  const items = order?.demo === true ? normalizeCart(order.cartItems) : [];
  if (!items.length)
    return (
      <section className="container page-section empty-state">
        <h1>No demo order to show</h1>
        <p>Your next good find is still waiting.</p>
        <Link className="button" to="/">
          Continue Shopping
        </Link>
      </section>
    );
  return (
    <section className="container page-section receipt">
      <div className="confirmation-icon" aria-hidden="true">
        ✓
      </div>
      <p className="eyebrow">ALL SET</p>
      <h1>Your demo order is complete.</h1>
      <p className="muted">
        Thanks for exploring ShopSphere. No payment was taken and nothing will
        be shipped.
      </p>
      <div className="receipt-items">
        {items.map((item) => (
          <div className="receipt-item" key={item.id}>
            <ProductImage src={item.image?.url} alt={item.title} />
            <div>
              <strong>{item.title}</strong>
              <p className="muted">Quantity: {item.quantity}</p>
            </div>
            <strong>{money(lineTotalCents(item) / 100)}</strong>
          </div>
        ))}
      </div>
      <div className="summary-row summary-total">
        <span>Total</span>
        <strong>{money(totalCents(items) / 100)}</strong>
      </div>
      <Link className="button" to="/">
        Continue Shopping
      </Link>
    </section>
  );
}
