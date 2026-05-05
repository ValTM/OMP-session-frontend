import { useEffect, useState } from "react";

export type ThemeMode = "light" | "dark" | "system";

type ResolvedTheme = "light" | "dark";

const THEME_STORAGE_KEY = "omp-session-viewer-theme";
const DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)";

export function useTheme() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(readStoredThemeMode);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => resolveTheme(themeMode));

  useEffect(() => {
    writeStoredThemeMode(themeMode);

    const mediaQuery = getThemeMediaQuery();
    function applyTheme() {
      const nextResolvedTheme = resolveTheme(themeMode, mediaQuery?.matches);
      document.documentElement.classList.toggle("dark", nextResolvedTheme === "dark");
      document.documentElement.dataset.theme = themeMode;
      setResolvedTheme(nextResolvedTheme);
    }

    applyTheme();
    if (themeMode !== "system" || !mediaQuery) {
      return;
    }

    mediaQuery.addEventListener("change", applyTheme);
    return () => mediaQuery.removeEventListener("change", applyTheme);
  }, [themeMode]);

  return { themeMode, resolvedTheme, setThemeMode };
}

function readStoredThemeMode(): ThemeMode {
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }
  return "system";
}

function writeStoredThemeMode(themeMode: ThemeMode) {
  window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);
}

function resolveTheme(themeMode: ThemeMode, systemPrefersDark?: boolean): ResolvedTheme {
  if (themeMode !== "system") {
    return themeMode;
  }
  const prefersDark = systemPrefersDark ?? getThemeMediaQuery()?.matches ?? false;
  return prefersDark ? "dark" : "light";
}

function getThemeMediaQuery() {
  if (typeof window.matchMedia !== "function") {
    return null;
  }
  return window.matchMedia(DARK_MEDIA_QUERY);
}
