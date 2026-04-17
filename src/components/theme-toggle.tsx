"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "rent-app-theme";

type ThemeMode = "light" | "dark";

function applyTheme(theme: ThemeMode) {
  document.documentElement.setAttribute("data-theme", theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const nextTheme: ThemeMode = stored === "dark" ? "dark" : "light";
    setTheme(nextTheme);
    applyTheme(nextTheme);
    setReady(true);
  }, []);

  function toggleTheme() {
    const nextTheme: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="theme-toggle inline-flex h-11 items-center gap-2 rounded-2xl border border-white/12 bg-white/8 px-3 text-sm font-semibold text-white transition hover:bg-white/14"
      aria-label={ready ? `Switch to ${theme === "dark" ? "light" : "dark"} mode` : "Toggle theme"}
      title={ready ? `Switch to ${theme === "dark" ? "light" : "dark"} mode` : "Toggle theme"}
    >
      <span className="text-base leading-none">{theme === "dark" ? "☀️" : "🌙"}</span>
      <span>{theme === "dark" ? "Light" : "Dark"}</span>
    </button>
  );
}
