import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  window.history.replaceState({}, "", "/");
});

test("unknown routes offer a route back to the shop", () => {
  window.history.replaceState({}, "", "/missing");
  render(<App />);
  expect(
    screen.getByRole("heading", { name: "Page not found" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "Back to the shop" }),
  ).toHaveAttribute("href", "/");
});

test("mobile navigation supports Escape and closes on navigation", () => {
  window.history.replaceState({}, "", "/cart");
  render(<App />);
  const toggle = screen.getByRole("button", { name: "Toggle navigation" });
  fireEvent.click(toggle);
  expect(toggle).toHaveAttribute("aria-expanded", "true");
  fireEvent.keyDown(document, { key: "Escape" });
  expect(toggle).toHaveAttribute("aria-expanded", "false");
  expect(toggle).toHaveFocus();
  fireEvent.click(toggle);
  fireEvent.click(
    screen.getAllByRole("link", { name: "Contact", exact: true })[1],
  );
  expect(toggle).toHaveAttribute("aria-expanded", "false");
  expect(
    screen.getByRole("heading", { name: /You’re in the right place/ }),
  ).toBeInTheDocument();
});

test("opening confirmation without a previous demo order shows a useful empty state", () => {
  window.history.replaceState({}, "", "/checkout-success");
  render(<App />);
  expect(
    screen.getByRole("heading", { name: "No demo order to show" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "Continue Shopping" }),
  ).toHaveAttribute("href", "/");
});
