import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ContactPage, { validateContact } from "../pages/ContactPage";

test("whitespace-only contact fields are rejected", () => {
  expect(
    Object.keys(
      validateContact({
        fullName: "   ",
        subject: "   ",
        email: "bad",
        body: "   ",
      }),
    ),
  ).toHaveLength(4);
});

test("invalid contact details receive accessible feedback and focus", () => {
  render(<ContactPage />);
  fireEvent.click(screen.getByRole("button", { name: "Preview message" }));
  expect(screen.getByLabelText("Full Name")).toHaveFocus();
  expect(screen.getByLabelText("Email")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
});

test("a valid demo contact form never claims a real message was delivered", () => {
  render(<ContactPage />);
  for (const [label, value] of [
    ["Full Name", "Robert Filep"],
    ["Subject", "A product question"],
    ["Email", "example@example.com"],
    ["Message", "Could you tell me more?"],
  ])
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
  fireEvent.click(screen.getByRole("button", { name: "Preview message" }));
  expect(screen.getByRole("status")).toHaveTextContent("it has not been sent");
});
