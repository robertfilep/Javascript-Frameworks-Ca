import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Homepage from "../pages/Homepage";
import Productpage from "../pages/Productpage";
import { CartProvider } from "../CartContext";

const products = Array.from({ length: 25 }, (_, index) => ({
  id: String(index),
  title: `Product ${String(index).padStart(2, "0")}`,
  price: 100 - index,
  discountedPrice: 100 - index,
  rating: index % 5,
  tags: index === 24 ? ["special gift"] : [],
  description: null,
}));
const result = (data) => ({ ok: true, json: async () => ({ data, meta: {} }) });
afterEach(() => jest.restoreAllMocks());

test("search covers all loaded products including tags and resets visible results", async () => {
  global.fetch = jest.fn().mockResolvedValue(result(products));
  render(
    <MemoryRouter>
      <Homepage />
    </MemoryRouter>,
  );
  await screen.findByRole("heading", { name: "Product 00" });
  expect(screen.getAllByRole("article")).toHaveLength(12);
  fireEvent.click(screen.getByRole("button", { name: "Load More" }));
  expect(screen.getAllByRole("article")).toHaveLength(24);
  fireEvent.change(screen.getByLabelText("Search the collection"), {
    target: { value: "  special gift  " },
  });
  expect(
    screen.getByRole("heading", { name: "Product 24" }),
  ).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("Search the collection"), {
    target: { value: "" },
  });
  expect(screen.getAllByRole("article")).toHaveLength(12);
});

test("sorts the full catalog before pagination", async () => {
  global.fetch = jest.fn().mockResolvedValue(result(products));
  render(
    <MemoryRouter>
      <Homepage />
    </MemoryRouter>,
  );
  await screen.findByRole("heading", { name: "Product 00" });
  fireEvent.change(screen.getByLabelText("Sort by"), {
    target: { value: "price-asc" },
  });
  const headings = screen.getAllByRole("heading", { level: 3 });
  expect(headings[0]).toHaveTextContent("Product 24");
  expect(headings).toHaveLength(12);
});

test("HTTP errors leave the loading state and can be retried", async () => {
  global.fetch = jest
    .fn()
    .mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: async () => ({ errors: [{ message: "Temporarily unavailable." }] }),
    })
    .mockResolvedValueOnce(result(products));
  render(
    <MemoryRouter>
      <Homepage />
    </MemoryRouter>,
  );
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Temporarily unavailable.",
  );
  expect(screen.queryByText("Loading products...")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(
    await screen.findByRole("heading", { name: "Product 00" }),
  ).toBeInTheDocument();
});

test("an empty search has a clear recovery action", async () => {
  global.fetch = jest.fn().mockResolvedValue(result(products));
  render(
    <MemoryRouter>
      <Homepage />
    </MemoryRouter>,
  );
  await screen.findByRole("heading", { name: "Product 00" });
  fireEvent.change(screen.getByLabelText("Search the collection"), {
    target: { value: "does not exist" },
  });
  expect(
    screen.getByRole("heading", { name: "No products found" }),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
  expect(
    screen.getByRole("heading", { name: "Product 00" }),
  ).toBeInTheDocument();
});

test("product errors can be retried and reviews come from the API", async () => {
  global.fetch = jest
    .fn()
    .mockRejectedValueOnce(new Error("Connection lost."))
    .mockResolvedValueOnce(
      result({
        id: "one",
        title: "A good find",
        price: 10,
        rating: 4,
        reviews: [
          {
            id: "review",
            username: "Alex",
            rating: 4,
            description: "Works well.",
          },
        ],
      }),
    );
  render(
    <MemoryRouter initialEntries={["/product/one"]}>
      <CartProvider>
        <Routes>
          <Route path="/product/:id" element={<Productpage />} />
        </Routes>
      </CartProvider>
    </MemoryRouter>,
  );
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Connection lost.",
  );
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(
    await screen.findByRole("heading", { name: "A good find" }),
  ).toBeInTheDocument();
  expect(screen.getByText("Works well.")).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Submit" }),
  ).not.toBeInTheDocument();
  await waitFor(() =>
    expect(screen.queryByRole("alert")).not.toBeInTheDocument(),
  );
});
