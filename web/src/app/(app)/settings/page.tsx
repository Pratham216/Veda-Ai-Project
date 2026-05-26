import { Topbar } from "@/components/Topbar";
import { BottomNav } from "@/components/BottomNav";

export default function SettingsPage() {
  return (
    <>
      <Topbar crumb="Settings" />
      <main className="px-4 lg:px-8">
        <h1 className="text-[22px] font-bold text-dark">Settings</h1>
        <p className="text-[13px] text-muted mt-1">Coming soon.</p>
      </main>
      <BottomNav />
    </>
  );
}
