'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, 
  AlertTriangle, 
  RotateCcw, 
  ShieldAlert,
  Target,
  ShieldCheck,
  BrainCircuit,
  Loader2
} from "lucide-react";
import { TEENS_SCENARIOS, Scenario } from "@/components/teens/data/scenario";
import { useAudio } from "@/components/context/audio-manager"; 

// --- MATURE ANIMATIONS ---
const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: -20,
    transition: { duration: 0.3, ease: "easeInOut" as const }
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

const STORAGE_KEY = '@heal-teens-scenario-deck';
const BOARD_SIZE = 4; // Number of scenarios shown at once

export default function TeensScenariosPage() {
  const { playSfx } = useAudio();
  const [deck, setDeck] = useState<DeckState | null>(null);
  const [justCompleted, setJustCompleted] = useState<string[]>([]); // Holds IDs temporarily showing the success screen

  // --- INITIALIZE DECK ---
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setDeck(JSON.parse(saved));
        return;
      } catch (e) {
        console.error("Failed to parse deck state", e);
      }
    }
    
    // First load: Shuffle all and distribute
    const allIds = shuffleArray(TEENS_SCENARIOS.map((s: Scenario) => s.id));
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
    
    // 1. Mark as just completed to show success screen
    setJustCompleted(prev => [...prev, id]);

    // 2. Wait 3 seconds to let user read the explanation, then swap
    setTimeout(() => {
      setDeck(prev => {
        if (!prev) return prev;
        
        let { unseen, active, history, totalSolved } = prev;
        let nextUnseen = [...unseen];
        let nextHistory = [...history, id];
        let nextActive = [...active];
        
        const idx = nextActive.indexOf(id);
        if (idx !== -1) {
          // If unseen queue is empty, shuffle history into unseen (infinite loop, no immediate repeats)
          if (nextUnseen.length === 0) {
            nextUnseen = shuffleArray([...nextHistory]);
            nextHistory = []; // Clear history as it's now the unseen queue
          }
          
          // Pop the top card and replace the active one
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

      // Remove from temporary success state
      setJustCompleted(prev => prev.filter(x => x !== id));
    }, 3000); 
  };

  if (!deck) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Cap the progress display at 70/70, even if they've solved more
  const displayProgress = Math.min(deck.totalSolved, TEENS_SCENARIOS.length);

  return (
    <div className="min-h-screen pb-32 px-4 md:px-8 relative overflow-hidden text-white">
      
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 right-[10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-[5%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      </div>

      {/* --- HERO SECTION --- */}
      <header className="pt-16 pb-12 text-center relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6"
        >
          <BrainCircuit className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold tracking-wider uppercase text-white/70">Simulation Protocol</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
        >
          Scenario <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Analysis.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-white/50 max-w-xl text-sm md:text-base"
        >
          Test your instincts in realistic situations. Navigate boundaries, identify red flags, and determine the safest course of action.
        </motion.p>
      </header>

      {/* --- GRID LAYOUT --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10 max-w-5xl mx-auto">
        <AnimatePresence mode="popLayout">
          {deck.active.map((id) => {
            const scenario = TEENS_SCENARIOS.find((s: Scenario) => s.id === id);
            if (!scenario) return null;

            return (
              <ScenarioCard 
                key={scenario.id} 
                scenario={scenario} 
                isCompleted={justCompleted.includes(scenario.id)}
                onComplete={() => handleComplete(scenario.id)}
              />
            );
          })}
        </AnimatePresence>
      </div>

      {/* --- PROGRESS BAR --- */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.5, type: "spring", damping: 20 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-background/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col gap-3 shadow-2xl z-50"
      >
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-white/70">
            <Target className="w-4 h-4" />
            <span className="text-xs font-semibold tracking-wider uppercase">Completion Status</span>
          </div>
          <span className="text-sm font-bold text-primary">{displayProgress} / {TEENS_SCENARIOS.length}</span>
        </div>
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            animate={{ width: `${(displayProgress / TEENS_SCENARIOS.length) * 100}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-primary" 
          />
        </div>
      </motion.div>

    </div>
  );
}

// --- INTERACTIVE SCENARIO CARD COMPONENT ---
function ScenarioCard({ 
  scenario, 
  isCompleted, 
  onComplete, 
}: { 
  scenario: Scenario, 
  isCompleted: boolean, 
  onComplete: () => void, 
}) {
  const { playSfx } = useAudio();
  const [picked, setPicked] = useState<string | null>(null);
  
  const choice = picked ? scenario.choices.find((c: { id: string; text: string; safe: boolean; explanation: string }) => c.id === picked) : null;

  const handleChoice = (c: { id: string; text: string; safe: boolean; explanation: string }) => {
    if (picked) return;
    
    playSfx('click');
    setPicked(c.id);

    // If safe, trigger completion to start the rotation timer
    if (c.safe) {
      onComplete();
    }
  };

  return (
    <motion.div 
      layout
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`relative rounded-3xl border p-6 flex flex-col transition-all duration-300 ${
        isCompleted 
          ? "bg-white/5 border-primary/30 backdrop-blur-xl shadow-[0_0_30px_rgba(var(--primary-rgb),0.1)]" 
          : "bg-white/5 border-white/10 backdrop-blur-xl hover:bg-white/10"
      }`}
    >
      <AnimatePresence mode="wait">
        {!isCompleted || !choice?.safe ? (
          <motion.div 
            key="question"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col flex-1"
          >
            {/* Header / Context */}
            <div className="flex items-center justify-between mb-6">
              <div className="inline-flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-semibold tracking-wider text-white/60 uppercase">
                {scenario.context}
              </div>
            </div>

            {/* Prompt */}
            <h4 className="font-bold text-lg leading-snug text-white mb-6">
              {scenario.prompt}
            </h4>

            {/* Choices Grid */}
            <div className="flex flex-col gap-3 mt-auto">
              {scenario.choices.map((c: { id: string; text: string; safe: boolean; explanation: string }) => {
                const active = picked === c.id;
                const showResult = !!picked && active;
                
                return (
                  <motion.button
                    key={c.id}
                    whileHover={!picked ? { scale: 1.01 } : {}}
                    whileTap={!picked ? { scale: 0.99 } : {}}
                    onClick={() => handleChoice(c)}
                    disabled={!!picked}
                    className={`relative rounded-xl border px-5 py-4 text-left transition-all duration-300 ${
                      showResult
                        ? c.safe
                          ? "border-emerald-500/50 bg-emerald-500/10 text-white"
                          : "border-rose-500/50 bg-rose-500/10 text-white"
                        : picked 
                          ? "border-white/5 bg-white/5 opacity-40" 
                          : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-medium">{c.text}</span>
                      <AnimatePresence>
                        {showResult && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`shrink-0 rounded-full p-1.5 ${c.safe ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}
                          >
                            {c.safe ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <AlertTriangle className="h-4 w-4" />
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Error Feedback */}
            <AnimatePresence>
              {choice && !choice.safe && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: 5 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-5 rounded-xl border border-rose-500/20 bg-rose-500/5 p-5"
                >
                  <p className="text-sm font-medium text-white/80 leading-relaxed mb-5">
                    <span className="text-rose-400 font-bold block mb-1">Assessment Incorrect</span>
                    {choice.explanation}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      playSfx('click');
                      setPicked(null);
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-xs font-semibold tracking-widest uppercase text-white hover:bg-white/10 transition-all"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Re-evaluate
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* --- ANALYSIS COMPLETE VIEW --- */
          <motion.div
            key="celebration"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-8 text-center h-full"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mb-6">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            
            <h3 className="text-xl font-bold text-white mb-3">Optimal Action Selected</h3>
            <p className="text-white/60 font-medium text-sm mb-6 leading-relaxed max-w-[280px] mx-auto">
              {choice?.explanation}
            </p>

            <div className="inline-flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10 mt-auto">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white/80 tracking-widest uppercase">Protocol Verified</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}