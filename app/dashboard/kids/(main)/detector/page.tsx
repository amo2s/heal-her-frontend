'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ShieldCheck, AlertCircle, Search, Info, MessageCircleHeart, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAudio } from "@/components/context/audio-manager";
import { RED_FLAG_TERMS } from "@/data/heal";

// --- TYPES & LOGIC ---
interface Result {
  flagged: { term: string; category: string; index: number }[];
  buckets: Record<string, number>;
  riskScore: number;
}

function analyze(text: string): Result {
  const lower = text.toLowerCase();
  const flagged: Result["flagged"] = [];
  
  for (const { term, category } of RED_FLAG_TERMS) {
    let idx = 0;
    while ((idx = lower.indexOf(term, idx)) !== -1) {
      flagged.push({ term, category, index: idx });
      idx += term.length;
    }
  }

  const buckets: Record<string, number> = { Manipulation: 0, Pressure: 0, Grooming: 0 };
  for (const f of flagged) buckets[f.category] = (buckets[f.category] ?? 0) + 1;
  
  const total = flagged.length || 1;
  const pct = {
    Manipulation: Math.round((buckets.Manipulation / total) * 100),
    Pressure: Math.round((buckets.Pressure / total) * 100),
    Grooming: Math.round((buckets.Grooming / total) * 100),
  };

  const wordCount = Math.max(text.trim().split(/\s+/).length, 1);
  const density = flagged.length / wordCount;
  const riskScore = Math.min(100, Math.round(density * 800 + flagged.length * 5));
  
  return { flagged, buckets: pct, riskScore };
}

const SAMPLE = "Hey, you're so mature for your age. This is just between us — don't tell your mom. If you really loved me you would send a pic. It's our little secret okay? Delete this after.";

// --- COMPONENTS ---

export default function RedFlagDetectorPage() {
  const [text, setText] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const router = useRouter();
  const { playSfx, speak } = useAudio();

  const run = async () => {
    if (!text.trim()) return;
    
    playSfx('click');
    setScanning(true);
    setResult(null);
    
    speak("Using the magic glass to look closely...", "neutral", true);

    // Simulate high-end AI processing time for the animation
    setTimeout(() => {
      const analysis = analyze(text);
      setResult(analysis);
      setScanning(false);
      
      if (analysis.riskScore >= 60) {
        playSfx('boing');
        speak("I found some tricky words here. It might be a good idea to talk to an adult about this.", "gentle", true);
      } else if (analysis.riskScore > 0) {
        playSfx('yay');
        speak("There are a few words to be careful with, but you are safe.", "gentle", true);
      } else {
        playSfx('yay');
        speak("Looks like a safe and friendly message to me!", "happy", true);
      }
    }, 2500);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center p-4 md:p-8">
      
      {/* Premium Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-10 left-[10%] w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-20 right-[5%] w-80 h-80 bg-rose-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-4xl relative z-10 mt-12 mb-24">
        
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-5 py-2 text-xs font-black uppercase tracking-widest text-white shadow-xl backdrop-blur-md mb-6"
          >
            <Sparkles className="h-4 w-4 text-[#DA8CA0] animate-pulse" /> Safety Scanner
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4 leading-none">
            The Magic <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-[#DA8CA0]">Glass</span>
          </h1>
          <p className="text-[#CCCCD9] text-sm md:text-base font-bold uppercase tracking-widest max-w-lg mx-auto">
            Paste a message here to see if there are any hidden tricks.
          </p>
        </div>

        {/* Main Interface */}
        <div className="rounded-[3rem] border-4 border-white/10 bg-white/5 p-6 md:p-10 shadow-2xl backdrop-blur-2xl">
          
          <div className="flex justify-between items-center mb-4 px-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#DA8CA0]">Message Box</span>
            <button
              onClick={() => { playSfx('click'); setText(SAMPLE); }}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-lg border border-white/10"
            >
              Try Magic Example
            </button>
          </div>

          <div className="group relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              placeholder="Paste the message right here..."
              className="w-full resize-none rounded-[2rem] border-2 border-white/10 bg-black/20 p-6 text-lg font-medium leading-relaxed text-white outline-none transition-all focus:border-[#DA8CA0]/50 shadow-inner"
            />
            
            <div className="absolute bottom-6 right-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={run}
                disabled={!text.trim() || scanning}
                className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-purple-500 to-[#DA8CA0] px-8 py-4 text-sm font-black uppercase tracking-widest text-white shadow-[0_10px_30px_rgba(218,140,160,0.3)] transition-all disabled:opacity-50"
              >
                {scanning ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                {scanning ? "Looking..." : "Use Magic Glass"}
              </motion.button>
            </div>
          </div>

          {/* Results Area */}
          <AnimatePresence mode="wait">
            {scanning && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="mt-10 flex flex-col items-center justify-center py-8"
              >
                <div className="relative w-full max-w-md h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ left: "-100%" }} animate={{ left: "100%" }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="absolute top-0 w-1/2 h-full bg-gradient-to-r from-transparent via-[#DA8CA0] to-transparent"
                  />
                </div>
                <p className="mt-6 text-xs font-black uppercase tracking-[0.3em] text-[#DA8CA0] animate-pulse">
                  Scanning for hidden tricks...
                </p>
              </motion.div>
            )}

            {result && !scanning && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-10 space-y-8">
                
                <VibeMeter score={result.riskScore} count={result.flagged.length} />
                
                <div className="rounded-[2.5rem] border-2 border-white/10 bg-black/20 p-8 shadow-inner">
                  <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#DA8CA0]">
                    <Info className="h-4 w-4" /> The Magic Reveal
                  </div>
                  <Highlighted text={text} flagged={result.flagged} />
                </div>

                {result.flagged.length > 0 && (
                  <>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <BehaviorCard label="Tricky Words" value={result.buckets.Manipulation} />
                      <BehaviorCard label="Pushy Words" value={result.buckets.Pressure} />
                      <BehaviorCard label="Secret Words" value={result.buckets.Grooming} />
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        playSfx('click');
                        router.push("/dashboard/kids/chat");
                      }}
                      className="w-full mt-6 flex items-center justify-center gap-3 rounded-[2rem] border-2 border-[#DA8CA0]/30 bg-[#DA8CA0]/10 px-8 py-5 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-[#DA8CA0]/20"
                    >
                      <MessageCircleHeart className="w-6 h-6 text-[#DA8CA0]" />
                      Talk to Heal Buddy About This
                    </motion.button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function Highlighted({ text, flagged }: { text: string; flagged: Result["flagged"] }) {
  if (!flagged.length) return <p className="text-lg leading-relaxed text-white/80 font-medium">{text}</p>;
  
  const sorted = [...flagged].sort((a, b) => a.index - b.index);
  const parts: React.ReactNode[] = [];
  let cursor = 0;

  sorted.forEach((f, i) => {
    if (f.index < cursor) return;
    parts.push(<span key={`p-${i}`}>{text.slice(cursor, f.index)}</span>);
    parts.push(
      <motion.mark 
        key={`m-${i}`} 
        initial={{ backgroundColor: "rgba(255,255,255,0)" }}
        animate={{ backgroundColor: "rgba(218,140,160,0.3)" }}
        transition={{ delay: i * 0.2, duration: 0.5 }}
        className="rounded-xl px-2 py-1 font-black text-white ring-2 ring-[#DA8CA0]/50 shadow-[0_0_15px_rgba(218,140,160,0.4)] bg-transparent"
      >
        {text.slice(f.index, f.index + f.term.length)}
      </motion.mark>
    );
    cursor = f.index + f.term.length;
  });
  
  parts.push(<span key="end">{text.slice(cursor)}</span>);
  return <p className="whitespace-pre-wrap text-lg font-medium leading-relaxed text-white/90">{parts}</p>;
}

function VibeMeter({ score, count }: { score: number; count: number }) {
  const isHigh = score >= 60;
  const isClear = count === 0;
  
  const config = {
    Clear: { icon: ShieldCheck, title: "Safe & Friendly", color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/30" },
    Moderate: { icon: AlertCircle, title: "Hmm, be careful", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/30" },
    High: { icon: AlertCircle, title: "Red Alert! Talk to an adult", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/30" }
  };

  const current = isClear ? config.Clear : isHigh ? config.High : config.Moderate;
  const Icon = current.icon;

  return (
    <div className={`flex flex-col md:flex-row items-center justify-between rounded-[2rem] border-2 p-6 transition-all duration-500 ${current.bg}`}>
      <div className="flex items-center gap-5">
        <div className={`grid h-16 w-16 place-items-center rounded-2xl bg-white/10 shadow-inner ${current.color}`}>
          <Icon className="h-8 w-8" />
        </div>
        <div className="text-left">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-1">Vibe Check Result</div>
          <div className={`text-2xl font-black tracking-tight ${current.color}`}>{current.title}</div>
        </div>
      </div>
      {!isClear && (
        <div className="mt-4 md:mt-0 text-center md:text-right bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
          <div className="text-3xl font-black text-white">{count}</div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">Tricky Things Found</div>
        </div>
      )}
    </div>
  );
}

function BehaviorCard({ label, value }: { label: string; value: number }) {
  if (value === 0) return null; // Don't show empty buckets to kids
  
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-lg"
    >
      <div className="mb-4 flex flex-col gap-1">
        <span className="text-2xl font-black text-white">{value}%</span>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#DA8CA0]">{label}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-black/40 shadow-inner border border-white/5">
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1.5, ease: "circOut" }}
          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-[#DA8CA0] shadow-[0_0_10px_rgba(218,140,160,0.8)]"
        />
      </div>
    </motion.div>
  );
}