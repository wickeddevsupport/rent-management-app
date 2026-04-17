import { format } from "date-fns";

export function money(value: number) {
  return new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function shortDate(value: Date | string | null | undefined) {
  if (!value) return "—";
  return format(new Date(value), "dd MMM yyyy");
}

export function monthLabel(month: number, year: number) {
  return format(new Date(year, month - 1, 1), "MMMM yyyy");
}

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}
