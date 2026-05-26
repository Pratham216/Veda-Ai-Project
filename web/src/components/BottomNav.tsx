"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, ClipboardList, BookOpenCheck, Sparkles, Plus } from "lucide-react";

const items = [
  { href: "/", label: "Home", icon: LayoutGrid },
  { href: "/assignments", label: "Assignments", icon: ClipboardList },
  { href: "/library", label: "Library", icon: BookOpenCheck },
  { href: "/toolkit", label: "AI Toolkit", icon: Sparkles },
];

export function BottomNav({ showFab = false }: { showFab?: boolean }) {
  const pathname = usePathname();
  return (
    <>
      {showFab ? (
        <Link
          href="/assignments/new"
          className="lg:hidden fixed bottom-[78px] right-5 z-30 h-12 w-12 rounded-full bg-[#FF5623] text-white grid place-items-center shadow-lg"
          aria-label="Create assignment"
        >
          <Plus className="h-5 w-5" strokeWidth={2.2} />
        </Link>
      ) : null}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-dark text-white">
        <ul className="grid grid-cols-4">
          {items.map(({ href, label, icon: Icon }) => {
            const active =
              (href === "/" && pathname === "/") ||
              (href !== "/" && pathname.startsWith(href));
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex flex-col items-center gap-1 py-3 text-[11px] ${
                    active ? "text-white" : "text-white/60"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
