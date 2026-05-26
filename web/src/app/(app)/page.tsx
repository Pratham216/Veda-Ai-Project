"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Topbar } from "@/components/Topbar";
import { BottomNav } from "@/components/BottomNav";
import { PageHeader } from "@/components/PageHeader";
import { useAssignmentStore } from "@/store/useAssignmentStore";
import { useAuthStore } from "@/store/useAuthStore";
import {
  ArrowUpRight,
  CheckCircle2,
  ClipboardEdit,
  ClipboardList,
  Clock,
  GraduationCap,
  Plus,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

export default function HomePage() {
  const { assignments, hydrated, loadFromApi } = useAssignmentStore();
  const user = useAuthStore((s) => s.user);
  const firstName = user?.name?.split(" ")[0] ?? "there";

  useEffect(() => {
    if (!hydrated) loadFromApi();
  }, [hydrated, loadFromApi]);

  const ready = assignments.filter((a) => a.status === "ready").length;
  const pending = assignments.length - ready;
  const recent = assignments.slice(0, 4);

  return (
    <>
      <Topbar crumb="Home" />
      <main className="px-4 lg:px-8 pb-24 lg:pb-10">
        {/* Welcome banner */}
        <section className="banner-dark text-white rounded-2xl p-5 lg:p-7 flex flex-col lg:flex-row items-start lg:items-center gap-5 justify-between">
          <div>
            <div className="text-[12px] uppercase tracking-wider text-white/60">
              {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
            </div>
            <h1 className="mt-1 text-[22px] lg:text-[26px] font-bold tracking-tight">
              Welcome back, {firstName} 👋
            </h1>
            <p className="mt-1 text-[13px] text-white/70 max-w-md">
              Ready to spin up your next assignment? Your AI teaching assistant is on standby.
            </p>
          </div>
          <Link
            href="/assignments/new"
            className="inline-flex items-center gap-2 rounded-full bg-white text-dark px-5 py-2.5 text-[13px] font-medium hover:bg-white/90"
          >
            <Sparkles className="h-4 w-4 text-[#FF5623]" />
            Create Assignment
          </Link>
        </section>

        {/* Stats */}
        <section className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <Stat
            label="Active Assignments"
            value={assignments.length}
            icon={ClipboardList}
            accent="#FF5623"
            trend="+12% this week"
          />
          <Stat label="Pending Reviews" value={pending} icon={Clock} accent="#F59E0B" />
          <Stat label="Students" value={165} icon={Users} accent="#3B82F6" trend="across 6 groups" />
          <Stat label="Avg. Score" value="78%" icon={TrendingUp} accent="#22C55E" trend="+4% vs last month" />
        </section>

        {/* Two-up: Recent activity + Quick actions */}
        <section className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white border border-[#F0F0F0] rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <PageHeader title="Recent Assignments" />
              <Link
                href="/assignments"
                className="text-[12px] text-[#5e5e5e] hover:text-dark inline-flex items-center gap-1"
              >
                View all <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            {recent.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-[#E1DCEB] p-8 text-center">
                <p className="text-[13px] text-muted">No assignments yet.</p>
                <Link
                  href="/assignments/new"
                  className="btn-dark-glow mt-3 inline-flex items-center gap-2 rounded-full text-white px-5 py-2 text-[13px] font-medium"
                >
                  <Plus className="h-4 w-4 text-[#FF5623]" strokeWidth={2.4} />
                  Create your first
                </Link>
              </div>
            ) : (
              <ul className="mt-4 divide-y divide-[#F0F0F0]">
                {recent.map((a) => (
                  <li key={a.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="grid place-items-center h-9 w-9 rounded-lg bg-[#FF5623]/10 text-[#FF5623]">
                        <ClipboardList className="h-4 w-4" strokeWidth={1.8} />
                      </span>
                      <div className="min-w-0">
                        <Link
                          href={`/assignments/${a.id}`}
                          className="block truncate text-[14px] font-semibold text-dark hover:underline underline-offset-2 decoration-2"
                        >
                          {a.title}
                        </Link>
                        <div className="text-[12px] text-muted truncate">
                          Due {a.dueDate} · Assigned {a.assignedOn}
                        </div>
                      </div>
                    </div>
                    <StatusPill status={a.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white border border-[#F0F0F0] rounded-2xl p-5">
            <PageHeader title="Quick Actions" />
            <div className="mt-4 grid grid-cols-1 gap-2">
              <QuickAction
                href="/assignments/new"
                icon={ClipboardEdit}
                title="New Question Paper"
                description="Generate sections, marks and difficulty mix."
                accent="#FF5623"
              />
              <QuickAction
                href="/toolkit"
                icon={Sparkles}
                title="Open AI Toolkit"
                description="Lesson plans, rubrics, graders and more."
                accent="#A855F7"
              />
              <QuickAction
                href="/groups"
                icon={GraduationCap}
                title="Manage Classes"
                description="View students and section assignments."
                accent="#3B82F6"
              />
            </div>
          </div>
        </section>
      </main>
      <BottomNav />
    </>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  accent,
  trend,
}: {
  label: string;
  value: number | string;
  icon: typeof Users;
  accent: string;
  trend?: string;
}) {
  return (
    <div className="bg-white border border-[#F0F0F0] rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-muted">{label}</span>
        <span
          className="grid place-items-center h-8 w-8 rounded-lg"
          style={{ background: `${accent}1a`, color: accent }}
        >
          <Icon className="h-4 w-4" strokeWidth={1.8} />
        </span>
      </div>
      <div className="mt-2 text-[26px] font-bold tracking-tight text-dark">{value}</div>
      {trend ? <div className="text-[11px] text-[#16A34A] mt-0.5">{trend}</div> : null}
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  title,
  description,
  accent,
}: {
  href: string;
  icon: typeof Users;
  title: string;
  description: string;
  accent: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-3 rounded-xl border border-[#F0F0F0] p-3 hover:border-[#a9a9a9] transition"
    >
      <span
        className="shrink-0 grid place-items-center h-9 w-9 rounded-lg"
        style={{ background: `${accent}1a`, color: accent }}
      >
        <Icon className="h-4 w-4" strokeWidth={1.8} />
      </span>
      <div className="min-w-0">
        <div className="text-[13px] font-semibold text-dark group-hover:text-[#FF5623]">{title}</div>
        <p className="text-[12px] text-muted">{description}</p>
      </div>
    </Link>
  );
}

function StatusPill({ status }: { status: "queued" | "generating" | "ready" | "failed" }) {
  const map = {
    queued: { label: "Queued", color: "#A9A9A9" },
    generating: { label: "Generating", color: "#F59E0B" },
    ready: { label: "Ready", color: "#22C55E" },
    failed: { label: "Failed", color: "#E11D48" },
  } as const;
  const s = map[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-medium rounded-full px-2.5 py-1 whitespace-nowrap"
      style={{ background: `${s.color}1a`, color: s.color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
      {s.label}
    </span>
  );
}
