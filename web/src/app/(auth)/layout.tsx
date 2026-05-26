import { AuthBranding } from "@/components/AuthBranding";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <AuthBranding />
      <main className="flex-1 flex items-center justify-center px-6 py-10 bg-background">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
