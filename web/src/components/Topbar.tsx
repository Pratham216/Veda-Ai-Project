"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, ChevronDown, LayoutGrid, LogOut, Plus, UserRound } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export function Topbar({
  crumb = "Assignment",
  showCreateChip = false,
}: {
  crumb?: string;
  showCreateChip?: boolean;
}) {
  const router = useRouter();
  const { user, clearSession } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menuOpen]);

  const displayName = user?.name ?? "Account";
  const initial = (user?.name?.[0] ?? "?").toUpperCase();

  const onLogout = () => {
    clearSession();
    router.replace("/login");
  };

  return (
    <header className="flex items-center justify-between gap-4 px-4 lg:px-8 h-14 lg:h-16">
      <div className="flex items-center gap-3 text-[15px] text-[#5e5e5e]">
        <button
          onClick={() => router.back()}
          className="grid place-items-center h-8 w-8 rounded-full hover:bg-white/70"
          aria-label="Back"
        >
          <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={1.8} />
        </button>
        {showCreateChip ? (
          <button className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-[#E1DCEB] px-3 py-1.5 text-[13px] text-[#5e5e5e]">
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            Create New
          </button>
        ) : (
          <span className="inline-flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" strokeWidth={1.6} />
            {crumb}
          </span>
        )}
      </div>

      <div className="hidden lg:flex items-center gap-4">
        <button className="relative grid place-items-center h-9 w-9 rounded-full hover:bg-white/70" aria-label="Notifications">
          <Bell className="h-[18px] w-[18px] text-[#5e5e5e]" strokeWidth={1.8} />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-[#FF5623]" />
        </button>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-full bg-white/60 px-2 py-1.5 ring-1 ring-[#E1DCEB] hover:bg-white"
          >
            <span className="h-7 w-7 rounded-full bg-gradient-to-br from-[#FFD8C9] to-[#FF5623] grid place-items-center text-white text-[12px] font-semibold">
              {initial}
            </span>
            <span className="text-[13px] font-medium text-dark pr-1 truncate max-w-[140px]">
              {displayName}
            </span>
            <ChevronDown
              className={`h-3.5 w-3.5 text-[#5e5e5e] mr-1.5 transition ${menuOpen ? "rotate-180" : ""}`}
            />
          </button>
          {menuOpen ? (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl border border-[#E1DCEB] shadow-lg overflow-hidden z-30">
              <div className="px-4 py-3 border-b border-[#F0F0F0]">
                <div className="text-[13px] font-semibold text-dark truncate">{displayName}</div>
                <div className="text-[11px] text-muted truncate">{user?.email ?? ""}</div>
              </div>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  router.push("/settings");
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-[13px] text-dark hover:bg-[#F6F6F6]"
              >
                <UserRound className="h-4 w-4 text-[#5e5e5e]" />
                Account settings
              </button>
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-[13px] text-[#E11D48] hover:bg-[#FFF1F2]"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
