// src/components/OrderStatusModal.tsx
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateOrder, deleteOrder } from "../features/orders/api";
import { toast } from "sonner";
import { createPortal } from "react-dom";

type Dish = { id?: number; name?: string; price?: number; quantity?: number };

type Order = {
    id: number;
    deliverTo: string;
    mobileNumber: string;
    status: string;
    dishes?: Dish[];
};

export default function OrderStatusModal({
    open,
    onClose,
    order,
}: {
    open: boolean;
    onClose: () => void;
    order: Order | null;
}) {
    const root = document.body;
    if (!open || !order) return null;
    return createPortal(<Panel onClose={onClose} order={order} />, root);
}

function Panel({ onClose, order }: { onClose: () => void; order: Order }) {
    const statuses = useMemo(
        () => ["pending", "preparing", "out-for-delivery", "delivered"],
        []
    );

    // local state
    const [status, setStatus] = useState(order.status ?? "pending");
    const [dishes, setDishes] = useState<Dish[]>(order.dishes ?? []);

    // Decide when editing items is allowed (you can relax this if you want)
    const itemsEditable = status !== "delivered";

    useEffect(() => {
        setStatus(order.status ?? "pending");
        setDishes(order.dishes ?? []);
        const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onEsc);
        return () => window.removeEventListener("keydown", onEsc);
    }, [order, onClose]);

    const qc = useQueryClient();

    // Helpers to manipulate quantities
    const clampInt = (n: number) => {
        // integers >= 1 only
        if (!Number.isFinite(n)) return 1;
        n = Math.floor(n);
        return n < 1 ? 1 : n;
    };

    const setQty = (index: number, next: number) => {
        setDishes((prev) => {
            const copy = [...prev];
            copy[index] = { ...copy[index], quantity: clampInt(next) };
        return copy;
        });
    };

    const decQty = (index: number) => {
        setDishes((prev) => {
            const copy = [...prev];
            const current = clampInt(Number(copy[index]?.quantity ?? 1));
            copy[index] = { ...copy[index], quantity: Math.max(1, current - 1) };
        return copy;
        });
    };

    const incQty = (index: number) => {
        setDishes((prev) => {
            const copy = [...prev];
            const current = clampInt(Number(copy[index]?.quantity ?? 1));
            copy[index] = { ...copy[index], quantity: current + 1 };
        return copy;
        });
    };

    const total =
        dishes.reduce(
            (s, d) => s + (Number(d.price ?? 0) * clampInt(Number(d.quantity ?? 1))),
            0
        ) ?? 0;

    const save = useMutation({
        mutationFn: async () => {
            if (!statuses.includes(status)) {
                throw new Error(
                    "Order must have a status of pending, preparing, out-for-delivery, delivered."
                );
            }
            if (!dishes.length) {
                throw new Error("Order must include at least one dish.");
            }

            return updateOrder(order.id, {
                deliverTo: order.deliverTo,
                mobileNumber: order.mobileNumber,
                status,
                dishes: (dishes ?? []).map(d => ({
                    id: d.id,
                    name: d.name ?? "Item",
                    price: Number(d.price ?? 0),
                    quantity: Math.max(1, Number(d.quantity ?? 1)),
                })),
            });
        },
    onSuccess: () => {
        toast.success("Order updated");
        qc.invalidateQueries({ queryKey: ["orders"] });
        onClose();
    },
    onError: (e: any) =>
        toast.error(e?.response?.data?.error ?? e?.message ?? "Failed to update order"),
    });

    const remove = useMutation({
        mutationFn: async () => deleteOrder(order.id), // backend forbids deleting non-pending orders
        onSuccess: () => {
            toast.success("Order deleted");
            qc.invalidateQueries({ queryKey: ["orders"] });
            onClose();
        },
        onError: (e: any) =>
        toast.error(e?.response?.data?.error ?? e?.message ?? "Failed to delete order"),
    });

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center">
            {/* overlay */}
            <div
                className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* panel */}
            <div
                className="relative z-[1001] w-full max-w-lg rounded-2xl bg-zinc-200 dark:bg-zinc-800 p-5 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="order-edit-title"
            >
                <div className="mb-4 flex items-center justify-between">
                    <h3 id="order-edit-title" className="text-xl font-semibold">
                        Edit Order
                    </h3>
                    <button
                        className="rounded-md px-2 py-1 text-sm hover:bg-zinc-300 dark:hover:bg-zinc-700"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <div className="text-gray-500">Address</div>
                            <div className="font-medium">{order.deliverTo}</div>
                        </div>
                        <div>
                            <div className="text-gray-500">Phone</div>
                            <div className="font-medium">{order.mobileNumber}</div>
                        </div>
                        <div>
                            <div className="text-gray-500">Total</div>
                            <div className="font-medium">${total}</div>
                        </div>
                        <div>
                            <div className="text-gray-500 mb-1">Status</div>
                            <select
                                className="w-full rounded-xl border border-zinc-400 dark:border-zinc-700
                                    bg-zinc-300 dark:bg-zinc-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-600/50"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                {statuses.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {!!dishes.length && (
                        <div className="mt-2">
                            <div className="text-gray-500 mb-1">Items</div>
                            <ul className="max-h-56 overflow-auto space-y-2 pr-1">
                                {dishes.map((d, i) => {
                                    const line = Number(d.price ?? 0) * clampInt(Number(d.quantity ?? 1));
                                    return (
                                        <li
                                            key={i}
                                            className="flex items-center justify-between gap-3
                                                rounded-lg border border-zinc-400 dark:border-zinc-700 px-3 py-2"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <div className="truncate font-medium">{d.name}</div>
                                                <div className="text-xs text-gray-500">${d.price} each</div>
                                            </div>

                                            {/* qty editor */}
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    className="h-8 w-8 rounded-md border border-zinc-400 dark:border-zinc-700
                                                        hover:bg-zinc-300 dark:hover:bg-zinc-700 disabled:opacity-50"
                                                    onClick={() => decQty(i)}
                                                    disabled={!itemsEditable}
                                                    aria-label="Decrease quantity"
                                                >
                                                −
                                                </button>
                                                <input
                                                    type="number"
                                                    inputMode="numeric"
                                                    className="w-14 rounded-md border border-zinc-400 dark:border-zinc-700 px-2 py-1 text-center
                                                        outline-none focus:ring-2 focus:ring-blue-600/50 disabled:opacity-50
                                                        bg-zinc-200 dark:bg-zinc-800"
                                                    value={clampInt(Number(d.quantity ?? 1))}
                                                    onChange={(e) => setQty(i, Number(e.target.value))}
                                                    onBlur={(e) => setQty(i, Number(e.target.value))}
                                                    min={1}
                                                    disabled={!itemsEditable}
                                                />
                                                <button
                                                    type="button"
                                                    className="h-8 w-8 rounded-md border border-zinc-400 dark:border-zinc-700
                                                        hover:bg-zinc-300 dark:hover:bg-zinc-700 disabled:opacity-50"
                                                    onClick={() => incQty(i)}
                                                    disabled={!itemsEditable}
                                                    aria-label="Increase quantity"
                                                >
                                                +
                                                </button>
                                            </div>

                                            <div className="w-20 text-right font-medium">${line}</div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="mt-5 flex justify-between">
                    <button
                        className="inline-flex items-center rounded-xl border border-red-500/60
                                bg-red-500/10 px-4 py-2 text-sm text-red-600 hover:bg-red-500/15
                                disabled:opacity-50"
                        onClick={() => {
                            const ok = window.confirm(
                            `Delete order ${order.id}? This cannot be undone.`
                            );
                            if (ok) remove.mutate();
                        }}
                        disabled={remove.isPending}
                        title="Delete order"
                    >
                        {remove.isPending ? "Deleting…" : "Delete"}
                    </button>

                    <div className="flex gap-2">
                        <button
                            className="inline-flex items-center rounded-xl border border-zinc-400
                                dark:border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-300 dark:hover:bg-zinc-700"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2 text-sm
                                font-medium hover:bg-blue-700 disabled:opacity-60"
                            onClick={() => save.mutate()}
                            disabled={save.isPending}
                        >
                            {save.isPending ? "Saving…" : "Save"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}