"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Tooltip from "@radix-ui/react-tooltip";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { 
  LayoutDashboard, 
  BookOpen, 
  Bot, 
  ScanSearch, 
  Users, 
  Gamepad2,
  LucideIcon 
} from "lucide-react";

/**
 * THE KIDS ICON REGISTRY
 * Specific tools required for managing the Little Explorer segment.
 */
const ICON_MAP: Record<string, LucideIcon> = {
  overview: LayoutDashboard,
  lessons: BookOpen,
  buddy: Bot,
  glass: ScanSearch,
  circle: Users,
  practice: Gamepad2,
};

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface KidsNavLinkProps {
  href: string;
  icon: string;
  label: string;
}

export function KidsNavLink({ href, icon, label }: KidsNavLinkProps) {
  const pathname = usePathname();
  // Exact match for the overview, or starts with for sub-pages
  const isActive = pathname === href || (href !== "/management/dashboard/kids" && pathname.startsWith(href));

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
                ? "bg-[#DA8CA0]/10 text-[#DA8CA0] border border-[#DA8CA0]/30 shadow-[0_0_15px_rgba(218,140,160,0.15)]" 
                : "text-gray-400 hover:bg-white/5 hover:text-white border border-transparent"
            )}
          >
            <Icon className="w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110" />
            
            {/* Hides text smoothly when the global sidebar toggles */}
            <span className="text-xs font-medium transition-opacity duration-300 opacity-100 group-[.peer-checked+aside]:opacity-0">
              {label}
            </span>

            {/* ROSE GLOW ACTIVE INDICATOR */}
            {isActive && (
              <div className="absolute left-0 w-[3px] h-1/2 bg-gradient-to-b from-[#DA8CA0] to-purple-500 shadow-[0_0_12px_#DA8CA0] rounded-r-full" />
            )}
          </Link>
        </Tooltip.Trigger>
        
        <Tooltip.Portal>
          <Tooltip.Content
            side="right"
            sideOffset={20}
            className="z-[100] px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#DA8CA0] to-purple-600 rounded-md shadow-[0_0_20px_rgba(218,140,160,0.4)] animate-in fade-in zoom-in-95 hidden group-[.peer-checked+aside]:block"
          >
            {label}
            <Tooltip.Arrow className="fill-[#DA8CA0]" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}