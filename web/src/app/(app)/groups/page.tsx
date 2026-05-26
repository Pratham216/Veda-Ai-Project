"use client";

import Link from "next/link";
import { Topbar } from "@/components/Topbar";
import { BottomNav } from "@/components/BottomNav";
import { PageHeader } from "@/components/PageHeader";
import { Plus, Users, MoreVertical, GraduationCap } from "lucide-react";

type Group = {
  id: string;
  name: string;
  subject: string;
  grade: string;
  students: number;
  color: string;
  emoji: string;
};

const groups: Group[] = [
  { id: "g1", name: "Section A — Morning", subject: "Science",     grade: "Grade 8", students: 32, color: "#FF5623", emoji: "🧪" },
  { id: "g2", name: "Section B — Morning", subject: "Mathematics", grade: "Grade 8", students: 28, color: "#3B82F6", emoji: "📐" },
  { id: "g3", name: "Section A — Afternoon", subject: "English",   grade: "Grade 5", students: 35, color: "#22C55E", emoji: "📖" },
  { id: "g4", name: "Section C",            subject: "History",    grade: "Grade 7", students: 30, color: "#A855F7", emoji: "🏛️" },
  { id: "g5", name: "Honors Group",         subject: "Physics",    grade: "Grade 10", students: 18, color: "#F59E0B", emoji: "⚛️" },
  { id: "g6", name: "Junior Coders",        subject: "Computer Science", grade: "Grade 6", students: 22, color: "#06B6D4", emoji: "💻" },
];

export default function GroupsPage() {
  return (
    <>
      <Topbar crumb="My Groups" />
      <main className="px-4 lg:px-8 pb-24 lg:pb-10">
        <div className="flex items-center justify-between gap-3">
          <PageHeader title="My Groups" subtitle="The classes and sections you teach." />
          <Link
            href="#"
            className="btn-dark-glow hidden lg:inline-flex items-center gap-2 rounded-full text-white text-[13px] font-medium py-2.5 px-5"
          >
            <Plus className="h-4 w-4 text-[#FF5623]" strokeWidth={2.4} />
            New Group
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {groups.map((g) => (
            <GroupCard key={g.id} g={g} />
          ))}
          <button className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#E1DCEB] text-[#5e5e5e] hover:border-[#a9a9a9] hover:text-dark transition py-10 text-[14px]">
            <Plus className="h-5 w-5" />
            Add another group
          </button>
        </div>
      </main>
      <BottomNav />
    </>
  );
}

function GroupCard({ g }: { g: Group }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-[#F0F0F0] p-5 hover:shadow-sm transition">
      <span className="absolute left-0 top-0 bottom-0 w-1.5" style={{ background: g.color }} />
      <div className="pl-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span
              className="grid place-items-center h-11 w-11 rounded-xl text-xl"
              style={{ background: `${g.color}1a` }}
            >
              {g.emoji}
            </span>
            <div>
              <div className="text-[15px] font-bold text-dark leading-tight">{g.subject}</div>
              <div className="text-[12px] text-muted">{g.grade}</div>
            </div>
          </div>
          <button className="grid place-items-center h-7 w-7 rounded-full hover:bg-[#F6F6F6]" aria-label="More">
            <MoreVertical className="h-4 w-4 text-[#5e5e5e]" />
          </button>
        </div>

        <div className="mt-4 text-[13px] text-[#5e5e5e]">{g.name}</div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[12px] text-[#5e5e5e]">
            <Users className="h-4 w-4" strokeWidth={1.8} />
            {g.students} students
          </div>
          <div className="flex -space-x-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-6 w-6 rounded-full ring-2 ring-white grid place-items-center text-[11px] text-white"
                style={{ background: `${g.color}cc` }}
              >
                {String.fromCharCode(65 + i)}
              </span>
            ))}
            <span className="h-6 w-6 rounded-full ring-2 ring-white bg-[#F0F0F0] text-[10px] text-[#5e5e5e] grid place-items-center">
              +{Math.max(0, g.students - 3)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
