import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  price?: number;
  quantity: number;
};

type Ctx = {
  items: CartItem[];
  add: (d: Omit<CartItem, "quantity">, qty?: number) => void;
  updateQty: (id: number, qty: number) => void;
  remove: (id: number) => void;
  clear: () => void;
  total: number;

  // UI state for the sheet
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

const KEY = "grubdash.cart.v1";
const Cart = createContext<Ctx | null>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, set] = useState<CartItem[]>([]);
  const [isOpen, setOpen] = useState(false);

  // load on first mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) set(JSON.parse(raw));
    } catch {}
  }, []);

  // persist on change
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const add = (d: Omit<CartItem, "quantity">, qty = 1) => {
    set(prev => {
      const i = prev.findIndex(x => x.id === d.id);
      if (i >= 0) {
        const cp = [...prev];
        cp[i] = { ...cp[i], quantity: cp[i].quantity + qty };
        return cp;
      }
      return [...prev, { ...d, quantity: qty }];
    });
    setOpen(true); // open sheet when adding
  };

  const updateQty = (id: number, qty: number) =>
    set(prev =>
      prev
        .map(p => (p.id === id ? { ...p, quantity: Math.max(0, Math.floor(qty)) } : p))
        .filter(x => x.quantity > 0)
    );

  const remove = (id: number) => set(prev => prev.filter(x => x.id !== id));
  const clear = () => set([]);

  const total = useMemo(
    () => items.reduce((s, i) => s + (Number(i.price ?? 0) * i.quantity), 0),
    [items]
  );

  const open = () => setOpen(true);
  const close = () => setOpen(false);
  const toggle = () => setOpen(v => !v);

  return (
    <Cart.Provider
      value={{ items, add, updateQty, remove, clear, total, isOpen, open, close, toggle }}
    >
      {children}
    </Cart.Provider>
  );
};

export const useCart = () => {
  const c = useContext(Cart);
  if (!c) throw new Error("useCart must be used inside <CartProvider>");
  return c;
};