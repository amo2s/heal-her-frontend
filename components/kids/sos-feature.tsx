'use client';

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Phone, MapPin, MessageSquare } from "lucide-react";
import { useAudio } from "@/components/context/audio-manager";

export function SOSButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { playSfx, speak } = useAudio();

  const handleStartHold = () => {
    setIsHolding(true);
    playSfx('click');
    
    timerRef.current = setTimeout(() => {
      setIsHolding(false);
      speak("Emergency menu opened. You are not alone.", "gentle", true);
      setIsOpen(true);
    }, 3000); // 3-second hold requirement
  };

  const handleEndHold = () => {
    setIsHolding(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleClose = () => {
    playSfx('click');
    setIsOpen(false);
    // STOP ongoing audio immediately
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  return (
    <>
      <div className="flex flex-col items-center gap-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 animate-pulse">
          Hold for 3s
        </p>
        <motion.button
          onPointerDown={handleStartHold}
          onPointerUp={handleEndHold}
          onPointerLeave={handleEndHold}
          className="relative flex h-16 w-16 items-center justify-center rounded-full bg-red-500 shadow-lg shadow-red-500/30 touch-none"
        >
          {/* Progress Ring */}
          <svg className="absolute inset-0 h-full w-full -rotate-90">
            <circle
              cx="32"
              cy="32"
              r="30"
              fill="transparent"
              stroke="white"
              strokeWidth="4"
              strokeDasharray="188.5"
              strokeDashoffset={isHolding ? 0 : 188.5}
              className="transition-all"
              style={{
                transitionDuration: isHolding ? '3000ms' : '200ms',
                transitionTimingFunction: 'linear'
              }}
            />
          </svg>
          <AlertTriangle className="relative z-10 h-6 w-6 text-white" />
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-[2rem] bg-gradient-to-br from-red-500 to-rose-600 p-6 text-white shadow-2xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-white/20">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold">Emergency</h3>
                    <p className="text-sm opacity-80">Quick help is here</p>
                  </div>
                </div>
                <button onClick={handleClose} className="rounded-full p-2 hover:bg-white/20">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 text-left">
                <a href="tel:911" onClick={() => speak("Calling Emergency.", "gentle", true)} className="flex items-center gap-3 rounded-2xl bg-white/20 p-4">
                  <Phone className="h-5 w-5" />
                  <div>
                    <div className="font-bold">Call Emergency</div>
                    <div className="text-sm opacity-80">911</div>
                  </div>
                </a>
                <button onClick={() => speak("Texting Heroes.", "gentle", true)} className="flex w-full items-center gap-3 rounded-2xl bg-white/20 p-4">
                  <MessageSquare className="h-5 w-5" />
                  <div>
                    <div className="font-bold">Text Trusted Contact</div>
                    <div className="text-sm opacity-80">Send alert message</div>
                  </div>
                </button>
                <button onClick={() => speak("Sharing Location.", "gentle", true)} className="flex w-full items-center gap-3 rounded-2xl bg-white/20 p-4">
                  <MapPin className="h-5 w-5" />
                  <div>
                    <div className="font-bold">Share Location</div>
                    <div className="text-sm opacity-80">Send where you are</div>
                  </div>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}