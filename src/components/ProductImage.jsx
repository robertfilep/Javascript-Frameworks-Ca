import React, { useState } from "react";
export default function ProductImage({ src, alt, ...props }) {
  const [failed, setFailed] = useState(null);
  const fallback = `${process.env.PUBLIC_URL || ""}/product-placeholder.svg`;
  return (
    <img
      {...props}
      src={/^https?:\/\//i.test(src || "") && failed !== src ? src : fallback}
      alt={alt || "Product image"}
      onError={() => setFailed(src)}
    />
  );
}
