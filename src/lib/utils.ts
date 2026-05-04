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
