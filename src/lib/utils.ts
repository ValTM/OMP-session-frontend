import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function getUserLocales() {
  if (typeof navigator === "undefined") {
    return undefined;
  }
  return navigator.languages.length > 0 ? navigator.languages : navigator.language;
}

export function formatDate(value: string) {
  return new Date(value).toLocaleString(getUserLocales(), {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatDateTimeParts(value: string) {
  const date = new Date(value);
  return {
    date: date.toLocaleDateString(getUserLocales(), { dateStyle: "medium" }),
    time: date.toLocaleTimeString(getUserLocales(), { timeStyle: "short" }),
  };
}

export function compactPath(path: string) {
  return path.replace(/^\/Users\/[^/]+/, "~");
}

export function formatModelLabel(model: string) {
  const trimmed = model.trim();
  const slashIndex = trimmed.lastIndexOf("/");
  if (slashIndex === -1) {
    return trimmed;
  }
  return trimmed.slice(slashIndex + 1);
}

export function formatTokenCount(tokens: number) {
  return new Intl.NumberFormat(getUserLocales(), {
    notation: "compact",
    maximumFractionDigits: tokens >= 1000 ? 1 : 0,
  }).format(tokens);
}

export function formatWholeNumber(value: number) {
  return new Intl.NumberFormat(getUserLocales()).format(value);
}

export function formatCost(value: number) {
  return new Intl.NumberFormat(getUserLocales(), {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value > 0 && value < 0.01 ? 4 : 2,
  }).format(value);
}
