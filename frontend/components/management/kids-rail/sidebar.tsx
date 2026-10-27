import Image from "next/image";
import Link from "next/link";
import { Lock, ArrowLeft } from "lucide-react";
import { fortressFetch } from "@/lib/utility";

// Imports tailored for the Kids Rail
import { KidsNavLink } from "./nav-link";
import { LogoutButton } from "../principal-rail/logout-button";

// --- KIDS MANAGEMENT MENU ---
const kidsNavItems = [
  { icon: "overview", label: "Segment Overview", href: "/management/dashboard/kids", permKey: "kids" },
  { icon: "lessons", label: "Lesson Vault", href: "/management/dashboard/kids/lessons", permKey: "kids" },
  { icon: "buddy", label: "Buddy Admin", href: "/management/dashboard/kids/buddy", permKey: "kids" },
  { icon: "glass", label: "Glass Manager", href: "/management/dashboard/kids/glass", permKey: "kids" },
  { icon: "circle", label: "Circle Monitor", href: "/management/dashboard/kids/circle", permKey: "kids" },
  { icon: "practice", label: "Practice Editor", href: "/management/dashboard/kids/practice", permKey: "kids" },
];

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

export default async function KidsSidebar() {
  // =====================================================================
  // 1. THE ZERO-LATENCY IDENTITY SIPHON
  // =====================================================================
  let userRole = "GUEST";
  let isLocked = true;

  try {
    const response = await fortressFetch("/graphql", {
      method: "POST",
      body: JSON.stringify({ query: GET_ME_QUERY }),
      next: { revalidate: 300 } 
    });

    const getMe = response?.data?.getMe;
    
    if (getMe?.success && getMe?.profile) {
      userRole = getMe.profile.role.toUpperCase();
      isLocked = false; 
    }
  } catch (error) {
    console.error("[KIDS SIDEBAR ERROR]:", error);
  }

  // Super Admin / Owner Bypass check
  const hasAccess = ["ADMIN", "OWNER", "SUPER_ADMIN", "SUPERADMIN", "TEACHER", "COUNSELOR"].includes(userRole);

  return (
    <div className="flex flex-col h-full bg-transparent group/sidebar relative">
      
      {/* =====================================================================
          2. THE GLOBAL HUB BRIDGE (Intelligent Back Navigation)
          ===================================================================== */}
      <div className="px-4 pt-4 pb-2 shrink-0 border-b border-white/5">
        <Link 
          href="/management/dashboard"
          className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group/back"
        >
          <div className="p-1 bg-black/40 rounded-lg group-hover/back:-translate-x-1 transition-transform">
            <ArrowLeft className="w-4 h-4 text-[#DA8CA0]" />
          </div>
          <span className="text-xs font-bold text-gray-300 group-hover/back:text-white transition-colors overflow-hidden whitespace-nowrap opacity-100 group-[.peer-checked+aside]:opacity-0 group-[.peer-checked+aside]:w-0">
            Global Hub
          </span>
        </Link>
      </div>

      {/* =====================================================================
          3. BRANDING AREA (Heal Her Specific)
          ===================================================================== */}
      <div className="h-20 flex items-center px-6 gap-4 border-b border-white/5 shrink-0 overflow-hidden">
        <div className="relative flex items-center justify-center min-w-[48px] h-12 rounded-xl bg-gradient-to-tr from-[#DA8CA0]/20 to-purple-500/20 border border-[#DA8CA0]/30 shadow-[0_0_15px_rgba(218,140,160,0.2)]">
           {/* Fallback to text if the heal-logo.png isn't available, but using your requested logo path */}
          <Image src="/heal-logo.png" alt="Heal Her Logo" width={28} height={28} className="object-contain" />
        </div>
        
        <div className="flex flex-col justify-center whitespace-nowrap transition-opacity duration-300 opacity-100 group-[.peer-checked+aside]:opacity-0">
          <div className="flex items-baseline gap-1.5 leading-none">
            <span className="text-lg font-black tracking-wider text-white">Heal <span className="text-[#DA8CA0]">Her</span></span>
          </div>
          <span className="text-[8px] font-black tracking-[0.2em] text-[#DA8CA0] uppercase mt-1 bg-[#DA8CA0]/10 px-2 py-0.5 rounded-sm inline-block w-max">
            Kids Management
          </span>
        </div>
      </div>

      {/* =====================================================================
          4. NAVIGATION LINKS (Segment Specific)
          ===================================================================== */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar py-6 px-4 space-y-1">
        {isLocked || !hasAccess ? (
          <div className="p-4 border border-red-500/20 bg-red-950/10 rounded-xl text-center flex flex-col items-center">
            <Lock className="w-5 h-5 text-red-500 mb-3" />
            <span className="text-[10px] uppercase text-red-400 font-bold whitespace-nowrap overflow-hidden transition-all group-[.peer-checked+aside]:w-0 group-[.peer-checked+aside]:opacity-0">
              Clearance Required
            </span>
          </div>
        ) : (
          kidsNavItems.map((item) => (
            <KidsNavLink key={item.href} href={item.href} icon={item.icon} label={item.label} />
          ))
        )}
      </div>

      {/* =====================================================================
          5. USER & LOGOUT
          ===================================================================== */}
      <div className="p-4 border-t border-white/5 shrink-0 bg-black/20">
        <div className="mb-4 px-2 whitespace-nowrap transition-all duration-300 overflow-hidden group-[.peer-checked+aside]:h-0 group-[.peer-checked+aside]:opacity-0">
          <span className="text-[9px] px-2 py-1 rounded-full border border-[#DA8CA0]/30 bg-[#DA8CA0]/10 font-bold uppercase text-[#DA8CA0]">
            Clearance: {userRole}
          </span>
        </div>
        <LogoutButton />
      </div>
    </div>
  );
}