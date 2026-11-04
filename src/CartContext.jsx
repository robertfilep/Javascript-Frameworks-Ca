import React, { createContext, useContext, useEffect, useState } from "react";
import {
  MAX_QUANTITY,
  normalizeCart,
  readStoredCart,
  totalCents,
  unitPrice,
} from "./shop";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(readStoredCart);
  const [storageError, setStorageError] = useState("");
  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(items));
      setStorageError("");
    } catch {
      setStorageError(
        "Your cart is available in this tab, but could not be saved on this device.",
      );
    }
  }, [items]);
  useEffect(() => {
    const sync = (event) => {
      if (event.key === "cart" || event.key === null)
        setItems(readStoredCart());
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  const addItem = (product) => {
    if (unitPrice(product) === null || !product.id || !product.title) return;
    setItems((previous) =>
      normalizeCart([...previous, { ...product, quantity: 1 }]),
    );
  };
  const setQuantity = (id, quantity) => {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY)
      return;
    setItems((previous) =>
      previous.map((item) => (item.id === id ? { ...item, quantity } : item)),
    );
  };
  const removeItem = (id) =>
    setItems((previous) => previous.filter((item) => item.id !== id));
  const clearCart = () => setItems([]);
  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        setQuantity,
        removeItem,
        clearCart,
        storageError,
        count: items.reduce((sum, item) => sum + item.quantity, 0),
        total: totalCents(items) / 100,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("Cart controls must be inside CartProvider.");
  return value;
}
