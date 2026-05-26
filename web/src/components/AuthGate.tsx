"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useAssignmentStore } from "@/store/useAssignmentStore";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, user, hydrated, hydrate } = useAuthStore();
  const setDraft = useAssignmentStore((s) => s.setDraft);
  const draft = useAssignmentStore((s) => s.draft);

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  useEffect(() => {
    if (!hydrated) return;
    if (!token) {
      const next = encodeURIComponent(pathname || "/");
      router.replace(`/login?next=${next}`);
    }
  }, [hydrated, token, router, pathname]);

  // Once we know the user, sync their school/teacher defaults into the create-form draft
  // (unless the user has already edited the draft).
  useEffect(() => {
    if (!user) return;
    const patch: Partial<typeof draft> = {};
    if (!draft.schoolName) patch.schoolName = user.schoolName || "";
    if (!draft.teacherName) patch.teacherName = user.name || "";
    if (Object.keys(patch).length > 0) setDraft(patch);
  }, [user, draft.schoolName, draft.teacherName, setDraft]);

  if (!hydrated || !token) {
    return (
      <div className="min-h-screen grid place-items-center text-[13px] text-muted">
        Loading…
      </div>
    );
  }

  return <>{children}</>;
}
