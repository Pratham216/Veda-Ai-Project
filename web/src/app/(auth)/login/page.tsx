"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Loader2, Lock, Mail } from "lucide-react";
import { AuthField } from "@/components/AuthField";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const setSession = useAuthStore((s) => s.setSession);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setServerError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      const { token, user } = await api.login(form);
      setSession(token, user);
      router.replace(search.get("next") ?? "/");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-[28px] lg:text-[32px] font-bold tracking-tight text-dark leading-tight">
          Welcome back.
        </h1>
        <p className="mt-1 text-[13px] text-muted">
          Sign in to keep building exam papers with VedaAI.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <AuthField
          label="Email"
          type="email"
          placeholder="you@school.edu"
          autoComplete="email"
          icon={<Mail className="h-4 w-4" />}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          error={errors.email}
        />
        <AuthField
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          autoComplete="current-password"
          icon={<Lock className="h-4 w-4" />}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          error={errors.password}
        />

        {serverError ? (
          <div className="rounded-lg bg-[#FEF2F2] border border-[#FCD8D8] px-3 py-2 text-[12.5px] text-[#9F1239]">
            {serverError}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="btn-dark-glow w-full inline-flex items-center justify-center gap-2 rounded-full text-white px-6 py-3 text-[14px] font-medium disabled:opacity-60"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Sign in
              <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-[13px] text-muted">
        New to VedaAI?{" "}
        <Link href="/signup" className="text-dark font-semibold hover:text-[#FF5623]">
          Create an account
        </Link>
      </p>
    </div>
  );
}
