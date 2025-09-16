export type Theme = "light" | "dark";

const KEY = "theme";

export function getSavedTheme(): Theme | null {
    try {
        const v = localStorage.getItem(KEY);
        return v === "light" || v === "dark" ? v : null;
    } catch {
        return null;
    }
}

export function getSystemTheme(): Theme {
    if (typeof window === "undefined") return "light";
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
    return prefersDark ? "dark" : "light";
}

export function applyTheme(theme: Theme) {
    const isDark = theme === "dark";
    document.documentElement.classList.toggle("dark", isDark);
    try {
        localStorage.setItem(KEY, theme);
    } catch {}
}

/** Call once before React renders */
export function initTheme() {
    const saved = getSavedTheme();
    const theme = saved ?? getSystemTheme();
    applyTheme(theme);
}