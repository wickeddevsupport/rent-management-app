import { format } from "date-fns";

const BS_MONTHS = ["Baisakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin", "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"];

function approximateBsParts(input: Date) {
  const year = input.getFullYear();
  const month = input.getMonth() + 1;
  const day = input.getDate();

  const boundaries = [
    { month: 1, day: 15, bsMonthIndex: 9, yearOffset: 56 },
    { month: 2, day: 13, bsMonthIndex: 10, yearOffset: 56 },
    { month: 3, day: 15, bsMonthIndex: 11, yearOffset: 56 },
    { month: 4, day: 14, bsMonthIndex: 0, yearOffset: 57 },
    { month: 5, day: 15, bsMonthIndex: 1, yearOffset: 57 },
    { month: 6, day: 15, bsMonthIndex: 2, yearOffset: 57 },
    { month: 7, day: 16, bsMonthIndex: 3, yearOffset: 57 },
    { month: 8, day: 17, bsMonthIndex: 4, yearOffset: 57 },
    { month: 9, day: 17, bsMonthIndex: 5, yearOffset: 57 },
    { month: 10, day: 18, bsMonthIndex: 6, yearOffset: 57 },
    { month: 11, day: 17, bsMonthIndex: 7, yearOffset: 57 },
    { month: 12, day: 16, bsMonthIndex: 8, yearOffset: 57 },
  ];

  const currentBoundary = boundaries.find((entry) => entry.month === month);
  if (!currentBoundary) {
    return { monthName: BS_MONTHS[0], year: year + 57 };
  }

  if (day >= currentBoundary.day) {
    return { monthName: BS_MONTHS[currentBoundary.bsMonthIndex], year: year + currentBoundary.yearOffset };
  }

  const previousBoundary = boundaries[(boundaries.findIndex((entry) => entry.month === month) + 11) % 12];
  return { monthName: BS_MONTHS[previousBoundary.bsMonthIndex], year: year + previousBoundary.yearOffset };
}

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

export function bsMonthLabelFromDate(value: Date | string | null | undefined) {
  const date = value ? new Date(value) : new Date();
  const parts = approximateBsParts(date);
  return `${parts.monthName} ${parts.year}`;
}

export function bsDate(value: Date | string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  const parts = approximateBsParts(date);
  return `${parts.monthName} ${parts.year} · ${format(date, "dd MMM yyyy")}`;
}

export function monthLabel(month: number, year: number) {
  return format(new Date(year, month - 1, 1), "MMMM yyyy");
}

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}
