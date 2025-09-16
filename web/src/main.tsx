import "./index.css";
import { initTheme } from "./lib/theme";
initTheme();
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import { CartProvider } from "./lib/cart";
import CartPanel from "./components/CartPanel";

const qc = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <CartProvider>
        <BrowserRouter>
            <CartPanel />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/orders/new" element={<Home />} />
          </Routes>
        </BrowserRouter>
        <Toaster richColors position="top-right" />
      </CartProvider>
    </QueryClientProvider>
  </React.StrictMode>
);