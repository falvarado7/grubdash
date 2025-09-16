// src/components/DashboardDishes.tsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listDishes, type Dish } from "../features/dishes/api";
import { normDish } from "../lib/normalize";
import DishModal from "./DishModal";
import { Pencil } from "lucide-react";

export default function DashboardDishes() {
    const { data: dishes, isLoading } = useQuery<Dish[]>({
        queryKey: ["dishes"],
        queryFn: listDishes,
    });

    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<any | undefined>(undefined);

    if (isLoading) {
        return (
            <div className="rounded-2xl border card p-4 shadow-2xl mt-6">
                Loading dishes…
            </div>
        );
    }

    const rows = (dishes ?? []).map(normDish);

    return (
        <div className="rounded-2xl card p-4 shadow-2xl mt-6">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-2xl md:text-3xl font-semibold">Dishes</h3>
                <button
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition
                            bg-blue-600 hover:brightness-110 active:brightness-95
                            shadow-[0_6px_24px_rgba(59,130,246,.25)]"
                onClick={() => {
                    setEditing(undefined);
                    setOpen(true);
                }}
                >
                + Create Dish
                </button>
            </div>

            <table className="w-full text-sm">
                <thead>
                    <tr className="text-left">
                        <th>#</th>
                        <th>Dish</th>
                        <th>Description</th>
                        <th>Price</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((d: any, i: number) => (
                        <tr key={d.id} className="border-t border-zinc-400 dark:border-zinc-800">
                        <td className=" text-gray-500">
                            {i + 1}
                        </td>
                        <td className="truncate max-w-[10ch]">
                            {d.name}
                        </td>
                        <td className=" text-gray-600 truncate max-w-[12ch]">
                            {d.description}
                        </td>
                        <td>${d.price}</td>
                        <td className="text-right">
                            <button
                                className="inline-flex items-center gap-1 rounded-xl px-3 py-1.5 my-0.5
                                    text-sm font-medium transition bg-transparent border
                                  border-zinc-400 dark:border-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700"
                                onClick={() => {
                                    setEditing(d);
                                    setOpen(true);
                                }}
                            >
                                <Pencil size={13}/>
                                Edit
                            </button>
                        </td>
                        </tr>
                    ))}
                {!rows.length && (
                    <tr>
                        <td colSpan={5} className="py-8 text-center text-muted-foreground">
                            No dishes yet. Click “Create Dish” to add your first one.
                        </td>
                    </tr>
                )}
                </tbody>
            </table>

            <DishModal open={open} initial={editing} onClose={() => setOpen(false)} />
        </div>
    );
}