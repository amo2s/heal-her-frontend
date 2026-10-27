'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
  Check, 
  AlertTriangle, 
  RotateCcw, 
  Lightbulb,
  Volume2,
  VolumeX,
  Star,
  Award,
  Trophy,
  Sparkles
} from "lucide-react";
import { KIDS_SCENARIOS, Scenario } from "@/components/kids/data/scenarios";
import { useAudio } from "@/components/context/audio-manager"; 

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: "spring" as const, stiffness: 250, damping: 25 } 
  }
};

export default function KidsScenariosPage() {
  const { voiceEnabled, toggleVoice, playSfx, speak } = useAudio();
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  
  // Modal & Nudge State
  const [showModal, setShowModal] = useState(false);
  const [showNudge, setShowNudge] = useState(false);

  useEffect(() => {
    // Check if user has made a choice before
    const savedPreference = localStorage.getItem('@heal-her:buddy-voice-enabled');
    if (savedPreference === null) {
      // First time visit, show modal
      setShowModal(true);
    }
  }, []);

  const handleComplete = (id: string) => {
    if (!completedIds.includes(id)) {
      setCompletedIds(prev => [...prev, id]);
    }
  };

  const handleAcceptBuddy = () => {
    playSfx('click');
    localStorage.setItem('@heal-her:buddy-voice-enabled', 'true');
    if (!voiceEnabled) {
      toggleVoice();
    }
    setShowModal(false);
    
    // Trigger visual nudge for 5 seconds
    setShowNudge(true);
    setTimeout(() => setShowNudge(false), 5000);
  };

  const handleManualToggle = () => {
    playSfx('click');
    const newState = !voiceEnabled;
    localStorage.setItem('@heal-her:buddy-voice-enabled', String(newState));
    toggleVoice();
    setShowNudge(false); // Hide nudge if they click it manually
  };

  return (
    <div className="min-h-screen pb-32 px-4 md:px-8 relative overflow-hidden">
      
      {/* ONBOARDING MODAL */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-slate-900 border border-white/20 rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-500/20 to-transparent pointer-events-none" />
              
              <div className="relative w-20 h-20 mx-auto mb-6 rounded-full border-4 border-white/10 bg-white/5 p-3 shadow-lg flex items-center justify-center">
                <Sparkles className="absolute -top-2 -right-2 text-yellow-400 w-6 h-6 animate-pulse" />
                <Image src="/heal-logo.png" alt="Heal Logo" fill className="object-contain p-3 drop-shadow-md" />
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">Meet Heal Buddy!</h2>
              <p className="text-white/70 text-sm mb-8 leading-relaxed font-medium">
                I can read the scenarios and choices out loud for you. Just leave my button turned ON to listen anytime!
              </p>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAcceptBuddy}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all"
              >
                Okay, turn Buddy ON!
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GLOBAL VOICE TOGGLE & NUDGE */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-4">
        
        <AnimatePresence>
          {showNudge && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="hidden md:flex items-center gap-2 bg-indigo-500 text-white px-3 py-1.5 rounded-full shadow-lg border border-indigo-400"
            >
              <span className="text-xs font-bold tracking-wide">Buddy is here!</span>
              <span className="animate-bounce">👉</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleManualToggle}
          className={`relative flex items-center gap-2 p-2 pr-4 rounded-full shadow-lg transition-all border ${
            voiceEnabled ? "bg-[#DA8CA0] border-[#DA8CA0] text-white" : "bg-white/10 border-white/20 text-white/60 backdrop-blur-md hover:bg-white/20"
          }`}
        >
          {showNudge && (
            <span className="absolute inset-0 rounded-full border-2 border-indigo-400 animate-ping opacity-50 pointer-events-none" />
          )}
          <div className={`p-2 rounded-full ${voiceEnabled ? "bg-white/20" : "bg-white/10"}`}>
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider hidden md:block">
            {voiceEnabled ? "Buddy ON" : "Buddy OFF"}
          </span>
        </motion.button>
      </div>

      {/* --- HERO SECTION --- */}
      <header className="pt-10 pb-8 text-center relative z-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="relative w-20 h-20 mx-auto mb-4 cursor-pointer hover:scale-105 transition-transform"
          onClick={() => {
            playSfx('click');
            speak("Let's practice being safe!", 'happy');
          }}
        >
          <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
          <div className="relative w-full h-full rounded-full border border-white/30 backdrop-blur-md flex items-center justify-center p-4 shadow-xl bg-white/5">
             <Image src="/heal-logo.png" alt="Heal Logo" fill className="object-contain p-4 drop-shadow-md" />
          </div>
        </motion.div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">Hero Training</h1>
        <p className="text-emerald-300/90 text-sm font-medium max-w-md mx-auto">
          Pick the safest choice to earn your hero stars! 🌟
        </p>
      </header>

      {/* --- GRID LAYOUT --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 max-w-5xl mx-auto">
        {KIDS_SCENARIOS.map((scenario) => (
          <ScenarioCard 
            key={scenario.id} 
            scenario={scenario} 
            isCompleted={completedIds.includes(scenario.id)}
            onComplete={() => handleComplete(scenario.id)}
          />
        ))}
      </div>

      {/* --- HERO STATUS BAR --- */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-black/60 backdrop-blur-xl border border-white/10 rounded-full p-3 px-6 flex items-center justify-between shadow-2xl z-50"
      >
        <div className="flex items-center gap-3">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <span className="text-sm font-semibold text-white tracking-wide">{completedIds.length} / {KIDS_SCENARIOS.length} Stars</span>
        </div>
        <div className="flex-1 max-w-[120px] h-2.5 bg-white/10 rounded-full mx-4 overflow-hidden shadow-inner">
          <motion.div 
            animate={{ width: `${(completedIds.length / KIDS_SCENARIOS.length) * 100}%` }}
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500" 
          />
        </div>
      </motion.div>

      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-20 left-[10%] w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-40 right-[5%] w-80 h-80 bg-teal-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
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
  const { playSfx, speak } = useAudio();
  const [picked, setPicked] = useState<string | null>(null);
  
  const choice = picked ? scenario.choices.find((c) => c.id === picked) : null;

  const handleSpeakerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSfx('click');
    
    // Read the prompt AND the available choices
    const optionsText = scenario.choices.map(c => c.text).join(". Or, ");
    const fullSpeech = `${scenario.prompt}. Your choices are: ${optionsText}.`;
    
    speak(fullSpeech, 'neutral');
  };

  const handleChoice = (c: any) => {
    if (picked) return;
    
    playSfx('click');
    setPicked(c.id);

    if (c.safe) {
      playSfx('yay'); // Play success SFX immediately
      
      // Wait for SFX to finish (~1.2 seconds) before speaking
      setTimeout(() => {
        speak(`Awesome! ${c.explanation}`, 'happy'); 
        setTimeout(() => onComplete(), 500);
      }, 1200); 

    } else {
      playSfx('boing'); // Play failure SFX immediately
      
      // Wait for SFX to finish (~1.2 seconds) before speaking gently
      setTimeout(() => {
        speak(`Let's think about that. ${c.explanation}`, 'gentle');
      }, 1200);
    }
  };

  return (
    <motion.div 
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className={`relative rounded-3xl border p-6 flex flex-col transition-all duration-500 ${
        isCompleted 
          ? "bg-emerald-500/10 border-emerald-500/30 backdrop-blur-xl" 
          : "bg-white/5 border-white/10 backdrop-blur-xl shadow-lg"
      }`}
    >
      <AnimatePresence mode="wait">
        {!isCompleted || !choice?.safe ? (
          <motion.div 
            key="question"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col"
          >
            {/* Header / Context & Speaker Icon */}
            <div className="flex items-center justify-between mb-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-white/80">
                <Lightbulb className="h-3.5 w-3.5 text-yellow-300" /> 
                {scenario.context}
              </div>
              
              {/* Prominent Listen Button */}
              <button 
                onClick={handleSpeakerClick}
                className="group flex items-center gap-2 rounded-full bg-indigo-500/20 border border-indigo-500/30 px-3 py-1.5 text-indigo-300 hover:bg-indigo-500/40 hover:text-white transition-all shadow-sm"
              >
                <Volume2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold tracking-wide">Listen</span>
              </button>
            </div>

            {/* Prompt (Softer Font) */}
            <h4 className="font-semibold text-xl leading-snug text-white mb-6">
              {scenario.prompt}
            </h4>

            {/* Choices Grid (Shorter, tighter spacing) */}
            <div className="flex flex-col gap-3 mt-2">
              {scenario.choices.map((c) => {
                const active = picked === c.id;
                const showResult = !!picked && active;
                
                return (
                  <motion.button
                    key={c.id}
                    whileHover={!picked ? { scale: 1.01 } : {}}
                    whileTap={!picked ? { scale: 0.98 } : {}}
                    onClick={() => handleChoice(c)}
                    disabled={!!picked}
                    className={`relative rounded-2xl border px-4 py-3 text-left transition-all duration-300 shadow-sm ${
                      showResult
                        ? c.safe
                          ? "border-emerald-500 bg-emerald-500/20 text-white"
                          : "border-rose-500 bg-rose-500/20 text-white"
                        : picked 
                          ? "border-white/5 bg-white/5 opacity-50 shadow-none" 
                          : "border-white/10 bg-white/10 text-white/90 hover:bg-white/20 hover:border-white/30"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-medium">{c.text}</span>
                      <AnimatePresence>
                        {showResult && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`shrink-0 rounded-full p-1.5 ${c.safe ? 'bg-emerald-500' : 'bg-rose-500'}`}
                          >
                            {c.safe ? (
                              <Check className="h-4 w-4 text-white" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-white" />
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Error Feedback (Softer Design) */}
            <AnimatePresence>
              {choice && !choice.safe && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: 5 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-5 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4"
                >
                  <p className="text-sm font-medium text-white/90 leading-relaxed mb-4">
                    {choice.explanation}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      playSfx('click');
                      setPicked(null);
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 border border-white/20 px-4 py-2.5 text-xs font-semibold tracking-wide text-white hover:bg-white/20 transition-all"
                  >
                    <RotateCcw className="h-3.5 w-3.5 text-rose-400" /> Try Again
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* --- CELEBRATION VIEW --- */
          <motion.div
            key="celebration"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-8 text-center"
          >
            <motion.div 
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", damping: 15, delay: 0.1 }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-300 to-orange-500 border-4 border-white/20 flex items-center justify-center shadow-lg mb-5"
            >
              <Star className="w-10 h-10 text-white fill-current" />
            </motion.div>
            
            <h3 className="text-2xl font-bold text-white mb-3">Hero Move!</h3>
            <p className="text-emerald-100/90 font-medium text-sm mb-6 leading-relaxed max-w-xs mx-auto">
              {choice?.explanation}
            </p>

            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
              <Award className="w-4 h-4 text-yellow-400" />
              <span className="text-xs font-semibold text-white tracking-wide">Safe Choice</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent Star Badge if completed */}
      {isCompleted && picked === null && (
        <div className="absolute -top-3 -right-3 bg-yellow-400 p-2.5 rounded-full shadow-lg border-2 border-white z-20">
          <Star className="w-4 h-4 text-yellow-900 fill-current" />
        </div>
      )}
    </motion.div>
  );
}