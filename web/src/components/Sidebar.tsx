"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Users,
  ClipboardList,
  GraduationCap,
  BookOpenCheck,
  Settings,
  Sparkles,
} from "lucide-react";
import { Logo } from "./Logo";
import { useAssignmentStore } from "@/store/useAssignmentStore";
import { useAuthStore } from "@/store/useAuthStore";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutGrid;
  badgeKey?: "assignmentCount";
};

const nav: NavItem[] = [
  { href: "/", label: "Home", icon: LayoutGrid },
  { href: "/groups", label: "My Groups", icon: Users },
  { href: "/assignments", label: "Assignments", icon: ClipboardList, badgeKey: "assignmentCount" },
  { href: "/toolkit", label: "AI Teacher's Toolkit", icon: GraduationCap },
  { href: "/library", label: "My Library", icon: BookOpenCheck },
];

export function Sidebar({ topAction = "create" as "create" | "toolkit" }) {
  const pathname = usePathname();
  const assignmentCount = useAssignmentStore((s) => s.assignments.length);
  const badges = { assignmentCount };
  const user = useAuthStore((s) => s.user);
  const initial = (user?.name?.[0] ?? "?").toUpperCase();
  const school = user?.schoolName || "Your School";
  const location = user?.location || "Add a location";
  return (
    <aside className="hidden lg:flex w-[260px] shrink-0 flex-col bg-white rounded-2xl m-3 mr-0 h-[calc(100vh-1.5rem)] sticky top-3 overflow-hidden">
      <div className="p-5 pb-3">
        <Logo />
      </div>

      <div className="px-4 pt-1">
        {topAction === "create" ? (
          <Link
            href="/assignments/new"
            className="btn-dark-glow flex items-center justify-center gap-2 w-full rounded-full text-white text-[15px] font-medium py-3 px-4"
          >
            <Sparkles className="h-4 w-4 text-[#FF5623]" strokeWidth={2.2} />
            <span>Create Assignment</span>
          </Link>
        ) : (
          <Link
            href="/toolkit"
            className="btn-dark-glow flex items-center justify-center gap-2 w-full rounded-full text-white text-[15px] font-medium py-3 px-4"
          >
            <Sparkles className="h-4 w-4 text-[#FF5623]" strokeWidth={2.2} />
            <span>AI Teacher&rsquo;s Toolkit</span>
          </Link>
        )}
      </div>

      <nav className="px-3 mt-6 flex-1 flex flex-col gap-1">
        {nav.map((item) => {
          const active =
            (item.href === "/" && pathname === "/") ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          const badgeValue = item.badgeKey ? badges[item.badgeKey] : 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-[15px] transition
                ${active ? "bg-[#F0F0F0] text-dark font-medium" : "text-[#5e5e5e] hover:bg-[#F6F6F6]"}`}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                {item.label}
              </span>
              {badgeValue > 0 ? (
                <span className="inline-flex items-center justify-center text-[11px] font-semibold rounded-full bg-[#FF5623] text-white h-5 min-w-[22px] px-1.5">
                  {badgeValue}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pt-3 border-t border-[#F0F0F0]">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] text-[#5e5e5e] hover:bg-[#F6F6F6]"
        >
          <Settings className="h-[18px] w-[18px]" strokeWidth={1.8} />
          Settings
        </Link>
      </div>

      <div className="m-3 mt-2 rounded-2xl bg-[#F6F6F6] p-3 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#FFD8C9] to-[#FF5623] grid place-items-center text-white font-semibold text-sm">
          {initial}
        </div>
        <div className="leading-tight min-w-0">
          <div className="text-[13px] font-semibold text-dark truncate">{school}</div>
          <div className="text-[11px] text-muted truncate">{location}</div>
        </div>
      </div>
    </aside>
  );
}
