"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Tooltip from "@radix-ui/react-tooltip";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { 
  LayoutDashboard, 
  MessageCircle, 
  CheckSquare, 
  FolderKanban, 
  HardDrive, 
  Send, 
  Users, 
  FileText, 
  Globe, 
  BarChart3, 
  Package, 
  UsersRound, 
  Settings, 
  Shield,
  Smile,          
  Zap,            
  GraduationCap,  
  LogOut,
  Activity,
  AlertTriangle,
  LucideIcon 
} from "lucide-react";

/**
 * THE ICON REGISTRY (Client-Side Only)
 * Maps string identifiers from the Server to actual Lucide Components.
 * This prevents serialization errors during the Server-to-Client handoff.
 */
const ICON_MAP: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  kids: Smile,
  teens: Zap,
  adults: GraduationCap,
  chat: MessageCircle,
  tasks: CheckSquare,
  projects: FolderKanban,
  files: HardDrive,
  delivery: Send,
  clients: Users,
  invoices: FileText,
  content: Globe,
  analytics: BarChart3,
  services: Package,
  team: UsersRound,
  settings: Settings,
  security: Shield,
  health: Activity,
  alerts: AlertTriangle,
  logout: LogOut,
};

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface NavLinkProps {
  href: string;
  icon: string; // Serialized string key matching ICON_MAP
  label: string;
}

export function NavLink({ href, icon, label }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  // Resolve the string to a component, defaulting to LayoutDashboard if not found
  const Icon = ICON_MAP[icon] || LayoutDashboard;

  return (
    <Tooltip.Provider delayDuration={100}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <Link
            href={href}
            className={cn(
              "group relative flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-300 overflow-hidden whitespace-nowrap",
              isActive 
                ? "bg-[#00FFFF]/10 text-[#00FFFF] border border-[#00FFFF]/20 shadow-[0_0_15px_rgba(0,255,255,0.1)]" 
                : "text-gray-400 hover:bg-white/5 hover:text-white border border-transparent"
            )}
          >
            <Icon className="w-5 h-5 shrink-0" />
            
            {/* 
              ENHANCED: Uses group-hover and group-data states to manage 
              visibility during sidebar collapse cycles.
            */}
            <span className="text-xs font-medium transition-opacity duration-300 opacity-100 group-[.peer-checked+aside]:opacity-0">
              {label}
            </span>

            {/* ACTIVE INDICATOR (Glow Bar) */}
            {isActive && (
              <div className="absolute left-0 w-[2px] h-1/2 bg-[#00FFFF] shadow-[0_0_10px_#00FFFF] rounded-r-full" />
            )}
          </Link>
        </Tooltip.Trigger>
        
        <Tooltip.Portal>
          <Tooltip.Content
            side="right"
            sideOffset={20}
            className="z-[100] px-3 py-1.5 text-xs font-bold text-black bg-[#00FFFF] rounded-md shadow-[0_0_15px_rgba(0,255,255,0.3)] animate-in fade-in zoom-in-95"
          >
            {label}
            <Tooltip.Arrow className="fill-[#00FFFF]" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}