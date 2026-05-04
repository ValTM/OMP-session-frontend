import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
});

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  timeStyle: "short",
});

export function formatDate(value: string) {
  return dateTimeFormatter.format(new Date(value));
}

export function formatDateTimeParts(value: string) {
  const date = new Date(value);
  return {
    date: dateFormatter.format(date),
    time: timeFormatter.format(date),
  };
}

export function compactPath(path: string) {
  return path.replace(/^\/Users\/[^/]+/, "~");
}
