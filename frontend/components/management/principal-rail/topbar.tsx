import { Search, Menu, Bell } from "lucide-react";
import { fortressFetch } from "@/lib/utility";
import { Breadcrumbs } from "./breadcrumbs";
import { ProfileDropdown } from "./profile-dropdown";
import { SystemPulse } from "./system-pulse";
import { SearchTrigger } from "./search-trigger";

const GET_ME_QUERY = `
  query GetStaffIdentity {
    getMe {
      success
      profile {
        fullName
        role
      }
    }
  }
`;

export default async function Topbar() {
  // Siphon identity for the Profile Island
  let userProfile = null;
  try {
    const response = await fortressFetch("/graphql", {
      method: "POST",
      body: JSON.stringify({ query: GET_ME_QUERY }),
    });
    userProfile = response?.data?.getMe?.profile;
  } catch (e) {
    console.error("[TOPBAR IDENTITY FAILURE]:", e);
  }

  return (
    <div className="w-full h-full flex items-center justify-between gap-4">
      {/* --- ZONE ALPHA: NAVIGATION CONTROL --- */}
      <div className="flex items-center gap-4">
        {/* SIDEBAR TOGGLE: Connected to the hidden checkbox in layout.tsx via htmlFor */}
        <label 
          htmlFor="sidebar-toggle" 
          className="p-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-[#00FFFF]/30 text-gray-400 hover:text-[#00FFFF] transition-all cursor-pointer group"
        >
          <Menu className="w-5 h-5 group-active:scale-90 transition-transform" />
        </label>

        <div className="h-8 w-[1px] bg-white/5 mx-2 hidden md:block" />
        
        {/* PATH-AWARE BREADCRUMBS (Client Island) */}
        <Breadcrumbs />
      </div>

      {/* --- ZONE BETA: INTELLIGENCE & COMMAND --- */}
      <div className="flex-1 max-w-xl hidden lg:block">
        <SearchTrigger />
      </div>

      {/* --- ZONE GAMMA: TELEMETRY & IDENTITY --- */}
      <div className="flex items-center gap-3">
        {/* Real-time System Health Indicator */}
        <SystemPulse />

        <div className="h-8 w-[1px] bg-white/5 mx-2" />

        {/* Notifications (Optional Expansion) */}
        <button className="p-2.5 rounded-xl border border-white/5 bg-white/5 text-gray-400 hover:text-white transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#FF1493] rounded-full ring-4 ring-black" />
        </button>

        {/* IDENTITY AEGIS (Client Island) */}
        <ProfileDropdown profile={userProfile} />
      </div>
    </div>
  );
}