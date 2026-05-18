"use client"

import React, { useState } from "react"
import Image from "next/image"
import { motion, useMotionTemplate, useMotionValue, Variants, AnimatePresence } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { cn } from "@/lib/utils"
import { 
  Heart, 
  Globe, 
  Users, 
  Activity, 
  Network, 
  Code2, 
  User, 
  ShieldCheck, 
  ChevronRight,
  Quote, 
  Baby,
  Shield,
  Zap
} from "lucide-react"

// ============================================================================
// ULTRA-PREMIUM UTILITY COMPONENTS & ANIMATIONS
// ============================================================================

const ultraSmooth: [number, number, number, number] = [0.16, 1, 0.3, 1]

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)", 
    transition: { duration: 1.2, ease: ultraSmooth } 
  }
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 }
  }
}

const scaleIn: Variants = {
  hidden: { scale: 0.9, opacity: 0, filter: "blur(10px)" },
  visible: { 
    scale: 1, 
    opacity: 1, 
    filter: "blur(0px)", 
    transition: { duration: 1.2, ease: ultraSmooth } 
  }
}

const drawLine: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { 
    pathLength: 1, 
    opacity: 0.5, 
    transition: { duration: 2.5, ease: ultraSmooth } 
  }
}

const GrainOverlay = () => (
  <div 
    className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
    }}
  />
)

function TextReveal({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words = text.split(" ")
  const container: Variants = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({ 
      opacity: 1, 
      transition: { staggerChildren: 0.08, delayChildren: 0.04 * i + delay } 
    }),
  }
  const child: Variants = {
    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 1, ease: ultraSmooth } },
    hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
  }

  return (
    <motion.h1 className={className} variants={container} initial="hidden" whileInView="visible" viewport={{ once: true }}>
      {words.map((word, index) => (
        <motion.span variants={child} style={{ marginRight: "0.25em", display: "inline-block" }} key={index}>{word}</motion.span>
      ))}
    </motion.h1>
  )
}

// ============================================================================
// THE LIVING CONNECTION VISUALIZATION (Premium Gradient & Smooth Motion)
// ============================================================================
const RippleVisualization = () => {
  const center = { x: 200, y: 200 }
  const layer1 = [
    { x: 200, y: 120 }, { x: 276, y: 175 }, { x: 247, y: 265 }, { x: 153, y: 265 }, { x: 124, y: 175 }
  ]
  const layer2 = [
    { x: 200, y: 50 }, { x: 320, y: 140 }, { x: 350, y: 250 }, { x: 250, y: 350 }, { x: 150, y: 350 },
    { x: 50, y: 250 }, { x: 80, y: 140 }, { x: 100, y: 60 }, { x: 300, y: 80 }, { x: 300, y: 320 }
  ]

  return (
    <div className="w-full aspect-square md:aspect-auto md:h-full min-h-[400px] md:min-h-[500px] relative overflow-hidden rounded-[2.5rem] border border-white/10 shadow-[0_20px_50px_-15px_rgba(218,140,160,0.2)] flex items-center justify-center bg-gradient-to-br from-[#2a1b54] via-[#1C1246] to-[#120b30]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(218,140,160,0.15)_0%,transparent_60%)] animate-pulse duration-[4000ms]" />
      
      <svg viewBox="0 0 400 400" className="w-full h-full max-w-[450px] absolute drop-shadow-2xl">
        <motion.g initial="hidden" whileInView="visible" viewport={{ once: true }}>
          
          {/* L1 Connections */}
          {layer1.map((pos, i) => (
            <motion.line 
              key={`L1-${i}`}
              x1={center.x} y1={center.y} x2={pos.x} y2={pos.y}
              stroke="url(#gradientL1)" strokeWidth="2.5" strokeOpacity="0.8" strokeLinecap="round"
              variants={drawLine}
            />
          ))}

          {/* L2 Connections */}
          {layer2.map((pos, i) => {
            const parent = layer1[i % 5]
            return (
              <motion.line 
                key={`L2-${i}`}
                x1={parent.x} y1={parent.y} x2={pos.x} y2={pos.y}
                stroke="url(#gradientL2)" strokeWidth="1.5" strokeOpacity="0.5" strokeDasharray="4 4"
                variants={drawLine}
                transition={{ delay: 1.2, duration: 2, ease: ultraSmooth }} 
              />
            )
          })}

          {/* Gradient Definitions */}
          <defs>
            <linearGradient id="gradientL1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#DA8CA0" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
            <linearGradient id="gradientL2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
          </defs>

          {/* Central Hub */}
          <motion.circle 
            cx={center.x} cy={center.y} r="18" fill="#DA8CA0"
            initial={{ scale: 0 }}
            animate={{ scale: 1, boxShadow: "0 0 40px #DA8CA0" }}
            transition={{ duration: 1.2, ease: ultraSmooth }}
          />
          <motion.circle 
            cx={center.x} cy={center.y} r="45" stroke="#DA8CA0" strokeWidth="1.5" fill="none"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2.8, opacity: 0 }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
          />

          {/* L1 Nodes */}
          {layer1.map((pos, i) => (
            <motion.circle 
              key={`N1-${i}`} cx={pos.x} cy={pos.y} r="8" fill="#c084fc"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ delay: 0.8 + (i * 0.15), ease: ultraSmooth }}
            />
          ))}

          {/* L2 Nodes */}
          {layer2.map((pos, i) => (
            <motion.circle 
              key={`N2-${i}`} cx={pos.x} cy={pos.y} r="5" fill="#34d399"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ delay: 2 + (i * 0.08), ease: ultraSmooth }}
            />
          ))}

        </motion.g>
      </svg>

      <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8 md:right-8">
         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.8, duration: 1.2, ease: ultraSmooth }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-2xl flex items-center gap-4 shadow-2xl"
         >
            <div className="bg-emerald-500/20 p-3 rounded-full shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
               <Network className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />
            </div>
            <div>
               <p className="text-white text-sm md:text-base font-bold tracking-wide">The Multiplier Effect</p>
               <p className="text-[#CCCCD9] text-xs md:text-sm font-light mt-1">Protecting 1 girl secures an entire network.</p>
            </div>
         </motion.div>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function ImpactPage() {
  return (
    <div className="relative min-h-screen bg-[#1C1246] text-[#FAFAFA] selection:bg-[#DA8CA0]/30 selection:text-[#DA8CA0] font-sans">
      <GrainOverlay />
      <Navigation />

      {/* --- HERO SECTION (High-Contrast Emotional Hook) --- */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden min-h-[85vh] flex flex-col justify-center">
        
        <div className="absolute inset-0 z-0">
          <Image
            src="/seven-hero.png"
            alt="The Global Network Grid"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1C1246]/90 via-[#1C1246]/60 to-[#1C1246]" />
        </div>
        
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
           <motion.div
             variants={scaleIn}
             initial="hidden"
             animate="visible"
             className="mb-6 md:mb-8 inline-flex items-center justify-center h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-[#231854]/80 backdrop-blur-xl border border-[#DA8CA0]/30 shadow-2xl shadow-[#DA8CA0]/20"
           >
             <Globe className="h-6 w-6 md:h-8 md:w-8 text-[#DA8CA0]" />
           </motion.div>

           <TextReveal 
             text="The Cost of Silence." 
             className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-4 md:mb-6 drop-shadow-lg"
           />

           <motion.p 
             initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
             animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
             transition={{ delay: 0.4, duration: 1.2, ease: ultraSmooth }}
             className="max-w-2xl mx-auto text-base sm:text-lg md:text-2xl text-[#CCCCD9] leading-relaxed font-light px-2"
           >
             Ignorance is a vulnerability. Knowledge is armor. We are closing the information gap that leaves young women exposed to predators, fear, and medical myths.
           </motion.p>
        </div>
      </section>

      {/* --- THE REALITY (Stark Moral Clarity) --- */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        className="py-16 md:py-24 border-y border-white/5 bg-[#231854]/20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-xs md:text-sm font-bold tracking-widest text-rose-400 uppercase mb-4">The Reality We Face</h2>
            <h3 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-white mb-6 md:mb-8 leading-tight">
              A girl without answers is a girl at risk.
            </h3>
            <p className="text-base md:text-xl font-light leading-relaxed text-[#CCCCD9]">
              Right now, millions of girls lack a safe place to ask terrifying questions about their changing bodies, mental health, or unsafe situations. When they search online, they find harmful myths. When they stay silent, they become targets. <strong className="text-white font-bold">Heal Her steps into that gap as an unshakeable digital shield.</strong>
            </p>
          </div>
        </div>
      </motion.section>

      {/* --- MEASURING SUCCESS (Vital Signs Dashboard) --- */}
      <section className="py-20 md:py-32">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 md:mb-12 gap-4">
               <div>
                 <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">The Shield in Numbers</h2>
                 <p className="text-[#CCCCD9] text-sm md:text-base font-light">Impact isn't abstract. It is measured in protected lives.</p>
               </div>
               <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs text-emerald-400 font-bold tracking-widest uppercase w-fit shadow-inner">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Defense Metrics
               </div>
            </div>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
            >
               {[
                 { val: "24/7", label: "Active Defense", sub: "Always awake, always listening", color: "text-white" },
                 { val: "< 1s", label: "Response Time", sub: "Instant support when seconds count", color: "text-blue-400" },
                 { val: "100%", label: "Anonymity", sub: "Zero data sold. Absolute trust.", color: "text-emerald-400" },
                 { val: "∞", label: "Fears Resolved", sub: "Infinite patience and empathy", color: "text-[#DA8CA0]" },
               ].map((stat, i) => (
                 <motion.div 
                   key={i} 
                   variants={fadeInUp}
                   className="bg-[#231854]/40 border border-white/5 p-8 md:p-10 rounded-[2rem] flex flex-col items-center justify-center hover:bg-[#231854]/60 hover:border-[#DA8CA0]/20 transition-all duration-500 shadow-lg"
                 >
                    <div className={cn("text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-md", stat.color)}>{stat.val}</div>
                    <div className="text-xs md:text-sm text-white font-bold tracking-widest uppercase text-center mb-1">{stat.label}</div>
                    <div className="text-[10px] md:text-xs text-[#CCCCD9] font-light text-center">{stat.sub}</div>
                 </motion.div>
               ))}
            </motion.div>
         </div>
      </section>

      {/* --- THE RIPPLE EFFECT (Visualization) --- */}
      <section className="py-20 md:py-32 bg-[#231854]/20 border-y border-white/5 overflow-hidden">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
               <motion.div 
                 initial={{ opacity: 0, x: -30, filter: "blur(10px)" }}
                 whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                 viewport={{ once: true }}
                 transition={{ duration: 1.2, ease: ultraSmooth }}
                 className="order-2 lg:order-1"
               >
                  <h2 className="text-xs md:text-sm font-bold tracking-widest text-[#DA8CA0] uppercase mb-3">Exponential Protection</h2>
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">The Network of Sisterhood.</h3>
                  <p className="text-base md:text-lg text-[#CCCCD9] font-light mb-8 md:mb-10 leading-relaxed">
                      When you arm one girl with the truth, she doesn't keep it to herself. She protects her friends, educates her siblings, and breaks generational cycles of fear. A single interaction scales into community-wide defense.
                  </p>
                  
                  <div className="space-y-6 md:space-y-8 relative">
                     <div className="absolute left-[23px] md:left-[27px] top-6 bottom-6 w-[2px] bg-gradient-to-b from-[#DA8CA0] via-purple-500 to-emerald-500 opacity-20 -z-10" />

                     <div className="flex gap-5 md:gap-6 items-start">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#DA8CA0]/10 flex items-center justify-center border border-[#DA8CA0]/40 shrink-0 z-10 backdrop-blur-sm shadow-[0_0_15px_rgba(218,140,160,0.3)]">
                           <User className="h-5 w-5 md:h-6 md:w-6 text-[#DA8CA0]" />
                        </div>
                        <div className="pt-1">
                           <h4 className="text-white font-bold text-lg md:text-xl mb-1">1 Girl Empowered</h4>
                           <p className="text-[#CCCCD9] text-sm md:text-base font-light">She gains the vocabulary to set boundaries and the knowledge to protect her body.</p>
                        </div>
                     </div>

                     <div className="flex gap-5 md:gap-6 items-start">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/40 shrink-0 z-10 backdrop-blur-sm shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                           <Users className="h-5 w-5 md:h-6 md:w-6 text-purple-400" />
                        </div>
                        <div className="pt-1">
                           <h4 className="text-white font-bold text-lg md:text-xl mb-1">Her Circle Defended</h4>
                           <p className="text-[#CCCCD9] text-sm md:text-base font-light">She recognizes when her friends are in danger and shares clinical, verified truths.</p>
                        </div>
                     </div>

                     <div className="flex gap-5 md:gap-6 items-start">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/40 shrink-0 z-10 backdrop-blur-sm shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                           <Baby className="h-5 w-5 md:h-6 md:w-6 text-emerald-400" />
                        </div>
                        <div className="pt-1">
                           <h4 className="text-white font-bold text-lg md:text-xl mb-1">Generations Shifted</h4>
                           <p className="text-[#CCCCD9] text-sm md:text-base font-light">An educated woman raises fiercely protected, highly literate children. The cycle is broken.</p>
                        </div>
                     </div>
                  </div>
               </motion.div>

               <motion.div 
                 initial={{ opacity: 0, x: 30, filter: "blur(10px)" }}
                 whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                 viewport={{ once: true }}
                 transition={{ duration: 1.2, delay: 0.2, ease: ultraSmooth }}
                 className="order-1 lg:order-2 w-full flex justify-center lg:justify-end"
               >
                  <RippleVisualization />
               </motion.div>
            </div>
         </div>
      </section>

      {/* --- STORIES FROM THE FRONTLINE --- */}
      <section className="py-20 md:py-32">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: ultraSmooth }}
              className="text-center mb-12 md:mb-20"
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white">Files of Defense</h2>
              <p className="text-[#CCCCD9] mt-4 text-base md:text-lg font-light max-w-2xl mx-auto">Real interventions. Real protection. Details obscured to protect identities.</p>
            </motion.div>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-6 md:gap-8"
            >
               {[
                 {
                   text: "A stranger online told me to keep our chats a secret. Heal Her flagged his exact words as 'grooming tactics' and gave me the script to block him before I made a mistake.",
                   tag: "Predator Deflection",
                   color: "text-rose-400",
                   bg: "bg-rose-500/10",
                   border: "border-rose-500/20"
                 },
                 {
                   text: "I was having a severe panic attack in the school bathroom. The app didn't judge me; it just walked me through a 4-7-8 breathing loop until my heart stopped racing.",
                   tag: "Clinical Grounding",
                   color: "text-purple-400",
                   bg: "bg-purple-500/10",
                   border: "border-purple-500/20"
                 },
                 {
                   text: "I thought the pain I felt every month was normal because my aunties said so. Heal Her gave me the exact medical words to tell a doctor, and I finally got diagnosed.",
                   tag: "Medical Literacy",
                   color: "text-emerald-400",
                   bg: "bg-emerald-500/10",
                   border: "border-emerald-500/20"
                 }
               ].map((story, i) => (
                 <motion.div 
                   key={i} 
                   variants={fadeInUp}
                   className="bg-[#231854]/40 border border-white/5 p-8 md:p-10 rounded-[2rem] relative shadow-[0_10px_30px_-15px_rgba(0,0,0,0.5)] hover:bg-[#231854]/60 transition-colors duration-500 flex flex-col"
                 >
                    <Quote className="absolute top-8 left-8 h-10 w-10 text-white/5 pointer-events-none" />
                    <p className="text-[#FAFAFA] font-light relative z-10 pt-2 mb-8 leading-relaxed md:text-lg flex-grow">"{story.text}"</p>
                    <div className="border-t border-white/10 pt-5 mt-auto">
                       <div className={cn("inline-flex items-center px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest border", story.bg, story.color, story.border)}>
                          {story.tag}
                       </div>
                    </div>
                 </motion.div>
               ))}
            </motion.div>
         </div>
      </section>

      {/* --- DEEP IMPACT (Replacing Financial Ask) --- */}
      <section className="py-24 md:py-32 relative overflow-hidden bg-[#231854]/20 border-t border-white/5" id="impact">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-[#DA8CA0]/10 blur-[150px] rounded-full pointer-events-none" />
         
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
               
               <motion.div 
                 initial={{ opacity: 0, x: -30, filter: "blur(10px)" }}
                 whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                 viewport={{ once: true }}
                 transition={{ duration: 1.2, ease: ultraSmooth }}
                 className="space-y-8 md:space-y-10"
               >
                  <div>
                     <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-5 md:mb-6">
                        <Zap className="h-3 w-3 md:h-4 md:w-4" /> Systemic Disruption
                     </div>
                     <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 md:mb-8 leading-[1.1]">
                        The architecture of <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DA8CA0] to-indigo-400">empowerment.</span>
                     </h2>
                     <p className="text-base md:text-lg text-[#CCCCD9] font-light leading-relaxed mb-6">
                        Heal Her isn't just an application; it is a fundamental shift in how young women access critical life intelligence. By leveraging advanced AI, we bypass the stigma and geographical limitations that have kept generations in the dark.
                     </p>
                     <p className="text-base md:text-lg text-white font-medium leading-relaxed">
                        Our premium infrastructure ensures that every interaction is processed with zero-latency precision. When a girl needs a shield, she gets it instantly—without compromise.
                     </p>
                  </div>
               </motion.div>

               <motion.div 
                 initial={{ opacity: 0, x: 30, filter: "blur(10px)" }}
                 whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                 viewport={{ once: true }}
                 transition={{ duration: 1.2, delay: 0.2, ease: ultraSmooth }}
                 className="grid gap-4 md:gap-6"
               >
                 <div className="p-8 rounded-[2rem] bg-gradient-to-br from-[#1C1246] to-[#2a1b54] border border-white/10 shadow-2xl relative overflow-hidden group hover:border-[#DA8CA0]/40 transition-colors duration-500">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full pointer-events-none" />
                    <Code2 className="h-8 w-8 text-blue-400 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Unrestricted Access</h3>
                    <p className="text-sm text-[#CCCCD9] font-light">Tearing down the walls of misinformation. Our systems deliver clinical-grade health data and psychological support directly to her device, 24/7.</p>
                 </div>
                 
                 <div className="p-8 rounded-[2rem] bg-gradient-to-br from-[#1C1246] to-[#2a1b54] border border-white/10 shadow-2xl relative overflow-hidden group hover:border-emerald-400/40 transition-colors duration-500 lg:ml-8">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none" />
                    <ShieldCheck className="h-8 w-8 text-emerald-400 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Unyielding Privacy</h3>
                    <p className="text-sm text-[#CCCCD9] font-light">Shame thrives in exposure. Our zero-logging cryptographic architecture guarantees that her most vulnerable questions remain permanently sealed.</p>
                 </div>
               </motion.div>

            </div>
         </div>
      </section>

      {/* --- SDG ALIGNMENT & PARTNERSHIPS --- */}
      <section className="py-20 md:py-32 border-y border-white/5 bg-[#1C1246]">
         <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <motion.div 
               initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
               whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
               viewport={{ once: true }}
               transition={{ duration: 1.2, ease: ultraSmooth }}
               className="flex flex-col md:flex-row items-center gap-10 md:gap-16"
            >
               <div className="w-40 h-40 md:w-56 md:h-56 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl flex flex-col items-center justify-center text-white shrink-0 shadow-[0_20px_40px_-10px_rgba(16,185,129,0.4)] border border-emerald-400/30 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="text-7xl md:text-8xl font-black drop-shadow-lg">5</div>
                  <div className="text-xs md:text-sm font-bold text-center mt-2 px-4 uppercase tracking-widest">Gender<br/>Equality</div>
               </div>
               <div className="text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-4">
                     <Globe className="h-3 w-3 md:h-4 md:w-4" /> Global Alignment
                  </div>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">Built for UN Goal 5</h2>
                  <p className="text-[#CCCCD9] text-base md:text-lg font-light leading-relaxed mb-8">
                     Heal Her is an actionable, scalable weapon in the fight for global gender equality. By decentralizing access to sexual and reproductive health intelligence, we grant young women total autonomy over their physical futures.
                  </p>
                  
                  <div className="p-5 md:p-6 rounded-2xl bg-[#231854]/40 border border-[#DA8CA0]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                     <div className="flex items-center gap-3">
                        <Network className="h-6 w-6 text-[#DA8CA0]" />
                        <span className="text-white font-bold text-sm md:text-base">Institutional Partnerships</span>
                     </div>
                     <a href="mailto:partners@healher.ai" className="text-xs md:text-sm font-mono text-[#DA8CA0] hover:text-white transition-colors bg-[#DA8CA0]/10 px-4 py-2 rounded-lg border border-[#DA8CA0]/30 w-full sm:w-auto text-center">
                        partners@healher.ai
                     </a>
                  </div>
               </div>
            </motion.div>
         </div>
      </section>

      <Footer />
    </div>
  )
}