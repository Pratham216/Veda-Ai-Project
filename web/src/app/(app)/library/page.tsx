"use client";

import { useState } from "react";
import { Topbar } from "@/components/Topbar";
import { BottomNav } from "@/components/BottomNav";
import { PageHeader } from "@/components/PageHeader";
import {
  Bookmark,
  Download,
  FileText,
  Image as ImageIcon,
  ListChecks,
  Search,
  SlidersHorizontal,
} from "lucide-react";

type Tab = "Question Papers" | "Lesson Plans" | "Worksheets" | "Rubrics";

type Item = {
  id: string;
  title: string;
  type: Tab;
  subject: string;
  grade: string;
  date: string;
  thumb: string;
};

const library: Item[] = [
  { id: "l1", title: "Electricity — Chapter Review",            type: "Question Papers", subject: "Science",     grade: "Grade 8",  date: "12-05-2025", thumb: "#FFE4D9" },
  { id: "l2", title: "Algebra Pop Quiz",                        type: "Question Papers", subject: "Mathematics", grade: "Grade 6",  date: "08-05-2025", thumb: "#DBEAFE" },
  { id: "l3", title: "Photosynthesis — Lesson 03",              type: "Lesson Plans",    subject: "Biology",     grade: "Grade 7",  date: "01-05-2025", thumb: "#DCFCE7" },
  { id: "l4", title: "Comparing Fractions — Practice Sheet",    type: "Worksheets",      subject: "Mathematics", grade: "Grade 5",  date: "20-04-2025", thumb: "#FEF3C7" },
  { id: "l5", title: "Persuasive Essay Rubric",                 type: "Rubrics",         subject: "English",     grade: "Grade 9",  date: "18-04-2025", thumb: "#EDE9FE" },
  { id: "l6", title: "World War II — Timeline Worksheet",       type: "Worksheets",      subject: "History",     grade: "Grade 10", date: "14-04-2025", thumb: "#FCE7F3" },
  { id: "l7", title: "Acids & Bases — Mid-term Paper",          type: "Question Papers", subject: "Chemistry",   grade: "Grade 9",  date: "02-04-2025", thumb: "#CFFAFE" },
  { id: "l8", title: "Reading Comprehension Lesson",            type: "Lesson Plans",    subject: "English",     grade: "Grade 4",  date: "28-03-2025", thumb: "#FFE4E6" },
];

const TABS: Tab[] = ["Question Papers", "Lesson Plans", "Worksheets", "Rubrics"];

export default function LibraryPage() {
  const [tab, setTab] = useState<Tab>("Question Papers");
  const [query, setQuery] = useState("");

  const filtered = library.filter(
    (l) =>
      l.type === tab &&
      (query === "" ||
        l.title.toLowerCase().includes(query.toLowerCase()) ||
        l.subject.toLowerCase().includes(query.toLowerCase())),
  );

  const counts = TABS.reduce<Record<Tab, number>>(
    (acc, t) => {
      acc[t] = library.filter((l) => l.type === t).length;
      return acc;
    },
    { "Question Papers": 0, "Lesson Plans": 0, Worksheets: 0, Rubrics: 0 },
  );

  return (
    <>
      <Topbar crumb="My Library" />
      <main className="px-4 lg:px-8 pb-24 lg:pb-10">
        <PageHeader title="My Library" subtitle="Everything you've saved, in one place." />

        {/* Tabs */}
        <div className="mt-6 flex gap-1 overflow-x-auto scroll-thin -mx-1 px-1">
          {TABS.map((t) => {
            const active = tab === t;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-[13px] transition ${
                  active
                    ? "bg-dark text-white"
                    : "bg-white border border-[#E8EAED] text-[#5e5e5e] hover:border-[#a9a9a9]"
                }`}
              >
                {t}
                <span
                  className={`ml-2 text-[11px] font-semibold rounded-full px-1.5 ${
                    active ? "bg-white/15 text-white" : "bg-[#F0F0F0] text-[#5e5e5e]"
                  }`}
                >
                  {counts[t]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter + Search */}
        <div className="mt-5 flex items-center justify-between gap-3">
          <button className="inline-flex items-center gap-2 bg-white rounded-full border border-[#E8EAED] px-4 py-2 text-[13px] text-[#5e5e5e] shrink-0 whitespace-nowrap hover:border-[#a9a9a9] transition">
            <SlidersHorizontal className="h-4 w-4" strokeWidth={1.8} />
            Filter
          </button>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a9a9a9]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search library"
              className="w-full bg-white rounded-full border border-[#E8EAED] pl-10 pr-4 py-2 text-[13px] placeholder:text-[#a9a9a9] focus:outline-none focus:border-[#a9a9a9]"
            />
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="mt-10 mx-auto max-w-md text-center text-[13px] text-muted">
            Nothing here yet — items you save will appear in this tab.
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((i) => (
              <LibraryCard key={i.id} item={i} />
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}

function LibraryCard({ item }: { item: Item }) {
  const Icon =
    item.type === "Question Papers"
      ? FileText
      : item.type === "Lesson Plans"
        ? ImageIcon
        : item.type === "Worksheets"
          ? FileText
          : ListChecks;
  return (
    <div className="group bg-white border border-[#F0F0F0] rounded-2xl overflow-hidden hover:shadow-sm transition">
      <div
        className="h-28 flex items-center justify-center relative"
        style={{ background: item.thumb }}
      >
        <Icon className="h-10 w-10 text-dark/40" strokeWidth={1.3} />
        <button
          className="absolute top-2 right-2 h-7 w-7 grid place-items-center rounded-full bg-white/80 backdrop-blur text-[#5e5e5e] hover:text-[#FF5623]"
          aria-label="Bookmark"
        >
          <Bookmark className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="p-4">
        <div className="text-[14px] font-bold text-dark leading-tight">{item.title}</div>
        <div className="mt-1 text-[12px] text-muted">
          {item.subject} · {item.grade}
        </div>
        <div className="mt-3 flex items-center justify-between text-[12px] text-muted">
          <span>Saved {item.date}</span>
          <button className="inline-flex items-center gap-1 text-dark hover:text-[#FF5623] transition">
            <Download className="h-3.5 w-3.5" />
            Open
          </button>
        </div>
      </div>
    </div>
  );
}
