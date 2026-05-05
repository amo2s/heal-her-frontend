'use client';

import { Menu, Search, Bell, Sparkles } from "lucide-react";
import { useSidebar } from "@/store/use-sidebar";
import { useHeal } from "@/store/heal";
import { useAudio } from "@/components/context/audio-manager";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export function TopBar() {
  const { toggle } = useSidebar();
  const { nickname } = useHeal(); 
  const { playSfx } = useAudio();
  const router = useRouter();

  // 1. STATE: We use your local 'nickname' as the instant fallback while the network request loads
  const [greeting, setGreeting] = useState(`Hi, ${nickname || 'Buddy'}`);

  // 2. FETCH DATA: Call the Go backend via your Next.js proxy route
  useEffect(() => {
    const fetchGreeting = async () => {
      try {
        const response = await fetch('/api/go/kids/greet'); 
        
        if (response.ok) {
          const json = await response.json();
          // We now look explicitly for 'first_name' from our updated Go handler
          if (json.status === 'success' && json.data?.first_name) {
            // We assemble the sleek TopBar greeting here
            setGreeting(`Hi, ${json.data.first_name}`);
          }
        }
      } catch (error) {
        console.error("[GREETING ERROR] Failed to fetch live greeting:", error);
      }
    };

    fetchGreeting();
  }, []);

  const handleAskBuddy = () => {
    playSfx('yay');
    router.push('/dashboard/kids/ai-buddy');
  };

  return (
    <header className="mb-8 flex w-full items-center justify-between gap-4 relative z-30">
      
      {/* LEFT SECTION: Mobile Menu & Greeting */}
      <div className="flex items-center gap-4">
        {/* Premium Mobile Hamburger */}
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            playSfx('click');
            toggle();
          }}
          className="grid h-12 w-12 place-items-center rounded-[1rem] border border-white/10 bg-white/5 shadow-lg backdrop-blur-md md:hidden hover:bg-white/10 transition-colors"
        >
          <Menu className="h-5 w-5 text-white" />
        </motion.button>

        {/* Personalized Desktop Greeting */}
        <div className="hidden sm:block">
          <motion.h2 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-black tracking-tight text-white flex items-center gap-2"
          >
            {/* The clean "Hi, Amos" text goes here, followed by the emoji */}
            {greeting} <span className="animate-bounce origin-bottom-right inline-block">👋</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#DA8CA0] mt-1"
          >
            What are we exploring today?
          </motion.p>
        </div>
      </div>

      {/* RIGHT SECTION: Search, Notifications, & Action */}
      <div className="flex flex-1 items-center justify-end gap-3 md:gap-4">
        
        {/* Glassmorphic Search Bar */}
        <div className="relative hidden lg:block w-full max-w-xs group">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#CCCCD9]/50 group-focus-within:text-[#DA8CA0] transition-colors" />
          <input 
            type="text" 
            placeholder="Search for answers..." 
            className="h-11 w-full rounded-full border border-white/10 bg-white/5 pl-11 pr-4 text-xs font-bold uppercase tracking-wider text-white placeholder:text-[#CCCCD9]/40 outline-none backdrop-blur-md transition-all focus:border-[#DA8CA0]/50 focus:bg-white/10 focus:shadow-[0_0_15px_rgba(218,140,160,0.2)]" 
          />
        </div>

        {/* Notification Bell */}
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => playSfx('click')}
          className="relative grid h-11 w-11 place-items-center rounded-[1rem] border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-colors"
        >
          <Bell className="h-5 w-5 text-[#CCCCD9] group-hover:text-white transition-colors" />
          {/* Notification Dot */}
          <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-[#DA8CA0] shadow-[0_0_8px_rgba(218,140,160,0.8)] border border-[#1C1246]" />
        </motion.button>

        {/* Primary Call to Action: Ask Buddy */}
        <motion.button 
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAskBuddy}
          className="flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-[#DA8CA0] px-5 md:px-6 text-xs font-black uppercase tracking-widest text-white shadow-[0_8px_20px_rgba(218,140,160,0.3)] hover:shadow-[0_10px_25px_rgba(218,140,160,0.5)] transition-all"
        >
          <Sparkles className="h-4 w-4 animate-pulse" />
          <span className="hidden sm:inline">Ask Buddy</span>
        </motion.button>
      </div>

    </header>
  );
}