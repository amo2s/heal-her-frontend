"use client";

import { useEffect, useState } from "react";
import { Lock } from "lucide-react";

export function ClockIsland({ firstName, role }: { firstName: string, role: string }) {
  const [greeting, setGreeting] = useState("Welcome");
  const [systemTime, setSystemTime] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting("Good Morning");
    else if (hour >= 12 && hour < 17) setGreeting("Good Afternoon");
    else if (hour >= 17 && hour < 22) setGreeting("Good Evening");
    else setGreeting("Working Late");

    const timer = setInterval(() => {
      setSystemTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    
    // Set initial time immediately to prevent hydration layout shift
    setSystemTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-[#CCCCD9]">
          {greeting}, {firstName}.
        </h1>
        <div className="flex flex-wrap items-center gap-3 mt-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black tracking-[0.2em] uppercase">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            {role.replace('_', ' ')}
          </div>
          <span className="text-white/40 text-sm font-medium flex items-center gap-1">
            <Lock className="w-3 h-3" /> Secure Connection
          </span>
        </div>
      </div>
      
      <div className="text-right hidden md:block">
        <div className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1">System Time (Local)</div>
        <div className="text-2xl font-mono font-medium text-white/90">
          {systemTime || "Synchronizing..."}
        </div>
      </div>
    </div>
  );
}