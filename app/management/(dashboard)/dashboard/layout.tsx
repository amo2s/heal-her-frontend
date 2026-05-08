import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

// --- PERIMETER COMPONENTS ---
// We assume these are located exactly where you specified.
// They will be rendered as Server Components by default.
import Sidebar from "@/components/management/principal-rail/sidebar";
import Topbar from "@/components/management/principal-rail/topbar";

export default async function ManagementDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // =====================================================================
  // 1. THE SERVER-SIDE AEGIS (Perimeter Identity Check)
  // =====================================================================
  // This executes on the server before a single byte of HTML is sent to the browser.
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("admin-access-token");

  if (!accessToken?.value) {
    // If the primary access token is missing, the connection is instantly severed.
    redirect("/management/auth/login");
  }

  return (
    <div className="relative min-h-screen bg-[#0A0A0F] text-white flex overflow-hidden">
      
      {/* =====================================================================
          2. THE ZERO-JS STATE MACHINE (Hardware-Accelerated Layout)
          =====================================================================
          This hidden checkbox acts as the global state for the sidebar. 
          When the user clicks the hamburger menu in the Topbar (which acts as a <label> 
          for this specific ID), the `peer-checked` CSS classes instantly trigger.
          Zero React state. Zero re-renders. Infinite performance.
      */}
      <input
        type="checkbox"
        id="sidebar-toggle"
        className="peer hidden"
        defaultChecked={false}
      />

      {/* =====================================================================
          3. THE PRINCIPAL RAIL (Sidebar - Z-Index: 50)
          =====================================================================
          Notice the `peer-checked:w-[80px]`. If the hidden checkbox is ticked, 
          the sidebar collapses hardware-smoothly to 80px.
      */}
      <aside className="group/aside relative z-50 w-[280px] peer-checked:w-[80px] transition-[width] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] shrink-0 border-r border-white/5 bg-black/40 backdrop-blur-2xl flex flex-col">
        <Sidebar />
      </aside>

      {/* =====================================================================
          4. THE DYNAMIC CONTENT AREA (Main Stage)
          ===================================================================== */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        
        {/* --- TOPBAR (Z-Index: 40) --- */}
        {/* 
            The Topbar sits below the Sidebar in the Z-Vortex to ensure dropdowns 
            from the Topbar don't overlap the Principal Rail. 
        */}
        <header className="relative z-40 h-20 border-b border-white/5 bg-black/20 backdrop-blur-xl flex items-center px-6">
          <Topbar />
        </header>

        {/* --- STREAMING MAIN STAGE (Z-Index: 10) --- */}
        {/* 
            The children are wrapped in a Suspense boundary. If the page is fetching 
            heavy data via the proxy, the shell (Sidebar/Topbar) remains visible and 
            interactive, while only this specific area shows the skeleton.
        */}
        <main className="flex-1 overflow-y-auto relative z-10 scroll-smooth">
          <Suspense fallback={<DashboardGlobalSkeleton />}>
            {children}
          </Suspense>
        </main>
        
      </div>
    </div>
  );
}

// =====================================================================
// 5. THE HOLOGRAPHIC SKELETON (Suspense Fallback)
// =====================================================================
function DashboardGlobalSkeleton() {
  return (
    <div className="p-6 md:p-10 w-full h-full flex flex-col gap-6 animate-pulse">
      {/* Skeleton Header */}
      <div className="h-12 w-64 bg-white/5 rounded-xl border border-white/10" />
      
      {/* Skeleton Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-[140px] bg-white/5 rounded-[1.5rem] border border-white/10" />
        ))}
      </div>
      
      {/* Skeleton Action Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        <div className="lg:col-span-2 h-[400px] bg-white/5 rounded-[1.5rem] border border-white/10" />
        <div className="h-[400px] bg-white/5 rounded-[1.5rem] border border-white/10" />
      </div>
    </div>
  );
}