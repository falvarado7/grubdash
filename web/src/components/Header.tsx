import { Link, useLocation } from "react-router-dom";
import { useCart } from "../lib/cart";
import ThemeToggle from "./ThemeToggle";
import { Hamburger, ShoppingCart } from "lucide-react";

export default function Header() {
    const { items, open } = useCart();
    const count = items.reduce((a,b)=>a+b.quantity,0);
    const loc = useLocation();

    return (
        <header className="sticky top-0 z-30 border-b border-zinc-400/70
                dark:border-zinc-800 bg-zinc-200/60
                dark:bg-zinc-900/60 backdrop-blur">
            {/* hero */}
            <div className="relative overflow-hidden">
                {/* background */}
                <div
                    className="absolute inset-0 opacity-15
                        bg-[radial-gradient(black_1px,transparent_1px)] dark:bg-[radial-gradient(white_1px,transparent_1px)]
                        [background-size:18px_18px]"
                />

                {/* content */}
                <div className="relative flex items-center justify-between px-4 py-6">
                    {/* left side */}
                    <div>
                    <Link to="/" className="inline-flex items-center gap-2">
                        <div className="grid place-items-center h-9 w-9 rounded-xl bg-blue-500">
                            <Hamburger size={28} className="text-black dark:text-white"/>
                        </div>
                        <span className="text-3xl md:text-4xl font-extrabold tracking-tight text-black dark:text-white">
                            GrubDash
                        </span>
                    </Link>
                    <p className="mt-1 text-black dark:text-white text-sm md:text-base">
                        Your favorite dishes, delivered fast.
                    </p>
                    </div>

                    {/* right side */}
                    <ThemeToggle />
                </div>
            </div>

            {/* nav */}
            <nav className="sticky top-0 z-30 border-y border-zinc-400/70
                dark:border-zinc-800 bg-zinc-200/60
                dark:bg-zinc-900/60 backdrop-blur">
                <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <NavLink to="/" active={loc.pathname==="/"}>Home</NavLink>
                    <NavLink to="/dashboard" active={loc.pathname==="/dashboard"}>Dashboard</NavLink>
                </div>
                    <button
                        type="button"
                        onClick={open}
                        className="relative inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm
                            border border-zinc-400 dark:border-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700"
                        aria-label="Open cart"
                    >
                        <ShoppingCart size={18} />
                        {count > 0 && (
                            <span className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full bg-blue-600 text-xs grid place-items-center px-1">
                                {count}
                            </span>
                        )}
                        <span className="hidden sm:inline">Cart</span>
                    </button>
                </div>
            </nav>
        </header>
    );
    }

function NavLink({ to, active, children }:{to:string; active:boolean; children:React.ReactNode}) {
    return (
        <Link
            to={to}
            className={`px-3 py-1 rounded-lg transition
                ${active ?
                    "bg-zinc-300 dark:bg-zinc-700 border border-zinc-400 dark:border-zinc-800" :
                    "hover:bg-zinc-300 hover:border hover:border-zinc-400 dark:hover:bg-zinc-700 dark:hover:border-zinc-800"}`}
        >
            {children}
        </Link>
    );
    }