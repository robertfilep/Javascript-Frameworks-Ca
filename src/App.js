import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { CartProvider } from "./CartContext";
import Layout from "./components/Layout";
import Homepage from "./pages/Homepage";
import Productpage from "./pages/Productpage";
import CartPage from "./pages/CartPage";
import CheckoutSuccessPage from "./pages/CheckoutSuccessPage";
import ContactPage from "./pages/ContactPage";
import "./App.css";

export default function App() {
  return (
    <Router>
      <CartProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/product/:id" element={<Productpage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout-success" element={<CheckoutSuccessPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route
              path="*"
              element={
                <section className="container page-section empty-state">
                  <p className="eyebrow">A SMALL DETOUR</p>
                  <h1>Page not found</h1>
                  <p>Let’s find something you’ll love instead.</p>
                  <Link to="/" className="button">
                    Back to the shop
                  </Link>
                </section>
              }
            />
          </Routes>
        </Layout>
      </CartProvider>
    </Router>
  );
}
