// src/pages/Home.tsx
import Header from "../components/Header";
import DishCard from "../components/DishCard";
import CartPanel from "../components/CartPanel";
import { useQuery } from "@tanstack/react-query";
import { listDishes, type Dish } from "../features/dishes/api";
import { normDish } from "../lib/normalize";

export default function Home() {
    const { data: dishes, isLoading, error } = useQuery<Dish[]>({
        queryKey: ["dishes"],
        queryFn: listDishes,
    });

    const rows = (dishes ?? []).map(normDish);

    return (
        <>
            <Header />
            <main className="max-w-7xl mx-auto px-4 ">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <section className="lg:col-span-3 space-y-4">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-semibold">Menu</h2>
                            <p className="text-sm text-gray-500">Handpicked favorites near you</p>
                        </div>

                        {isLoading && (
                            <div className="rounded-2xl border card p-4 mt-6 shadow-[0_4px_20px_rgba(0,0,0,.06)]">
                            Loading…
                            </div>
                        )}
                        {error && (
                            <div className="rounded-2xl border card p-4 mt-6 shadow-[0_4px_20px_rgba(0,0,0,.06)]">
                            Failed to load
                            </div>
                        )}

                        {/* Show 1 / 2 / 3 / 4 cards as space allows */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {rows.map((dish) => <DishCard key={dish.id} {...dish} />)}
                        </div>
                    </section>
                    <aside className="lg:sticky lg:top-20 h-fit">
                        <CartPanel />
                    </aside>
                </div>
            </main>
        </>
    );
}