export const API_BASE = "https://v2.api.noroff.dev/online-shop";
export const MAX_QUANTITY = 99;

export function unitPrice(product) {
  const regular = product?.price;
  const discounted = product?.discountedPrice;
  const valid = (value) =>
    typeof value === "number" && Number.isFinite(value) && value >= 0;
  if (valid(discounted) && (!valid(regular) || discounted <= regular))
    return discounted;
  return valid(regular) ? regular : null;
}

export const money = (amount) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    amount,
  );
export const lineTotalCents = (item) =>
  Math.round(unitPrice(item) * 100) * item.quantity;
export const totalCents = (items) =>
  items.reduce((sum, item) => sum + lineTotalCents(item), 0);

export function normalizeCart(value) {
  if (!Array.isArray(value)) return [];
  const items = new Map();
  for (const product of value) {
    if (
      !product ||
      typeof product.id !== "string" ||
      !product.id ||
      typeof product.title !== "string" ||
      unitPrice(product) === null ||
      !Number.isInteger(product.quantity) ||
      product.quantity < 1
    )
      continue;
    const quantity = Math.min(
      MAX_QUANTITY,
      product.quantity + (items.get(product.id)?.quantity || 0),
    );
    items.set(product.id, {
      id: product.id,
      title: product.title,
      price: product.price,
      discountedPrice: product.discountedPrice,
      image: product.image,
      quantity,
    });
  }
  return [...items.values()];
}

export function readStoredCart() {
  try {
    return normalizeCart(JSON.parse(localStorage.getItem("cart") || "[]"));
  } catch {
    return [];
  }
}

export async function getProducts(path = "", signal) {
  const response = await fetch(`${API_BASE}${path}`, { signal });
  const body = await response.json().catch(() => null);
  if (!response.ok)
    throw new Error(
      body?.errors?.[0]?.message ||
        (response.status === 404
          ? "This product could not be found."
          : "We could not load the products. Please try again."),
    );
  if (!body || !body.data)
    throw new Error(
      "The shop returned an unexpected response. Please try again.",
    );
  return body;
}

export async function getCatalog(signal) {
  const items = [];
  let page = 1;
  while (page) {
    const body = await getProducts(`?limit=100&page=${page}`, signal);
    if (!Array.isArray(body.data))
      throw new Error("The product list could not be loaded.");
    items.push(...body.data);
    page = body.meta?.nextPage || null;
  }
  return [...new Map(items.map((product) => [product.id, product])).values()];
}
