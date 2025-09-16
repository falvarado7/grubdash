import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { X, Trash2 } from "lucide-react";
import { useCart } from "../lib/cart";
import OrderFormModal from "./OrderFormModal";

const fmt = (n: number) => `$${n.toFixed(2)}`;

export default function CartPanel() {
    const { isOpen, close, items, updateQty, remove, clear, total } = useCart();
    const [showForm, setShowForm] = useState(false);

    // ESC to close
    useEffect(() => {
        if (!isOpen) return;
        const onEsc = (e: KeyboardEvent) => e.key === "Escape" && close();
        window.addEventListener("keydown", onEsc);
        return () => window.removeEventListener("keydown", onEsc);
    }, [isOpen, close]);

    if (typeof document === "undefined") return null;

    return createPortal(
        <div
            className={`fixed inset-0 z-[1000] transition ${
                isOpen ? "pointer-events-auto" : "pointer-events-none"
            }`}
            aria-hidden={!isOpen}
        >
            {/* Overlay */}
            <div
                className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity ${
                    isOpen ? "opacity-100" : "opacity-0"
                }`}
                onClick={close}
            />

            {/* Panel: full-screen on small, right-drawer on md+ */}
            <aside
                className={`absolute right-0 top-0 h-full w-full md:w-[380px] lg:w-[420px]
                            bg-zinc-200 dark:bg-zinc-900
                            border-l border-zinc-400 dark:border-zinc-800 shadow-xl
                            transition-transform duration-300 ease-out
                            ${isOpen ? "translate-x-0" : "translate-x-full"}`}
                role="dialog"
                aria-modal="true"
                aria-label="Shopping cart"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-zinc-400 dark:border-zinc-800">
                    <h2 className="text-lg font-semibold">Your Cart</h2>
                    <button
                        className="rounded-md p-2 hover:bg-[hsl(var(--muted))]"
                        onClick={close}
                        aria-label="Close"
                    >
                        <X />
                    </button>
                </div>

                {/* Items */}
                <div className="p-4 space-y-3 overflow-auto h-[calc(100%-11rem)]">
                    {!items.length && (
                        <div className="text-sm text-gray-500">Your cart is empty.</div>
                    )}

                    {items.map(item => {
                        const line = Number(item.price ?? 0) * item.quantity;
                        return (
                            <div
                                key={item.id}
                                className="flex gap-3 rounded-xl border border-zinc-400 dark:border-zinc-800 p-3"
                            >
                                <div className="h-16 w-16 rounded-lg overflow-hidden
                                        flex-shrink-0">
                                    {item.image_url ? (
                                        <img
                                            src={item.image_url}
                                            alt={item.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : null}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="font-medium truncate">{item.name}</div>
                                    <div className="text-xs text-gray-500">{fmt(Number(item.price ?? 0))} each</div>

                                    <div className="mt-2 flex items-center gap-2">
                                        <button
                                            className="h-7 w-7 rounded-md border border-zinc-400 dark:border-zinc-800
                                                hover:bg-zinc-300 dark:hover:bg-zinc-700"
                                            onClick={() => updateQty(item.id, Math.max(1, item.quantity - 1))}
                                            aria-label="Decrease quantity"
                                        >
                                            −
                                        </button>
                                        <input
                                            type="number"
                                            min={1}
                                            className="w-14 rounded-md border border-zinc-400 dark:border-zinc-800
                                                px-2 py-0.5 text-center outline-none focus:ring-2 bg-zinc-200 dark:bg-zinc-900
                                                focus:ring-blue-500/30"
                                            value={item.quantity}
                                            onChange={e => updateQty(item.id, Math.max(1, Number(e.target.value)))}
                                            onBlur={e => updateQty(item.id, Math.max(1, Number(e.target.value)))}
                                        />
                                        <button
                                            className="h-7 w-7 rounded-md border border-zinc-400 dark:border-zinc-800
                                                hover:bg-zinc-300 dark:hover:bg-zinc-700"
                                            onClick={() => updateQty(item.id, item.quantity + 1)}
                                            aria-label="Increase quantity"
                                        >
                                            +
                                        </button>

                                        <button
                                            className="ml-auto inline-flex items-center gap-1 text-sm
                                                text-red-600 hover:underline"
                                            onClick={() => remove(item.id)}
                                        >
                                            <Trash2 size={16} /> Remove
                                        </button>
                                    </div>
                                </div>
                                <div className="font-medium">{fmt(line)}</div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-zinc-400 dark:border-zinc-800">
                    <div className="flex items-center justify-between mb-3 mx-2">
                        <div className="text-sm text-gray-600">Subtotal</div>
                        <div className="text-lg font-semibold">{fmt(total)}</div>
                    </div>
                    <div className="flex gap-2 mx-2">
                        <button
                            className="inline-flex flex-1 items-center justify-center rounded-xl
                                border border-zinc-400 dark:border-zinc-800 px-4 py-2 text-sm hover:bg-zinc-300 dark:hover:bg-zinc-700"
                            onClick={clear}
                            disabled={!items.length}
                        >
                            Clear
                        </button>
                        <button
                            className="inline-flex flex-1 items-center justify-center rounded-xl
                                bg-blue-600 px-4
                                py-2 text-sm font-medium hover:brightness-110"
                            disabled={!items.length}
                            onClick={() => setShowForm(true)}
                        >
                            Checkout
                        </button>
                    </div>
                </div>
            </aside>
            <OrderFormModal open={showForm} onClose={() => setShowForm(false)} />
        </div>,
        document.body
    );
}