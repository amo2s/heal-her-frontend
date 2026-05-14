'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, 
  FileText, 
  Compass, 
  CheckCircle,
  Shield,
  Lock,
  Unlock,
  ArrowRight,
  TrendingUp,
  Award
} from "lucide-react";

import { LESSONS, VIDEOS } from "@/data/heal";
import type { Lesson, VideoItem } from "@/data/heal";

// --- SAFE DATA EXTRACTORS ---
// Bypasses the strict AgeGroup TS error by targeting the exact 'ya' key
const getYaLessons = (): Lesson[] => (LESSONS as any).ya || [];
const getYaVideos = (): VideoItem[] => (VIDEOS as any).ya || [];

// --- SOPHISTICATED ANIMATIONS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.12 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.19, 1, 0.22, 1] as const } 
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

export default function YoungAdultsLearnPage() {
  const yaLessons = getYaLessons();
  const yaVideos = getYaVideos();
  const completedModules = yaLessons.filter((l: Lesson) => l.progress === 100);

  return (
    <div className="min-h-screen pb-32 px-4 md:px-8 relative overflow-hidden text-white">
      
      {/* --- BACKGROUND BLOOMS --- */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[130px] pointer-events-none" />

      {/* --- HEADER --- */}
      <header className="pt-16 pb-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6"
        >
          <Compass className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/60">Development Suite</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-bold tracking-tighter mb-6"
        >
          Mastery through <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Insight.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-white/50 max-w-2xl text-sm md:text-lg leading-relaxed"
        >
          Curated frameworks for professional boundaries, emotional intelligence, and interpersonal dynamics. Build the autonomy to thrive in complex environments.
        </motion.p>
      </header>

      {/* --- RESUME PROGRESS --- */}
      {completedModules.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-full mb-16 p-8 rounded-[2rem] bg-white/[0.03] border border-white/10 backdrop-blur-3xl"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/80">Growth Milestones</h3>
            </div>
            <span className="text-[10px] font-medium text-white/30 uppercase tracking-widest">
              {completedModules.length} Modules Finalized
            </span>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {completedModules.map((module: Lesson, idx: number) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.08 }}
                className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/30 transition-colors"
              >
                <span className="text-xl">{module.emoji}</span>
                <span className="text-xs font-semibold tracking-tight">{module.title}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* --- CONTENT LAYERS --- */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-24 relative z-10"
      >
        <StrategicModules lessons={yaLessons} />
        <PerspectiveMedia videos={yaVideos} />
        <DecisionLabs />
      </motion.div>
    </div>
  );
}

// --- 1. STRATEGIC MODULES ---
function StrategicModules({ lessons }: { lessons: Lesson[] }) {
  return (
    <section className="space-y-8">
      <div className="flex items-end justify-between px-2">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Frameworks</h2>
          <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Core Development</p>
        </div>
      </div>

      <div className={`-mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-10 pt-2 ${minimalScrollbar}`}>
        {lessons.map((lesson: Lesson) => (
          <motion.div 
            key={lesson.id} 
            variants={itemVariants}
            whileHover={{ y: -8 }}
            className="snap-start relative group min-w-[300px] w-[80vw] max-w-[360px] bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 transition-all hover:bg-white/[0.07] cursor-pointer flex flex-col"
          >
            <div className="flex justify-between items-start mb-8">
              <div className="w-14 h-14 flex items-center justify-center rounded-[1.25rem] bg-white/5 border border-white/10 text-3xl group-hover:scale-110 transition-transform">
                {lesson.emoji}
              </div>
              {lesson.progress === 100 ? (
                <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border border-primary/20">
                  Certified
                </div>
              ) : (
                <div className="text-[10px] font-bold text-white/40 uppercase bg-white/5 px-3 py-1 rounded-full border border-white/10">
                  {lesson.duration}
                </div>
              )}
            </div>

            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-3 block">{lesson.category}</span>
            <h3 className="text-xl font-bold leading-tight flex-1 tracking-tight">{lesson.title}</h3>

            <div className="mt-10 flex items-center gap-6">
              <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: `${lesson.progress}%` }}
                  transition={{ duration: 1.2, ease: "circOut" }}
                  className="h-full bg-primary rounded-full shadow-[0_0_12px_rgba(var(--primary-rgb),0.5)]"
                />
              </div>
              <span className="text-[10px] font-bold text-white/40 tabular-nums">{lesson.progress}%</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// --- 2. PERSPECTIVE MEDIA ---
function PerspectiveMedia({ videos }: { videos: VideoItem[] }) {
  const [isGrid, setIsGrid] = useState(true);

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between px-2">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Perspectives</h2>
          <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Masterclass series</p>
        </div>
        
        <button
          onClick={() => setIsGrid(!isGrid)}
          className="flex items-center gap-3 rounded-2xl bg-white/5 border border-white/10 px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-white/10 active:scale-95"
        >
          {isGrid ? <FileText className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
          <span className="hidden sm:inline">{isGrid ? "Condensed View" : "Overview"}</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {!isGrid ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-[2rem] divide-y divide-white/5 overflow-hidden"
          >
            {videos.map((v: VideoItem) => (
              <div 
                key={v.id} 
                className="flex items-center justify-between p-6 hover:bg-white/5 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary/20 transition-all">
                    <Play className="w-5 h-5 text-white/50 group-hover:text-primary ml-1" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg tracking-tight">{v.title}</h4>
                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.1em] mt-1.5">{v.presenter} • {v.duration}</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-white/10 group-hover:text-white/50 transition-all hidden sm:block" />
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="grid"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`-mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-10 pt-2 ${minimalScrollbar}`}
          >
            {videos.map((v: VideoItem) => (
              <motion.div 
                key={v.id} 
                variants={itemVariants}
                className="snap-start group min-w-[300px] w-[80vw] max-w-[360px] bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2.5rem] overflow-hidden cursor-pointer hover:border-white/20 transition-all"
              >
                <div className="relative aspect-video bg-neutral-900">
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/0 transition-colors">
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 group-hover:bg-primary transition-all duration-500">
                      <Play className="w-6 h-6 text-white ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-xl text-[10px] font-bold text-white/90 tracking-tighter">
                    {v.duration}
                  </div>
                </div>
                
                <div className="p-7">
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{v.topic}</span>
                  <h4 className="mt-3 text-lg font-bold leading-tight tracking-tight line-clamp-2">{v.title}</h4>
                  <p className="text-xs text-white/40 mt-5 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-white/20" /> {v.presenter}
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

// --- 3. DECISION LABS ---
const PRACTICE_SCENARIOS = [
  { id: "s1", title: "Navigating Professional Encroachment", points: 250, icon: "💼", locked: false },
  { id: "s2", title: "The Financial Accountability Matrix", points: 400, icon: "⚖️", locked: false },
  { id: "s3", title: "Interpersonal De-escalation", points: 550, icon: "🤝", locked: true },
  { id: "s4", title: "Cognitive Distortion Audit", points: 700, icon: "🧠", locked: true },
];

function DecisionLabs() {
  return (
    <section className="space-y-8">
      <div className="flex items-end justify-between px-2">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Decision Labs</h2>
          <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Advanced Simulations</p>
        </div>
      </div>

      <div className={`-mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-10 pt-2 ${minimalScrollbar}`}>
        {PRACTICE_SCENARIOS.map((scenario) => (
          <motion.div 
            key={scenario.id} 
            variants={itemVariants}
            whileHover={!scenario.locked ? { y: -8, scale: 1.02 } : {}}
            className={`snap-start relative group min-w-[240px] w-[65vw] max-w-[280px] border rounded-[2rem] p-7 transition-all flex flex-col ${
              scenario.locked 
                ? "bg-white/[0.02] border-white/5 opacity-40 cursor-not-allowed" 
                : "bg-white/[0.04] backdrop-blur-2xl border-white/10 cursor-pointer hover:bg-white/[0.08] hover:border-white/20 shadow-xl"
            }`}
          >
            <div className="absolute top-6 right-6 z-10">
              {scenario.locked ? (
                <Lock className="w-4 h-4 text-white/20" />
              ) : (
                <Unlock className="w-4 h-4 text-primary/50" />
              )}
            </div>

            <div className="mb-10">
              <div className={`w-14 h-14 flex items-center justify-center rounded-2xl text-3xl border transition-all duration-500 ${!scenario.locked && "group-hover:rotate-12 group-hover:scale-110 shadow-lg"} ${scenario.locked ? "bg-black/20 border-white/5 grayscale" : "bg-white/5 border-white/10 shadow-primary/5"}`}>
                {scenario.icon}
              </div>
            </div>

            <h3 className={`text-base font-bold leading-snug flex-1 tracking-tight ${scenario.locked ? "text-white/30" : "text-white"}`}>
              {scenario.title}
            </h3>

            <div className="mt-6 flex justify-between items-center pt-5 border-t border-white/5">
               <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Expertise</span>
               <span className={`text-xs font-black tracking-tighter ${scenario.locked ? "text-white/10" : "text-primary"}`}>+{scenario.points} XP</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}