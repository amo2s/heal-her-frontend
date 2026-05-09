'use client';

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, 
  BookOpen, 
  Users, 
  Target, 
  X, 
  Settings, 
  MessageSquareDashed,
  ScanSearch,
  ShieldCheck
} from "lucide-react";
import { useSidebar } from "@/store/use-sidebar";
import { useHeal } from "@/store/heal";
import { useAudio } from "@/components/context/audio-manager";
import { cn } from "@/lib/utils";

// Upgraded navigation for the Teens experience
const NAV = [
  { to: "dashboard", label: "Overview", icon: Home },
  { to: "heal-ai", label: "Heal AI", icon: MessageSquareDashed },
  { to: "detector", label: "Analyzer", icon: ScanSearch },
  { to: "safe-circle", label: "Safe Circle", icon: Users },
  { to: "scenarios", label: "Simulations", icon: Target },
  { to: "learn", label: "Resources", icon: BookOpen },
];

export interface SidebarProps {
  base?: string;
}

export function Sidebar({ base = "teens" }: SidebarProps) {
  const { isOpen, close } = useSidebar();
  const { nickname, group } = useHeal();
  const pathname = usePathname();
  const { playSfx } = useAudio();

  // Close mobile sidebar on route change
  useEffect(() => { 
    close(); 
  }, [pathname, close]);

  const SidebarContent = (
    <div className="flex h-full flex-col p-6">
      {/* Brand Section */}
      <div className="mb-10 flex items-center justify-between px-2">
        <Link 
          href="/" 
          onClick={() => playSfx('click')}
          className="flex items-center gap-3 group"
        >
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="relative h-10 w-10 overflow-hidden rounded-xl bg-white/5 border border-white/10 p-1.5 shadow-lg backdrop-blur-md"
          >
            <Image 
              src="/heal-logo.png" 
              alt="HEAL Her Logo" 
              fill 
              className="object-contain p-1"
              priority
            />
          </motion.div>
          <div className="flex flex-col">
            <span className="font-bold tracking-tight text-xl leading-none text-white">
              Heal <span className="text-primary">Her</span>
            </span>
            <div className="flex items-center gap-1 mt-1">
              <ShieldCheck className="w-3 h-3 text-primary/80" />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
                Secure Access
              </span>
            </div>
          </div>
        </Link>
        <button 
          onClick={() => { playSfx('click'); close(); }} 
          className="md:hidden p-2 bg-white/5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation - Sleek & Mature */}
      <nav className="flex-1 space-y-2 no-scrollbar overflow-y-auto pr-2">
        <div className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
          Main Menu
        </div>
        {NAV.map((n) => {
          // Normalize 'dashboard' to point to the base route without double slashes
          const routeSuffix = n.to === 'dashboard' ? '' : `/${n.to}`;
          const href = `/dashboard/${base}${routeSuffix}`;
          const isActive = pathname === href || pathname?.startsWith(`${href}/`);

          return (
            <Link 
              key={n.to} 
              href={href} 
              onClick={() => playSfx('click')}
              className="relative block group"
            >
              <div className={cn(
                "flex items-center gap-4 rounded-2xl px-4 py-3.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 border",
                isActive 
                  ? "text-white bg-white/10 shadow-lg border-white/10" 
                  : "text-white/50 hover:text-white hover:bg-white/5 border-transparent"
              )}>
                <n.icon className={cn(
                  "h-4 w-4 transition-colors duration-300",
                  isActive ? "text-primary" : "text-white/30 group-hover:text-primary/70"
                )} />
                {n.label}
                
                {isActive && (
                  <motion.div 
                    layoutId="activePillDesktop"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Profile Footer */}
      <div className="pt-6 mt-4 border-t border-white/10">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
        >
          <div className="relative group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-xs font-black text-white uppercase tracking-wider">
                {nickname.slice(0, 2)}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-background bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          </div>
          
          <div className="flex flex-1 flex-col min-w-0">
            <span className="truncate text-xs font-black text-white uppercase tracking-wider">{nickname}</span>
            <span className="truncate text-[9px] text-primary uppercase font-bold tracking-[0.2em]">{group || "Teens"} User</span>
          </div>

          <Link 
            href={`/dashboard/${base}/settings`}
            onClick={() => playSfx('click')}
            className="p-2.5 bg-white/5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all"
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-72 shrink-0 md:block z-40">
        <div className="h-full rounded-3xl border border-white/10 bg-background/50 backdrop-blur-2xl shadow-2xl overflow-hidden">
          {SidebarContent}
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => { playSfx('click'); close(); }}
              className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm md:hidden"
            />
            <motion.div 
              initial={{ x: "-100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed inset-y-0 left-0 z-[70] w-[280px] bg-background backdrop-blur-2xl border-r border-white/10 md:hidden"
            >
              {SidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}