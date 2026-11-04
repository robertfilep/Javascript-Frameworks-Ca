import {
  getCatalog,
  normalizeCart,
  readStoredCart,
  totalCents,
  unitPrice,
} from "../shop";
const product = {
  id: "one",
  title: "Headphones",
  price: 100,
  discountedPrice: 80,
  quantity: 1,
};
afterEach(() => {
  localStorage.clear();
  jest.restoreAllMocks();
});

test("uses valid discounts, including free products, and falls back to regular price", () => {
  expect(unitPrice(product)).toBe(80);
  expect(unitPrice({ price: 100 })).toBe(100);
  expect(unitPrice({ price: 100, discountedPrice: 0 })).toBe(0);
  expect(unitPrice({ price: 100, discountedPrice: 150 })).toBe(100);
  expect(unitPrice({ price: -1, discountedPrice: NaN })).toBeNull();
});

test("calculates totals in cents without floating-point drift", () => {
  expect(
    totalCents([
      { ...product, price: 0.1, discountedPrice: 0.1, quantity: 3 },
      { ...product, id: "two", price: 0.2, discountedPrice: 0.2, quantity: 1 },
    ]),
  ).toBe(50);
});

test("recovers safely from invalid stored JSON and non-array carts", () => {
  localStorage.setItem("cart", "{broken");
  expect(readStoredCart()).toEqual([]);
  localStorage.setItem("cart", JSON.stringify({ id: "one" }));
  expect(readStoredCart()).toEqual([]);
});

test("discards invalid products, merges duplicates and caps quantity", () => {
  const cart = normalizeCart([
    product,
    { ...product, quantity: 2 },
    { ...product, id: "zero", quantity: 0 },
    { ...product, id: "fraction", quantity: 1.5 },
    { ...product, id: "bad-price", price: -10, discountedPrice: -20 },
    null,
  ]);
  expect(cart).toHaveLength(1);
  expect(cart[0].quantity).toBe(3);
  expect(normalizeCart([{ ...product, quantity: 1000 }])[0].quantity).toBe(99);
});

test("loads every product page and deduplicates repeated results", async () => {
  global.fetch = jest
    .fn()
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [product], meta: { nextPage: 2 } }),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [product, { ...product, id: "two" }],
        meta: { nextPage: null },
      }),
    });
  expect(await getCatalog()).toHaveLength(2);
  expect(global.fetch.mock.calls[1][0]).toContain("page=2");
});

test("an HTTP failure surfaces the API message", async () => {
  global.fetch = jest
    .fn()
    .mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ errors: [{ message: "Service unavailable." }] }),
    });
  await expect(getCatalog()).rejects.toThrow("Service unavailable.");
});
