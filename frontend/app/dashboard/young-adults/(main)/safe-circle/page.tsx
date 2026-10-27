'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, 
  Plus, 
  X, 
  AlertOctagon, 
  LifeBuoy, 
  ShieldCheck, 
  UserPlus,
  Verified,
  Info
} from "lucide-react";

// --- DOMAIN-SPECIFIC DATA IMPORT ---
// Updated to match your specific export name: YOUNG_ADULT_CONTACTS
import { YOUNG_ADULT_CONTACTS } from "@/components/young-adults/data/contact";
import type { Contact } from "@/components/young-adults/data/contact"; 

import { useAudio } from "@/components/context/audio-manager";
import { SOSButton } from "@/components/kids/sos-feature"; 

// --- SOPHISTICATED MOTION ---
const containerVars = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const cardVars = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: [0.19, 1, 0.22, 1] as const } 
  }
};

export default function YoungAdultsSafeCirclePage() {
  const { playSfx } = useAudio();
  const [isSosOpen, setIsSosOpen] = useState(false);

  // Mapping to your specific constant
  const yaContacts: Contact[] = YOUNG_ADULT_CONTACTS || [];

  const handleAddContact = () => {
    playSfx('click');
    window.prompt("Identity and Protocol: Enter the name and contact number for this guard:");
  };

  return (
    <div className="min-h-screen pb-32 px-4 md:px-8 relative overflow-hidden flex flex-col items-center text-white">
      
      {/* --- STRATEGIC AMBIENCE --- */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 right-[-5%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[140px] pointer-events-none" />
      </div>

      {/* --- HEADER SECTION --- */}
      <header className="pt-20 pb-16 text-center relative z-10 w-full max-w-4xl flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-xl mb-8"
        >
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-black tracking-[0.3em] uppercase text-white/50">Security Protocol</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tighter mb-6"
        >
          Safe <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Circle.</span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-white/40 max-w-2xl text-sm md:text-lg leading-relaxed mb-10"
        >
          Your emergency architecture. A curated network of verified contacts and professional crisis responders, secured with end-to-end zero-knowledge protocols.
        </motion.p>
        
        <motion.button
          whileHover={{ scale: 1.02, backgroundColor: "rgba(239, 68, 68, 0.15)" }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { playSfx('click'); setIsSosOpen(true); }}
          className="inline-flex items-center gap-3 rounded-2xl bg-red-500/[0.08] border border-red-500/20 px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-red-400 transition-all"
        >
          <AlertOctagon className="w-4 h-4" />
          Initiate SOS
        </motion.button>
      </header>

      {/* --- CONTACTS GRID --- */}
      <motion.div 
        variants={containerVars} 
        initial="hidden" 
        animate="visible" 
        className="grid gap-6 w-full max-w-5xl grid-cols-1 md:grid-cols-2 relative z-10"
      >
        {yaContacts.map((contact) => (
          <motion.div 
            key={contact.id} 
            variants={cardVars} 
            whileHover={{ y: -5, backgroundColor: "rgba(255, 255, 255, 0.08)" }}
            onClick={() => playSfx('click')}
            className="group relative cursor-pointer overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-3xl transition-all"
          >
            <div className="flex items-start gap-6">
              {/* Avatar Shield */}
              <div className="w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br from-primary/10 to-purple-500/10 p-px">
                <div className="w-full h-full bg-neutral-900 rounded-[15px] flex items-center justify-center border border-white/5">
                  <span className="text-xl font-black text-white/80">{contact.initials}</span>
                </div>
              </div>

              {/* Identity Info */}
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white tracking-tight truncate">{contact.name}</h3>
                  {contact.trusted && (
                    <Verified className="w-4 h-4 text-primary shrink-0" />
                  )}
                </div>
                
                <p className="text-[10px] font-black uppercase tracking-widest text-primary/80 mt-1">{contact.relation}</p>
                
                {contact.description && (
                  <p className="text-xs text-white/30 mt-3 line-clamp-2 leading-relaxed">
                    {contact.description}
                  </p>
                )}
              </div>

              {/* Comm Trigger */}
              <a 
                href={`tel:${contact.phone}`}
                onClick={(e) => e.stopPropagation()}
                className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] transition-all"
              >
                <Phone className="w-5 h-5 text-white/40 group-hover:text-white" />
              </a>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* --- ACTION BAR --- */}
      <div className="relative z-10 mt-16 text-center w-full max-w-4xl">
        <motion.button 
          whileHover={{ scale: 1.01, backgroundColor: "rgba(255, 255, 255, 0.08)" }} 
          whileTap={{ scale: 0.99 }} 
          onClick={handleAddContact} 
          className="w-full md:w-auto inline-flex items-center justify-center gap-4 rounded-3xl border border-white/10 bg-white/[0.03] px-10 py-5 backdrop-blur-3xl hover:border-white/20 transition-all"
        >
          <UserPlus className="h-5 w-5 text-white/30" />
          <span className="text-xs font-black text-white/50 uppercase tracking-[0.3em]">Provision Guard</span>
        </motion.button>
      </div>

      {/* --- EMERGENCY SYSTEM MODAL --- */}
      <AnimatePresence>
        {isSosOpen && (
          <motion.div
            key="sos-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl p-4"
            onClick={() => setIsSosOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg rounded-[2.5rem] border border-white/10 bg-[#0A0A0A] p-10 shadow-[0_0_50px_rgba(239,68,68,0.1)]"
            >
              <button
                onClick={() => setIsSosOpen(false)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/30 hover:bg-white/10 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center gap-8">
                <div className="w-16 h-16 rounded-[1.25rem] bg-red-500/10 flex items-center justify-center border border-red-500/20">
                   <LifeBuoy className="w-8 h-8 text-red-500 animate-pulse" />
                </div>
                
                <div className="text-center space-y-3">
                  <h2 className="text-2xl font-black text-white tracking-tight uppercase italic">Crisis Deployment</h2>
                  <p className="text-sm text-white/40 max-w-[280px] mx-auto leading-relaxed">
                    Activating the SOS protocol will broadcast your encrypted live location and status to all provisioned guards.
                  </p>
                </div>

                <div className="w-full pt-4">
                  <SOSButton />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}