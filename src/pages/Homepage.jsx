import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getCatalog, unitPrice } from "../shop";
import ProductImage from "../components/ProductImage";
import Price from "../components/Price";

const PAGE_SIZE = 12;
export default function Homepage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setError("");
    getCatalog(controller.signal)
      .then((items) => {
        if (active) setProducts(items);
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
  }, [retry]);
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const results = products.filter((product) =>
      [
        product.title || "",
        product.description || "",
        ...(product.tags || []),
      ].some((text) => String(text).toLowerCase().includes(query)),
    );
    return [...results].sort((a, b) => {
      const priceA = unitPrice(a),
        priceB = unitPrice(b);
      if (sort.startsWith("price")) {
        if (priceA === null) return priceB === null ? 0 : 1;
        if (priceB === null) return -1;
        return sort === "price-asc" ? priceA - priceB : priceB - priceA;
      }
      if (sort === "rating-desc") return (b.rating || 0) - (a.rating || 0);
      if (sort === "rating-asc") return (a.rating || 0) - (b.rating || 0);
      if (sort === "discount")
        return (
          Math.max(0, (b.price || 0) - (priceB ?? b.price)) -
          Math.max(0, (a.price || 0) - (priceA ?? a.price))
        );
      return 0;
    });
  }, [products, search, sort]);
  return (
    <>
      <section className="shop-hero">
        <div className="container hero-content">
          <div>
            <p className="eyebrow">GOOD FINDS. EVERY DAY.</p>
            <h1>
              Your next favorite
              <br />
              <span>is waiting.</span>
            </h1>
            <p>
              Small upgrades, thoughtful gifts, and everyday essentials.
              <br className="desktop-break" /> Find a little something that
              feels like you.
            </p>
            <a className="button" href="#products">
              Explore the collection <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="hero-edit" aria-label="The everyday edit">
            <span className="hero-edit-label">THE EVERYDAY EDIT / 01</span>
            <figure className="hero-product">
              <ProductImage
                src="https://static.noroff.dev/api/online-shop/3-headphones-beats.jpg"
                alt="Gold over-ear headphones"
                width="320"
                height="360"
              />
              <figcaption>TURN IT UP.</figcaption>
            </figure>
            <figure className="hero-product">
              <ProductImage
                src="https://static.noroff.dev/api/online-shop/2-shoes-pink.jpg"
                alt="Pink everyday sneakers"
                width="260"
                height="300"
              />
              <figcaption>STEP OUT.</figcaption>
            </figure>
          </div>
        </div>
      </section>
      <section
        id="products"
        className="container page-section"
        aria-labelledby="collection-title"
      >
        <div className="collection-heading">
          <div>
            <p className="eyebrow">THE COLLECTION</p>
            <h2 id="collection-title">Find your kind of good.</h2>
          </div>
          <p className="muted" role="status">
            {!loading && !error
              ? `${filtered.length} ${filtered.length === 1 ? "product" : "products"}`
              : ""}
          </p>
        </div>
        <div className="search-sort-container">
          <div className="search-field">
            <label htmlFor="product-search">Search the collection</label>
            <input
              type="search"
              id="product-search"
              placeholder="Try headphones, beauty, or a gift…"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setVisible(PAGE_SIZE);
              }}
            />
          </div>
          <div>
            <label htmlFor="product-sort">Sort by</label>
            <select
              id="product-sort"
              value={sort}
              onChange={(event) => {
                setSort(event.target.value);
                setVisible(PAGE_SIZE);
              }}
            >
              <option value="default">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Highest Rating</option>
              <option value="rating-asc">Lowest Rating</option>
              <option value="discount">Largest Discount</option>
            </select>
          </div>
        </div>
        {loading && (
          <p className="empty-state" role="status">
            Loading products...
          </p>
        )}
        {error && (
          <div className="notice error" role="alert">
            <p>{error}</p>
            <button
              type="button"
              className="button secondary"
              onClick={() => setRetry((n) => n + 1)}
            >
              Try again
            </button>
          </div>
        )}
        {!loading && !error && (
          <>
            <div className="product-list">
              {filtered.slice(0, visible).map((product) => {
                const price = unitPrice(product);
                const discount =
                  price !== null && product.price > price
                    ? Math.round(
                        ((product.price - price) / product.price) * 100,
                      )
                    : 0;
                return (
                  <article key={product.id} className="product-card">
                    <Link
                      to={`/product/${product.id}`}
                      className="product-image-link"
                      aria-label={`View ${product.title}`}
                    >
                      <ProductImage
                        src={product.image?.url}
                        alt={product.image?.alt || product.title}
                        className="product-image"
                        loading="lazy"
                        width="500"
                        height="450"
                      />
                      {discount > 0 && (
                        <span className="discount-badge">−{discount}%</span>
                      )}
                    </Link>
                    <div className="product-card-body">
                      <p className="product-category">
                        {product.tags?.slice(0, 2).join(" / ") ||
                          "EVERYDAY FINDS"}
                      </p>
                      <h3>
                        <Link to={`/product/${product.id}`}>
                          {product.title}
                        </Link>
                      </h3>
                      <p className="product-rating">
                        {product.rating > 0
                          ? `★ ${product.rating.toFixed(1)}`
                          : "No ratings yet"}
                      </p>
                      <div className="product-card-bottom">
                        <Price product={product} />
                        <Link
                          className="product-arrow"
                          aria-label={`Details for ${product.title}`}
                          to={`/product/${product.id}`}
                        >
                          ↗
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
            {filtered.length === 0 && (
              <div className="empty-state">
                <h3>No products found</h3>
                <p>Try another search or explore the full collection.</p>
                {search && (
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() => {
                      setSearch("");
                      setVisible(PAGE_SIZE);
                    }}
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
            <div className="pagination">
              {visible < filtered.length && (
                <button
                  className="button"
                  onClick={() => setVisible((count) => count + PAGE_SIZE)}
                >
                  Load More
                </button>
              )}
              {visible > PAGE_SIZE && (
                <button
                  className="button secondary"
                  onClick={() => setVisible(PAGE_SIZE)}
                >
                  Show Less
                </button>
              )}
            </div>
          </>
        )}
      </section>
    </>
  );
}
