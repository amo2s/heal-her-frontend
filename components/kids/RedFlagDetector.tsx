'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ShieldCheck, AlertTriangle, ScanSearch, Info } from "lucide-react";
import { RED_FLAG_TERMS } from "@/data/heal";

interface Result {
  flagged: { term: string; category: string; index: number }[];
  buckets: Record<string, number>;
  riskScore: number;
}

// Logic: Analysis Engine
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

// Sub-Component: Highlighted Text
function Highlighted({ text, flagged }: { text: string; flagged: Result["flagged"] }) {
  if (!flagged.length) return <p className="text-sm leading-relaxed text-foreground/80">{text}</p>;
  
  const sorted = [...flagged].sort((a, b) => a.index - b.index);
  const parts: React.ReactNode[] = [];
  let cursor = 0;

  sorted.forEach((f, i) => {
    if (f.index < cursor) return;
    parts.push(<span key={`p-${i}`}>{text.slice(cursor, f.index)}</span>);
    parts.push(
      <mark key={`m-${i}`} className="rounded-md bg-destructive/20 px-1.5 py-0.5 font-bold text-destructive ring-1 ring-destructive/30">
        {text.slice(f.index, f.index + f.term.length)}
      </mark>
    );
    cursor = f.index + f.term.length;
  });
  
  parts.push(<span key="end">{text.slice(cursor)}</span>);
  return <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-foreground/90">{parts}</p>;
}

const SAMPLE = "Hey, you're so mature for your age. This is just between us — don't tell your mom. If you really loved me you would send a pic. It's our little secret okay? Delete this after.";

export function RedFlagDetector() {
  const [text, setText] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const run = () => {
    if (!text.trim()) return;
    setScanning(true);
    setResult(null);
    // Simulate high-end AI processing time
    setTimeout(() => {
      setResult(analyze(text));
      setScanning(false);
    }, 1500);
  };

  return (
    <div className="glass relative overflow-hidden rounded-[2.5rem] border border-white/10 p-6 shadow-2xl md:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-xs font-bold text-primary">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" /> HEAL AI · Pattern Detector
          </div>
          <h3 className="mt-3 font-display text-2xl font-extrabold tracking-tight">Check a message</h3>
          <p className="mt-1 text-sm font-medium text-muted-foreground">Paste DMs or texts you&apos;re unsure about. Privacy is guaranteed.</p>
        </div>
        <button
          onClick={() => setText(SAMPLE)}
          className="focus-ring shrink-0 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-bold transition-all hover:bg-white/10 active:scale-95"
        >
          Try a sample
        </button>
      </div>

      {/* Input Area */}
      <div className="group relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          placeholder="Paste the suspicious chat text here…"
          className="focus-ring min-h-[160px] w-full resize-none rounded-3xl border border-white/10 bg-black/20 p-5 text-base leading-relaxed text-foreground outline-none transition-all focus:border-primary/40 focus:ring-4 focus:ring-primary/5"
        />
        <div className="absolute bottom-4 right-4 flex items-center gap-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
            {text.trim().split(/\s+/).filter(Boolean).length} words
          </span>
          <button
            onClick={run}
            disabled={!text.trim() || scanning}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
          >
            {scanning ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                <ScanSearch className="h-5 w-5" />
              </motion.div>
            ) : (
              <ScanSearch className="h-5 w-5" />
            )}
            {scanning ? "Processing..." : "Analyze"}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {scanning && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0 }} 
            className="mt-8 space-y-3"
          >
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-3 overflow-hidden rounded-full bg-white/5">
                <motion.div 
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: i * 0.2 }}
                  className="h-full w-1/3 bg-gradient-to-r from-transparent via-primary/40 to-transparent"
                />
              </div>
            ))}
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary/60">
              <span className="h-1.5 w-1.5 animate-ping rounded-full bg-primary" />
              Scanning for behavioral patterns...
            </div>
          </motion.div>
        )}

        {result && !scanning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="mt-8 space-y-6"
          >
            <RiskHeader score={result.riskScore} count={result.flagged.length} />
            
            <div className="rounded-[2rem] border border-white/5 bg-white/5 p-6 backdrop-blur-md">
              <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <Info className="h-3 w-3" /> Annotated message view
              </div>
              <Highlighted text={text} flagged={result.flagged} />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <BucketBar label="Manipulation" value={result.buckets.Manipulation} color="from-orange-400 to-orange-600" />
              <BucketBar label="Pressure" value={result.buckets.Pressure} color="from-rose-400 to-rose-600" />
              <BucketBar label="Grooming" value={result.buckets.Grooming} color="from-primary to-accent" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RiskHeader({ score, count }: { score: number; count: number }) {
  const level = score >= 60 ? "High" : score >= 25 ? "Moderate" : count === 0 ? "Clear" : "Low";
  const Icon = level === "Clear" ? ShieldCheck : AlertTriangle;
  
  const theme = {
    Clear: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
    High: "bg-rose-500/10 text-rose-500 border-rose-500/30",
    Moderate: "bg-amber-500/10 text-amber-500 border-amber-500/30",
    Low: "bg-blue-500/10 text-blue-500 border-blue-500/30"
  }[level];

  return (
    <div className={`flex items-center justify-between rounded-3xl border px-6 py-4 transition-all duration-500 ${theme}`}>
      <div className="flex items-center gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-current/10">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <div className="font-display text-lg font-bold">Risk: {level}</div>
          <div className="text-xs font-bold opacity-80 uppercase tracking-tighter">
            {count} Red Flags Detected
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-display text-4xl font-extrabold tabular-nums">{score}</div>
        <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">Score / 100</div>
      </div>
    </div>
  );
}

function BucketBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-[2rem] border border-white/5 bg-white/5 p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
        <span className="font-display text-xl font-bold tabular-nums text-foreground">{value}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-white/5 shadow-inner">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "circOut" }}
          className={`h-full rounded-full bg-gradient-to-r ${color} shadow-lg`}
        />
      </div>
    </div>
  );
}