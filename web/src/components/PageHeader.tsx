export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="relative inline-flex h-2.5 w-2.5 shrink-0">
        <span className="absolute inset-0 rounded-full bg-[#22C55E] opacity-75 animate-ping" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#22C55E]" />
      </span>
      <div>
        <h1 className="text-[22px] lg:text-[24px] font-bold tracking-tight text-dark leading-tight">
          {title}
        </h1>
        {subtitle ? <p className="text-[13px] text-muted">{subtitle}</p> : null}
      </div>
    </div>
  );
}
