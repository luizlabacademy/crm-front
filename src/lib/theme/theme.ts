export type ThemeMode = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "crm_theme";

function systemPrefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function getStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "system";
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }
  return "system";
}

export function applyTheme(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const isDark = mode === "dark" || (mode === "system" && systemPrefersDark());
  root.classList.toggle("dark", isDark);
}

export function setTheme(mode: ThemeMode) {
  if (typeof window !== "undefined") {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  }
  applyTheme(mode);
}
