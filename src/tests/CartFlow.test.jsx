import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "../App";

const product = {
  id: "headphones",
  title: "Gold headphones",
  description: "Clear sound for everyday listening.",
  price: 100,
  discountedPrice: 80,
  rating: 4,
  reviews: [],
  image: {},
};
const originalFetch = global.fetch;
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  window.history.replaceState({}, "", "/");
  global.fetch = jest
    .fn()
    .mockImplementation((url) =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          data: url.includes("/online-shop/headphones") ? product : [product],
          meta: {},
        }),
      }),
    );
});
afterEach(() => {
  global.fetch = originalFetch;
  jest.restoreAllMocks();
});

test("adding a product updates the header immediately and the cart survives a remount", async () => {
  window.history.replaceState({}, "", "/product/headphones");
  const view = render(<App />);
  fireEvent.click(await screen.findByRole("button", { name: "Add to Cart" }));
  expect(
    screen.getByRole("link", { name: "Cart, 1 item" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent("Added to your cart.");
  await waitFor(() =>
    expect(JSON.parse(localStorage.getItem("cart"))[0].quantity).toBe(1),
  );
  view.unmount();
  window.history.replaceState({}, "", "/cart");
  render(<App />);
  expect(
    screen.getByRole("link", { name: "Cart, 1 item" }),
  ).toBeInTheDocument();
  expect(screen.getByLabelText("Quantity")).toHaveValue(1);
});

test("quantity updates totals and invalid quantities cannot corrupt the cart", () => {
  localStorage.setItem("cart", JSON.stringify([{ ...product, quantity: 1 }]));
  window.history.replaceState({}, "", "/cart");
  render(<App />);
  fireEvent.change(screen.getByLabelText("Quantity"), {
    target: { value: "3" },
  });
  expect(
    screen.getByRole("link", { name: "Cart, 3 items" }),
  ).toBeInTheDocument();
  expect(screen.getAllByText("$240.00")).toHaveLength(3);
  fireEvent.change(screen.getByLabelText("Quantity"), {
    target: { value: "-2" },
  });
  expect(screen.getByRole("alert")).toHaveTextContent("Choose a whole number");
  expect(screen.getByLabelText("Quantity")).toHaveValue(3);
  fireEvent.click(
    screen.getByRole("button", { name: "Remove Gold headphones" }),
  );
  expect(
    screen.getByRole("heading", { name: "Your cart is empty" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "Cart, 0 items" }),
  ).toBeInTheDocument();
});

test("demo checkout collects no payment data, clears the cart and preserves a receipt on reload", async () => {
  localStorage.setItem("cart", JSON.stringify([{ ...product, quantity: 2 }]));
  window.history.replaceState({}, "", "/cart");
  const view = render(<App />);
  expect(screen.queryByLabelText(/credit card/i)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Complete demo order" }));
  expect(
    await screen.findByRole("heading", {
      name: "Your demo order is complete.",
    }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "Cart, 0 items" }),
  ).toBeInTheDocument();
  expect(global.fetch).not.toHaveBeenCalled();
  await waitFor(() =>
    expect(JSON.parse(localStorage.getItem("cart"))).toEqual([]),
  );
  view.unmount();
  window.history.replaceState({}, "", "/checkout-success");
  render(<App />);
  expect(
    screen.getByRole("heading", { name: "Your demo order is complete." }),
  ).toBeInTheDocument();
  expect(screen.getAllByText("$160.00")).toHaveLength(2);
});

test("malformed saved cart cannot crash the app", () => {
  localStorage.setItem("cart", "{invalid");
  window.history.replaceState({}, "", "/cart");
  render(<App />);
  expect(
    screen.getByRole("heading", { name: "Your cart is empty" }),
  ).toBeInTheDocument();
});

test("cart follows updates from another tab", () => {
  window.history.replaceState({}, "", "/cart");
  render(<App />);
  localStorage.setItem("cart", JSON.stringify([{ ...product, quantity: 4 }]));
  fireEvent(window, new StorageEvent("storage", { key: "cart" }));
  expect(
    screen.getByRole("link", { name: "Cart, 4 items" }),
  ).toBeInTheDocument();
});
