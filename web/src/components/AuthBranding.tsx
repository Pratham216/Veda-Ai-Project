import { Sparkles } from "lucide-react";
import { Logo } from "./Logo";

export function AuthBranding() {
  return (
    <aside className="hidden lg:flex relative flex-col justify-between w-[46%] xl:w-[42%] banner-dark text-white p-10 xl:p-14 overflow-hidden">
      {/* Decorative gradient orbs */}
      <div
        aria-hidden
        className="absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full blur-3xl opacity-40"
        style={{ background: "radial-gradient(closest-side, #FF5623 0%, transparent 70%)" }}
      />
      <div
        aria-hidden
        className="absolute -bottom-40 -right-20 h-[420px] w-[420px] rounded-full blur-3xl opacity-25"
        style={{ background: "radial-gradient(closest-side, #A855F7 0%, transparent 70%)" }}
      />

      <div className="relative z-10">
        <div className="flex items-center gap-2">
          <span className="grid place-items-center h-9 w-9 rounded-xl bg-white/10 ring-1 ring-white/15">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
              <path
                d="M12 3C16 7 18 10 18 14a6 6 0 1 1-12 0c0-4 2-7 6-11Z"
                fill="#FF5623"
              />
              <path
                d="M10 12c1.6 1.6 2.4 3.2 2.4 5"
                stroke="#fff"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="font-bold tracking-tight text-lg">VedaAI</span>
        </div>
      </div>

      <div className="relative z-10 space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 ring-1 ring-white/15 px-3 py-1.5 text-[12px]">
          <Sparkles className="h-3.5 w-3.5 text-[#FF5623]" />
          AI for teachers
        </div>
        <h1 className="text-[40px] xl:text-[44px] font-bold leading-[1.05] tracking-tight">
          Spin up exam-ready
          <br />
          question papers <span className="text-[#FF5623]">in seconds.</span>
        </h1>
        <p className="text-white/70 text-[14px] leading-relaxed max-w-md">
          VedaAI drafts, formats and grades assignments for you — so you can spend
          your time teaching, not typing.
        </p>

        <div className="flex flex-wrap gap-2 pt-2">
          {[
            "Difficulty mix",
            "Auto sections",
            "Answer key",
            "PDF export",
            "Multi-model",
          ].map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white/5 ring-1 ring-white/10 px-3 py-1 text-[11px] text-white/70"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-3 text-[12px] text-white/60">
        <div className="flex -space-x-2">
          {["#FFD8C9", "#DBEAFE", "#DCFCE7", "#FEE2E2"].map((c, i) => (
            <span
              key={i}
              className="h-7 w-7 rounded-full ring-2 ring-[#181818]"
              style={{ background: c }}
            />
          ))}
        </div>
        <span>Trusted by teachers across 50+ schools</span>
      </div>
    </aside>
  );
}
