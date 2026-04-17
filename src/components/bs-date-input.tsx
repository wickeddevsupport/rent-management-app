"use client";

import { useEffect, useMemo, useState } from "react";
import { bsPartsToAdIso, cn, getBsDayOptions, getBsMonths, getBsYears, toBsFormParts, type BsFormParts } from "@/lib/format";

const inputClassName = "h-12 rounded-2xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100";

export function BsDateInput({
  name,
  defaultValue,
  required,
  className,
}: {
  name: string;
  defaultValue?: Date | string | null;
  required?: boolean;
  className?: string;
}) {
  const initial = useMemo(() => toBsFormParts(defaultValue), [defaultValue]);
  const [parts, setParts] = useState<BsFormParts>(initial);

  useEffect(() => {
    setParts(initial);
  }, [initial]);

  const months = useMemo(() => getBsMonths(), []);
  const years = useMemo(() => getBsYears(), []);
  const dayOptions = useMemo(() => getBsDayOptions(parts.year, parts.monthIndex), [parts.year, parts.monthIndex]);

  useEffect(() => {
    const maxDay = dayOptions[dayOptions.length - 1] ?? 30;
    if (parts.day > maxDay) {
      setParts((current) => ({ ...current, day: maxDay }));
    }
  }, [dayOptions, parts.day]);

  const adIso = useMemo(() => bsPartsToAdIso(parts), [parts]);

  return (
    <div className={cn("space-y-3", className)}>
      <input type="hidden" name={name} value={adIso} readOnly required={required} />
      <div className="grid grid-cols-3 gap-3">
        <select
          aria-label="BS year"
          className={inputClassName}
          value={parts.year}
          onChange={(event) => setParts((current) => ({ ...current, year: Number(event.target.value) }))}
        >
          {years.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>

        <select
          aria-label="BS month"
          className={inputClassName}
          value={parts.monthIndex}
          onChange={(event) => setParts((current) => ({ ...current, monthIndex: Number(event.target.value) }))}
        >
          {months.map((month) => (
            <option key={month.monthIndex} value={month.monthIndex}>{month.label}</option>
          ))}
        </select>

        <select
          aria-label="BS day"
          className={inputClassName}
          value={parts.day}
          onChange={(event) => setParts((current) => ({ ...current, day: Number(event.target.value) }))}
        >
          {dayOptions.map((day) => (
            <option key={day} value={day}>{day}</option>
          ))}
        </select>
      </div>
      <p className="text-xs font-medium text-slate-500">BS date</p>
    </div>
  );
}
