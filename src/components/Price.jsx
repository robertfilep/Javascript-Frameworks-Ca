import React from "react";
import { money, unitPrice } from "../shop";
export default function Price({ product }) {
  const price = unitPrice(product);
  if (price === null) return <span>Price unavailable</span>;
  return (
    <span className="price">
      {typeof product.price === "number" && product.price > price && (
        <del aria-label="Original price">{money(product.price)}</del>
      )}
      <strong>{money(price)}</strong>
    </span>
  );
}
