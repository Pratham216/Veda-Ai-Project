"use client";

import Link from "next/link";
import { Topbar } from "@/components/Topbar";
import { BottomNav } from "@/components/BottomNav";
import { PageHeader } from "@/components/PageHeader";
import {
  ClipboardEdit,
  BookOpenCheck,
  CheckCircle2,
  ListChecks,
  MessageSquareText,
  PenLine,
  Presentation,
  Sparkles,
  Brain,
  type LucideIcon,
} from "lucide-react";

type Tool = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  href: string;
  badge?: string;
};

const tools: Tool[] = [
  {
    id: "question-paper",
    title: "Question Paper Generator",
    description: "Generate exam-ready papers from your syllabus in seconds.",
    icon: ClipboardEdit,
    accent: "#FF5623",
    href: "/assignments/new",
    badge: "Most used",
  },
  {
    id: "lesson-planner",
    title: "Lesson Planner",
    description: "Draft a full lesson plan with objectives, activities and homework.",
    icon: Presentation,
    accent: "#3B82F6",
    href: "#",
  },
  {
    id: "rubric-builder",
    title: "Rubric Builder",
    description: "Translate learning outcomes into clear marking rubrics.",
    icon: ListChecks,
    accent: "#A855F7",
    href: "#",
  },
  {
    id: "ai-grader",
    title: "AI Grader",
    description: "Score student submissions with feedback aligned to your rubric.",
    icon: CheckCircle2,
    accent: "#22C55E",
    href: "#",
  },
  {
    id: "worksheets",
    title: "Worksheet Generator",
    description: "Differentiated practice sheets at three difficulty levels.",
    icon: PenLine,
    accent: "#F59E0B",
    href: "#",
  },
  {
    id: "doubt-solver",
    title: "Doubt Solver",
    description: "Step-by-step explanations for any question, in plain language.",
    icon: MessageSquareText,
    accent: "#06B6D4",
    href: "#",
  },
  {
    id: "concept-explainer",
    title: "Concept Explainer",
    description: "Generate analogies, examples and visuals for tricky topics.",
    icon: Brain,
    accent: "#EC4899",
    href: "#",
  },
  {
    id: "summariser",
    title: "Chapter Summariser",
    description: "Condense textbook chapters into revision notes with key points.",
    icon: BookOpenCheck,
    accent: "#10B981",
    href: "#",
  },
];

export default function ToolkitPage() {
  return (
    <>
      <Topbar crumb="AI Teacher's Toolkit" />
      <main className="px-4 lg:px-8 pb-24 lg:pb-10">
        <PageHeader
          title="AI Teacher's Toolkit"
          subtitle="Eight assistants that handle the busywork so you can focus on teaching."
        />

        {/* Spotlight */}
        <section className="mt-6 banner-dark text-white rounded-2xl p-5 lg:p-7 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="grid place-items-center h-12 w-12 rounded-2xl bg-white/10 ring-1 ring-white/15">
              <Sparkles className="h-5 w-5 text-[#FF5623]" />
            </span>
            <div>
              <div className="text-[12px] uppercase tracking-wider text-white/60">
                Featured tool
              </div>
              <div className="text-[18px] font-bold">Question Paper Generator</div>
              <p className="text-[13px] text-white/70 max-w-xl">
                Turn a chapter or syllabus into a structured paper with marks, sections and
                difficulty distribution — automatically.
              </p>
            </div>
          </div>
          <Link
            href="/assignments/new"
            className="inline-flex items-center gap-2 rounded-full bg-white text-dark px-5 py-2.5 text-[13px] font-medium hover:bg-white/90"
          >
            <Sparkles className="h-4 w-4 text-[#FF5623]" />
            Try now
          </Link>
        </section>

        {/* Tool grid */}
        <section className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tools.map((t) => (
            <ToolCard key={t.id} tool={t} />
          ))}
        </section>
      </main>
      <BottomNav />
    </>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon;
  return (
    <Link
      href={tool.href}
      className="group relative bg-white border border-[#F0F0F0] rounded-2xl p-5 flex flex-col hover:shadow-sm transition"
    >
      <div className="flex items-start justify-between">
        <span
          className="grid place-items-center h-11 w-11 rounded-xl"
          style={{ background: `${tool.accent}1a`, color: tool.accent }}
        >
          <Icon className="h-5 w-5" strokeWidth={1.8} />
        </span>
        {tool.badge ? (
          <span className="text-[10px] font-semibold tracking-wide uppercase rounded-full bg-[#FF5623]/10 text-[#FF5623] px-2 py-1">
            {tool.badge}
          </span>
        ) : null}
      </div>
      <div className="mt-4 text-[15px] font-bold text-dark leading-tight">{tool.title}</div>
      <p className="mt-1 text-[13px] text-muted leading-relaxed">{tool.description}</p>
      <div className="mt-4 inline-flex items-center gap-1 text-[12px] font-medium text-dark group-hover:text-[#FF5623] transition">
        Try now
        <span aria-hidden>→</span>
      </div>
    </Link>
  );
}
