import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProducts, MAX_QUANTITY, money, unitPrice } from "../shop";
import { useCart } from "../CartContext";
import ProductImage from "../components/ProductImage";
import Price from "../components/Price";

export default function Productpage() {
  const { id } = useParams();
  const { items, addItem, storageError } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setError("");
    setProduct(null);
    setAdded(false);
    getProducts(`/${encodeURIComponent(id)}`, controller.signal)
      .then((body) => {
        if (active) setProduct(body.data);
      })
      .catch((err) => {
        if (active && err.name !== "AbortError") setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [id, retry]);
  if (loading)
    return (
      <p role="status" className="container page-section">
        Loading product details...
      </p>
    );
  if (error || !product)
    return (
      <section className="container page-section">
        <h1>Product unavailable</h1>
        <p role="alert">{error || "This product could not be found."}</p>
        <button
          className="button secondary"
          onClick={() => setRetry((n) => n + 1)}
        >
          Try again
        </button>{" "}
        <Link to="/">Back to the shop</Link>
      </section>
    );
  const price = unitPrice(product);
  const reviews = Array.isArray(product.reviews) ? product.reviews : [];
  const quantity = items.find((item) => item.id === product.id)?.quantity || 0;
  return (
    <section className="container page-section">
      <Link className="back-link" to="/">
        ← Back to the collection
      </Link>
      <div className="product-detail">
        <div className="detail-image">
          <ProductImage
            src={product.image?.url}
            alt={product.image?.alt || product.title}
          />
        </div>
        <div className="detail-copy">
          <p className="eyebrow">
            {product.tags?.join(" / ") || "A GOOD FIND"}
          </p>
          <h1>{product.title}</h1>
          <p className="product-rating">
            {product.rating > 0
              ? `★ ${product.rating.toFixed(1)} · ${reviews.length} ${reviews.length === 1 ? "review" : "reviews"}`
              : "No ratings yet"}
          </p>
          <div className="detail-price">
            <Price product={product} />
          </div>
          {price !== null && product.price > price && (
            <p className="savings">You save {money(product.price - price)}</p>
          )}
          <p className="product-description">
            {product.description || "No description available."}
          </p>
          <button
            type="button"
            className="button add-to-cart"
            disabled={price === null || quantity >= MAX_QUANTITY}
            onClick={() => {
              addItem(product);
              setAdded(true);
            }}
          >
            {" "}
            {quantity >= MAX_QUANTITY
              ? "Maximum quantity reached"
              : "Add to Cart"}{" "}
          </button>
          <div role="status" className="cart-feedback">
            {added && (
              <p>
                Added to your cart. <Link to="/cart">View cart →</Link>
              </p>
            )}
          </div>
          {storageError && (
            <p role="alert" className="notice">
              {storageError}
            </p>
          )}
          <p className="muted small-label">PORTFOLIO STORE · DEMO CHECKOUT</p>
        </div>
      </div>
      <section className="reviews" aria-labelledby="reviews-title">
        <h2 id="reviews-title">Customer reviews</h2>
        {reviews.length ? (
          <div className="review-grid">
            {reviews.map((review, index) => (
              <article className="review-card" key={review.id || index}>
                <p
                  aria-label={`${review.rating} out of 5 stars`}
                  className="product-rating"
                >
                  ★ {review.rating} / 5
                </p>
                <p>{review.description || "No written review."}</p>
                <strong>{review.username || "Customer"}</strong>
              </article>
            ))}
          </div>
        ) : (
          <p className="muted">There are no reviews for this product yet.</p>
        )}
      </section>
    </section>
  );
}
