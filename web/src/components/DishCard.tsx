// src/components/DishCard.tsx
import { useState } from "react";
import { useCart } from "../lib/cart";
import DishModal from "./DishModal";

export default function DishCard({ id, name, description, price, image_url }:{
    id:number; name:string; description?:string; price?:number; image_url?:string;
}) {
    const cart = useCart();
    const [open, setOpen] = useState(false);

    return (
        <>
            <article
                className="card rounded-2xl border shadow-2xl
                         p-3
                        transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(0,0,0,.08)]"
            >
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
                    <img src={image_url} alt={name} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 rounded-full bg-black/80 text-white text-xs px-3 py-1">
                        ${price}
                    </div>
                </div>

                <div className="mt-3">
                    <h3 className="text-lg font-semibold leading-tight whitespace-nowrap">{name}</h3>
                        {description && <p className="mt-1 text-sm text-gray-600 line-clamp-2 md:h-12 sm:h-12">{description}</p>}
                </div>

                <div className="mt-3 flex items-center gap-2">
                    <button
                        className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition
                                bg-blue-600 hover:brightness-110 active:brightness-95
                                shadow-[0_6px_24px_rgba(59,130,246,.25)]"
                        onClick={()=> cart.add({ id, name, description, image_url, price }, 1)}
                    >
                        Add to cart
                    </button>
                    <button
                        className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition
                            border border-zinc-400 hover:bg-zinc-300"
                        onClick={()=> setOpen(true)}
                    >
                        Details
                    </button>
                </div>
            </article>

            <DishModal
                open={open}
                onClose={()=> setOpen(false)}
                readOnly
                initial={{ id, name, description, image_url, price }}
                onAddToCart={(dish) => cart.add(dish, 1)}
            />
        </>
    );
}