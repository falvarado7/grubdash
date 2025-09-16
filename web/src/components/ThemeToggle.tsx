import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import type { Theme } from "../lib/theme";
import { applyTheme, getSavedTheme, getSystemTheme } from "../lib/theme";

export default function ThemeToggle() {
    const [theme, setTheme] = useState<Theme>(() => getSavedTheme() ?? getSystemTheme());

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    const toggle = () => setTheme(t => (t === "dark" ? "light" : "dark"));

    const isDark = theme === "dark";

    return (
        <button
            type="button"
            onClick={toggle}
            className="inline-flex items-center gap-2 rounded-xl border
                bg-zinc-200 dark:bg-zinc-900 border-zinc-700 dark:border-zinc-500
                 text-black dark:text-white px-3 py-2 text-sm
                 hover:bg-zinc-300 hover:border hover:border-zinc-700 dark:hover:bg-zinc-700 dark:hover:border-zinc-500"
            aria-label="Toggle color theme"
            title={isDark ? "Switch to light" : "Switch to dark"}
        >
            <span className="text-lg leading-none">{isDark ? <Moon /> : <Sun />}</span>
            <span className="hidden sm:inline">{isDark ? "Dark" : "Light"}</span>
        </button>
    );
}