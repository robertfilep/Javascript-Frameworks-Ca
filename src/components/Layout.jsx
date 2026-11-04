import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
export default function Layout({ children }) {
  const { pathname } = useLocation();
  useEffect(() => {
    if (
      typeof window.scrollTo === "function" &&
      process.env.NODE_ENV !== "test"
    )
      window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <div className="layout-container">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Header />
      <main id="main-content" tabIndex="-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
