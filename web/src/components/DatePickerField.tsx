"use client";

import { useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { Calendar } from "lucide-react";

type Props = {
  value: string; // DD-MM-YYYY
  onChange: (dmy: string) => void;
  error?: boolean;
  placeholder?: string;
  minToday?: boolean;
};

function dmyToDate(dmy: string): Date | undefined {
  const m = dmy.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!m) return undefined;
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function dateToDmy(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}-${mm}-${d.getFullYear()}`;
}

export function DatePickerField({
  value,
  onChange,
  error,
  placeholder = "DD-MM-YYYY",
  minToday = true,
}: Props) {
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement | null>(null);
  const selected = dmyToDate(value);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapper.current && !wrapper.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={wrapper}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between bg-white rounded-xl border pl-4 pr-3 py-3 text-[14px] text-left transition focus:outline-none ${
          error ? "border-[#E11D48]" : "border-[#E1DCEB] hover:border-[#a9a9a9]"
        }`}
      >
        <span className={value ? "text-dark" : "text-[#a9a9a9]"}>{value || placeholder}</span>
        <span className="grid place-items-center h-8 w-8 rounded-lg text-[#5e5e5e]">
          <Calendar className="h-4 w-4" />
        </span>
      </button>

      {open ? (
        <div
          className="absolute z-30 mt-2 right-0 sm:left-0 sm:right-auto bg-white rounded-2xl border border-[#E1DCEB] shadow-xl p-3 origin-top-left animate-in"
          role="dialog"
          aria-label="Pick a due date"
        >
          <DayPicker
            mode="single"
            selected={selected}
            defaultMonth={selected ?? new Date()}
            disabled={minToday ? { before: new Date(new Date().toDateString()) } : undefined}
            onSelect={(d) => {
              if (d) {
                onChange(dateToDmy(d));
                setOpen(false);
              }
            }}
            showOutsideDays
            captionLayout="dropdown"
            startMonth={new Date(2020, 0)}
            endMonth={new Date(new Date().getFullYear() + 5, 11)}
            classNames={{
              root: "rdp-vedaai text-[13px]",
              months: "",
              month: "",
              caption_label: "font-semibold text-dark text-[14px]",
              nav: "flex gap-1",
              button_previous:
                "h-8 w-8 grid place-items-center rounded-lg hover:bg-[#F6F6F6] text-[#5e5e5e]",
              button_next:
                "h-8 w-8 grid place-items-center rounded-lg hover:bg-[#F6F6F6] text-[#5e5e5e]",
              month_caption: "flex items-center justify-between px-1 pb-2",
              weekdays: "text-[11px] text-[#a9a9a9] uppercase tracking-wide",
              weekday: "w-9 h-7 grid place-items-center font-medium",
              day: "p-0",
              day_button:
                "h-9 w-9 grid place-items-center rounded-lg text-[13px] text-dark hover:bg-[#F6F6F6] focus:outline-none focus:ring-2 focus:ring-[#FF5623]/40",
              selected: "[&_button]:bg-[#FF5623] [&_button]:text-white [&_button]:hover:bg-[#FF5623]",
              today: "[&_button]:font-bold [&_button]:text-[#FF5623]",
              outside: "[&_button]:text-[#a9a9a9]",
              disabled: "[&_button]:text-[#d4d4d4] [&_button]:cursor-not-allowed",
              dropdowns: "flex gap-2 items-center",
              dropdown:
                "appearance-none bg-white border border-[#E1DCEB] rounded-md px-2 py-1 text-[12px] text-dark cursor-pointer",
              dropdown_root: "relative",
              chevron: "fill-[#5e5e5e]",
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
