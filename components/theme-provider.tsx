"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  useCallback,
  useSyncExternalStore,
  ReactNode,
} from "react";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export type Theme = "light" | "dark" | "system";

interface ThemeProviderState {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
}

const STORAGE_KEY = "consultorio-theme";

const ThemeContext = createContext<ThemeProviderState | undefined>(undefined);

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function subscribeToSystemTheme(callback: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function resolveTheme(theme: Theme, systemTheme: "light" | "dark"): "light" | "dark" {
  if (theme === "system") return systemTheme;
  return theme;
}

function applyTheme(resolved: "light" | "dark") {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(resolved);
  document.body.classList.remove("light", "dark");
  document.body.classList.add(resolved);
}

function readStoredTheme(fallback: Theme): Theme {
  if (typeof window === "undefined") return fallback;
  try {
    const value = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (value === "light" || value === "dark" || value === "system") return value;
    return fallback;
  } catch {
    return fallback;
  }
}

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  attribute?: "class";
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  attribute = "class",
}: ThemeProviderProps) {
  const systemTheme = useSyncExternalStore<"light" | "dark">(
    subscribeToSystemTheme,
    getSystemTheme,
    () => "light"
  );
  const [theme, setThemeState] = useState<Theme>(() =>
    readStoredTheme(defaultTheme)
  );
  const resolvedTheme = resolveTheme(theme, systemTheme);
  const pathname = usePathname();

  useIsomorphicLayoutEffect(() => {
    if (attribute === "class") {
      applyTheme(resolvedTheme);
    }
  }, [resolvedTheme, pathname, attribute]);

  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      if (attribute === "class" && !root.classList.contains(resolvedTheme)) {
        applyTheme(resolvedTheme);
      }
    });

    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [resolvedTheme, attribute]);

  const setTheme = useCallback((next: Theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage may be disabled in private mode; ignore.
    }
    setThemeState(next);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeProviderState {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export function useResolvedTheme(): "light" | "dark" {
  const context = useContext(ThemeContext);
  return context?.resolvedTheme ?? "light";
}
