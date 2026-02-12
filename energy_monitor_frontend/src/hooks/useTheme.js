import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);

const STORAGE_KEY = "energy_monitor.theme";

// PUBLIC_INTERFACE
export function ThemeProvider({ children }) {
  /** Provides theme selection (retro dark variants). */
  const [theme, setTheme] = useState("neon"); // "neon" | "amber"

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setTheme(raw);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  // Keep it simple: attach theme as data attribute (CSS can use it if extended).
  useEffect(() => {
    document.documentElement.setAttribute("data-retro-theme", theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    /** Toggle between neon and amber themes. */
    setTheme((t) => (t === "neon" ? "amber" : "neon"));
  };

  const value = useMemo(() => ({ theme, toggleTheme }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// PUBLIC_INTERFACE
export function useTheme() {
  /** Access theme context. */
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within <ThemeProvider>.");
  return ctx;
}
