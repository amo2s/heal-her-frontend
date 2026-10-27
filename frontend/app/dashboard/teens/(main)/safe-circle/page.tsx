'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Plus, X, ShieldAlert } from "lucide-react";
import { CONTACTS } from "@/data/heal";
import type { Contact } from "@/data/heal";
import { useAudio } from "@/components/context/audio-manager";
import { SOSButton } from "@/components/kids/sos-feature"; 

const containerVars = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const cardVars = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } }
};

export default function TeensSafeCirclePage() {
  const { playSfx } = useAudio();
  const [isSosOpen, setIsSosOpen] = useState(false);

  const handleAddContact = () => {
    playSfx('click');
    window.prompt("Enter new trusted contact's name and number:");
  };

  return (
    <div className="min-h-screen pb-32 px-4 md:px-8 relative overflow-hidden flex flex-col items-center text-white">
      
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 right-[10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-[5%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      </div>

      <header className="pt-16 pb-12 text-center relative z-10 w-full max-w-4xl flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6"
        >
          <ShieldAlert className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold tracking-wider uppercase text-white/70">Support Network</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
        >
          Safe <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Circle.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-white/50 max-w-xl text-sm md:text-base mb-8"
        >
          Your trusted contacts and professional support. Always encrypted, always accessible.
        </motion.p>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { playSfx('click'); setIsSosOpen(true); }}
          className="inline-flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-6 py-3 text-sm font-bold text-red-400 transition-all hover:bg-red-500/20 hover:border-red-500/30"
        >
          Emergency SOS
        </motion.button>
      </header>

      <motion.div variants={containerVars} initial="hidden" animate="visible" className="grid gap-4 w-full max-w-4xl grid-cols-1 md:grid-cols-2 relative z-10">
        {CONTACTS.teens.map((contact) => (
          <motion.div 
            key={contact.id} 
            variants={cardVars} 
            whileHover={{ y: -2 }}
            onClick={() => playSfx('click')}
            className="group relative cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition-all hover:bg-white/10"
          >
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 p-px">
                <div className="w-full h-full bg-background rounded-[15px] flex items-center justify-center border border-white/10">
                  <span className="text-lg font-bold text-white">{contact.initials}</span>
                </div>
              </div>
              <div className="flex-1 text-left min-w-0">
                <h3 className="text-lg font-bold text-white truncate">{contact.name}</h3>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary mt-1 truncate">{contact.relation}</p>
              </div>
              <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
                <Phone className="w-4 h-4 text-white/70 group-hover:text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="relative z-10 mt-12 text-center w-full max-w-4xl">
        <motion.button 
          whileHover={{ scale: 1.02 }} 
          whileTap={{ scale: 0.98 }} 
          onClick={handleAddContact} 
          className="w-full md:w-auto inline-flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-md hover:bg-white/10 transition-colors"
        >
          <Plus className="h-5 w-5 text-white/50" />
          <span className="text-sm font-semibold text-white/70 uppercase tracking-widest">Add Trusted Contact</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {isSosOpen && (
          <motion.div
            key="sos-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            onClick={() => setIsSosOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-3xl border border-white/10 bg-background p-8 shadow-2xl"
            >
              <button
                onClick={() => setIsSosOpen(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex flex-col items-center gap-6 pt-2">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                   <ShieldAlert className="w-6 h-6 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-white text-center">Emergency SOS</h2>
                <p className="text-sm text-white/50 text-center -mt-4">Activating this will immediately notify your trusted contacts and share your live location.</p>
                <SOSButton />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}