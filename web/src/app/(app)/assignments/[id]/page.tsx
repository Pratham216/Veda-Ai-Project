"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/Topbar";
import { BottomNav } from "@/components/BottomNav";
import { useAssignmentStore, type Assignment } from "@/store/useAssignmentStore";
import { api } from "@/lib/api";
import { subscribeAssignment } from "@/lib/socket";
import { downloadAssignmentPdf } from "@/lib/pdf";
import { Download, Loader2, RefreshCw } from "lucide-react";

type Params = Promise<{ id: string }>;

export default function OutputPage({ params }: { params: Params }) {
  const { id } = use(params);
  const router = useRouter();
  const { assignments, hydrated, loadFromApi, upsertAssignment } = useAssignmentStore();
  const [progress, setProgress] = useState<number>(0);
  const [liveStatus, setLiveStatus] = useState<Assignment["status"] | null>(null);

  useEffect(() => {
    if (!hydrated) loadFromApi();
  }, [hydrated, loadFromApi]);

  // If we don't have this assignment in the store (e.g. deep-link), fetch it.
  useEffect(() => {
    const existing = assignments.find((x) => x.id === id);
    if (existing || id.startsWith("local-")) return;
    let cancelled = false;
    api
      .get(id)
      .then((a) => {
        if (!cancelled) upsertAssignment(a);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [id, assignments, upsertAssignment]);

  // Subscribe to live status events for non-local assignments.
  useEffect(() => {
    if (id.startsWith("local-")) return;
    const off = subscribeAssignment(id, (e) => {
      setLiveStatus(e.status);
      if (typeof e.progress === "number") setProgress(e.progress);
      if (e.status === "ready" || e.status === "failed") {
        // Refetch to grab the latest result/error, then upsert.
        api.get(id).then(upsertAssignment).catch(() => {});
      }
    });
    return off;
  }, [id, upsertAssignment]);

  const a = assignments.find((x) => x.id === id);
  const status = liveStatus ?? a?.status ?? "queued";

  // Polling fallback: if the socket event is missed (network blip, retry race, etc),
  // poll the API every 4 seconds until the assignment resolves to ready/failed.
  useEffect(() => {
    if (id.startsWith("local-")) return;
    if (a?.result || status === "failed") return;
    const handle = setInterval(() => {
      api
        .get(id)
        .then((fresh) => {
          upsertAssignment(fresh);
          if (fresh.status === "ready" || fresh.status === "failed") {
            setLiveStatus(fresh.status);
          }
        })
        .catch(() => {});
    }, 4000);
    return () => clearInterval(handle);
  }, [id, status, a?.result, upsertAssignment]);

  if (!a) {
    return (
      <>
        <Topbar showCreateChip />
        <main className="px-3 lg:px-8 pb-24 lg:pb-10">
          <LoadingShell label="Loading assignment…" progress={progress} />
        </main>
        <BottomNav />
      </>
    );
  }

  const showFailed = status === "failed";
  const showLoading = !showFailed && !a.result;

  return (
    <>
      <Topbar showCreateChip />
      <main className="px-3 lg:px-8 pb-24 lg:pb-10">
        {/* Banner */}
        <div className="banner-dark text-white rounded-2xl px-5 lg:px-7 py-4 lg:py-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <p className="text-[13px] lg:text-[14px] leading-relaxed max-w-3xl">
            {showLoading
              ? "Generating your customized question paper — this usually takes 10-30 seconds."
              : showFailed
              ? "Generation failed. Try regenerating the paper."
              : `Certainly, ${a?.teacherName?.trim() || "there"}! Here is your customized Question Paper, ready for download or review.`}
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => a && downloadAssignmentPdf(a)}
              disabled={showLoading || showFailed}
              className="inline-flex items-center gap-2 rounded-full bg-white text-dark px-4 py-2 text-[13px] font-medium hover:bg-white/90 disabled:opacity-40"
            >
              <Download className="h-4 w-4" strokeWidth={2} />
              Download as PDF
            </button>
            <button
              onClick={() => router.push("/assignments/new")}
              className="hidden lg:inline-flex items-center gap-2 rounded-full border border-white/15 text-white px-4 py-2 text-[13px] hover:bg-white/5"
              title="Regenerate"
            >
              <RefreshCw className="h-4 w-4" />
              Regenerate
            </button>
          </div>
        </div>

        {showLoading ? (
          <LoadingShell label={statusLabel(status)} progress={progress} />
        ) : showFailed ? (
          <FailedShell />
        ) : (
          <Paper a={a} />
        )}
      </main>
      <BottomNav />
    </>
  );
}

function statusLabel(s: Assignment["status"]) {
  switch (s) {
    case "queued":
      return "Getting started…";
    case "generating":
      return "Crafting your question paper…";
    case "failed":
      return "Something went wrong.";
    default:
      return "Just a moment…";
  }
}

function LoadingShell({ label, progress }: { label: string; progress: number }) {
  return (
    <article className="mt-4 mx-auto max-w-3xl bg-white border border-[#F0F0F0] rounded-2xl p-10 text-center">
      <Loader2 className="h-8 w-8 mx-auto animate-spin text-[#FF5623]" />
      <h2 className="mt-4 text-[16px] font-semibold text-dark">{label}</h2>
      <p className="mt-1 text-[13px] text-muted">
        Hang tight — this usually takes 20-30 seconds. Your paper will appear here automatically.
      </p>
      <div className="mt-4 mx-auto h-1.5 max-w-xs rounded-full bg-[#F0F0F0] overflow-hidden">
        <div
          className="h-full bg-[#FF5623] transition-all duration-500"
          style={{ width: `${Math.max(8, progress)}%` }}
        />
      </div>
    </article>
  );
}

function FailedShell() {
  return (
    <article className="mt-4 mx-auto max-w-3xl bg-white border border-[#FCD8D8] rounded-2xl p-10 text-center">
      <h2 className="text-[16px] font-semibold text-[#9F1239]">Generation failed</h2>
      <p className="mt-1 text-[13px] text-muted">
        Something went wrong while contacting the LLM. Use Regenerate to try again.
      </p>
    </article>
  );
}

function Paper({ a }: { a: Assignment }) {
  const r = a.result;
  if (!r) return null;
  return (
    <article className="mt-4 mx-auto max-w-3xl bg-white border border-[#F0F0F0] rounded-2xl p-6 lg:p-10 print:shadow-none print:border-0 print:max-w-none">
      <header className="text-center">
        <h1 className="text-[20px] lg:text-[22px] font-bold tracking-tight text-dark">
          {r.schoolName}
        </h1>
        <p className="mt-1 text-[14px] text-dark">Subject: {r.subject}</p>
        <p className="text-[14px] text-dark">Class: {r.className}</p>
      </header>

      <div className="mt-5 flex flex-col lg:flex-row lg:items-center lg:justify-between text-[13px] text-dark">
        <span>Time Allowed: {r.timeAllowedMinutes} minutes</span>
        <span>Maximum Marks: {r.maximumMarks}</span>
      </div>
      <p className="mt-2 text-[13px] text-dark">
        All questions are compulsory unless stated otherwise.
      </p>

      <div className="mt-5 space-y-2 text-[13px] text-dark">
        <StudentLine label="Name" />
        <StudentLine label="Roll Number" />
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="whitespace-nowrap">Class: {r.className}</span>
          <span className="whitespace-nowrap">Section:</span>
          <span className="border-b border-dashed border-[#a9a9a9] flex-1 min-w-[120px]" />
        </div>
      </div>

      {r.sections.map((s) => (
        <section key={s.title} className="mt-7">
          <h2 className="text-center text-[16px] font-bold text-dark">{s.title}</h2>
          <p className="mt-2 text-[13px] text-dark whitespace-pre-line italic">
            {s.instruction}
          </p>
          <ol className="mt-3 space-y-2 text-[13px] text-dark list-decimal pl-5">
            {s.questions.map((q, i) => (
              <li key={i} className="leading-relaxed">
                <span className={`font-semibold ${difficultyClass(q.difficulty)}`}>
                  [{q.difficulty}]
                </span>{" "}
                {q.text}{" "}
                <span className="text-[#5e5e5e]">[{q.marks} Marks]</span>
              </li>
            ))}
          </ol>
        </section>
      ))}

      <p className="mt-7 text-center italic text-[13px] text-dark">End of Question Paper</p>

      {r.answerKey.length > 0 ? (
        <section className="mt-8 pt-6 border-t border-[#F0F0F0]">
          <h2 className="text-[15px] font-bold text-dark">Answer Key:</h2>
          <ol className="mt-3 space-y-3 text-[13px] text-dark list-decimal pl-5">
            {r.answerKey.map((line, i) => (
              <li key={i} className="leading-relaxed">
                {line}
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </article>
  );
}

function StudentLine({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="whitespace-nowrap">{label}:</span>
      <span className="border-b border-dashed border-[#a9a9a9] flex-1 min-w-[160px]" />
    </div>
  );
}

function difficultyClass(d: string): string {
  switch (d) {
    case "Easy":
      return "text-[#166534]"; // green
    case "Moderate":
      return "text-[#B45309]"; // amber
    case "Challenging":
      return "text-[#9F1239]"; // rose
    default:
      return "text-dark";
  }
}

