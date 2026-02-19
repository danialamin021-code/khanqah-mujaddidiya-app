"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

const STORAGE_KEY = "khanqah-theme";

export type Theme = "light" | "dark" | "system";

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const resolved = theme === "system" ? getSystemTheme() : theme;
  root.setAttribute("data-theme", resolved);
  if (resolved === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "system";
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
  return stored && ["light", "dark", "system"].includes(stored) ? stored : "system";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (theme === "system") applyTheme("system");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  function handleChange(newTheme: Theme) {
    setTheme(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
    applyTheme(newTheme);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => handleChange("light")}
        className={`rounded-lg p-2 transition-colors ${
          theme === "light" ? "bg-light-green/60 text-deep-green" : "text-foreground/60 hover:bg-light-green/40"
        }`}
        aria-pressed={theme === "light"}
        aria-label="Light theme"
      >
        <Sun className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => handleChange("dark")}
        className={`rounded-lg p-2 transition-colors ${
          theme === "dark" ? "bg-light-green/60 text-deep-green" : "text-foreground/60 hover:bg-light-green/40"
        }`}
        aria-pressed={theme === "dark"}
        aria-label="Dark theme"
      >
        <Moon className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => handleChange("system")}
        className={`rounded-lg px-3 py-2 text-sm transition-colors ${
          theme === "system" ? "bg-light-green/60 font-medium text-deep-green" : "text-foreground/60 hover:bg-light-green/40"
        }`}
        aria-pressed={theme === "system"}
      >
        System
      </button>
    </div>
  );
}
