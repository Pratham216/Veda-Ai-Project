import { Sidebar } from "@/components/Sidebar";
import { MobileTopbar } from "@/components/MobileTopbar";
import { AuthGate } from "@/components/AuthGate";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <div className="min-h-screen flex">
        <Sidebar topAction="create" />
        <div className="flex-1 min-w-0">
          <MobileTopbar />
          {children}
        </div>
      </div>
    </AuthGate>
  );
}
