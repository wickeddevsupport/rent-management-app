import { format } from "date-fns";
import NepaliDate, { dateConfigMap } from "nepali-date-converter";

const BS_MONTHS = ["Baisakh", "Jestha", "Asar", "Shrawan", "Bhadra", "Aswin", "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"] as const;

export type BsFormParts = {
  year: number;
  monthIndex: number;
  day: number;
};

function normalizeDate(value: Date | string | null | undefined) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toNepaliDate(value: Date | string | null | undefined) {
  const date = normalizeDate(value);
  return date ? NepaliDate.fromAD(date) : null;
}

export function money(value: number) {
  return new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function shortDate(value: Date | string | null | undefined) {
  const bs = toNepaliDate(value);
  return bs ? bs.format("DD MMMM YYYY") : "—";
}

export function bsMonthLabelFromDate(value: Date | string | null | undefined) {
  const bs = toNepaliDate(value);
  return bs ? bs.format("MMMM YYYY") : "—";
}

export function bsMonthLabelFromMonthYear(month: number, year: number) {
  return bsMonthLabelFromDate(new Date(year, month - 1, 1));
}

export function bsDate(value: Date | string | null | undefined) {
  const bs = toNepaliDate(value);
  return bs ? bs.format("DD MMMM YYYY") : "—";
}

export function monthLabel(month: number, year: number) {
  return bsMonthLabelFromMonthYear(month, year);
}

export function toIsoDate(value: Date | string | null | undefined) {
  const date = normalizeDate(value);
  return date ? format(date, "yyyy-MM-dd") : "";
}

export function toBsFormParts(value: Date | string | null | undefined): BsFormParts {
  const bs = toNepaliDate(value) || new NepaliDate();
  return {
    year: bs.getYear(),
    monthIndex: bs.getMonth(),
    day: bs.getDate(),
  };
}

export function getBsYears() {
  return Object.keys(dateConfigMap)
    .map((year) => Number(year))
    .sort((a, b) => a - b);
}

export function getBsMonths() {
  return BS_MONTHS.map((label, monthIndex) => ({ label, monthIndex }));
}

export function getBsDaysInMonth(year: number, monthIndex: number) {
  const yearConfig = dateConfigMap[String(year)] as Record<string, number> | undefined;
  const monthName = BS_MONTHS[monthIndex] as string | undefined;
  if (!yearConfig || !monthName) return 32;
  return yearConfig[monthName] ?? 32;
}

export function getBsDayOptions(year: number, monthIndex: number) {
  const days = getBsDaysInMonth(year, monthIndex);
  return Array.from({ length: days }, (_, index) => index + 1);
}

export function bsPartsToAdIso({ year, monthIndex, day }: BsFormParts) {
  return format(new NepaliDate(year, monthIndex, day).toJsDate(), "yyyy-MM-dd");
}

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}
