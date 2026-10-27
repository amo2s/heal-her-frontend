'use client';

import { motion } from "framer-motion";
import { useHeal } from "@/store/heal";
import { CONTACTS } from "@/data/heal";
import { Phone, MessageSquare, MapPin } from "lucide-react";
import { SOSButton } from "@/components/kids/sos-feature";

const containerVars = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const cardVars = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } }
};

export function SafeCircle() {
  const { group } = useHeal();
  const contacts = CONTACTS[group];

  return (
    <section className="glass rounded-[2.5rem] border border-white/10 p-6 shadow-2xl md:p-8">
      {/* Header Section */}
      <div className="mb-8 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">Trusted Network</div>
          <h3 className="mt-1 font-display text-2xl font-extrabold tracking-tight">Your Safe Circle</h3>
          <p className="mt-1 text-sm font-medium text-muted-foreground">The people who have your back, just one tap away.</p>
        </div>
        <SOSButton />
      </div>

      {/* Contacts Grid */}
      <motion.div 
        variants={containerVars}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid gap-4 sm:grid-cols-2"
      >
        {contacts.map((c) => (
          <motion.div 
            key={c.id} 
            variants={cardVars}
            whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
            className="group flex items-center gap-4 rounded-3xl border border-white/5 bg-white/5 p-4 transition-colors"
          >
            {/* Avatar */}
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent text-lg font-bold text-white shadow-lg shadow-primary/20">
              {c.initials}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="truncate font-bold text-foreground">{c.name}</div>
              <div className="truncate text-xs font-medium text-muted-foreground/80">
                {c.relation} <span className="mx-1 opacity-30">•</span> {c.phone}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1 bg-black/20 rounded-2xl p-1">
              <motion.button 
                whileTap={{ scale: 0.9 }}
                className="rounded-xl p-2.5 text-primary transition-colors hover:bg-primary/20" 
                title="Call"
              >
                <Phone className="h-4 w-4" />
              </motion.button>
              <motion.button 
                whileTap={{ scale: 0.9 }}
                className="rounded-xl p-2.5 text-secondary transition-colors hover:bg-secondary/20" 
                title="Text"
              >
                <MessageSquare className="h-4 w-4" />
              </motion.button>
              <motion.button 
                whileTap={{ scale: 0.9 }}
                className="rounded-xl p-2.5 text-accent transition-colors hover:bg-accent/20" 
                title="Share Location"
              >
                <MapPin className="h-4 w-4" />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-8 flex items-center justify-center gap-2 rounded-2xl bg-white/5 py-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/40">
        <span className="h-1 w-1 rounded-full bg-current" />
        Encrypted & Private Access Only
        <span className="h-1 w-1 rounded-full bg-current" />
      </div>
    </section>
  );
}