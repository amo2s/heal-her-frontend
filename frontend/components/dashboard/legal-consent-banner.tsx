"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, ArrowRight, X } from "lucide-react";

export function LegalConsentBanner() {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, height: 0, marginBottom: 0, transition: { duration: 0.25 } }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-indigo-900/20 backdrop-blur-md shadow-[0_0_25px_rgba(99,102,241,0.18)] p-4 sm:p-4.5 mb-4 group transition-all"
      >
        {/* Subtle ambient lighting inside the banner */}
        <div 
          aria-hidden="true" 
          className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-indigo-500/10 blur-2xl transition-opacity group-hover:bg-indigo-500/20" 
        />
        <div 
          aria-hidden="true" 
          className="pointer-events-none absolute right-0 top-0 h-full w-40 bg-gradient-to-l from-indigo-500/5 to-transparent" 
        />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.3)]">
              <ShieldAlert className="w-5 h-5 text-indigo-300" />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                  Compliance Notice
                </span>
              </div>
              <p className="text-xs sm:text-sm text-indigo-100 font-medium leading-relaxed">
                <span className="font-semibold text-white">Action Required:</span> Please complete your mandatory Legal Consent signature (Terms & Privacy) to ensure full protection of your account and medical data.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end flex-shrink-0 pt-2 md:pt-0">
            <Link
              href="/terms"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide text-white bg-indigo-600/40 hover:bg-indigo-600/60 border border-indigo-400/40 hover:border-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.25)] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-200 group/link"
            >
              <span>Review & Sign</span>
              <ArrowRight className="w-3.5 h-3.5 text-indigo-300 group-hover/link:translate-x-0.5 transition-transform" />
            </Link>

            <button
              onClick={() => setIsDismissed(true)}
              aria-label="Dismiss banner"
              className="p-2 rounded-xl text-indigo-300/60 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

