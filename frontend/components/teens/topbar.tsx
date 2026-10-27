'use client';

import { Menu, Search, Bell, Sparkles } from "lucide-react";
import { useSidebar } from "@/store/use-sidebar";
import { useHeal } from "@/store/heal";
import { useAudio } from "@/components/context/audio-manager";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

// =====================================================================
// 1. THE GRAPHQL QUERY (Tailored for Teens TopBar)
// =====================================================================
const TEENS_TOPBAR_QUERY = `
  query GetTeensTopBarProfile {
    getMe {
      success
      profile {
        firstName
      }
    }
  }
`;

export function TopBar() {
  const { toggle } = useSidebar();
  const { nickname } = useHeal(); 
  const { playSfx } = useAudio();
  const router = useRouter();

  // 1. STATE: Instant fallback using local nickname
  const [greeting, setGreeting] = useState(`Hey, ${nickname || 'there'}`);

  // 2. FETCH DATA: Call the new GraphQL backend via Next.js proxy
  useEffect(() => {
    // AbortController prevents memory leaks
    const controller = new AbortController();

    const fetchGreeting = async () => {
      try {
        const response = await fetch('/api/proxy/teens/dashboard/graphql', {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json'
            // "Authorization": `Bearer ${localStorage.getItem('token')}` // Uncomment if needed
          },
          body: JSON.stringify({ query: TEENS_TOPBAR_QUERY })
        }); 
        
        if (!response.ok) {
          throw new Error(`HTTP Error! Status: ${response.status}`);
        }

        const payload = await response.json();

        // Safely extract firstName from the GraphQL payload
        if (payload.data?.getMe?.success) {
          const { profile } = payload.data.getMe;
          setGreeting(`Hey, ${profile.firstName}`);
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error("[GREETING ERROR] Failed to fetch teen greeting:", error.message);
        }
      }
    };

    fetchGreeting();

    return () => controller.abort();
  }, []);

  const handleAskAI = () => {
    playSfx('click');
    router.push('/dashboard/teens/heal-ai');
  };

  return (
    <header className="mb-8 flex w-full items-center justify-between gap-4 relative z-30">
      
      <div className="flex items-center gap-4">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            playSfx('click');
            toggle();
          }}
          className="grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-white/5 shadow-lg backdrop-blur-md md:hidden hover:bg-white/10 transition-colors"
        >
          <Menu className="h-5 w-5 text-white" />
        </motion.button>

        <div className="hidden sm:block">
          <motion.h2 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold tracking-tight text-white flex items-center gap-2"
          >
            {greeting} <span className="inline-block">✨</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-[11px] font-medium uppercase tracking-[0.15em] text-white/40 mt-1"
          >
            How can we help today?
          </motion.p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end gap-3 md:gap-4">
        
        <div className="relative hidden lg:block w-full max-w-xs group">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search topics or resources..." 
            className="h-11 w-full rounded-xl border border-white/10 bg-white/5 pl-11 pr-4 text-sm text-white placeholder:text-white/20 outline-none backdrop-blur-md transition-all focus:border-primary/50 focus:bg-white/10" 
          />
        </div>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => playSfx('click')}
          className="relative grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-colors"
        >
          <Bell className="h-5 w-5 text-white/70" />
          <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.6)]" />
        </motion.button>

        <motion.button 
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAskAI}
          className="flex h-11 items-center gap-2 rounded-xl bg-primary px-5 md:px-6 text-xs font-bold uppercase tracking-wider text-white shadow-xl transition-all hover:bg-primary/90"
        >
          <Sparkles className="h-4 w-4" />
          <span className="hidden sm:inline">Heal AI</span>
        </motion.button>
      </div>

    </header>
  );
}