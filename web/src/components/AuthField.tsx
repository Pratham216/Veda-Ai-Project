"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState, type InputHTMLAttributes } from "react";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
  icon?: React.ReactNode;
};

export function AuthField({ label, hint, error, icon, type, className, ...rest }: FieldProps) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const effectiveType = isPassword ? (visible ? "text" : "password") : type;

  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-[12.5px] font-medium text-dark">{label}</span>
        {hint ? <span className="text-[11px] text-[#a9a9a9]">{hint}</span> : null}
      </div>
      <div
        className={`relative flex items-center bg-white rounded-xl border transition focus-within:border-[#181818] ${
          error ? "border-[#E11D48]" : "border-[#E1DCEB]"
        }`}
      >
        {icon ? (
          <span className="pl-3 text-[#a9a9a9] grid place-items-center h-11 w-9">{icon}</span>
        ) : null}
        <input
          type={effectiveType}
          {...rest}
          className={`flex-1 bg-transparent py-3 ${icon ? "pl-1" : "pl-4"} ${
            isPassword ? "pr-11" : "pr-4"
          } text-[14px] text-dark placeholder:text-[#a9a9a9] focus:outline-none ${className ?? ""}`}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center h-8 w-8 rounded-lg text-[#5e5e5e] hover:bg-[#F6F6F6]"
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        ) : null}
      </div>
      {error ? <p className="mt-1 text-[12px] text-[#E11D48]">{error}</p> : null}
    </label>
  );
}
