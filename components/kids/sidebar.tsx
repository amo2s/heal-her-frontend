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
  Gamepad2, 
  X, 
  Settings, 
  MessageCircleHeart,
  ScanSearch
} from "lucide-react";
import { useSidebar } from "@/store/use-sidebar";
import { useHeal } from "@/store/heal";
import { useAudio } from "@/components/context/audio-manager";

// Updated with the new Magic Glass (Detector) route
const NAV = [
  { to: "dashboard", label: "Home", icon: Home },
  { to: "ai-buddy", label: "Heal Buddy", icon: MessageCircleHeart },
  { to: "detector", label: "Magic Glass", icon: ScanSearch },
  { to: "safe-circle", label: "Safe Circle", icon: Users },
  { to: "scenarios", label: "Practice", icon: Gamepad2 },
  { to: "learn", label: "Watch & Learn", icon: BookOpen },
];

export function Sidebar({ base }: { base: string }) {
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
            whileHover={{ scale: 1.1, rotate: -5 }}
            className="relative h-10 w-10 overflow-hidden rounded-2xl bg-white/10 border border-white/20 p-1.5 shadow-lg backdrop-blur-sm"
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
            <span className="font-black tracking-tight text-xl leading-none text-white">
              Heal <span className="text-[#DA8CA0]">Her</span>
            </span>
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#CCCCD9]/60 mt-1">
              Little Explorer
            </span>
          </div>
        </Link>
        <button 
          onClick={() => { playSfx('click'); close(); }} 
          className="md:hidden p-2 bg-white/5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation - Premium Organic Design */}
      <nav className="flex-1 space-y-2 no-scrollbar overflow-y-auto pr-2">
        <div className="mb-4 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#DA8CA0]">
          My Menu
        </div>
        {NAV.map((n) => {
          const href = `/dashboard/${base}${n.to === 'dashboard' ? '' : '/' + n.to}`;
          const isActive = pathname === href;

          return (
            <Link 
              key={n.to} 
              href={href} 
              onClick={() => playSfx('click')}
              className="relative block group"
            >
              <div className={`flex items-center gap-4 rounded-[1.2rem] px-4 py-3.5 text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                isActive 
                  ? "text-white bg-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-white/10" 
                  : "text-[#CCCCD9] hover:text-white hover:bg-white/5 border border-transparent"
              }`}>
                <n.icon className={`h-5 w-5 transition-colors duration-300 ${isActive ? "text-[#DA8CA0]" : "text-[#CCCCD9]/50 group-hover:text-[#DA8CA0]/70"}`} />
                {n.label}
                
                {isActive && (
                  <motion.div 
                    layoutId="activePill"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-gradient-to-b from-purple-400 to-[#DA8CA0] rounded-r-full shadow-[0_0_10px_rgba(218,140,160,0.5)]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Profile Footer - Premium Badge */}
      <div className="pt-6 mt-4 border-t border-white/10">
        <motion.div 
          whileHover={{ y: -2 }}
          className="flex items-center gap-3 p-3 rounded-[1.5rem] bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
        >
          <div className="relative group">
            <div className="h-10 w-10 rounded-[1rem] bg-gradient-to-tr from-[#DA8CA0] to-purple-600 p-px shadow-lg">
              <div className="flex h-full w-full items-center justify-center rounded-[15px] bg-[#1C1246] text-xs font-black text-white">
                {nickname.slice(0, 2).toUpperCase()}
              </div>
            </div>
            <div className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full border-[2.5px] border-[#1C1246] bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
          </div>
          
          <div className="flex flex-1 flex-col min-w-0">
            <span className="truncate text-xs font-black text-white uppercase tracking-wider">{nickname}</span>
            <span className="truncate text-[9px] text-[#DA8CA0] uppercase font-bold tracking-[0.2em]">{group} User</span>
          </div>

          <Link 
            href={`/dashboard/${base}/settings`}
            onClick={() => playSfx('click')}
            className="p-2.5 bg-white/5 rounded-xl text-[#CCCCD9] hover:text-white hover:bg-white/10 transition-all"
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
        <div className="h-full rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] overflow-hidden">
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
              className="fixed inset-0 z-[60] bg-[#0A051E]/80 backdrop-blur-md md:hidden"
            />
            <motion.div 
              initial={{ x: "-100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed inset-y-0 left-0 z-[70] w-[300px] bg-[#1C1246]/95 backdrop-blur-2xl border-r border-white/10 md:hidden"
            >
              {SidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}