import Image from "next/image";
import { Lock } from "lucide-react";

// Import the Isomorphic Courier
import { fortressFetch } from "@/lib/utility";

// Import our Client Islands
import { NavLink } from "./nav-link";
import { LogoutButton } from "./logout-button";

// --- MASTER MENU DEFINITION ---
// The 'icon' property is now a string to safely cross the Server-Client boundary.
const allNavItems = [
  { icon: "dashboard", label: "Dashboard", href: "/management/dashboard", permKey: "dashboard" },
  { icon: "chat", label: "Team Chat", href: "/management/dashboard/chat", permKey: "chat" },
  { icon: "tasks", label: "Task Board", href: "/management/dashboard/tasks", permKey: "tasks" },
  { icon: "projects", label: "Projects", href: "/management/dashboard/projects", permKey: "projects" },
  { icon: "files", label: "The Vault", href: "/management/dashboard/files", permKey: "files" },
  { icon: "delivery", label: "Delivery", href: "/management/dashboard/delivery", permKey: "delivery" },
  { icon: "clients", label: "Clients", href: "/management/dashboard/clients", permKey: "clients" },
  { icon: "invoices", label: "Invoices", href: "/management/dashboard/invoices", permKey: "invoices" },
  { icon: "content", label: "Portfolio CMS", href: "/management/dashboard/content", permKey: "content" },
  { icon: "analytics", label: "Analytics", href: "/management/dashboard/analytics", permKey: "analytics" },
  { icon: "services", label: "Services", href: "/management/dashboard/services", permKey: "services" },
  { icon: "team", label: "Team Access", href: "/management/dashboard/team", permKey: "team" },
  { icon: "settings", label: "Settings", href: "/management/dashboard/settings", permKey: "settings" },
  { icon: "security", label: "Security", href: "/management/dashboard/security", permKey: "security" },
];

// --- GRAPHQL QUERY DEFINITION ---
const GET_ME_QUERY = `
  query GetStaffIdentity {
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

export default async function Sidebar() {
  // =====================================================================
  // 1. THE ZERO-LATENCY IDENTITY SIPHON
  // =====================================================================
  // fortressFetch automatically knows it is on the server, grabs the admin 
  // token from next/headers, and bypasses the proxy to hit FastAPI directly.
  let userRole = "GUEST";
  let isLocked = true;

  try {
    const response = await fortressFetch("/graphql", {
      method: "POST",
      body: JSON.stringify({ query: GET_ME_QUERY }),
      next: { revalidate: 300 } // Cache the identity for 5 minutes
    });

    const getMe = response?.data?.getMe;
    
    if (getMe?.success && getMe?.profile) {
      userRole = getMe.profile.role;
      isLocked = false; 
    }
  } catch (error) {
    console.error("[SIDEBAR GRAPHQL ERROR]:", error);
    // The layout.tsx Aegis will catch severe auth failures, 
    // this catch block just ensures the UI doesn't crash if the DB blips.
  }

  // =====================================================================
  // 2. ROLE-BASED MVP FILTER
  // =====================================================================
  const visibleNavItems = allNavItems.filter((item) => {
    // As the sole operator/founder, if you are ADMIN, you see everything.
    if (userRole === "ADMIN" || userRole === "OWNER") return true;
    
    // Fallback for basic staff until granular JSON permissions are implemented
    return ["dashboard", "settings", "security"].includes(item.permKey);
  });

  return (
    <div className="flex flex-col h-full bg-transparent group/sidebar">
      
      {/* --- LOGO AREA --- */}
      <div className="h-20 flex items-center px-6 gap-4 border-b border-white/5 shrink-0 overflow-hidden">
        <div className="relative flex items-center justify-center min-w-[48px] h-12 rounded-xl bg-black/50 border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
          <Image src="/sliver.png" alt="Sliver Designs Logo" width={32} height={32} className="object-contain" />
        </div>
        
        {/* CSS Container Query trick: Hides instantly when layout expands/collapses */}
        <div className="flex flex-col justify-center whitespace-nowrap transition-opacity duration-300 opacity-100 group-[.peer-checked+aside]:opacity-0">
          <div className="flex items-baseline gap-1.5 leading-none">
            <span className="text-lg font-black tracking-wider uppercase text-white">Sliver</span>
            <span className="text-[10px] font-bold text-[#00FFFF] tracking-[0.2em]">DESIGNS</span>
          </div>
          <span className="text-[8px] font-mono italic tracking-widest text-[#FF1493] uppercase mt-1">
            Command Center
          </span>
        </div>
      </div>

      {/* --- NAVIGATION LINKS --- */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar py-6 px-4 space-y-1">
        {isLocked ? (
          <div className="p-4 border border-red-500/20 bg-red-950/10 rounded-xl text-center flex flex-col items-center">
            <Lock className="w-5 h-5 text-red-500 mb-3" />
            <span className="text-[10px] uppercase text-red-400 font-bold whitespace-nowrap overflow-hidden transition-all group-[.peer-checked+aside]:w-0 group-[.peer-checked+aside]:opacity-0">
              Access Restricted
            </span>
          </div>
        ) : (
          visibleNavItems.map((item) => (
            <NavLink key={item.href} href={item.href} icon={item.icon} label={item.label} />
          ))
        )}
      </div>

      {/* --- USER & LOGOUT --- */}
      <div className="p-4 border-t border-white/5 shrink-0">
        <div className="mb-4 px-2 whitespace-nowrap transition-all duration-300 overflow-hidden group-[.peer-checked+aside]:h-0 group-[.peer-checked+aside]:opacity-0">
          <span className="text-[9px] px-2 py-1 rounded-full border border-white/10 bg-white/5 font-mono uppercase text-gray-400">
            Access: {userRole}
          </span>
        </div>
        <LogoutButton />
      </div>
    </div>
  );
}