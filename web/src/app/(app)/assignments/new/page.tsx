"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/Topbar";
import { BottomNav } from "@/components/BottomNav";
import { useAssignmentStore } from "@/store/useAssignmentStore";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  ChevronDown,
  Minus,
  Mic,
  Plus,
  UploadCloud,
  X,
} from "lucide-react";

const QUESTION_TYPES = [
  "Multiple Choice Questions",
  "Short Questions",
  "Long Questions",
  "Diagram/Graph-Based Questions",
  "Numerical Problems",
  "True / False",
];

export default function CreateAssignmentPage() {
  const router = useRouter();
  const {
    draft,
    setDraft,
    addRow,
    updateRow,
    removeRow,
    submitDraft,
  } = useAssignmentStore();
  const fileInput = useRef<HTMLInputElement | null>(null);
  const dateInput = useRef<HTMLInputElement | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const openDatePicker = () => {
    const el = dateInput.current;
    if (!el) return;
    if (typeof (el as HTMLInputElement & { showPicker?: () => void }).showPicker === "function") {
      try {
        (el as HTMLInputElement & { showPicker: () => void }).showPicker();
        return;
      } catch {
        /* fall through */
      }
    }
    el.focus();
    el.click();
  };

  const onPickIsoDate = (iso: string) => {
    if (!iso) return setDraft({ dueDate: "" });
    const [y, m, d] = iso.split("-");
    setDraft({ dueDate: `${d}-${m}-${y}` });
  };

  const dmyToIso = (dmy: string): string => {
    const m = dmy.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    return m ? `${m[3]}-${m[2]}-${m[1]}` : "";
  };

  const formatDmy = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 8);
    const p1 = digits.slice(0, 2);
    const p2 = digits.slice(2, 4);
    const p3 = digits.slice(4, 8);
    return [p1, p2, p3].filter(Boolean).join("-");
  };

  const totals = useMemo(() => {
    const q = draft.questionTypes.reduce((s, r) => s + Number(r.count || 0), 0);
    const m = draft.questionTypes.reduce(
      (s, r) => s + Number(r.count || 0) * Number(r.marks || 0),
      0,
    );
    return { q, m };
  }, [draft.questionTypes]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!draft.title.trim()) e.title = "Required";
    if (!draft.dueDate) e.dueDate = "Required";
    if (draft.questionTypes.length === 0) e.types = "Add at least one question type";
    draft.questionTypes.forEach((r) => {
      if (r.count <= 0) e[`c-${r.id}`] = ">0";
      if (r.marks <= 0) e[`m-${r.id}`] = ">0";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onNext = async () => {
    if (!validate()) return;
    const id = await submitDraft();
    router.push(`/assignments/${id}`);
  };

  const handleFile = (file: File | null) => {
    if (!file) return setDraft({ file: null });
    setDraft({ file: { name: file.name, size: file.size } });
  };

  return (
    <>
      <Topbar />
      <main className="px-4 lg:px-8 pb-28 lg:pb-10">
        <div className="flex items-center gap-3">
          <span className="relative inline-flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inset-0 rounded-full bg-[#22C55E] opacity-75 animate-ping" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#22C55E]" />
          </span>
          <div>
            <h1 className="text-[22px] lg:text-[24px] font-bold tracking-tight text-dark leading-tight">
              Create Assignment
            </h1>
            <p className="text-[13px] text-muted">
              Set up a new assignment for your students.
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-5 grid grid-cols-2 gap-2 max-w-xl">
          <div className="h-[3px] rounded-full bg-dark" />
          <div className="h-[3px] rounded-full bg-[#E1DCEB]" />
        </div>

        {/* Form card */}
        <section className="mt-6 mx-auto max-w-3xl bg-white border border-[#F0F0F0] rounded-3xl p-6 lg:p-8">
          <div>
            <h2 className="text-[17px] font-bold text-dark">Assignment Details</h2>
            <p className="text-[12.5px] text-muted">Basic information about your assignment</p>
          </div>

          {/* Dropzone */}
          <div className="mt-5">
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="dashed-dropzone w-full rounded-2xl bg-white px-6 py-8 grid place-items-center text-center hover:bg-[#FAFAFA] transition"
            >
              <UploadCloud className="h-7 w-7 text-[#5e5e5e]" strokeWidth={1.4} />
              <div className="mt-2 text-[14px] text-[#303030]">
                {draft.file ? draft.file.name : "Choose a file or drag & drop it here"}
              </div>
              <div className="mt-1 text-[12px] text-[#a9a9a9]">JPEG, PNG, upto 10MB</div>
              <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-white border border-[#DADADA] px-4 py-1.5 text-[13px] text-dark">
                Browse Files
              </span>
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="image/png,image/jpeg,application/pdf"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
            <p className="mt-2 text-[12px] text-[#a9a9a9] text-center">
              Upload images of your preferred document/image
            </p>
          </div>

          {/* Assignment name */}
          <div className="mt-6">
            <label className="text-[13px] font-medium text-dark">
              Assignment Name <span className="text-[#FF5623]">*</span>
            </label>
            <input
              value={draft.title}
              onChange={(e) => setDraft({ title: e.target.value })}
              placeholder="e.g. Quiz on Electricity — Chapter 6"
              maxLength={120}
              className={`mt-2 w-full bg-white rounded-xl border px-4 py-3 text-[14px] placeholder:text-[#a9a9a9] focus:outline-none ${
                errors.title ? "border-[#E11D48]" : "border-[#E1DCEB] focus:border-[#a9a9a9]"
              }`}
            />
            {errors.title ? (
              <p className="mt-1 text-[12px] text-[#E11D48]">Assignment name is required.</p>
            ) : null}
          </div>

          {/* Due date */}
          <div className="mt-6">
            <label className="text-[13px] font-medium text-dark">
              Due Date <span className="text-[#FF5623]">*</span>
            </label>
            <div className="relative mt-2">
              <input
                value={draft.dueDate}
                onChange={(e) => setDraft({ dueDate: formatDmy(e.target.value) })}
                placeholder="DD-MM-YYYY"
                inputMode="numeric"
                className={`w-full bg-white rounded-xl border pl-4 pr-11 py-3 text-[14px] placeholder:text-[#a9a9a9] focus:outline-none ${
                  errors.dueDate ? "border-[#E11D48]" : "border-[#E1DCEB] focus:border-[#a9a9a9]"
                }`}
              />
              <button
                type="button"
                onClick={openDatePicker}
                aria-label="Open calendar"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 grid place-items-center h-8 w-8 rounded-lg hover:bg-[#F6F6F6] text-[#5e5e5e]"
              >
                <Calendar className="h-4 w-4" />
              </button>
              <input
                ref={dateInput}
                type="date"
                value={dmyToIso(draft.dueDate)}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => onPickIsoDate(e.target.value)}
                className="sr-only"
                tabIndex={-1}
                aria-hidden
              />
            </div>
          </div>

          {/* Question Type table (desktop) / cards (mobile) */}
          <div className="mt-6">
            <div className="hidden md:block">
              <div className="grid grid-cols-[1fr_30px_140px_120px] gap-3 px-1 text-[13px] font-medium text-dark">
                <div>
                  Question Type <span className="text-[#FF5623]">*</span>
                </div>
                <div />
                <div className="text-center">No. of Questions</div>
                <div className="text-center">Marks</div>
              </div>
              <div className="mt-2 flex flex-col gap-3">
                {draft.questionTypes.map((row) => (
                  <div
                    key={row.id}
                    className="grid grid-cols-[1fr_30px_140px_120px] gap-3 items-center"
                  >
                    <Dropdown
                      value={row.type}
                      options={QUESTION_TYPES}
                      onChange={(v) => updateRow(row.id, { type: v })}
                    />
                    <button
                      onClick={() => removeRow(row.id)}
                      className="grid place-items-center h-9 w-9 mx-auto rounded-full text-[#5e5e5e] hover:bg-[#F6F6F6]"
                      aria-label="Remove"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <NumberStepper
                      value={row.count}
                      onChange={(v) => updateRow(row.id, { count: v })}
                      error={!!errors[`c-${row.id}`]}
                      label="No. of Questions"
                    />
                    <NumberStepper
                      value={row.marks}
                      onChange={(v) => updateRow(row.id, { marks: v })}
                      error={!!errors[`m-${row.id}`]}
                      label="Marks"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden flex flex-col gap-3">
              {draft.questionTypes.map((row) => (
                <div key={row.id} className="rounded-2xl border border-[#E1DCEB] bg-white p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Dropdown
                        value={row.type}
                        options={QUESTION_TYPES}
                        onChange={(v) => updateRow(row.id, { type: v })}
                      />
                    </div>
                    <button
                      onClick={() => removeRow(row.id)}
                      className="grid place-items-center h-8 w-8 rounded-full text-[#5e5e5e] hover:bg-[#F6F6F6]"
                      aria-label="Remove"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-[12px] text-[#5e5e5e] mb-1.5">No. of Questions</div>
                      <NumberStepper
                        value={row.count}
                        onChange={(v) => updateRow(row.id, { count: v })}
                        error={!!errors[`c-${row.id}`]}
                        label="No. of Questions"
                      />
                    </div>
                    <div>
                      <div className="text-[12px] text-[#5e5e5e] mb-1.5">Marks</div>
                      <NumberStepper
                        value={row.marks}
                        onChange={(v) => updateRow(row.id, { marks: v })}
                        error={!!errors[`m-${row.id}`]}
                        label="Marks"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addRow}
              className="mt-4 inline-flex items-center gap-2 text-[13px] font-medium text-dark"
            >
              <span className="grid place-items-center h-6 w-6 rounded-full bg-dark text-white">
                <Plus className="h-3.5 w-3.5" strokeWidth={2.2} />
              </span>
              Add Question Type
            </button>

            <div className="mt-4 text-right space-y-0.5 text-[13px]">
              <div>
                <span className="text-[#5e5e5e]">Total Questions :</span>{" "}
                <span className="font-semibold text-dark">{totals.q}</span>
              </div>
              <div>
                <span className="text-[#5e5e5e]">Total Marks :</span>{" "}
                <span className="font-semibold text-dark">{totals.m}</span>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-6">
            <label className="text-[13px] font-medium text-dark">
              Additional Information{" "}
              <span className="text-[#a9a9a9] font-normal">(For better output)</span>
            </label>
            <div className="relative mt-2">
              <textarea
                value={draft.additionalInfo}
                onChange={(e) => setDraft({ additionalInfo: e.target.value })}
                rows={4}
                placeholder="e.g Generate a question paper for 3 hour exam duration..."
                className="w-full bg-white rounded-xl border border-[#E1DCEB] px-4 py-3 text-[14px] placeholder:text-[#a9a9a9] focus:outline-none focus:border-[#a9a9a9] resize-none"
              />
              <button
                type="button"
                className="absolute right-3 bottom-3 grid place-items-center h-7 w-7 rounded-full hover:bg-[#F6F6F6]"
                aria-label="Voice"
              >
                <Mic className="h-4 w-4 text-[#5e5e5e]" />
              </button>
            </div>
          </div>
        </section>

        {/* Footer actions */}
        <div className="mt-6 mx-auto max-w-3xl flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-full bg-white border border-[#DADADA] px-5 py-2.5 text-[14px] text-dark"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            Previous
          </button>
          <button
            onClick={onNext}
            className="btn-dark-glow inline-flex items-center gap-2 rounded-full text-white px-6 py-2.5 text-[14px] font-medium"
          >
            Next
            <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
          </button>
        </div>
      </main>
      <BottomNav />
    </>
  );
}

function NumberStepper({
  value,
  onChange,
  error,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  error?: boolean;
  label: string;
}) {
  return (
    <div
      className={`flex items-center justify-between bg-white rounded-full border px-2 py-1.5 ${
        error ? "border-[#E11D48]" : "border-[#E1DCEB]"
      }`}
      aria-label={label}
    >
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        className="grid place-items-center h-7 w-7 rounded-full text-[#5e5e5e] hover:bg-[#F6F6F6]"
        aria-label="Decrement"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <input
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value.replace(/\D/g, ""));
          if (!Number.isNaN(n)) onChange(n);
        }}
        className="w-10 text-center bg-transparent text-[14px] font-medium text-dark focus:outline-none"
        inputMode="numeric"
      />
      <button
        onClick={() => onChange(value + 1)}
        className="grid place-items-center h-7 w-7 rounded-full text-[#5e5e5e] hover:bg-[#F6F6F6]"
        aria-label="Increment"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function Dropdown({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between bg-white rounded-xl border border-[#E1DCEB] px-4 py-2.5 text-[14px] text-dark"
      >
        {value}
        <ChevronDown className={`h-4 w-4 text-[#5e5e5e] transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? (
        <ul className="absolute z-20 left-0 right-0 mt-1 bg-white rounded-xl border border-[#E1DCEB] shadow-lg overflow-hidden">
          {options.map((o) => (
            <li key={o}>
              <button
                onClick={() => {
                  onChange(o);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-[13px] hover:bg-[#F6F6F6] ${
                  o === value ? "font-semibold text-dark" : "text-[#303030]"
                }`}
              >
                {o}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

