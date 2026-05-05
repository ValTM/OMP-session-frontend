import { Moon, Monitor, Sun } from "lucide-react";

import type { ThemeMode } from "@/hooks/useTheme";
import { Select } from "@/components/ui/select";

interface ThemeToggleProps {
  themeMode: ThemeMode;
  resolvedTheme: "light" | "dark";
  onThemeModeChange: (themeMode: ThemeMode) => void;
}

export function ThemeToggle({ themeMode, resolvedTheme, onThemeModeChange }: ThemeToggleProps) {
  const Icon = themeMode === "system" ? Monitor : resolvedTheme === "dark" ? Moon : Sun;

  return (
    <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
      <Icon className="h-4 w-4" aria-hidden="true" />
      <span className="sr-only">Theme</span>
      <Select
        aria-label="Theme"
        value={themeMode}
        className="h-9 w-36 text-xs"
        onChange={(event) => onThemeModeChange(parseThemeMode(event.target.value))}
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">Sync system</option>
      </Select>
    </label>
  );
}

function parseThemeMode(value: string): ThemeMode {
  if (value === "light" || value === "dark" || value === "system") {
    return value;
  }
  return "system";
}
