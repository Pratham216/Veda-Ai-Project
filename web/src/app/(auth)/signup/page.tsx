"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Building2, Loader2, Lock, Mail, MapPin, UserRound } from "lucide-react";
import { AuthField } from "@/components/AuthField";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

export default function SignupPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    schoolName: "",
    location: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8) e.password = "Use at least 8 characters";
    if (!form.schoolName.trim()) e.schoolName = "School name is required";
    if (!form.location.trim()) e.location = "Location is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setServerError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      const { token, user } = await api.signup(form);
      setSession(token, user);
      router.replace("/");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[28px] lg:text-[32px] font-bold tracking-tight text-dark leading-tight">
          Create your account.
        </h1>
        <p className="mt-1 text-[13px] text-muted">
          A minute to set up. Your assistant will be ready right after.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3.5">
        <AuthField
          label="Full name"
          type="text"
          placeholder="Jane Sharma"
          autoComplete="name"
          icon={<UserRound className="h-4 w-4" />}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          error={errors.name}
        />
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
          hint="8+ characters"
          type="password"
          placeholder="Use a strong password"
          autoComplete="new-password"
          icon={<Lock className="h-4 w-4" />}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          error={errors.password}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <AuthField
            label="School name"
            type="text"
            placeholder="Delhi Public School"
            icon={<Building2 className="h-4 w-4" />}
            value={form.schoolName}
            onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
            error={errors.schoolName}
          />
          <AuthField
            label="Location"
            type="text"
            placeholder="Bokaro, Jharkhand"
            icon={<MapPin className="h-4 w-4" />}
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            error={errors.location}
          />
        </div>

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
              Create account
              <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
            </>
          )}
        </button>

        <p className="text-[11px] text-muted text-center pt-1">
          By signing up you agree to our terms and privacy policy.
        </p>
      </form>

      <p className="mt-5 text-center text-[13px] text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-dark font-semibold hover:text-[#FF5623]">
          Sign in
        </Link>
      </p>
    </div>
  );
}
