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
                <div className="min-h-screen flex flex-col">
                    <CartPanel />
                    <main className="flex-1">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/orders/new" element={<Home />} />
                        </Routes>
                    </main>
                    <footer className="
                        border-t border-zinc-400 dark:border-zinc-800
                        bg-zinc-200/60 dark:bg-zinc-900/60
                        py-6 text-center text-sm text-zinc-500 mt-auto">
                        <p>GrubDash</p>
                        <br></br>
                        <p>Built and designed by Francisco Alvarado</p>
                        <br></br>
                        <p>All rights reserved ©</p>
                    </footer>
                </div>
                </BrowserRouter>
                <Toaster richColors position="top-right" />
            </CartProvider>
        </QueryClientProvider>
    </React.StrictMode>
);