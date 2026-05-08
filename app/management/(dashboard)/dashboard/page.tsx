import { redirect } from "next/navigation";
import { 
  ShieldCheck, Users, Video, Activity, AlertTriangle, CheckCircle2, Clock as ClockIcon
} from "lucide-react";
import { fortressFetch } from "@/lib/utility";
import { ClockIsland } from "@/components/management/dashboard/clock-island";

const GET_IDENTITY_QUERY = `
  query GetIdentity {
    getMe {
      success
      message
      profile {
        fullName
        role
        email
      }
    }
  }
`;

export default async function ManagementDashboardHome() {
  // =====================================================================
  // 1. THE ZERO-LATENCY IDENTITY SIPHON (Direct FastAPI Connect)
  // =====================================================================
  let profile = null;
  let requiresRedirect = false;

  try {
    const response = await fortressFetch("/graphql", {
      method: "POST",
      body: JSON.stringify({ query: GET_IDENTITY_QUERY }),
    });

    const data = response?.data?.getMe;

    if (!data || data.success === false) {
      console.warn("[SECURITY] Invalid or expired session. Flagging for perimeter boot...");
      requiresRedirect = true;
    } else {
      profile = data.profile;
    }

  } catch (error) {
    console.error("[CRITICAL] Identity Siphon Failed:", error);
    requiresRedirect = true;
  }

  // THE STRICT REDIRECT (Executed safely outside the try/catch)
  if (requiresRedirect) {
    redirect('/management/auth/login'); 
  }

  const firstName = profile?.fullName?.split(' ')[0] || "Agent";
  const role = profile?.role || "GUEST";

  return (
    <div className="min-h-full w-full p-6 md:p-10 relative overflow-hidden">
      
      {/* --- BACKGROUND AMBIENCE --- */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        
        {/* --- HEADER: TEMPORAL ISLAND --- */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <ClockIsland firstName={firstName} role={role} />
        </header>

        {/* --- TELEMETRY GRID (Hardware Accelerated Pure CSS Animation) --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Stat 1 */}
          <div className="bg-white/5 border border-white/10 rounded-[1.5rem] p-6 backdrop-blur-xl hover:bg-white/10 transition-colors animate-in fade-in slide-in-from-bottom-4 duration-500 delay-[100ms] fill-mode-both">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                <Users className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="text-xs font-black text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg">+12%</span>
            </div>
            <p className="text-[#CCCCD9]/60 text-xs font-bold uppercase tracking-widest mb-1">Total Active Kids</p>
            <h3 className="text-4xl font-black text-white">1,204</h3>
          </div>

          {/* Stat 2 */}
          <div className="bg-white/5 border border-white/10 rounded-[1.5rem] p-6 backdrop-blur-xl hover:bg-white/10 transition-colors animate-in fade-in slide-in-from-bottom-4 duration-500 delay-[200ms] fill-mode-both">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-rose-500/20 rounded-xl border border-rose-500/30">
                <Video className="w-5 h-5 text-rose-400" />
              </div>
              <span className="text-xs font-black text-rose-400 bg-rose-400/10 px-2 py-1 rounded-lg flex items-center gap-1">
                <ClockIcon className="w-3 h-3" /> Queue
              </span>
            </div>
            <p className="text-[#CCCCD9]/60 text-xs font-bold uppercase tracking-widest mb-1">Content Approval</p>
            <h3 className="text-4xl font-black text-white">8</h3>
          </div>

          {/* Stat 3 */}
          <div className="bg-white/5 border border-white/10 rounded-[1.5rem] p-6 backdrop-blur-xl hover:bg-white/10 transition-colors animate-in fade-in slide-in-from-bottom-4 duration-500 delay-[300ms] fill-mode-both">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-amber-500/20 rounded-xl border border-amber-500/30">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <p className="text-[#CCCCD9]/60 text-xs font-bold uppercase tracking-widest mb-1">Pending Staff</p>
            <h3 className="text-4xl font-black text-white">3</h3>
          </div>

          {/* Stat 4 */}
          <div className="bg-white/5 border border-white/10 rounded-[1.5rem] p-6 backdrop-blur-xl hover:bg-white/10 transition-colors animate-in fade-in slide-in-from-bottom-4 duration-500 delay-[400ms] fill-mode-both">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
                <Activity className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-xs font-black text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg">Nominal</span>
            </div>
            <p className="text-[#CCCCD9]/60 text-xs font-bold uppercase tracking-widest mb-1">System Health</p>
            <h3 className="text-4xl font-black text-white">99.9%</h3>
          </div>
        </div>

        {/* --- MAIN ACTION AREA --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-[500ms] fill-mode-both">
          
          {/* Quick Actions (Admin Queue) */}
          <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-[1.5rem] p-6 backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" /> Administrative Queue
            </h2>
            <div className="space-y-3">
              {/* Dummy Queue Item 1 */}
              <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/30">
                    TJ
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm md:text-base">Teacher Jane requests access</p>
                    <p className="text-[#CCCCD9]/60 text-xs font-bold uppercase tracking-widest mt-1">Role: TEACHER • 2 hrs ago</p>
                  </div>
                </div>
                <button className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-xl transition-colors">
                  Review
                </button>
              </div>
              
              {/* Dummy Queue Item 2 */}
              <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-rose-500/20 flex items-center justify-center border border-rose-500/30">
                    <Video className="w-5 h-5 text-rose-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm md:text-base">"Internet Safety Basics" Video</p>
                    <p className="text-[#CCCCD9]/60 text-xs font-bold uppercase tracking-widest mt-1">Uploaded by C_Creator_01</p>
                  </div>
                </div>
                <button className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-xl transition-colors">
                  Review
                </button>
              </div>
            </div>
          </div>

          {/* System Log */}
          <div className="bg-white/5 border border-white/10 rounded-[1.5rem] p-6 backdrop-blur-xl flex flex-col">
            <h2 className="text-xl font-bold text-white mb-6">Security Log</h2>
            <div className="flex-1 space-y-5">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/90">Super Admin login successful.</p>
                  <p className="text-xs text-white/40 mt-0.5">Just now • IP: Local</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/90">Failed login attempt blocked.</p>
                  <p className="text-xs text-white/40 mt-0.5">10 mins ago • IP: 192.168.1.4</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/90">Valkey Tar-pit initialized.</p>
                  <p className="text-xs text-white/40 mt-0.5">System startup</p>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}