'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useHeal } from "@/store/heal";
import { LESSONS, VIDEOS } from "@/data/heal";
import { Volume2, PlayCircle, FileText, ChevronRight } from "lucide-react";

const rowVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
};

export function LessonsRow() {
  const { group } = useHeal();
  const items = LESSONS[group];

  return (
    <motion.div 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={rowVariants}
      className="space-y-4"
    >
      <div className="flex items-end justify-between px-1">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">Curated Learning</div>
          <h3 className="font-display text-2xl font-extrabold tracking-tight">Lessons for you</h3>
        </div>
        <button className="group flex items-center gap-1 text-xs font-bold text-primary transition-all hover:gap-2">
          See all <ChevronRight className="h-3 w-3" />
        </button>
      </div>

      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-6 scrollbar-hide">
        {items.map((l) => (
          <motion.div 
            key={l.id} 
            whileHover={{ y: -8 }}
            className="snap-start glass min-w-[280px] max-w-[300px] shrink-0 rounded-[2.5rem] border border-white/10 p-6 shadow-xl transition-shadow hover:shadow-primary/5"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-4xl shadow-inner">
                {l.emoji}
              </div>
              <motion.button 
                whileTap={{ scale: 0.9 }}
                className="rounded-full bg-white/10 p-2.5 text-muted-foreground transition-colors hover:bg-primary hover:text-white"
                title="Listen aloud"
              >
                <Volume2 className="h-4 w-4" />
              </motion.button>
            </div>
            
            <div className="text-[10px] font-bold uppercase tracking-widest text-primary/80">{l.category}</div>
            <h4 className="mt-2 line-clamp-2 h-12 font-display text-lg font-bold leading-tight">{l.title}</h4>
            
            <div className="mt-5 flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md">{l.duration}</span>
              <span className="font-bold text-foreground">{l.progress}% Complete</span>
            </div>
            
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: `${l.progress}%` }}
                transition={{ duration: 1, ease: "circOut" }}
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent" 
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export function VideosRow() {
  const { group } = useHeal();
  const items = VIDEOS[group];
  const [lowData, setLowData] = useState(false);

  return (
    <motion.div 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={rowVariants}
      className="space-y-4"
    >
      <div className="flex items-center justify-between gap-3 px-1">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">Library</div>
          <h3 className="font-display text-2xl font-extrabold tracking-tight">Watch & Learn</h3>
        </div>
        <button
          onClick={() => setLowData((v) => !v)}
          className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition-all duration-300 ${
            lowData 
              ? "border-primary bg-primary text-white shadow-lg shadow-primary/20" 
              : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          {lowData ? "Standard View" : "Low Data Mode"}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {lowData ? (
          <motion.ul 
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="divide-y divide-white/5 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden"
          >
            {items.map((v) => (
              <li key={v.id} className="group flex items-center justify-between gap-4 p-5 transition-colors hover:bg-white/5">
                <div className="min-w-0">
                  <div className="truncate font-bold text-foreground">{v.title}</div>
                  <div className="mt-0.5 text-[11px] font-medium text-muted-foreground">
                    {v.presenter} • {v.duration} • <span className="text-primary">{v.topic}</span>
                  </div>
                </div>
                <button className="shrink-0 rounded-xl bg-primary/10 px-4 py-2 text-xs font-bold text-primary transition-all group-hover:bg-primary group-hover:text-white">
                  Read Transcript
                </button>
              </li>
            ))}
          </motion.ul>
        ) : (
          <motion.div 
            key="grid"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-6 scrollbar-hide"
          >
            {items.map((v) => (
              <motion.div 
                key={v.id} 
                whileHover={{ scale: 1.02 }}
                className="snap-start glass min-w-[300px] max-w-[320px] shrink-0 overflow-hidden rounded-[2.5rem] border border-white/10 shadow-xl"
              >
                <div className="relative aspect-video bg-gradient-to-br from-indigo-500/20 to-purple-500/20 group cursor-pointer">
                  <div className="absolute inset-0 grid place-items-center bg-black/20 transition-colors group-hover:bg-black/40">
                    <PlayCircle className="h-14 w-14 text-white/80 drop-shadow-2xl transition-transform group-hover:scale-110" />
                  </div>
                  <span className="absolute bottom-3 right-3 rounded-lg bg-black/60 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                    {v.duration}
                  </span>
                </div>
                <div className="p-6">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-primary/80">{v.topic}</div>
                  <h4 className="mt-2 line-clamp-2 h-10 font-display text-base font-bold leading-tight">{v.title}</h4>
                  <div className="mt-2 text-xs font-medium text-muted-foreground">with {v.presenter}</div>
                  
                  <div className="mt-5 space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase">
                      <span>Progress</span>
                      <span>{v.watched}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${v.watched}%` }}
                        className="h-full rounded-full bg-primary" 
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}