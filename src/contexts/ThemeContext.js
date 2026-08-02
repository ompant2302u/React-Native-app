import { createContext, useContext, useMemo, useState } from "react";

const palettes = {
  light: {
    bg: "#f4f5f7",
    surface: "#ffffff",
    primary: "#2563eb",
    text: "#111827",
    textMuted: "#6b7280",
    textFaint: "#9ca3af",
    border: "#e5e7eb",
    tagBg: "#e0e7ff",
    tagText: "#3730a3",
    danger: "#dc2626",
    favourite: "#f59e0b",
  },
  dark: {
    bg: "#0f1115",
    surface: "#1a1d24",
    primary: "#60a5fa",
    text: "#f3f4f6",
    textMuted: "#9ca3af",
    textFaint: "#6b7280",
    border: "#2b3138",
    tagBg: "#1e293b",
    tagText: "#93c5fd",
    danger: "#f87171",
    favourite: "#fbbf24",
  },
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState("light");

  const toggle = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  const value = useMemo(() => {
    return { mode, toggle, colors: palettes[mode], isDark: mode === "dark" };
  }, [mode]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
