"use client";

import { Bell, LogOut, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { Logo } from "./Logo";
import { useAuthStore } from "@/store/useAuthStore";

export function MobileTopbar() {
  const router = useRouter();
  const { user, clearSession } = useAuthStore();
  const initial = (user?.name?.[0] ?? "?").toUpperCase();
  const onLogout = () => {
    clearSession();
    router.replace("/login");
  };
  return (
    <header className="lg:hidden flex items-center justify-between gap-3 bg-white px-4 py-3 sticky top-0 z-30 border-b border-[#F0F0F0]">
      <Logo />
      <div className="flex items-center gap-3">
        <button className="relative grid place-items-center h-8 w-8" aria-label="Notifications">
          <Bell className="h-[18px] w-[18px] text-[#5e5e5e]" strokeWidth={1.8} />
          <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-[#FF5623]" />
        </button>
        <button
          className="h-8 w-8 rounded-full bg-gradient-to-br from-[#FFD8C9] to-[#FF5623] grid place-items-center text-white text-[12px] font-semibold"
          aria-label="Profile"
        >
          {initial}
        </button>
        <button
          onClick={onLogout}
          className="grid place-items-center h-8 w-8 text-[#5e5e5e]"
          aria-label="Sign out"
        >
          <LogOut className="h-[18px] w-[18px]" strokeWidth={1.8} />
        </button>
      </div>
    </header>
  );
}

export function MobileSubHeader({ label, showBack = true }: { label: string; showBack?: boolean }) {
  return (
    <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-[#F0F0F0] bg-background">
      {showBack ? (
        <button className="text-[#5e5e5e]" onClick={() => history.back()} aria-label="Back">
          <span className="inline-block h-5 w-5 leading-none">←</span>
        </button>
      ) : (
        <span className="w-5" />
      )}
      <div className="font-semibold text-[15px] text-dark">{label}</div>
      <span className="w-5" />
    </div>
  );
}
