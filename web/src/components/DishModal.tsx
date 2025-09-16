// src/components/DishModal.tsx
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDish, updateDish, deleteDish } from "../features/dishes/api";
import { toast } from "sonner";

type DishLite = {
    id?: number;
    name?: string;
    description?: string;
    image_url?: string;
    price?: number;
};

type Props = {
    open: boolean;
    onClose: () => void;
    initial?: DishLite;
    readOnly?: boolean;
    onAddToCart?: (dish: Required<DishLite>) => void;
};

export default function DishModal({
    open,
    onClose,
    initial,
    readOnly = false,
    onAddToCart,
}: Props) {
    if (!open) return null;
    return createPortal(
        <Panel onClose={onClose} initial={initial} readOnly={readOnly} onAddToCart={onAddToCart} />,
        document.body
    );
}

function Panel({
    onClose,
    initial,
    readOnly,
    onAddToCart,
}: Required<Pick<Props, "onClose" | "readOnly">> & Pick<Props, "initial" | "onAddToCart">) {
    const [name, setName] = useState(initial?.name ?? "");
    const [description, setDescription] = useState(initial?.description ?? "");
    const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
    const [price, setPrice] = useState<number>(initial?.price ?? 0);

    useEffect(() => {
        setName(initial?.name ?? "");
        setDescription(initial?.description ?? "");
        setImageUrl(initial?.image_url ?? "");
        setPrice(initial?.price ?? 0);
        if (!readOnly) {
            // focus first input after paint
            setTimeout(() => document.getElementById("dish-name")?.focus(), 0);
        }
    }, [initial, readOnly]);

    const qc = useQueryClient();

    // Save (create/update)
    const save = useMutation({
        mutationFn: async () => {
            const payload = { name, description, image_url: imageUrl, price };
            return initial?.id ? updateDish(initial.id, payload) : createDish(payload);
        },
        onSuccess: (saved: any) => {
            toast.success(`Saved ${saved?.data?.name ?? saved?.name ?? "dish"}`);
            qc.invalidateQueries({ queryKey: ["dishes"] });
            onClose();
        },
        onError: (e: any) =>
            toast.error(e?.response?.data?.error ?? e?.message ?? "Failed to save dish"),
    });

    // Delete (only in edit mode)
    const del = useMutation({
        mutationFn: async () => {
            if (!initial?.id) return;
            await deleteDish(initial.id);
        },
        onSuccess: () => {
            toast.success("Dish deleted");
            qc.invalidateQueries({ queryKey: ["dishes"] });
            onClose();
        },
        onError: (e: any) =>
            toast.error(e?.response?.data?.error ?? e?.message ?? "Failed to delete dish"),
    });

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") onClose();
    };

    const isSaving = (save as any).isPending ?? (save as any).isLoading;
    const isDeleting = (del as any).isPending ?? (del as any).isLoading;

    return (
        <div
            className="fixed inset-0 z-[1000] flex items-center justify-center"
            onKeyDown={onKeyDown}
            role="dialog"
            aria-modal="true"
        >
        <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
        />

            {/* panel */}
            <div
                className="relative z-[1001] w-full max-w-lg rounded-2xl p-5 shadow-2xl
                        bg-zinc-200 dark:bg-zinc-800 border border-zinc-400 dark:border-zinc-700"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-xl font-semibold">
                        {readOnly ? "Dish Details" : initial?.id ? "Edit Dish" : "Create Dish"}
                    </h3>
                    <button
                        className="rounded-md px-2 py-1 text-sm hover:bg-zinc-300 dark:hover:bg-zinc-700"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                {/* Image */}
                {imageUrl && (
                    <img
                        src={imageUrl}
                        alt={name}
                        className="w-full h-48 object-cover rounded-xl mb-4"
                    />
                )}

                <div className="space-y-3">
                    {/* Name */}
                    {readOnly ? (
                        <Field label="Name">
                            <Box>{name}</Box>
                        </Field>
                    ) : (
                        <Field label="Name">
                            <input
                                id="dish-name"
                                className="w-full rounded-xl border border-zinc-400 dark:border-zinc-700
                                        px-2 py-2 text-sm outline-none
                                        focus:ring-2 focus:ring-blue-600/30 card"
                                placeholder="Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </Field>
                    )}

                    {/* Description */}
                    {readOnly ? (
                        <Field label="Description">
                            <Box className="min-h-[3rem]">{description}</Box>
                        </Field>
                    ) : (
                        <Field label="Description">
                            <textarea
                                className="h-24 w-full rounded-xl border border-zinc-400 dark:border-zinc-700
                                        px-2 py-2 text-sm outline-none card
                                        focus:ring-2 focus:ring-blue-600/30"
                                placeholder="Description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </Field>
                    )}

                    {/* Image URL (edit only) */}
                    {!readOnly && (
                        <Field label="Image URL">
                            <input
                                className="w-full rounded-xl border border-zinc-400 dark:border-zinc-700
                                        px-2 py-2 text-sm outline-none card
                                        focus:ring-2 focus:ring-blue-600/30"
                                placeholder="Image URL"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                            />
                        </Field>
                    )}

                    {/* Price */}
                    {readOnly ? (
                        <Field label="Price">
                            <Box>{price}</Box>
                        </Field>
                    ) : (
                        <Field label="Price">
                            <input
                                type="number"
                                className="w-full rounded-xl border border-zinc-400 dark:border-zinc-700
                                        px-2 py-2 text-sm outline-none card
                                        focus:ring-2 focus:ring-blue-600/30"
                                placeholder="Price (integer)"
                                value={Number.isNaN(price) ? "" : price}
                                onChange={(e) => setPrice(Number(e.target.value))}
                            />
                        </Field>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-5 flex justify-between">
                    {/* Delete (only when editing) */}
                    {!readOnly && initial?.id ? (
                        <button
                        className="inline-flex items-center rounded-xl border border-red-500/60
                                    bg-red-500/10 px-4 py-2 text-sm text-red-600 hover:bg-red-500/15
                                    disabled:opacity-50"
                        onClick={() => {
                            if (confirm("Delete this dish? This cannot be undone.")) del.mutate();
                        }}
                        disabled={isDeleting}
                        >
                        {isDeleting ? "Deleting…" : "Delete"}
                        </button>
                    ) : (
                        <span />
                    )}

                    <div className="flex gap-2">
                        {readOnly ? (
                            <>
                                <button
                                    className="inline-flex items-center rounded-xl border
                                        border-zinc-400 dark:border-zinc-700 px-4 py-2 text-sm
                                        hover:bg-zinc-300 dark:hover:bg-zinc-700"
                                    onClick={onClose}
                                >
                                    Close
                                </button>
                                {onAddToCart && (
                                    <button
                                        className="inline-flex items-center rounded-xl bg-blue-600 px-4
                                            py-2 text-sm font-medium text-white hover:bg-blue-700
                                            disabled:opacity-60"
                                        onClick={() => {
                                            if (!initial?.id || !name || !imageUrl || !Number.isFinite(price)) return;
                                            onAddToCart({
                                                id: initial.id!,
                                                name: name!,
                                                description,
                                                image_url: imageUrl,
                                                price: price!,
                                            });
                                            onClose();
                                        }}
                                        disabled={!initial?.id || !name || !imageUrl || !Number.isFinite(price)}
                                    >
                                        Add to cart
                                    </button>
                                )}
                            </>
                        ) : (
                            <>
                                <button
                                    className="inline-flex items-center rounded-xl border
                                        border-zinc-400 dark:border-zinc-700 px-4 py-2 text-sm
                                        hover:bg-zinc-300 dark:hover:bg-zinc-700"
                                    onClick={onClose}
                                    disabled={isSaving || isDeleting}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2
                                        text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                                    onClick={() => (save as any).mutate()}
                                    disabled={isSaving || isDeleting}
                                >
                                    {isSaving ? "Saving…" : "Save"}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <p className="pl-2 text-sm opacity-80">{label}</p>
            {children}
        </div>
    );
}
function Box({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div
            className={`rounded-xl border border-zinc-400 dark:border-zinc-700
                px-2 py-2 text-sm ${className}`}
        >
            {children}
        </div>
    );
}