'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, 
  AlertTriangle, 
  RotateCcw, 
  ShieldCheck,
  BrainCircuit,
  Loader2,
  Activity,
  Target
} from "lucide-react";

// --- DOMAIN-SPECIFIC DATA IMPORT ---
import { YOUNG_ADULT_SCENARIOS } from "@/components/young-adults/data/scenario";
import type { Scenario } from "@/components/young-adults/data/scenario";
import { useAudio } from "@/components/context/audio-manager"; 

// Safety Extraction
const YA_SCENARIOS: Scenario[] = YOUNG_ADULT_SCENARIOS || [];

// --- SOPHISTICATED ANIMATIONS ---
const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.19, 1, 0.22, 1] as const } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: -20,
    transition: { duration: 0.4, ease: "easeInOut" as const }
  }
};

// --- UTILITY: FISHER-YATES SHUFFLE ---
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// --- DECK STATE INTERFACE ---
interface DeckState {
  unseen: string[];
  active: string[];
  history: string[];
  totalSolved: number;
}

const STORAGE_KEY = '@heal-ya-scenario-deck-v2';
const BOARD_SIZE = 4; // Number of scenarios shown at once

export default function YoungAdultsScenariosPage() {
  const { playSfx } = useAudio();
  const [deck, setDeck] = useState<DeckState | null>(null);
  const [justCompleted, setJustCompleted] = useState<string[]>([]); 
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  // --- INITIALIZE DECK ---
  useEffect(() => {
    if (YA_SCENARIOS.length === 0) return;

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setDeck(JSON.parse(saved));
        return;
      } catch (e) {
        console.error("Failed to parse deck state", e);
      }
    }
    
    const allIds = shuffleArray(YA_SCENARIOS.map((s: Scenario) => s.id));
    setDeck({
      active: allIds.slice(0, BOARD_SIZE) as string[],
      unseen: allIds.slice(BOARD_SIZE) as string[],
      history: [],
      totalSolved: 0
    });
  }, []);

  // --- SAVE STATE ---
  useEffect(() => {
    if (deck) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(deck));
    }
  }, [deck]);

  // --- SMART ROTATION LOGIC ---
  const handleComplete = (id: string) => {
    if (justCompleted.includes(id)) return;
    
    setJustCompleted(prev => [...prev, id]);

    // Extended timer to let the user read the analysis
    setTimeout(() => {
      setDeck(prev => {
        if (!prev) return prev;
        
        let { unseen, active, history, totalSolved } = prev;
        let nextUnseen = [...unseen];
        let nextHistory = [...history, id];
        let nextActive = [...active];
        
        const idx = nextActive.indexOf(id);
        if (idx !== -1) {
          if (nextUnseen.length === 0) {
            nextUnseen = shuffleArray([...nextHistory]);
            nextHistory = []; 
          }
          
          const nextId = nextUnseen.shift();
          if (nextId) {
            nextActive[idx] = nextId;
          }
        }
        
        return {
          unseen: nextUnseen,
          active: nextActive,
          history: nextHistory,
          totalSolved: totalSolved + 1
        };
      });

      setJustCompleted(prev => prev.filter(x => x !== id));
      setActiveCardId(null); // Reset focus
    }, 4500); 
  };

  if (!deck || YA_SCENARIOS.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">Loading Scenarios...</span>
        </div>
      </div>
    );
  }

  const displayProgress = Math.min(deck.totalSolved, YA_SCENARIOS.length);
  const completionPercentage = (displayProgress / YA_SCENARIOS.length) * 100;

  return (
    <div className="min-h-screen pb-32 px-4 md:px-8 relative overflow-hidden text-white">
      
      {/* --- STRATEGIC AMBIENCE --- */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[700px] h-[700px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[700px] h-[700px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:24px_24px] opacity-20 pointer-events-none" />
      </div>

      {/* --- HERO SECTION & PROGRESS DASHBOARD --- */}
      <header className="pt-20 pb-12 relative z-10 w-full max-w-5xl mx-auto flex flex-col">
        <div className="flex flex-col items-center text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-xl mb-6"
          >
            <BrainCircuit className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/50">Interactive Practice</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tighter mb-6"
          >
            Real-Life <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Scenarios.</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/40 max-w-2xl text-sm md:text-lg leading-relaxed"
          >
            Practice making tough calls in realistic situations. Navigate professional and personal boundaries, spot red flags, and find the best way forward.
          </motion.p>
        </div>

        {/* INLINE PROGRESS BAR */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 shadow-2xl flex flex-col gap-4"
        >
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3 text-white/60">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Your Progress</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold tracking-widest text-white/30 uppercase">Completed</span>
              <span className="text-sm font-black text-primary tabular-nums tracking-widest">{displayProgress} / {YA_SCENARIOS.length}</span>
            </div>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden relative">
            <motion.div 
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-purple-500 rounded-full shadow-[0_0_15px_rgba(var(--primary-rgb),0.6)]" 
            />
          </div>
        </motion.div>
      </header>

      {/* --- GRID LAYOUT --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10 max-w-5xl mx-auto items-start">
        <AnimatePresence mode="popLayout">
          {deck.active.map((id) => {
            const scenario = YA_SCENARIOS.find((s: Scenario) => s.id === id);
            if (!scenario) return null;

            return (
              <ScenarioCard 
                key={scenario.id} 
                scenario={scenario} 
                isCompleted={justCompleted.includes(scenario.id)}
                isActive={activeCardId === scenario.id}
                hasActiveCard={activeCardId !== null}
                onInteractionStart={() => setActiveCardId(scenario.id)}
                onComplete={() => handleComplete(scenario.id)}
              />
            );
          })}
        </AnimatePresence>
      </div>

    </div>
  );
}

// --- INTELLIGENT SCENARIO CARD COMPONENT ---
function ScenarioCard({ 
  scenario, 
  isCompleted, 
  isActive,
  hasActiveCard,
  onInteractionStart,
  onComplete, 
}: { 
  scenario: Scenario, 
  isCompleted: boolean, 
  isActive: boolean,
  hasActiveCard: boolean,
  onInteractionStart: () => void,
  onComplete: () => void, 
}) {
  const { playSfx } = useAudio();
  const [picked, setPicked] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const choice = picked ? scenario.choices.find((c) => c.id === picked) : null;

  const handleChoice = (c: { id: string; text: string; safe: boolean; explanation: string }) => {
    if (picked) return;
    
    playSfx('click');
    onInteractionStart();
    setPicked(c.id);
    setIsAnalyzing(true);

    // Simulate Processing time
    setTimeout(() => {
      setIsAnalyzing(false);
      if (c.safe) {
        onComplete();
      }
    }, 1500);
  };

  // Dim the card slightly if another card is actively being played
  const isDimmed = !isActive && !isCompleted && picked === null && hasActiveCard;

  return (
    <motion.div 
      layout
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`relative rounded-[2rem] border p-8 flex flex-col transition-all duration-500 overflow-hidden ${
        isCompleted 
          ? "bg-white/[0.02] border-primary/40 backdrop-blur-3xl shadow-[0_0_50px_rgba(var(--primary-rgb),0.1)]" 
          : isActive
            ? "bg-white/[0.06] border-white/20 backdrop-blur-3xl shadow-2xl z-20 scale-[1.02]"
            : isDimmed
              ? "bg-white/[0.01] border-white/5 opacity-40 grayscale-[50%]"
              : "bg-white/[0.03] border-white/10 backdrop-blur-3xl hover:bg-white/[0.05]"
      }`}
    >
      <AnimatePresence mode="wait">
        {/* VIEW 1: COMPLETE CELEBRATION */}
        {isCompleted && !isAnalyzing ? (
          <motion.div
            key="celebration"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-10 text-center h-full"
          >
            <div className="w-20 h-20 rounded-[1.5rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
              <Check className="w-10 h-10 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">Great Choice!</h3>
            <p className="text-emerald-400/80 font-medium text-sm mb-8 leading-relaxed max-w-[320px] mx-auto">
              {choice?.explanation}
            </p>
            <div className="inline-flex items-center gap-3 bg-white/5 px-5 py-2.5 rounded-full border border-white/10 mt-auto">
              <span className="text-[10px] font-bold text-white/70 tracking-widest uppercase">Moving to next scenario...</span>
            </div>
          </motion.div>

        ) : (
          /* VIEW 2: ACTIVE QUESTION & ANALYSIS */
          <motion.div 
            key="question"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col flex-1"
          >
            {/* Header / Context */}
            <motion.div layout className="flex items-center justify-between mb-8">
              <div className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-[10px] font-bold tracking-widest text-white/50 uppercase">
                {scenario.context}
              </div>
            </motion.div>

            {/* Prompt */}
            <motion.h4 layout className="font-bold text-xl leading-snug text-white mb-8 tracking-tight">
              {scenario.prompt}
            </motion.h4>

            {/* Choices Grid */}
            <motion.div layout className="flex flex-col gap-4 mt-auto">
              <AnimatePresence>
                {scenario.choices.map((c) => {
                  const isPicked = picked === c.id;
                  // Hide unselected options to allow smooth expansion of the explanation
                  if (picked && !isPicked) return null; 

                  const showResult = !!picked && !isAnalyzing && isPicked;
                  
                  return (
                    <motion.button
                      key={c.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0, padding: 0, overflow: "hidden" }}
                      whileHover={!picked ? { scale: 1.01, backgroundColor: "rgba(255, 255, 255, 0.08)" } : {}}
                      whileTap={!picked ? { scale: 0.99 } : {}}
                      onClick={() => handleChoice(c)}
                      disabled={!!picked}
                      className={`relative rounded-2xl border px-6 py-5 text-left transition-all duration-500 ${
                        isAnalyzing && isPicked
                          ? "border-primary/50 bg-primary/10 shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]"
                          : showResult
                            ? c.safe
                              ? "border-emerald-500/50 bg-emerald-500/10 text-white"
                              : "border-rose-500/50 bg-rose-500/10 text-white"
                            : "border-white/10 bg-white/5 text-white/80"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className={`text-sm font-semibold leading-relaxed ${isAnalyzing ? "text-primary animate-pulse" : ""}`}>
                          {isAnalyzing && isPicked ? "Analyzing your choice..." : c.text}
                        </span>
                        
                        <AnimatePresence>
                          {showResult && (
                            <motion.div
                              initial={{ scale: 0, rotate: -90 }}
                              animate={{ scale: 1, rotate: 0 }}
                              className={`shrink-0 rounded-full p-2 ${c.safe ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}
                            >
                              {c.safe ? <Check className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </motion.div>

            {/* Simulated Analysis State */}
            <AnimatePresence>
              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 flex flex-col items-center justify-center p-6 bg-black/40 rounded-2xl border border-white/5"
                >
                  <Activity className="w-6 h-6 text-primary animate-bounce mb-3" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70 text-center">
                    Reviewing outcome...
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Feedback (Expands smoothly) */}
            <AnimatePresence>
              {choice && !choice.safe && !isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: 10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6"
                >
                  <div className="flex items-center gap-2 mb-3">
                     <AlertTriangle className="w-4 h-4 text-rose-400" />
                     <span className="text-rose-400 font-bold uppercase tracking-widest text-[10px]">Let's rethink this</span>
                  </div>
                  <p className="text-sm font-medium text-white/70 leading-relaxed mb-6 pl-6 border-l border-rose-500/20">
                    {choice.explanation}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      playSfx('click');
                      setPicked(null);
                      onInteractionStart(); // Keeps focus active while recalibrating
                    }}
                    className="flex w-full items-center justify-center gap-3 rounded-xl bg-white/[0.03] border border-white/10 px-5 py-3 text-[10px] font-bold tracking-[0.2em] uppercase text-white transition-all"
                  >
                    <RotateCcw className="h-4 w-4" /> Try Again
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}