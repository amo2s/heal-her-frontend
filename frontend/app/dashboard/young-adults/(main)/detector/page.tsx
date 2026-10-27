'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  AlertTriangle, 
  Search, 
  Info, 
  BrainCircuit, 
  Cpu,
  Activity,
  Terminal,
  ChevronRight,
  Database,
  ShieldAlert
} from "lucide-react";
import { useRouter } from "next/navigation";

// --- DOMAIN-SPECIFIC DATA IMPORT ---
import { YOUNG_ADULT_RED_FLAGS } from "@/components/young-adults/data/red-flags";
import type { RedFlag } from "@/components/young-adults/data/red-flags";

// --- TYPES & INTELLIGENT LOGIC ---
interface FlaggedItem extends RedFlag {
  index: number;
  length: number;
}

interface Result {
  flagged: FlaggedItem[];
  buckets: Record<string, number>;
  riskScore: number;
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function analyze(text: string): Result {
  const flagged: FlaggedItem[] = [];
  const terms: RedFlag[] = YOUNG_ADULT_RED_FLAGS || [];
  
  for (const flag of terms) {
    if (!flag.term) continue;
    const regex = new RegExp(`\\b${escapeRegExp(flag.term)}\\b`, 'gi');
    let match;
    while ((match = regex.exec(text)) !== null) {
      flagged.push({ ...flag, index: match.index, length: match[0].length });
    }
  }

  const sortedFlags = flagged.sort((a, b) => (a.index - b.index) || (b.length - a.length));
  const nonOverlapping: FlaggedItem[] = [];
  let lastEnd = 0;
  
  for (const f of sortedFlags) {
    if (f.index >= lastEnd) {
      nonOverlapping.push(f);
      lastEnd = f.index + f.length;
    }
  }

  const buckets: Record<string, number> = {};
  let totalRiskWeight = 0;

  for (const f of nonOverlapping) {
    buckets[f.category] = (buckets[f.category] ?? 0) + 1;
    totalRiskWeight += f.riskLevel === "Critical" ? 30 : 15;
  }
  
  const total = nonOverlapping.length || 1;
  const pct: Record<string, number> = {};
  for (const [key, val] of Object.entries(buckets)) {
    pct[key] = Math.round((val / total) * 100);
  }

  const wordCount = Math.max(text.trim().split(/\s+/).length, 1);
  const density = nonOverlapping.length / wordCount;
  const riskScore = Math.min(100, Math.round((density * 500) + totalRiskWeight));
  
  return { flagged: nonOverlapping, buckets: pct, riskScore };
}

const SMART_SAMPLE = "I feel like you're love bombing me lately, but then you say that never happened and I'm misremembering. It's like you're alienating you from your support network on purpose. If you really loved me, you'd stop checking your phone/emails without consent. Otherwise, you're just ruining things.";

export default function YoungAdultsPatternScannerPage() {
  const [text, setText] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const router = useRouter();

  const runAnalysis = async () => {
    if (!text.trim()) return;
    setScanning(true);
    setResult(null);

    setTimeout(() => {
      const analysis = analyze(text);
      setResult(analysis);
      setScanning(false);
    }, 3200);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center p-4 md:p-8 text-white">
      
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[700px] h-[700px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[700px] h-[700px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none" />
      </div>

      <div className="w-full max-w-5xl relative z-10 mt-12 mb-24">
        
        <header className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-8"
          >
            <Cpu className="h-4 w-4 text-primary" /> Linguistic Auditing Interface
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-tight">
            Pattern <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Analysis.</span>
          </h1>
          <p className="text-white/40 text-sm md:text-xl font-medium leading-relaxed max-w-2xl mx-auto">
            Audit digital communications for coercive framing and psychological manipulation. Decrypt behavior through data-driven linguistic cross-referencing.
          </p>
        </header>

        <section className="rounded-[2.5rem] border border-white/10 bg-white/[0.02] p-6 md:p-10 backdrop-blur-3xl shadow-2xl">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 px-2 gap-4">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">Raw Text Ingestion</span>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setText(SMART_SAMPLE)}
              className="flex items-center gap-3 rounded-2xl bg-primary/20 border border-primary/40 px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-primary transition-all animate-pulse hover:animate-none"
            >
              <Database className="w-4 h-4" /> Initialize Threat Sample
            </motion.button>
          </div>

          <div className="group relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              placeholder="Paste communication logs here for high-fidelity auditing..."
              className="w-full resize-none rounded-[2rem] border border-white/10 bg-black/40 p-8 text-lg font-medium leading-relaxed text-white outline-none focus:border-primary/50 shadow-inner placeholder:text-white/10"
            />
            
            <div className="absolute bottom-6 right-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={runAnalysis}
                disabled={!text.trim() || scanning}
                className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-primary to-purple-500 px-10 py-5 text-xs font-black uppercase tracking-[0.2em] text-white shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] transition-all disabled:opacity-30 disabled:grayscale"
              >
                {scanning ? <Activity className="h-5 w-5 animate-pulse" /> : <Search className="h-5 w-5" />}
                {scanning ? "Processing..." : "Initiate Audit"}
              </motion.button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {scanning && <AuditTerminal />}

            {result && !scanning && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-16 space-y-12">
                
                <RiskStatus score={result.riskScore} count={result.flagged.length} />
                
                <div className="rounded-[2.5rem] border border-white/10 bg-black/40 p-10 shadow-inner">
                  <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                      <ShieldAlert className="h-4 w-4 text-primary" /> Visualized Threat Telemetry
                    </div>
                  </div>
                  {/* Parent is now a div to prevent hydration errors */}
                  <HighlightedOutput text={text} flagged={result.flagged} />
                </div>

                {result.flagged.length > 0 && (
                  <div className="space-y-8">
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {Object.entries(result.buckets).map(([category, percentage]) => (
                        <BehaviorCard key={category} label={category} value={percentage} />
                      ))}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.01, backgroundColor: "rgba(var(--primary-rgb), 0.1)" }} 
                      whileTap={{ scale: 0.99 }}
                      onClick={() => router.push("/dashboard/young-adults/heal-ai")}
                      className="w-full mt-12 flex items-center justify-center gap-4 rounded-[2.5rem] border border-primary/30 bg-primary/5 px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-white transition-all hover:border-primary/60"
                    >
                      <BrainCircuit className="w-5 h-5 text-primary" />
                      Debrief with AI Security Architect
                    </motion.button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function AuditTerminal() {
  const logs = [
    "Establishing secure sandbox...",
    "Tokenizing input stream...",
    "Mapping YOUNG_ADULT_RED_FLAGS database...",
    "Isolating manipulative syntactic structures...",
    "Quantifying coercive density...",
    "Generating risk-vector telemetry...",
    "Finalizing audit report..."
  ];
  const [currentLog, setCurrentLog] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLog(prev => Math.min(prev + 1, logs.length - 1));
    }, 400);
    return () => clearInterval(interval);
  }, [logs.length]);

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-12 py-6">
      <div className="w-full max-w-3xl mx-auto bg-[#080808] border border-white/5 rounded-2xl p-8 shadow-inner font-mono">
        <div className="flex items-center gap-3 border-b border-white/5 pb-6 mb-6">
          <Terminal className="w-5 h-5 text-primary" />
          <span className="text-[10px] text-white/40 uppercase tracking-[0.2em]">Engine Logic Log</span>
        </div>
        <div className="space-y-3">
          {logs.slice(0, currentLog + 1).map((log, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-start gap-3 text-sm text-emerald-500/70">
              <ChevronRight className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{log}</span>
            </motion.div>
          ))}
          {currentLog < logs.length - 1 && (
            <motion.div animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-2.5 h-4 bg-primary ml-7 mt-2" />
          )}
        </div>
      </div>
    </motion.div>
  );
}

function HighlightedOutput({ text, flagged }: { text: string; flagged: FlaggedItem[] }) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  // Return a div to allow block-level descendants (tooltips)
  if (!flagged.length) return <div className="text-xl leading-relaxed text-white/50 font-medium whitespace-pre-wrap">{text}</div>;
  
  const parts: React.ReactNode[] = [];
  let cursor = 0;

  flagged.forEach((f, i) => {
    if (f.index < cursor) return;
    parts.push(<span key={`p-${i}`} className="text-white/40">{text.slice(cursor, f.index)}</span>);
    parts.push(
      /* Swapped div to span to maintain semantic validity within phrasing content */
      <span 
        key={`m-${i}`} 
        className="relative inline-block" 
        onMouseEnter={() => setActiveIdx(i)} 
        onMouseLeave={() => setActiveIdx(null)}
      >
        <motion.mark 
          initial={{ backgroundColor: "rgba(255,255,255,0)" }}
          animate={{ backgroundColor: f.riskLevel === 'Critical' ? "rgba(239, 68, 68, 0.2)" : "rgba(var(--primary-rgb), 0.2)" }}
          className={`rounded-lg px-1.5 py-0.5 mx-0.5 font-bold text-white ring-1 shadow-lg bg-transparent cursor-help transition-all ${
            f.riskLevel === 'Critical' ? 'ring-red-500/50' : 'ring-primary/40'
          }`}
        >
          {text.slice(f.index, f.index + f.length)}
        </motion.mark>

        <AnimatePresence>
          {activeIdx === i && (
            /* Swapped motion.div to motion.span to avoid hydration errors */
            <motion.span
              initial={{ opacity: 0, y: 10, scale: 0.95 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, y: 5, scale: 0.95 }}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-[300px] bg-[#0A0A0A] border border-white/10 p-5 rounded-2xl shadow-2xl z-50 pointer-events-none block text-left"
            >
              <span className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">{f.category}</span>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${f.riskLevel === 'Critical' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {f.riskLevel} Risk
                </span>
              </span>
              <span className="text-xs text-white/70 leading-relaxed font-medium block">{f.context}</span>
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    );
    cursor = f.index + f.length;
  });
  
  parts.push(<span key="end" className="text-white/40">{text.slice(cursor)}</span>);
  return <div className="whitespace-pre-wrap text-xl font-medium leading-relaxed">{parts}</div>;
}

function RiskStatus({ score, count }: { score: number; count: number }) {
  const isHigh = score >= 60;
  const isClear = count === 0;
  
  const config = {
    Clear: { icon: ShieldCheck, title: "Nominal Baseline", color: "text-emerald-400", bg: "bg-emerald-500/5 border-emerald-500/20" },
    Moderate: { icon: AlertTriangle, title: "Elevated Risk Patterns", color: "text-amber-400", bg: "bg-amber-500/5 border-amber-500/20" },
    High: { icon: AlertTriangle, title: "Critical Threat Detected", color: "text-red-400", bg: "bg-red-500/5 border-red-500/20" }
  };

  const current = isClear ? config.Clear : isHigh ? config.High : config.Moderate;
  const Icon = current.icon;

  return (
    <div className={`flex flex-col md:flex-row items-center justify-between rounded-[2.5rem] border p-10 transition-all duration-700 ${current.bg} backdrop-blur-xl`}>
      <div className="flex items-center gap-8">
        <div className={`grid h-20 w-20 place-items-center rounded-[1.5rem] bg-white/[0.03] border border-white/5 shadow-inner ${current.color}`}>
          <Icon className="h-10 w-10" />
        </div>
        <div className="text-left">
          <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mb-2">Audit Verdict</div>
          <div className={`text-3xl font-bold tracking-tight ${current.color}`}>{current.title}</div>
        </div>
      </div>
      {!isClear && (
        <div className="mt-8 md:mt-0 text-center md:text-right bg-white/[0.02] px-8 py-5 rounded-[2rem] border border-white/5">
          <div className="text-4xl font-black text-white tabular-nums">{count}</div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mt-1">Anomalies Isolated</div>
        </div>
      )}
    </div>
  );
}

function BehaviorCard({ label, value }: { label: string; value: number }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-md shadow-xl transition-all">
      <div className="mb-6 flex flex-col gap-2">
        <span className="text-4xl font-bold text-white tracking-tighter tabular-nums">{value}%</span>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70 leading-snug">{label}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-black/50">
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1.5, ease: "circOut" }}
          className="h-full rounded-full bg-gradient-to-r from-primary to-purple-500 shadow-[0_0_15px_rgba(var(--primary-rgb),0.6)]"
        />
      </div>
    </motion.div>
  );
}