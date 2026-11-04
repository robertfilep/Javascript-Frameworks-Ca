import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../CartContext";
import { MAX_QUANTITY, lineTotalCents, money, unitPrice } from "../shop";
import ProductImage from "../components/ProductImage";

export default function CartPage() {
  const {
    items,
    setQuantity,
    removeItem,
    clearCart,
    total,
    count,
    storageError,
  } = useCart();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const checkout = (event) => {
    event.preventDefault();
    if (submitting || !items.length) return;
    setSubmitting(true);
    const orderData = {
      demo: true,
      cartItems: items,
      totalAmount: total,
      created: new Date().toISOString(),
    };
    try {
      sessionStorage.setItem(
        "shopsphere-demo-order",
        JSON.stringify(orderData),
      );
    } catch {
      /* Router state keeps the receipt available if storage is blocked. */
    }
    clearCart();
    navigate("/checkout-success", { state: { orderData } });
  };
  return (
    <section className="container page-section">
      <Link className="back-link" to="/">
        ← Continue shopping
      </Link>
      <p className="eyebrow">YOUR GOOD FINDS</p>
      <h1>Your Cart</h1>
      {storageError && (
        <p role="alert" className="notice">
          {storageError}
        </p>
      )}
      {items.length === 0 ? (
        <div className="empty-state">
          <h2>Your cart is empty</h2>
          <p>Something good is waiting in the collection.</p>
          <Link to="/" className="button">
            Explore products
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div>
            <p className="muted">
              {count} {count === 1 ? "item" : "items"} in your cart
            </p>
            {error && (
              <p role="alert" className="notice error">
                {error}
              </p>
            )}
            <div className="cart-items">
              {items.map((item) => (
                <article className="cart-item" key={item.id}>
                  <Link to={`/product/${item.id}`}>
                    <ProductImage
                      src={item.image?.url}
                      alt={item.image?.alt || item.title}
                    />
                  </Link>
                  <div className="cart-item-copy">
                    <h2>
                      <Link to={`/product/${item.id}`}>{item.title}</Link>
                    </h2>
                    <p className="muted">{money(unitPrice(item))} each</p>
                    <div className="quantity-row">
                      <label htmlFor={`quantity-${item.id}`}>Quantity</label>
                      <input
                        type="number"
                        id={`quantity-${item.id}`}
                        min="1"
                        max={MAX_QUANTITY}
                        step="1"
                        value={item.quantity}
                        onChange={(event) => {
                          const quantity = Number(event.target.value);
                          if (
                            !Number.isInteger(quantity) ||
                            quantity < 1 ||
                            quantity > MAX_QUANTITY
                          ) {
                            setError(
                              `Choose a whole number between 1 and ${MAX_QUANTITY}.`,
                            );
                            return;
                          }
                          setError("");
                          setQuantity(item.id, quantity);
                        }}
                      />
                      <button
                        type="button"
                        className="text-button"
                        aria-label={`Remove ${item.title}`}
                        onClick={() => {
                          setError("");
                          removeItem(item.id);
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <strong className="cart-line-total">
                    {money(lineTotalCents(item) / 100)}
                  </strong>
                </article>
              ))}
            </div>
          </div>
          <aside className="order-summary">
            <h2>Order summary</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <strong>{money(total)}</strong>
            </div>
            <div className="summary-row">
              <span>Delivery</span>
              <span>Demo only</span>
            </div>
            <div className="summary-row summary-total">
              <span>Total</span>
              <strong>{money(total)}</strong>
            </div>
            <p className="muted">
              This is a portfolio demo. No payment is collected and no order is
              sent.
            </p>
            <form onSubmit={checkout}>
              <button type="submit" className="button" disabled={submitting}>
                {submitting ? "Preparing confirmation…" : "Complete demo order"}
              </button>
            </form>
            <p className="small-label muted">NO CARD DETAILS NEEDED</p>
          </aside>
        </div>
      )}
    </section>
  );
}
