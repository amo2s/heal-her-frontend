import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense, ReactNode } from "react";

// --- PERIMETER COMPONENTS ---
import Topbar from "@/components/management/principal-rail/topbar";

export const dynamic = "force-dynamic";
// =====================================================================
// 1. DEDICATED TYPE DEFINITION FOR PARALLEL SLOTS
// =====================================================================
interface LayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
}

// =====================================================================
// 2. THE HOLOGRAPHIC SKELETON (Moved up to prevent compilation hoisting issues)
// =====================================================================
function DashboardGlobalSkeleton() {
  return (
    <div className="p-6 md:p-10 w-full h-full flex flex-col gap-6 animate-pulse">
      <div className="h-12 w-64 bg-white/5 rounded-xl border border-white/10" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-[140px] bg-white/5 rounded-[1.5rem] border border-white/10" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        <div className="lg:col-span-2 h-[400px] bg-white/5 rounded-[1.5rem] border border-white/10" />
        <div className="h-[400px] bg-white/5 rounded-[1.5rem] border border-white/10" />
      </div>
    </div>
  );
}

// =====================================================================
// 3. MAIN DASHBOARD LAYOUT EXPORT
// =====================================================================
export default async function ManagementDashboardLayout({
  children,
  sidebar,
}: LayoutProps) {
  // =====================================================================
  // THE SERVER-SIDE AEGIS (Perimeter Identity Check)
  // =====================================================================
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("admin-access-token");

  if (!accessToken?.value) {
    redirect("/management/auth/login");
  }

  return (
    <div className="relative min-h-screen bg-[#0A0A0F] text-white flex overflow-hidden">
      
      {/* =====================================================================
          THE ZERO-JS STATE MACHINE (Hardware-Accelerated Layout)
          ==================================================================== */}
      <input
        type="checkbox"
        id="sidebar-toggle"
        className="peer hidden"
        defaultChecked={false}
      />

      {/* =====================================================================
          THE DYNAMIC RAIL (Z-Index: 50)
          ===================================================================== */}
      <aside className="group/aside relative z-50 w-[280px] peer-checked:w-[80px] transition-[width] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] shrink-0 border-r border-white/5 bg-black/40 backdrop-blur-2xl flex flex-col">
        {sidebar}
      </aside>

      {/* =====================================================================
          THE DYNAMIC CONTENT AREA (Main Stage)
          ===================================================================== */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        
        {/* --- GLOBAL TOPBAR (Z-Index: 40) --- */}
        <header className="relative z-40 h-20 border-b border-white/5 bg-black/20 backdrop-blur-xl flex items-center px-6">
          <Topbar />
        </header>

        {/* --- STREAMING MAIN STAGE (Z-Index: 10) --- */}
        <main className="flex-1 flex flex-col overflow-y-auto relative z-10 scroll-smooth">
          <Suspense fallback={<DashboardGlobalSkeleton />}>
            {children}
          </Suspense>
        </main>
        
      </div>
    </div>
  );
}