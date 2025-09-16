import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { X } from "lucide-react";
import { useCart } from "../lib/cart";
import { createOrder } from "../features/orders/api";

type Props = {
    open: boolean;
    onClose: () => void;
};

export default function OrderFormModal({ open, onClose }: Props) {
    const root = typeof document !== "undefined" ? document.body : null;
    const content = open ? <Panel onClose={onClose} /> : null;
    if (!open || !root) return null;
    return createPortal(content, root);
}

function Panel({ onClose }: { onClose: () => void }) {
    const { items, total, clear, close } = useCart();
    const [deliverTo, setDeliverTo] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");

    // close on ESC
    useEffect(() => {
        const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onEsc);
        return () => window.removeEventListener("keydown", onEsc);
    }, [onClose]);

    const qc = useQueryClient();

    const m = useMutation({
        mutationFn: async () => {
            if (!deliverTo.trim()) throw new Error("Please enter a delivery address.");
            if (!mobileNumber.trim()) throw new Error("Please enter a phone number.");
            if (!items.length) throw new Error("Your cart is empty.");

            const payload = {
                deliverTo,
                mobileNumber,
                dishes: items.map(i => ({
                name: i.name ?? "Item",
                description: i.description ?? i.name ?? "Item",
                image_url: i.image_url ?? "",
                price: Number(i.price ?? 0),
                quantity: Math.max(1, Number(i.quantity ?? 1)),
                })),
            };

            return createOrder(payload);
        },
        onSuccess: () => {
            toast.success("Order placed!");
            qc.invalidateQueries({ queryKey: ["orders"] });
            clear();
            onClose(); // close form
            close();   // close cart sheet
        },
        onError: (e: any) => {
            const msg =
                e?.response?.data?.error ??
                e?.message ??
                "Failed to place order";
            toast.error(msg);
        },
    });

    return (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center">
            {/* overlay */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />

            {/* panel */}
            <div
                className="relative z-[1101] w-full max-w-lg rounded-2xl card p-5 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="order-form-title"
            >
                <div className="mb-4 flex items-center justify-between">
                    <h3 id="order-form-title" className="text-xl font-semibold">Checkout</h3>
                    <button
                        className="rounded-md p-2 hover:bg-zinc-300 dark:bg-zinc-700"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <X />
                    </button>
                </div>

                <div className="space-y-3">
                    <div>
                        <label htmlFor="deliverTo" className="block text-sm mb-1">Delivery address</label>
                        <input
                            id="deliverTo"
                            className="w-full rounded-xl card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600/30"
                            placeholder="123 Main St, Springfield"
                            value={deliverTo}
                            onChange={(e) => setDeliverTo(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div>
                        <label htmlFor="mobileNumber" className="block text-sm mb-1">Phone number</label>
                        <input
                            id="mobileNumber"
                            className="w-full rounded-xl card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600/30"
                            placeholder="(555) 123-4567"
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value)}
                        />
                    </div>

                    <div className="mt-2 rounded-xl card p-3 text-sm card">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-500">Items</span>
                            <span>{items.length}</span>
                        </div>
                        <div className="mt-1 flex items-center justify-between">
                            <span className="text-gray-500">Subtotal</span>
                            <span className="font-semibold">${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-5 flex justify-end gap-2">
                    <button
                        className="inline-flex items-center rounded-xl border border-zinc-400 dark:border-zinc-700
                            px-4 py-2 text-sm hover:bg-zinc-300 dark:hover:bg-zinc-800"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium
                            hover:brightness-110 disabled:opacity-60"
                        onClick={() => m.mutate()}
                        disabled={m.isPending || !items.length}
                    >
                        {m.isPending ? "Placing…" : "Place order"}
                    </button>
                </div>
            </div>
        </div>
    );
}