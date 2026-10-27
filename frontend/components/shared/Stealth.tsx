'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EyeOff, Eye } from "lucide-react";
import { useHeal } from "@/store/heal";

export function StealthFAB() {
  const { toggleStealth } = useHeal();

  return (
    <motion.button
      onClick={toggleStealth}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-24 right-6 z-50 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-white shadow-xl shadow-primary/30 md:bottom-8"
      aria-label="Toggle stealth mode"
    >
      <EyeOff className="h-6 w-6" />
    </motion.button>
  );
}

export function StealthOverlay() {
  const { stealthMode, toggleStealth } = useHeal();

  return (
    <AnimatePresence>
      {stealthMode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={toggleStealth}
          className="fixed inset-0 z-[100] grid place-items-center bg-gradient-to-br from-gray-900 via-slate-900 to-zinc-900"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-white/10"
            >
              <Eye className="h-10 w-10 text-white/60" />
            </motion.div>
            <p className="text-lg font-medium text-white/60">Stealth Mode Active</p>
            <p className="mt-2 text-sm text-white/40">Tap anywhere or press Esc to exit</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
