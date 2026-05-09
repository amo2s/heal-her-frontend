'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, 
  FileText, 
  BookOpen, 
  CheckCircle,
  Shield,
  Lock,
  Unlock,
  ArrowRight
} from "lucide-react";

import { LESSONS, VIDEOS } from "@/data/heal";
import type { Lesson, VideoItem } from "@/data/heal";

// --- SLEEK ANIMATIONS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } 
  }
};

// --- MINIMAL SCROLLBAR ---
const minimalScrollbar = `
  [&::-webkit-scrollbar]:h-1.5 
  [&::-webkit-scrollbar-track]:bg-transparent 
  [&::-webkit-scrollbar-thumb]:bg-white/10 
  [&::-webkit-scrollbar-thumb]:rounded-full 
  hover:[&::-webkit-scrollbar-thumb]:bg-white/20
`;

export default function TeensLearnPage() {
  const completedModules = LESSONS.teens.filter((l: Lesson) => l.progress === 100);

  return (
    <div className="min-h-screen pb-32 px-4 md:px-8 relative overflow-hidden text-white">
      
      {/* --- BACKGROUND EFFECTS --- */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* --- HERO SECTION --- */}
      <header className="pt-12 pb-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6"
        >
          <BookOpen className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold tracking-wider uppercase text-white/70">Resource Library</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
        >
          Knowledge is <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Power.</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-white/50 max-w-xl text-sm md:text-base"
        >
          Explore modules on boundaries, digital safety, and relationships. Equip yourself with the tools to navigate the real world.
        </motion.p>
      </header>

      {/* --- PROGRESS OVERVIEW --- */}
      {completedModules.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-full mb-12 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-2xl"
        >
          <div className="flex items-center gap-2 mb-6">
            <CheckCircle className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/70">Completed Modules</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {completedModules.map((module: Lesson, idx: number) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10"
              >
                <span className="text-xl">{module.emoji}</span>
                <span className="text-xs font-medium">{module.title}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* --- MAIN CONTENT AREAS --- */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-16 relative z-10"
      >
        <ModulesSection />
        <MediaSection />
        <ScenariosSection />
      </motion.div>
    </div>
  );
}

// --- 1. MODULES COMPONENT ---
function ModulesSection() {
  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between px-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Essential Modules</h2>
          <p className="text-xs font-medium text-white/50 uppercase tracking-widest mt-1">Core Concepts</p>
        </div>
      </div>

      <div className={`-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-8 pt-2 ${minimalScrollbar}`}>
        {LESSONS.teens.map((lesson: Lesson) => (
          <motion.div 
            key={lesson.id} 
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="snap-start relative group min-w-[280px] w-[75vw] max-w-[320px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 transition-all hover:bg-white/10 cursor-pointer flex flex-col"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-2xl group-hover:scale-105 transition-transform">
                {lesson.emoji}
              </div>
              {lesson.progress === 100 ? (
                <div className="bg-primary/20 text-primary px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-primary/20">
                  Done
                </div>
              ) : (
                <div className="text-[10px] font-bold text-white/40 uppercase bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                  {lesson.duration}
                </div>
              )}
            </div>

            <span className="text-[10px] font-semibold uppercase tracking-widest text-primary mb-2 block">{lesson.category}</span>
            <h3 className="text-lg font-bold leading-snug flex-1">{lesson.title}</h3>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: `${lesson.progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
              <span className="text-xs font-medium text-white/50">{lesson.progress}%</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// --- 2. MEDIA COMPONENT ---
function MediaSection() {
  const [listView, setListView] = useState(false);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Expert Insights</h2>
          <p className="text-xs font-medium text-white/50 uppercase tracking-widest mt-1">Video Library</p>
        </div>
        
        <button
          onClick={() => setListView(!listView)}
          className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-xs font-medium transition-all hover:bg-white/10"
        >
          <FileText className="w-4 h-4 text-white/60" />
          <span className="hidden md:inline">{listView ? "Grid View" : "List View"}</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {listView ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl divide-y divide-white/5 overflow-hidden"
          >
            {VIDEOS.teens.map((v: VideoItem) => (
              <div 
                key={v.id} 
                className="flex items-center justify-between p-5 hover:bg-white/5 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Play className="w-5 h-5 text-white/70 group-hover:text-primary ml-0.5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-base">{v.title}</h4>
                    <p className="text-[11px] text-white/40 uppercase tracking-wider mt-1">{v.presenter} • {v.duration}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors hidden sm:block" />
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-8 pt-2 ${minimalScrollbar}`}
          >
            {VIDEOS.teens.map((v: VideoItem) => (
              <motion.div 
                key={v.id} 
                variants={itemVariants}
                className="snap-start group min-w-[280px] w-[75vw] max-w-[320px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden cursor-pointer hover:border-white/20 transition-all"
              >
                <div className="relative aspect-video bg-black/40">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 text-white ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-medium text-white/90">
                    {v.duration}
                  </div>
                </div>
                
                <div className="p-5">
                  <span className="text-[10px] font-semibold text-primary uppercase tracking-widest">{v.topic}</span>
                  <h4 className="mt-2 text-base font-bold leading-snug line-clamp-2">{v.title}</h4>
                  <p className="text-xs text-white/50 mt-3 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" /> {v.presenter}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// --- 3. SCENARIOS COMPONENT ---
const PRACTICE_SCENARIOS = [
  { id: "s1", title: "The Unwanted DM", points: 50, icon: "💬", locked: false },
  { id: "s2", title: "Party Boundaries", points: 100, icon: "🚫", locked: false },
  { id: "s3", title: "Digital Footprint Check", points: 150, icon: "🔍", locked: true },
  { id: "s4", title: "Gaslighting Simulation", points: 200, icon: "🧠", locked: true },
];

function ScenariosSection() {
  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between px-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Scenario Practice</h2>
          <p className="text-xs font-medium text-white/50 uppercase tracking-widest mt-1">Real-world Application</p>
        </div>
      </div>

      <div className={`-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-8 pt-2 ${minimalScrollbar}`}>
        {PRACTICE_SCENARIOS.map((scenario) => (
          <motion.div 
            key={scenario.id} 
            variants={itemVariants}
            whileHover={!scenario.locked ? { y: -5 } : {}}
            className={`snap-start relative group min-w-[220px] w-[60vw] max-w-[260px] border rounded-3xl p-5 transition-all flex flex-col ${
              scenario.locked 
                ? "bg-white/5 border-white/5 opacity-60 cursor-not-allowed" 
                : "bg-white/5 backdrop-blur-xl border-white/10 cursor-pointer hover:bg-white/10"
            }`}
          >
            <div className="absolute top-4 right-4 z-10">
              {scenario.locked ? (
                <Lock className="w-4 h-4 text-white/30" />
              ) : (
                <Unlock className="w-4 h-4 text-primary/70" />
              )}
            </div>

            <div className="mb-8">
              <div className={`w-12 h-12 flex items-center justify-center rounded-2xl text-2xl border transition-transform ${!scenario.locked && "group-hover:scale-105"} ${scenario.locked ? "bg-black/20 border-white/5 grayscale" : "bg-white/5 border-white/10"}`}>
                {scenario.icon}
              </div>
            </div>

            <h3 className={`text-base font-bold leading-snug flex-1 ${scenario.locked ? "text-white/40" : "text-white"}`}>
              {scenario.title}
            </h3>

            <div className="mt-4 flex justify-between items-center pt-4 border-t border-white/10">
               <span className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">XP Reward</span>
               <span className={`text-xs font-bold ${scenario.locked ? "text-white/20" : "text-primary"}`}>+{scenario.points}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}