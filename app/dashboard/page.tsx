'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShieldCheck, Sparkles, ArrowRight, EyeOff } from "lucide-react";
import { useHeal, groupFor } from "@/store/heal";

const ROUTES = { 
  kids: "/dashboard/kids", 
  teens: "/dashboard/teens", 
  ya: "/dashboard/young-adults" 
} as const;

// Animation Variants for staggering
const containerVars = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVars = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } }
};

export default function Gateway() {
  const router = useRouter();
  const { setUser } = useHeal();
  const [nickname, setNickname] = useState("Sarah");
  const [age, setAge] = useState(16);

  const enter = () => {
    setUser(nickname.trim() || "friend", age);
    router.push(ROUTES[groupFor(age)]);
  };

  const tier = groupFor(age);
  const tierLabel = tier === "kids" ? "Kids · 0–12" : tier === "teens" ? "Teens · 13–17" : "Young Adults · 18–25";

  return (
    <div className="relative min-h-screen overflow-hidden mesh-bg bg-background">
      {/* Enhanced Mesh Accents with more organic movement */}
      <motion.div
        aria-hidden
        animate={{ 
          scale: [1, 1.2, 1], 
          x: [0, 50, 0], 
          y: [0, -30, 0],
          rotate: [0, 120, 0] 
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none absolute -top-40 -left-40 h-[35rem] w-[35rem] rounded-full bg-primary/30 blur-[100px]"
      />
      <motion.div
        aria-hidden
        animate={{ 
          scale: [1.2, 1, 1.2], 
          x: [0, -60, 0], 
          y: [0, 40, 0],
          rotate: [0, -90, 0] 
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none absolute -bottom-40 -right-40 h-[40rem] w-[40rem] rounded-full bg-accent/20 blur-[100px]"
      />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl grid-cols-1 items-center gap-10 px-6 py-10 lg:grid-cols-2">
        
        {/* Left: Pitch Section with Staggered Entrance */}
        <motion.div
          variants={containerVars}
          initial="hidden"
          animate="visible"
          className="text-foreground"
        >
          <motion.div variants={itemVars} className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-semibold border border-white/10">
            <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" /> AI-powered safety companion
          </motion.div>
          
          <motion.h1 variants={itemVars} className="mt-5 font-display text-5xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
            Welcome to your <br />
            <span className="gradient-text">Safe Space.</span>
          </motion.h1>

          <motion.p variants={itemVars} className="mt-5 max-w-xl text-base text-foreground/75 md:text-lg">
            HEAL Her tailors itself to you — protective stories for kids, real talk for teens, and a quiet command center for young women. One tap to hide. One tap to get help.
          </motion.p>

          <motion.div variants={itemVars} className="mt-8 grid max-w-md grid-cols-3 gap-3 text-xs">
            {[
              { icon: ShieldCheck, label: "Stealth Mode" },
              { icon: Sparkles, label: "Red Flag AI" },
              { icon: Heart, label: "Safe Circle" },
            ].map((b) => (
              <motion.div 
                key={b.label} 
                whileHover={{ y: -5, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                className="glass flex flex-col items-start gap-2 rounded-2xl p-3 transition-colors border border-white/5"
              >
                <b.icon className="h-4 w-4 text-accent" />
                <span className="font-semibold">{b.label}</span>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={itemVars} className="mt-8 flex items-center gap-2 text-xs text-foreground/60">
            <EyeOff className="h-3.5 w-3.5" /> Press <kbd className="rounded bg-foreground/10 px-1.5 py-0.5 text-[10px] font-sans">Esc</kbd> anywhere to camouflage instantly.
          </motion.div>
        </motion.div>

        {/* Right: Form Card with Smooth Pop-in */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="glass-strong relative w-full rounded-[2.5rem] border border-white/20 p-6 shadow-2xl md:p-10"
        >
          <div className="mb-8 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-foreground/50">Secure Access</div>
              <h2 className="mt-1 font-display text-3xl font-bold">Get Started</h2>
            </div>
            <motion.div 
              whileHover={{ rotate: 15, scale: 1.1 }}
              className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20"
            >
              <Heart className="h-6 w-6 text-white" />
            </motion.div>
          </div>

          <div className="space-y-6">
            <label className="block">
              <span className="ml-1 text-xs font-semibold uppercase tracking-wider text-foreground/60">Your nickname</span>
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-base outline-none transition-all focus:border-primary/50 focus:bg-white/10 focus:ring-4 focus:ring-primary/10 placeholder:text-foreground/30"
                placeholder="What should we call you?"
              />
            </label>

            <div>
              <div className="flex items-baseline justify-between px-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-foreground/60">Your age</span>
                <AnimatePresence mode="wait">
                  <motion.span 
                    key={age}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    className="font-display text-3xl font-bold gradient-text tabular-nums"
                  >
                    {age}
                  </motion.span>
                </AnimatePresence>
              </div>
              <input
                type="range"
                min={6}
                max={25}
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value))}
                className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-primary"
                aria-label="Age"
              />
              <div className="mt-2 flex justify-between px-1 text-[10px] font-medium text-foreground/40">
                <span>6 years</span><span>25 years</span>
              </div>
              
              <motion.div 
                layout
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-xs text-primary-foreground"
              >
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                Accessing <strong className="font-bold">{tierLabel}</strong>
              </motion.div>
            </div>
          </div>

          <motion.button
            onClick={enter}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-10 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-primary to-accent px-6 py-5 text-lg font-bold text-white shadow-xl shadow-primary/25 transition-all hover:shadow-primary/40"
          >
            Enter Safe Space <ArrowRight className="h-5 w-5" />
          </motion.button>

          <p className="mt-6 text-center text-[11px] leading-relaxed text-foreground/40">
            Private & Secure. We don't store your personal data without permission. <br />
            Dyg? Your safety is our priority.
          </p>
        </motion.div>
      </div>
    </div>
  );
}