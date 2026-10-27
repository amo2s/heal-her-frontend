'use client';

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
  Volume2, 
  PlayCircle, 
  FileText, 
  ChevronRight, 
  Sparkles, 
  GraduationCap, 
  Star,
  Award,
  VolumeX,
  Gamepad2,
  Lock,
  Unlock
} from "lucide-react";

// --- UPDATED IMPORTS ---
import { KIDS_LESSONS, Lesson } from "@/components/kids/data/lessons";
import { KIDS_VIDEOS, VideoItem } from "@/components/kids/data/video";

// --- ANIMATION VARIANTS (Bouncy Toy Physics) ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.5, y: 40 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 18 } 
  }
};

// --- CUSTOM SCROLLBAR UTILITY ---
// This creates a thick, padded, colorful scrollbar replacing the default browser one.
const bouncyScrollbar = `
  [&::-webkit-scrollbar]:h-3.5 
  [&::-webkit-scrollbar-track]:bg-black/20 
  [&::-webkit-scrollbar-track]:rounded-full 
  [&::-webkit-scrollbar-track]:border-2 
  [&::-webkit-scrollbar-track]:border-white/5 
  [&::-webkit-scrollbar-track]:my-4
  [&::-webkit-scrollbar-thumb]:bg-gradient-to-r 
  [&::-webkit-scrollbar-thumb]:from-[#DA8CA0] 
  [&::-webkit-scrollbar-thumb]:to-purple-500 
  [&::-webkit-scrollbar-thumb]:rounded-full 
  [&::-webkit-scrollbar-thumb]:border-[3px] 
  [&::-webkit-scrollbar-thumb]:border-transparent 
  [&::-webkit-scrollbar-thumb]:bg-clip-content
`;

// --- CUSTOM HOOK: TOYBOX INTERACTIVITY (Voice & Haptics) ---
function useToyboxInteractivity() {
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const playBoing = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50); 
    }
  }, []);

  const playTada = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([100, 50, 100]); 
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!voiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; 
    utterance.pitch = 1.2; 
    
    const voices = window.speechSynthesis.getVoices();
    const friendlyVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Samantha'));
    if (friendlyVoice) utterance.voice = friendlyVoice;

    window.speechSynthesis.speak(utterance);
  }, [voiceEnabled]);

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    if (!voiceEnabled) {
      playTada();
      setTimeout(() => {
        const hello = new SpeechSynthesisUtterance("Heal Buddy is listening!");
        hello.pitch = 1.2;
        window.speechSynthesis.speak(hello);
      }, 300);
    } else {
      window.speechSynthesis.cancel();
    }
  };

  return { voiceEnabled, toggleVoice, speak, playBoing, playTada };
}

// --- MAIN PAGE COMPONENT ---
export default function KidsLearnPage() {
  const { voiceEnabled, toggleVoice, speak, playBoing, playTada } = useToyboxInteractivity();
  const earnedStickers = KIDS_LESSONS.filter((l: Lesson) => l.progress === 100);

  return (
    <div className="min-h-screen pb-32 px-4 md:px-8 relative overflow-hidden">
      
      {/* GLOBAL VOICE TOGGLE */}
      <div className="absolute top-6 right-6 z-50">
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={toggleVoice}
          className={`flex items-center gap-2 p-3 pr-4 rounded-full shadow-xl transition-colors border-2 ${
            voiceEnabled 
              ? "bg-[#DA8CA0] border-[#DA8CA0] text-white" 
              : "bg-white/10 border-white/20 text-white/50 backdrop-blur-md"
          }`}
        >
          <div className={`p-2 rounded-full ${voiceEnabled ? "bg-white/20" : "bg-white/5"}`}>
            {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </div>
          <span className="text-xs font-black uppercase tracking-widest hidden md:block">
            {voiceEnabled ? "Buddy ON" : "Buddy OFF"}
          </span>
        </motion.button>
      </div>

      {/* --- HERO SECTION --- */}
      <header className="pt-12 pb-8 text-center relative z-10">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 12 }}
          className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-[#DA8CA0]/20 to-purple-500/20 shadow-[0_0_30px_rgba(218,140,160,0.3)] mb-6 border-4 border-white/10 backdrop-blur-md relative overflow-hidden cursor-pointer"
          onClick={() => { playBoing(); speak("Welcome to your mission control!"); }}
        >
          <Image 
            src="/heal-logo.png" 
            alt="Heal Her Logo" 
            fill 
            className="object-contain p-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]"
          />
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-black tracking-tight text-white mb-4 drop-shadow-xl"
        >
          Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DA8CA0] to-purple-400">play?</span>
        </motion.h1>
      </header>

      {/* --- STICKER BOOK (Rewards Row) --- */}
      {earnedStickers.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-3xl mx-auto mb-12 p-6 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-md shadow-inner"
        >
          <div className="flex items-center gap-2 mb-4 px-2">
            <Award className="w-5 h-5 text-yellow-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-widest">My Sticker Book</h3>
          </div>
          <div className="flex flex-wrap gap-4 px-2">
            {earnedStickers.map((sticker: Lesson, idx: number) => (
              <motion.div
                key={sticker.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: idx * 0.1, type: "spring" }}
                whileHover={{ scale: 1.2, rotate: 10 }}
                onClick={() => { playTada(); speak(`You earned the ${sticker.title} sticker!`); }}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-300 to-orange-500 border-4 border-yellow-100 shadow-[0_0_15px_rgba(250,204,21,0.5)] flex items-center justify-center text-3xl cursor-pointer"
              >
                {sticker.emoji}
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
        <LessonsSection speak={speak} playBoing={playBoing} />
        <VideosSection speak={speak} playBoing={playBoing} />
        <ChallengesSection speak={speak} playBoing={playBoing} />
      </motion.div>

      {/* Background Elements */}
      <div className="fixed top-20 right-[10%] w-32 h-32 bg-[#DA8CA0]/10 rounded-full blur-[80px] pointer-events-none animate-pulse" />
      <div className="fixed bottom-40 left-[5%] w-48 h-48 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
    </div>
  );
}

// --- 1. LESSONS COMPONENT ---
function LessonsSection({ speak, playBoing }: { speak: (t: string) => void, playBoing: () => void }) {
  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-3xl bg-[#DA8CA0] text-white shadow-[0_8px_0_rgba(180,90,120,1)]">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Your Missions</h2>
            <p className="text-[10px] md:text-xs font-black text-[#DA8CA0] uppercase tracking-[0.2em]">Learn & Earn</p>
          </div>
        </div>
      </div>

      <div className={`-mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-10 pt-4 ${bouncyScrollbar}`}>
        {KIDS_LESSONS.map((lesson: Lesson) => (
          <motion.div 
            key={lesson.id} 
            variants={itemVariants}
            whileHover={{ y: -10 }}
            onClick={() => { playBoing(); speak(lesson.title); }}
            className="snap-start relative group min-w-[280px] w-[80vw] max-w-[320px] bg-white/10 backdrop-blur-xl border-4 border-white/10 rounded-[3rem] p-8 shadow-2xl cursor-pointer"
          >
            <div className="absolute top-6 right-6 z-10">
              {lesson.progress === 100 ? (
                <div className="bg-yellow-400 text-yellow-900 p-2 rounded-full shadow-[0_0_15px_rgba(250,204,21,0.6)]"><Star className="w-4 h-4 fill-current" /></div>
              ) : (
                <div className="text-[10px] font-black text-white/50 uppercase bg-black/20 px-3 py-1 rounded-full border border-white/5">New</div>
              )}
            </div>

            <div className="mb-6">
              <div className="w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-br from-white/20 to-white/5 text-5xl shadow-inner border border-white/20 group-hover:scale-110 transition-transform duration-300">
                {lesson.emoji}
              </div>
            </div>

            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#DA8CA0]">{lesson.category}</span>
            <h3 className="mt-2 text-xl font-black text-white leading-tight min-h-[56px] line-clamp-2">{lesson.title}</h3>

            <div className="mt-8 flex items-center justify-between">
              <div className="flex flex-col">
                 <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Time</span>
                 <span className="text-sm font-black text-white">{lesson.duration}</span>
              </div>
              
              <motion.button 
                whileTap={{ scale: 0.9, y: 4, boxShadow: "0px 0px 0px rgba(0,0,0,0)" }}
                className="w-14 h-14 rounded-full bg-[#DA8CA0] flex items-center justify-center text-white shadow-[0_6px_0_rgba(180,90,120,1)] hover:bg-[#e09eb0] transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  playBoing();
                  speak(`Playing lesson: ${lesson.title}`);
                }}
              >
                <Volume2 className="w-6 h-6" />
              </motion.button>
            </div>

            <div className="mt-6 h-4 w-full bg-black/20 rounded-full overflow-hidden border border-white/5 p-[3px]">
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: `${lesson.progress}%` }}
                className="h-full rounded-full bg-gradient-to-r from-[#DA8CA0] to-yellow-400"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// --- 2. VIDEOS COMPONENT ---
function VideosSection({ speak, playBoing }: { speak: (t: string) => void, playBoing: () => void }) {
  const [lowData, setLowData] = useState(false);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-3xl bg-purple-500 text-white shadow-[0_8px_0_rgba(120,50,180,1)]">
            <PlayCircle className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Story Time</h2>
            <p className="text-[10px] md:text-xs font-black text-purple-400 uppercase tracking-[0.2em]">Watch & Learn</p>
          </div>
        </div>
        
        <button
          onClick={() => { playBoing(); setLowData(!lowData); speak(lowData ? "Standard mode" : "Low data mode"); }}
          className={`flex items-center gap-2 rounded-2xl border-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
            lowData 
              ? "border-[#DA8CA0] bg-[#DA8CA0] text-white shadow-[0_4px_0_rgba(180,90,120,1)] translate-y-1" 
              : "border-white/10 bg-white/5 text-white/50 shadow-[0_4px_0_rgba(255,255,255,0.1)] hover:bg-white/10"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span className="hidden md:inline">{lowData ? "Standard View" : "Low Data Mode"}</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {lowData ? (
          <motion.div 
            key="list-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/10 backdrop-blur-xl border-4 border-white/10 rounded-[3rem] divide-y divide-white/5 overflow-hidden"
          >
            {KIDS_VIDEOS.map((v: VideoItem) => (
              <div 
                key={v.id} 
                onClick={() => { playBoing(); speak(v.title); }}
                className="flex items-center justify-between p-6 hover:bg-white/5 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-purple-500/20 border-2 border-purple-500/50 flex items-center justify-center text-purple-400 font-black text-xl">
                    {v.id.replace('v', '')}
                  </div>
                  <div>
                    <h4 className="text-white font-black text-lg">{v.title}</h4>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-wider">{v.topic} • {v.duration}</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="grid-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`-mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-10 ${bouncyScrollbar}`}
          >
            {KIDS_VIDEOS.map((v: VideoItem) => (
              <motion.div 
                key={v.id} 
                variants={itemVariants}
                onClick={() => { playBoing(); speak(v.title); }}
                className="snap-start group min-w-[280px] w-[80vw] max-w-[320px] bg-white/10 backdrop-blur-xl border-4 border-white/10 rounded-[3rem] overflow-hidden shadow-2xl cursor-pointer"
              >
                <div className="relative aspect-video bg-white/5 border-b-4 border-white/10">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/60 to-pink-600/60" />
                  <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.6)]">
                      <PlayCircle className="w-10 h-10 text-purple-600 ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-2xl text-[10px] font-black text-white border border-white/20">
                    {v.duration}
                  </div>
                </div>
                
                <div className="p-8">
                  <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em]">{v.topic}</span>
                  <h4 className="mt-2 text-xl font-black text-white leading-tight h-[56px] line-clamp-2">{v.title}</h4>
                  
                  <div className="mt-8 flex flex-col gap-2">
                    <div className="flex justify-between text-[10px] font-black text-white/40 uppercase tracking-widest">
                      <span>Watched</span>
                      <span className="text-purple-400">{v.watched}%</span>
                    </div>
                    <div className="h-4 w-full bg-black/20 rounded-full overflow-hidden border border-white/5 p-[3px]">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${v.watched}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-400"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// --- 3. NEW SECTION: QUICK CHALLENGES ---
const MOCK_CHALLENGES = [
  { id: "c1", title: "The Stranger Game", points: 50, emoji: "🕵️‍♂️", locked: false },
  { id: "c2", title: "My Safe Circle Quiz", points: 100, emoji: "👨‍👩‍👧", locked: false },
  { id: "c3", title: "Internet Explorer", points: 150, emoji: "💻", locked: true },
  { id: "c4", title: "Body Boss Master", points: 200, emoji: "👑", locked: true },
];

function ChallengesSection({ speak, playBoing }: { speak: (t: string) => void, playBoing: () => void }) {
  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-3xl bg-emerald-500 text-white shadow-[0_8px_0_rgba(16,185,129,1)]">
            <Gamepad2 className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Quick Challenges</h2>
            <p className="text-[10px] md:text-xs font-black text-emerald-400 uppercase tracking-[0.2em]">Test Your Powers</p>
          </div>
        </div>
      </div>

      <div className={`-mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-10 pt-4 ${bouncyScrollbar}`}>
        {MOCK_CHALLENGES.map((challenge) => (
          <motion.div 
            key={challenge.id} 
            variants={itemVariants}
            whileHover={!challenge.locked ? { y: -10 } : {}}
            onClick={() => { 
              playBoing(); 
              speak(challenge.locked ? "This challenge is locked." : challenge.title); 
            }}
            className={`snap-start relative group min-w-[200px] w-[60vw] max-w-[240px] border-4 rounded-[3rem] p-6 shadow-2xl transition-colors ${
              challenge.locked 
                ? "bg-black/40 border-white/5 cursor-not-allowed" 
                : "bg-emerald-500/10 backdrop-blur-xl border-emerald-500/30 cursor-pointer hover:bg-emerald-500/20"
            }`}
          >
            <div className="absolute top-5 right-5 z-10">
              {challenge.locked ? (
                <div className="bg-black/40 p-2 rounded-full border border-white/10"><Lock className="w-4 h-4 text-white/40" /></div>
              ) : (
                <div className="bg-emerald-500 text-white p-2 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"><Unlock className="w-4 h-4" /></div>
              )}
            </div>

            <div className="mb-4">
              <div className={`w-16 h-16 flex items-center justify-center rounded-full text-4xl shadow-inner border border-white/10 transition-transform duration-300 ${!challenge.locked && "group-hover:scale-110"} ${challenge.locked ? "bg-black/40 grayscale opacity-50" : "bg-gradient-to-br from-emerald-400/20 to-transparent"}`}>
                {challenge.emoji}
              </div>
            </div>

            <h3 className={`mt-2 text-lg font-black leading-tight min-h-[48px] ${challenge.locked ? "text-white/40" : "text-white"}`}>
              {challenge.title}
            </h3>

            <div className="mt-4 flex items-center gap-2">
               <span className="text-[10px] font-black text-emerald-400/60 uppercase tracking-widest">Reward</span>
               <span className={`text-sm font-black ${challenge.locked ? "text-white/20" : "text-emerald-400"}`}>+{challenge.points} XP</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}