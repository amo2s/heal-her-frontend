"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useHeal } from "@/store/heal"; 
import { 
  Briefcase, Scale, Globe, ShieldCheck, 
  ChevronLeft, ChevronRight, Droplet, Activity, 
  Wallet, Plus, ArrowRight, PieChart, Info
} from "lucide-react";

// --- ANIMATION VARIANTS ---
const containerVars = { animate: { transition: { staggerChildren: 0.1 } } };
const itemVars = { 
  initial: { opacity: 0, y: 20, scale: 0.95 }, 
  animate: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 200, damping: 20 } } 
};

// =====================================================================
// 1. THE EXACT GRAPHQL QUERY (Matched to TopBar Schema)
// =====================================================================
const DASHBOARD_PROFILE_QUERY = `
  query GetYoungAdultDashboardProfile {
    getMe {
      success
      profile {
        firstName
      }
    }
  }
`;

export default function YoungAdultsDashboardPage() {
  const { nickname } = useHeal(); 
  
  // STATE: Local override to instantly bypass the store's "Sarah" issue
  const [dashboardName, setDashboardName] = useState("");
  const [isNameLoading, setIsNameLoading] = useState(true);

  // FETCH DATA: Matched exactly to the TopBar's robust fetching logic
  useEffect(() => {
    const controller = new AbortController();

    const fetchDashboardProfile = async () => {
      try {
        setIsNameLoading(true);
        
        const response = await fetch('/api/proxy/young_adult/dashboard/graphql', {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ query: DASHBOARD_PROFILE_QUERY })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP Error! Status: ${response.status}`);
        }

        const payload = await response.json();
        
        if (payload.errors) {
          console.error("GraphQL Errors:", payload.errors);
          return;
        }
        
        // Safely extract firstName exactly like the TopBar
        if (payload.data?.getMe?.success) {
          const { profile } = payload.data.getMe;
          setDashboardName(profile.firstName);
        }
        
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error("Dashboard profile fetch failed:", error.message);
        }
      } finally {
        setIsNameLoading(false);
      }
    };
    
    fetchDashboardProfile();

    return () => controller.abort();
  }, []);
  
  return (
    <motion.section 
      variants={containerVars} 
      initial="initial" 
      animate="animate" 
      className="relative min-h-screen flex flex-col gap-6 p-4 pb-24 md:p-8 text-white overflow-hidden"
    >
      {/* VIBRANT AMBIENT BACKGROUND */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-10 left-[10%] w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-20 right-[5%] w-80 h-80 bg-rose-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* 1. DASHBOARD HEADER */}
      <motion.header 
        variants={itemVars} 
        className="relative z-10 overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-2xl"
      >
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#DA8CA0]/20 blur-3xl" />
        
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#DA8CA0] mb-4">
              <ShieldCheck className="h-4 w-4" /> Young Adult Command Center
            </div>
            
            {/* DYNAMIC WELCOME HEADER WITH LOCAL STATE AND SKELETON */}
            <h1 className="font-display text-3xl md:text-5xl font-extrabold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-[#CCCCD9] flex flex-wrap items-center gap-x-3 gap-y-1">
              Welcome back, 
              {isNameLoading ? (
                <span className="inline-block h-8 md:h-12 w-32 md:w-48 bg-white/20 animate-pulse rounded-xl align-middle shadow-inner border border-white/10" />
              ) : (
                <span className="text-white">
                  {dashboardName || nickname || "there"}
                </span>
              )}
            </h1>

            <p className="mt-3 text-sm md:text-base font-medium text-[#CCCCD9] max-w-md">
              Managing your health, career, and capital through the HealHer proxy.
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <QuickStat label="Safety Score" value="92%" />
            <QuickStat label="Status" value="Verified" />
            <QuickStat label="Streak" value="12 Days" />
          </div>
        </div>
      </motion.header>

      {/* 2. QUICK NAV PILLS */}
      <motion.div variants={itemVars} className="relative z-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: Briefcase, label: "Workplace", desc: "Labor Laws" },
          { icon: Scale, label: "Legal", desc: "Civil Rights" },
          { icon: Globe, label: "Travel", desc: "Safety Maps" },
          { icon: ShieldCheck, label: "Digital", desc: "Data Privacy" },
        ].map((item) => (
          <motion.button
            key={item.label}
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition-all hover:bg-white/10 hover:border-white/20 backdrop-blur-md"
          >
            <item.icon className="h-5 w-5 text-[#DA8CA0] transition-colors group-hover:text-purple-400" />
            <div className="text-sm font-bold text-white">{item.label}</div>
            <div className="text-[10px] uppercase tracking-wider text-white/50 font-bold">{item.desc}</div>
          </motion.button>
        ))}
      </motion.div>

      {/* 3. FUNCTIONAL WIDGETS */}
      <div className="relative z-10 grid gap-6 lg:grid-cols-2">
        <motion.div variants={itemVars}><SmartCycleTracker /></motion.div>
        <motion.div variants={itemVars}><NairaExpenseTracker /></motion.div>
      </div>

    </motion.section>
  );
}

// ==============================================================================
// ENHANCED WIDGET: SMART CYCLE TRACKER
// ==============================================================================
function SmartCycleTracker() {
  const days = ["S", "M", "T", "W", "T", "F", "S"];
  const today = new Date();
  const currentDay = today.getDate();
  
  const lastPeriodStart = 5; 
  const cycleLength = 28;
  const periodLength = 5;

  const cycleInfo = useMemo(() => {
    const isPeriod = currentDay >= lastPeriodStart && currentDay < (lastPeriodStart + periodLength);
    const ovulationDay = lastPeriodStart + 14;
    const isOvulation = currentDay >= (ovulationDay - 2) && currentDay <= (ovulationDay + 2);
    
    let phase = "Follicular Phase";
    if (isPeriod) phase = "Menstrual Phase";
    else if (isOvulation) phase = "Ovulatory Window";
    else if (currentDay > ovulationDay) phase = "Luteal Phase";

    return { isPeriod, isOvulation, phase, daysUntilNext: cycleLength - (currentDay - lastPeriodStart) };
  }, [currentDay]);

  return (
    <div className="h-full rounded-[2.5rem] border border-white/10 bg-white/5 p-6 md:p-8 shadow-xl backdrop-blur-md flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#DA8CA0] mb-1">
            <Activity className="w-3.5 h-3.5" /> Biometric Sync
          </div>
          <h2 className="text-2xl font-bold text-white">{cycleInfo.phase}</h2>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Next Period</div>
          <div className="text-lg font-black text-[#DA8CA0]">in {cycleInfo.daysUntilNext} days</div>
        </div>
      </div>

      <div className="flex-1 bg-black/20 rounded-3xl border border-white/5 p-6">
        <div className="grid grid-cols-7 mb-4">
          {days.map((d, i) => (
            <div key={i} className="text-center text-[10px] font-bold uppercase text-white/30">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => {
            const isPeriod = date >= lastPeriodStart && date < (lastPeriodStart + periodLength);
            const ovulationDay = lastPeriodStart + 14;
            const isOvulation = date === ovulationDay;
            const isToday = date === currentDay;

            return (
              <div key={date} className="relative flex items-center justify-center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`
                    aspect-square w-full max-w-[40px] rounded-xl flex items-center justify-center text-xs font-bold transition-all
                    ${isPeriod ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : "text-white/40"}
                    ${isOvulation ? "bg-indigo-500/30 text-indigo-300 border border-indigo-400/40" : ""}
                    ${isToday ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.5)]" : ""}
                  `}
                >
                  {date}
                </motion.div>
                {isPeriod && <div className="absolute -bottom-1 w-1 h-1 bg-rose-500 rounded-full" />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
        <Info className="w-5 h-5 text-indigo-400" />
        <p className="text-[11px] text-white/60 leading-relaxed italic">
          Based on your data, your fertile window peaks in 4 days. Energy levels might fluctuate.
        </p>
      </div>
    </div>
  );
}

// ==============================================================================
// ENHANCED WIDGET: NAIRA EXPENSE TRACKER
// ==============================================================================
function NairaExpenseTracker() {
  const formatNaira = (amt: number) => 
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amt);

  const budget = 450000;
  const spent = 285400;
  const percent = Math.round((spent / budget) * 100);

  const expenses = [
    { id: 1, name: "Rent Contribution", amount: 150000, category: "Housing", date: "Oct 1" },
    { id: 2, name: "Internet Subscription", amount: 25000, category: "Utilities", date: "Oct 4" },
    { id: 3, name: "Fuel / Transport", amount: 45000, category: "Travel", date: "Oct 5" },
  ];

  return (
    <div className="h-full rounded-[2.5rem] bg-gradient-to-br from-indigo-600/20 to-purple-500/10 p-6 md:p-8 shadow-xl border border-white/10 backdrop-blur-md flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-1">
            <PieChart className="w-3.5 h-3.5" /> Capital Management
          </div>
          <h2 className="text-2xl font-bold text-white">Monthly Budget</h2>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="p-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg transition-colors border border-white/20"
        >
          <Plus className="w-4 h-4" />
        </motion.button>
      </div>

      <div className="bg-black/30 rounded-3xl border border-white/10 p-6 mb-6">
        <div className="flex justify-between items-end mb-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Total Outflow</div>
            <div className="text-3xl font-black text-white">{formatNaira(spent)}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Cap</div>
            <div className="text-sm font-bold text-white/60">{formatNaira(budget)}</div>
          </div>
        </div>
        
        <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden mt-4 border border-white/5">
          <motion.div 
            initial={{ width: 0 }} 
            animate={{ width: `${percent}%` }} 
            transition={{ duration: 1.5, ease: "circOut" }}
            className={`h-full rounded-full ${percent > 85 ? 'bg-rose-500' : 'bg-indigo-500'} shadow-[0_0_15px_rgba(99,102,241,0.5)]`} 
          />
        </div>
      </div>

      <div className="flex-1 space-y-3">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-1 flex items-center justify-between">
          Recent debits <ArrowRight className="w-3 h-3" />
        </div>
        {expenses.map((exp) => (
          <div key={exp.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors">
                <Wallet className="w-4 h-4 text-indigo-300" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">{exp.name}</div>
                <div className="text-[9px] uppercase tracking-wider text-white/40">{exp.category} • {exp.date}</div>
              </div>
            </div>
            <div className="text-sm font-black text-white">
              -{formatNaira(exp.amount)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-md">
      <div className="text-xl md:text-2xl font-black text-white">{value}</div>
      <div className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-[#DA8CA0] mt-1">{label}</div>
    </div>
  );
}