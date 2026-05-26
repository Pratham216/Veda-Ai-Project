"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/Topbar";
import { BottomNav } from "@/components/BottomNav";
import { useAssignmentStore, type Assignment } from "@/store/useAssignmentStore";
import { ChevronDown, MoreVertical, Plus, Search, SlidersHorizontal } from "lucide-react";

export default function AssignmentsPage() {
  const { assignments, hydrated, loadFromApi } = useAssignmentStore();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!hydrated) loadFromApi();
  }, [hydrated, loadFromApi]);

  const filtered = assignments.filter((a) =>
    a.title.toLowerCase().includes(query.toLowerCase()),
  );

  const isEmpty = hydrated && assignments.length === 0;

  return (
    <>
      <Topbar />
      <main className="px-4 lg:px-8 pb-24 lg:pb-10">
        <SectionHeader />
        {isEmpty ? <EmptyState /> : (
          <FilledState
            assignments={filtered}
            query={query}
            onQuery={setQuery}
          />
        )}
      </main>
      <BottomNav showFab={!isEmpty} />
    </>
  );
}

function SectionHeader() {
  return (
    <div className="flex items-center gap-3">
      <span className="relative inline-flex h-2.5 w-2.5 shrink-0">
        <span className="absolute inset-0 rounded-full bg-[#22C55E] opacity-75 animate-ping" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#22C55E]" />
      </span>
      <div>
        <h1 className="text-[22px] lg:text-[24px] font-bold tracking-tight text-dark leading-tight">
          Assignments
        </h1>
        <p className="text-[13px] text-muted">
          Manage and create assignments for your classes.
        </p>
      </div>
    </div>
  );
}

function FilledState({
  assignments,
  query,
  onQuery,
}: {
  assignments: Assignment[];
  query: string;
  onQuery: (v: string) => void;
}) {
  return (
    <>
      <div className="mt-5 flex items-center justify-between gap-3">
        <button className="inline-flex items-center gap-2 bg-white rounded-full border border-[#E8EAED] px-4 py-2 text-[13px] text-[#5e5e5e] shrink-0 whitespace-nowrap hover:border-[#a9a9a9] transition">
          <SlidersHorizontal className="h-4 w-4" strokeWidth={1.8} />
          Filter By
        </button>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a9a9a9]" />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search Assignment"
            className="w-full bg-white rounded-full border border-[#E8EAED] pl-10 pr-4 py-2 text-[13px] placeholder:text-[#a9a9a9] focus:outline-none focus:border-[#a9a9a9]"
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {assignments.map((a) => (
          <AssignmentCard key={a.id} a={a} />
        ))}
      </div>

      <Link
        href="/assignments/new"
        className="btn-dark-glow hidden lg:inline-flex items-center gap-2 fixed left-1/2 -translate-x-1/2 bottom-6 rounded-full text-white text-[14px] font-medium py-3 px-6 z-20"
      >
        <Plus className="h-4 w-4 text-[#FF5623]" strokeWidth={2.4} />
        Create Assignment
      </Link>
    </>
  );
}

function AssignmentCard({ a }: { a: Assignment }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div className="relative bg-white rounded-2xl p-5 border border-[#F0F0F0] hover:shadow-sm transition">
      <div className="flex items-start justify-between">
        <Link
          href={`/assignments/${a.id}`}
          className="text-[17px] font-bold tracking-tight text-dark hover:underline underline-offset-4 decoration-2"
        >
          {a.title}
        </Link>
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen((o) => !o)}
            className="grid place-items-center h-7 w-7 rounded-full hover:bg-[#F6F6F6]"
            aria-label="Actions"
          >
            <MoreVertical className="h-4 w-4 text-[#5e5e5e]" />
          </button>
          {open ? (
            <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl border border-[#E1DCEB] shadow-lg overflow-hidden z-10">
              <button
                onClick={() => router.push(`/assignments/${a.id}`)}
                className="w-full text-left px-4 py-2.5 text-[13px] text-dark hover:bg-[#F6F6F6]"
              >
                View Assignment
              </button>
              <button
                onClick={() => {
                  useAssignmentStore.getState().removeAssignment(a.id);
                }}
                className="w-full text-left px-4 py-2.5 text-[13px] text-[#E11D48] hover:bg-[#FFF1F2]"
              >
                Delete
              </button>
            </div>
          ) : null}
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between text-[13px]">
        <span className="text-[#5e5e5e]">
          <span className="font-semibold text-dark">Assigned on</span> : {a.assignedOn}
        </span>
        <span className="text-[#5e5e5e]">
          <span className="font-semibold text-dark">Due</span> : {a.dueDate}
        </span>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-10 lg:mt-16 flex flex-col items-center text-center px-6">
      <EmptyIllustration />
      <h2 className="mt-6 text-[20px] lg:text-[22px] font-bold tracking-tight text-dark">
        No assignments yet
      </h2>
      <p className="mt-2 max-w-md text-[13px] text-muted">
        Create your first assignment to start collecting and grading student
        submissions. You can set up rubrics, define marking criteria, and let AI
        assist with grading.
      </p>
      <Link
        href="/assignments/new"
        className="btn-dark-glow mt-7 inline-flex items-center gap-2 rounded-full text-white text-[14px] font-medium py-3 px-6"
      >
        <Plus className="h-4 w-4 text-[#FF5623]" strokeWidth={2.4} />
        Create Your First Assignment
      </Link>
    </div>
  );
}

function EmptyIllustration() {
  return (
    <svg width="220" height="200" viewBox="0 0 220 200" fill="none" className="opacity-95">
      <circle cx="110" cy="100" r="84" fill="#F0EEF6" />
      <g transform="translate(60 30)">
        <rect x="0" y="0" width="92" height="118" rx="10" fill="#FFFFFF" stroke="#181818" strokeWidth="1.5" />
        <rect x="14" y="20" width="44" height="6" rx="3" fill="#E1DCEB" />
        <rect x="14" y="34" width="64" height="4" rx="2" fill="#EFEDF6" />
        <rect x="14" y="44" width="54" height="4" rx="2" fill="#EFEDF6" />
        <rect x="14" y="54" width="60" height="4" rx="2" fill="#EFEDF6" />
        <circle cx="64" cy="84" r="22" fill="#FFFFFF" stroke="#181818" strokeWidth="1.5" />
        <path
          d="M55 75 l18 18 M73 75 l-18 18"
          stroke="#E11D48"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="86" cy="106" r="3" fill="#181818" />
        <path d="M82 109 l10 10" stroke="#181818" strokeWidth="3" strokeLinecap="round" />
      </g>
      <path
        d="M40 26 c20 -8 28 6 18 16"
        stroke="#181818"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M44 154 l4 4 l-2 -5 z" fill="#FF5623" />
      <circle cx="170" cy="64" r="3" fill="#3B82F6" />
      <circle cx="160" cy="130" r="3" fill="#FF5623" />
    </svg>
  );
}
