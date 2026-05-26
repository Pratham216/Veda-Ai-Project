export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="grid place-items-center h-8 w-8 rounded-lg bg-[#FF5623]/10 ring-1 ring-[#FF5623]/20">
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
      <span className="font-bold text-[18px] tracking-tight text-dark">VedaAI</span>
    </div>
  );
}
