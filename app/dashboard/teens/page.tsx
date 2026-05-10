'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, 
  AlertTriangle, 
  Users, 
  BookOpen, 
  ArrowRight,
  ShieldCheck,
  Activity
} from "lucide-react";
import { useHeal } from "@/store/heal";

// --- ANIMATION VARIANTS ---
const containerVars = { 
  animate: { transition: { staggerChildren: 0.1 } } 
};

const itemVars = { 
  initial: { opacity: 0, y: 20, scale: 0.95 }, 
  animate: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 200, damping: 20 } } 
};

// =====================================================================
// 1. THE GRAPHQL QUERY
// =====================================================================
const TEENS_DASHBOARD_QUERY = `
  query GetTeensDashboardHeader {
    getMe {
      success
      profile {
        firstName
      }
      context {
        greeting
        contextualMessage
        currentStreak
      }
    }
  }
`;

export default function TeensDashboardPage() {
  const { nickname } = useHeal();
  const router = useRouter();
  
  // --- STATE MANAGEMENT ---
  const [mounted, setMounted] = useState(false);
  const [greetingText, setGreetingText] = useState<string | null>(null);
  const [contextMessage, setContextMessage] = useState<string>("Real talk about boundaries, consent, and staying safe.");
  const [streak, setStreak] = useState<number>(0);
  const [isFetching, setIsFetching] = useState(true);

  // --- DATA FETCHING (VIA SECURE NEXT.JS PROXY) ---
  useEffect(() => {
    setMounted(true);
    const controller = new AbortController();

    const fetchLiveGreeting = async () => {
      try {
        // Routing through your hidden Next.js proxy
        const response = await fetch('/api/proxy/teens/dashboard/graphql', {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json'
            // "Authorization": `Bearer ${localStorage.getItem('token')}` // If needed
          },
          body: JSON.stringify({ query: TEENS_DASHBOARD_QUERY })
        });

        if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);

        const payload = await response.json();

        if (payload.data?.getMe?.success) {
          const { profile, context } = payload.data.getMe;
          setGreetingText(`${context.greeting}, ${profile.firstName}.`);
          setContextMessage(context.contextualMessage);
          setStreak(context.currentStreak);
        } else {
          throw new Error("Invalid GraphQL payload or missing data");
        }

      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error("[FRONTEND ERROR] Failed to fetch secure dashboard data:", error.message);
          // Graceful Degradation
          setGreetingText(`Hey, ${nickname || 'there'}.`);
          setContextMessage("Real talk about boundaries, consent, and staying safe.");
        }
      } finally {
        setIsFetching(false);
      }
    };

    fetchLiveGreeting();
    return () => controller.abort();
  }, [nickname]);

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  if (!mounted) return null;

  return (
    <motion.div 
      variants={containerVars} 
      initial="initial" 
      animate="animate" 
      className="min-h-screen relative overflow-hidden flex flex-col gap-6 p-4 pb-24 md:p-8 text-white"
    >
      {/* VIBRANT AMBIENT BACKGROUND (Kids Palette) */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-10 left-[10%] w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-20 right-[5%] w-80 h-80 bg-rose-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* 1. DASHBOARD HEADER */}
      <motion.header 
        variants={itemVars} 
        className="relative z-10 overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-2xl"
      >
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#DA8CA0]/20 blur-3xl" />
        
        <div className="relative flex flex-col-reverse md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left flex-1">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#DA8CA0] mb-6"
            >
              <Activity className="h-4 w-4" /> 
              Your Space {streak > 0 && <span className="ml-2 pl-2 border-l border-white/20 text-white/70">{streak} Day Streak</span>}
            </motion.div>
            
            {/* DYNAMIC GREETING LOADER */}
            <div className="min-h-[60px] flex items-center justify-center md:justify-start mb-2">
              <AnimatePresence mode="wait">
                {isFetching ? (
                  <motion.div 
                    key="skeleton"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="h-10 w-3/4 md:w-1/2 bg-white/10 animate-pulse rounded-lg border border-white/5"
                  />
                ) : (
                  <motion.h1 
                    key="content"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="font-display text-3xl md:text-5xl font-extrabold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-[#CCCCD9]"
                  >
                    {greetingText}
                  </motion.h1>
                )}
              </AnimatePresence>
            </div>

            <p className="text-[#CCCCD9] font-medium text-sm md:text-base max-w-md mt-2">
              {contextMessage}
            </p>
          </div>

          <AwarenessRing score={92} />
        </div>
      </motion.header>

      {/* 2. BENTO BOX PORTALS (Teens Content, Kids Palette) */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* BIG PORTAL: Heal AI */}
        <motion.div 
          variants={itemVars}
          whileHover={{ scale: 1.01, y: -2 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => handleNavigate('/dashboard/teens/heal-ai')}
          className="md:col-span-2 group cursor-pointer relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-purple-600/80 to-[#DA8CA0]/80 p-8 shadow-xl border border-white/20 backdrop-blur-md"
        >
          <div className="absolute -right-10 -bottom-10 opacity-20 transition-transform duration-700 group-hover:scale-110">
            <MessageSquare className="w-64 h-64 text-white" />
          </div>
          <div className="relative z-10 h-full flex flex-col justify-between min-h-[160px]">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30 mb-4">
              <MessageSquare className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white mb-2">Talk to Heal AI</h2>
              <p className="text-white/80 font-bold uppercase tracking-widest text-[10px]">A private, judgment-free zone for real questions.</p>
            </div>
          </div>
        </motion.div>

        {/* SMALL PORTAL: Red Flag Detector */}
        <motion.div 
          variants={itemVars}
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleNavigate('/dashboard/teens/detector')}
          className="group cursor-pointer rounded-[2.5rem] bg-white/5 p-8 shadow-xl border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors flex flex-col justify-between min-h-[160px]"
        >
          <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30 mb-4 group-hover:bg-indigo-500/40 transition-colors">
            <AlertTriangle className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white mb-1">Vibe Check</h2>
            <p className="text-[#CCCCD9]/60 font-bold uppercase tracking-widest text-[10px] flex items-center gap-1">
              Analyze texts for red flags <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </p>
          </div>
        </motion.div>

        {/* SMALL PORTAL: Safe Circle */}
        <motion.div 
          variants={itemVars}
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleNavigate('/dashboard/teens/safe-circle')}
          className="group cursor-pointer rounded-[2.5rem] bg-white/5 p-8 shadow-xl border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors flex flex-col justify-between min-h-[160px]"
        >
          <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30 mb-4 group-hover:bg-emerald-500/40 transition-colors">
            <Users className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white mb-1">Trust Circle</h2>
            <p className="text-[#CCCCD9]/60 font-bold uppercase tracking-widest text-[10px] flex items-center gap-1">
              Manage your emergency contacts <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </p>
          </div>
        </motion.div>

        {/* WIDE PORTAL: Vault / Resources */}
        <motion.div 
          variants={itemVars}
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleNavigate('/dashboard/teens/vault')}
          className="md:col-span-2 lg:col-span-2 group cursor-pointer rounded-[2.5rem] bg-white/5 p-6 shadow-xl border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors flex items-center gap-6"
        >
          <div className="w-20 h-20 shrink-0 bg-amber-500/20 rounded-2xl flex items-center justify-center border border-amber-500/30 transition-transform group-hover:scale-110">
            <BookOpen className="w-10 h-10 text-amber-400" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 mb-1">Knowledge Vault</div>
            <h2 className="text-xl font-bold text-white mb-2">Navigating Consent</h2>
            {/* Progress Bar */}
            <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
              <div className="h-full bg-amber-400 w-2/3 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
            </div>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}

// --- SUB-COMPONENT: Awareness Ring (Kids Gradient) ---
function AwarenessRing({ score }: { score: number }) {
  const r = 45;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  
  return (
    <div className="relative grid h-36 w-36 place-items-center">
      <svg className="absolute inset-0 -rotate-90 w-full h-full drop-shadow-xl" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
        <motion.circle
          cx="50" cy="50" r={r}
          stroke="url(#teenGrad)" strokeWidth="8" strokeLinecap="round" fill="none"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
        />
        <defs>
          <linearGradient id="teenGrad" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#DA8CA0" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
        </defs>
      </svg>
      <div className="text-center">
        <ShieldCheck className="w-6 h-6 text-[#DA8CA0] mx-auto mb-1 opacity-80" />
        <div className="font-display text-4xl font-black text-white">{score}</div>
      </div>
    </div>
  );
}