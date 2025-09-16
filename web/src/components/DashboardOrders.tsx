// src/components/DashboardOrders.tsx
import { useQuery } from "@tanstack/react-query";
import { listOrders } from "../features/orders/api";
import { normOrder } from "../lib/normalize";
import { useState } from "react";
import OrderStatusModal from "./OrderStatusModal";
import { Pencil } from "lucide-react";

const badge = (s:string) => {
    const map:Record<string,string> = {
        pending: "bg-yellow-200 text-yellow-900",
        preparing: "bg-blue-300 text-blue-900",
        "out-for-delivery": "bg-purple-300 text-purple-900",
        delivered: "bg-emerald-300 text-emerald-900"
    };
    return map[s] || "bg-gray-100 text-gray-800";
};

export default function DashboardOrders() {
    const { data, isLoading } = useQuery({ queryKey:["orders"], queryFn: listOrders });
    const orders = (data?.data ?? []).map(normOrder);
    const [open, setOpen] = useState(false);
    const [current, setCurrent] = useState<any | null>(null);

    if (isLoading) return <div className="rounded-2xl card border mt-6 border-zinc-400 dark:border-zinc-800 p-4 shadow-2xl">Loading orders…</div>;

    return (
        <div className="rounded-2xl card mt-6 p-4 shadow-2xl">
            <h3 className="text-2xl md:text-3xl font-semibold mb-3">Orders</h3>
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-left">
                        <th>#</th>
                        <th>Address</th>
                        <th>Phone</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((o:any, i:number)=>{
                        const total = (o.dishes ?? []).reduce((s:number,d:any)=> s + ((d.price ?? 0)*(d.quantity ?? 1)), 0);
                        return (
                            <tr key={o.id} className="border-t border-zinc-400 dark:border-zinc-800">
                                <td className="text-gray-500">{i+1}</td>
                                <td className="truncate max-w-[8ch]">{o.deliverTo}</td>
                                <td className="truncate max-w-[6ch]">{o.mobileNumber}</td>
                                <td className="font-medium">${total}</td>
                                <td><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badge(o.status)}`}>{o.status}</span></td>
                                <td className="text-right">
                                    <button
                                        className="inline-flex items-center gap-1 rounded-xl px-3 py-1.5 my-0.5
                                            text-sm font-medium transition bg-transparent border
                                            border-zinc-400 dark:border-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700"
                                        onClick={()=>{ setCurrent(o); setOpen(true); }}
                                    >
                                        <Pencil size={13}/>
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <OrderStatusModal open={open} onClose={()=>setOpen(false)} order={current} />
        </div>
    );
}