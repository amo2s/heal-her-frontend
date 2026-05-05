'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, AlertTriangle, RotateCcw, Lightbulb } from "lucide-react";
import type { Scenario } from "@/data/heal";

export function ScenarioCard({ scenario }: { scenario: Scenario }) {
  const [picked, setPicked] = useState<string | null>(null);
  const choice = picked ? scenario.choices.find((c) => c.id === picked) : null;

  return (
    <div className="glass relative overflow-hidden rounded-[2.5rem] border border-white/10 p-6 shadow-2xl md:p-8">
      {/* Category Tag */}
      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        <Lightbulb className="h-3 w-3 text-primary" /> 
        Scenario Case · {scenario.context}
      </div>

      <h4 className="font-display text-xl font-bold leading-snug tracking-tight text-foreground">
        {scenario.prompt}
      </h4>

      {/* Choices Grid */}
      <div className="mt-6 grid gap-3">
        {scenario.choices.map((c) => {
          const active = picked === c.id;
          const showResult = !!picked && active;
          
          return (
            <motion.button
              key={c.id}
              whileHover={!picked ? { scale: 1.01, x: 4 } : {}}
              whileTap={!picked ? { scale: 0.99 } : {}}
              onClick={() => !picked && setPicked(c.id)}
              disabled={!!picked && !active}
              className={`group relative rounded-2xl border px-5 py-4 text-left text-sm font-medium transition-all duration-300 ${
                showResult
                  ? c.safe
                    ? "border-emerald-500 bg-emerald-500/10 text-foreground shadow-[0_0_25px_rgba(16,185,129,0.2)]"
                    : "border-rose-500 bg-rose-500/10 text-foreground shadow-[0_0_25px_rgba(244,63,94,0.1)]"
                  : picked 
                    ? "border-white/5 bg-white/5 opacity-40" // Fade out unpicked options
                    : "border-white/10 bg-white/5 hover:border-primary/50 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <span className={showResult ? "font-bold" : ""}>{c.text}</span>
                <AnimatePresence>
                  {showResult && (
                    <motion.div
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className={`shrink-0 rounded-full p-1 ${c.safe ? "bg-emerald-500" : "bg-rose-500"}`}
                    >
                      {c.safe ? (
                        <Check className="h-3.5 w-3.5 text-white" />
                      ) : (
                        <AlertTriangle className="h-3.5 w-3.5 text-white" />
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Feedback Explanation */}
      <AnimatePresence mode="wait">
        {choice && (
          <motion.div
            key={choice.id}
            initial={{ opacity: 0, height: 0, y: 20 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: 10 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className={`mt-6 rounded-3xl border p-5 backdrop-blur-md ${
              choice.safe 
                ? "border-emerald-500/30 bg-emerald-500/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" 
                : "border-rose-500/30 bg-rose-500/5"
            }`}
          >
            <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
              {choice.safe ? (
                <span className="flex items-center gap-1.5 text-emerald-500">
                   Great Choice!
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-rose-500">
                  Think about it...
                </span>
              )}
            </div>
            
            <p className="text-sm font-medium leading-relaxed text-foreground/80">
              {choice.explanation}
            </p>

            {!choice.safe && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPicked(null)}
                className="mt-4 flex items-center gap-2 rounded-xl bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-500 transition-colors hover:bg-rose-500/20"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Try another way
              </motion.button>
            )}
            
            {choice.safe && (
              <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-emerald-500 opacity-60">
                <Check className="h-3 w-3" /> Practice makes you safer.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}