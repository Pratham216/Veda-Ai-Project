"use client";

import { create } from "zustand";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  schoolName: string;
  location: string;
};

type State = {
  token: string | null;
  user: AuthUser | null;
  hydrated: boolean;
  setSession: (token: string, user: AuthUser) => void;
  clearSession: () => void;
  hydrate: () => void;
};

const KEY = "vedaai.auth";

export const useAuthStore = create<State>((set) => ({
  token: null,
  user: null,
  hydrated: false,
  setSession: (token, user) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(KEY, JSON.stringify({ token, user }));
    }
    set({ token, user, hydrated: true });
  },
  clearSession: () => {
    if (typeof window !== "undefined") localStorage.removeItem(KEY);
    set({ token: null, user: null, hydrated: true });
  },
  hydrate: () => {
    if (typeof window === "undefined") return set({ hydrated: true });
    const raw = localStorage.getItem(KEY);
    if (!raw) return set({ hydrated: true });
    try {
      const parsed = JSON.parse(raw) as { token: string; user: AuthUser };
      if (parsed?.token && parsed?.user) {
        set({ token: parsed.token, user: parsed.user, hydrated: true });
        return;
      }
    } catch {
      /* fall through */
    }
    set({ hydrated: true });
  },
}));

export function getAuthHeader(): Record<string, string> {
  const token = useAuthStore.getState().token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}
