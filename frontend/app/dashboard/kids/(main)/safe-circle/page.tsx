'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from "next/image";
import { Phone, Plus, X } from "lucide-react";
import { KIDS_CONTACTS } from "@/components/kids/data/safe-circle";
import { useAudio } from "@/components/context/audio-manager";
import { SOSButton } from "@/components/kids/sos-feature"; 

const containerVars = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const cardVars = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 200, damping: 20 } }
};

export default function KidsSafeCirclePage() {
  const { playSfx, speak } = useAudio();
  const [isSosOpen, setIsSosOpen] = useState(false);

  const handleAddHero = () => {
    playSfx('click');
    const answer = window.prompt("Parent Check: What is 1 + 1?");
    if (answer === "2") {
      speak("Parent verified. You may add a hero.", "happy", true);
    } else if (answer !== null) {
      speak("Oops! That's not right.", "gentle", true);
    }
  };

  return (
    <div className="min-h-screen pb-32 px-4 md:px-8 relative overflow-hidden flex flex-col items-center">
      
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-10 left-[10%] w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-20 right-[5%] w-80 h-80 bg-rose-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <header className="pt-12 pb-8 text-center relative z-10">
        <motion.div
          initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
          className="relative w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full p-1"
          onClick={() => { playSfx('click'); speak("These are your trusted heroes!", "happy", true); }}
        >
          <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center border-4 border-white/20 relative overflow-hidden">
            <Image src="/heal-logo.png" alt="Heal Logo" fill className="object-contain p-3" />
          </div>
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">My Hero Roster</h1>
        <p className="text-indigo-200 text-sm font-bold uppercase tracking-widest max-w-sm mx-auto">Your safe circle, just one tap away!</p>
        
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => { playSfx('click'); setIsSosOpen(true); }}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-rose-500 px-6 py-3 text-sm font-black text-white shadow-lg shadow-rose-500/30"
        >
          SOS Emergency
        </motion.button>
      </header>

      <motion.div variants={containerVars} initial="hidden" animate="visible" className="grid gap-6 w-full max-w-4xl grid-cols-1 md:grid-cols-2 relative z-10">
        {KIDS_CONTACTS.map((contact, index) => {
          const gradients = ["from-rose-400 to-orange-400", "from-emerald-400 to-teal-500", "from-blue-400 to-indigo-500", "from-purple-400 to-pink-500"];
          return (
            <motion.div key={contact.id} variants={cardVars} whileHover={{ scale: 1.02, y: -5 }} whileTap={{ scale: 0.98 }}
              onClick={() => { playSfx('click'); speak(`Calling ${contact.name}!`, "happy", true); }}
              className="group relative cursor-pointer overflow-hidden rounded-[2.5rem] border-4 border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl transition-all"
            >
              <div className="flex items-center gap-6">
                <div className={`w-20 h-20 shrink-0 rounded-full bg-gradient-to-br ${gradients[index % 4]} p-1 shadow-lg`}>
                  <div className="w-full h-full bg-slate-900/40 rounded-full flex items-center justify-center border-2 border-white/30">
                    <span className="text-2xl font-black text-white">{contact.initials}</span>
                  </div>
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-2xl font-black text-white mb-2">{contact.name}</h3>
                  <div className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white/80">{contact.relation}</div>
                </div>
                <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                  <Phone className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="relative z-10 mt-16 text-center">
        <motion.button whileTap={{ scale: 0.95 }} onClick={handleAddHero} className="inline-flex items-center gap-3 rounded-full border-2 border-white/20 bg-black/40 px-6 py-4 backdrop-blur-md">
          <Plus className="h-5 w-5 text-white" />
          <div className="flex flex-col items-start text-left">
            <span className="text-sm font-bold text-white">Add a Hero</span>
            <span className="text-[10px] font-black uppercase text-white/50">Parent Area: $1 + 1 = ?$</span>
          </div>
        </motion.button>
      </div>

      <AnimatePresence>
        {isSosOpen && (
          <motion.div
            key="sos-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setIsSosOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-[2.5rem] border-4 border-white/10 bg-slate-900/90 p-8 backdrop-blur-xl shadow-2xl"
            >
              <button
                onClick={() => setIsSosOpen(false)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex flex-col items-center gap-6 pt-2">
                <h2 className="text-2xl font-black text-white">Emergency SOS</h2>
                <SOSButton />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}