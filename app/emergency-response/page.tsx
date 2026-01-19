"use client"

import React from "react"
import { motion, useMotionTemplate, useMotionValue, Variants } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { cn } from "@/lib/utils"
import { 
  AlertTriangle, 
  Phone, 
  Clock, 
  Shield, 
  Activity, 
  AlertCircle,
  BrainCircuit,
  CheckCircle2,
  Heart,
  MessageCircle,
  ShieldCheck
} from "lucide-react"

// --- ANIMATION VARIANTS ---

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const scaleIn: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.5, ease: "backOut" } }
}

// --- PRO COMPONENTS ---

const GrainOverlay = () => (
  <div 
    className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
    }}
  />
)

function SpotlightCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  return (
    <motion.div
      className={cn(
        "group relative border border-white/10 bg-[#231854]/50 overflow-hidden rounded-3xl",
        className
      )}
      onMouseMove={handleMouseMove}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(218, 140, 160, 0.15),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative h-full">{children}</div>
    </motion.div>
  )
}

function TextReveal({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words = text.split(" ")
  const container: Variants = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({ opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.04 * i + delay } }),
  }
  const child: Variants = {
    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", damping: 12, stiffness: 100 } },
    hidden: { opacity: 0, y: 20, filter: "blur(10px)", transition: { type: "spring", damping: 12, stiffness: 100 } },
  }

  return (
    <motion.h1 className={className} variants={container} initial="hidden" whileInView="visible" viewport={{ once: true }}>
      {words.map((word, index) => (
        <motion.span variants={child} style={{ marginRight: "0.25em", display: "inline-block" }} key={index}>{word}</motion.span>
      ))}
    </motion.h1>
  )
}

// --- PAGE COMPONENT ---

export default function EmergencyResponsePage() {
  return (
    <div className="relative min-h-screen bg-[#1C1246] text-[#FAFAFA] selection:bg-[#DA8CA0]/30 selection:text-[#DA8CA0]">
      <GrainOverlay />
      <Navigation />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-[#DA8CA0]/20 via-[#1C1246] to-[#1C1246] -z-10" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
           <motion.div
             variants={scaleIn}
             initial="hidden"
             animate="visible"
             className="mb-8 inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-[#231854] border border-[#DA8CA0]/20 shadow-2xl shadow-[#DA8CA0]/10"
           >
             <Heart className="h-8 w-8 text-[#DA8CA0] animate-pulse" />
           </motion.div>

           <TextReveal 
             text="Safe Response Protocol." 
             className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6"
           />

           <motion.p 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.6, duration: 0.8 }}
             className="max-w-2xl mx-auto text-lg text-[#CCCCD9] leading-relaxed"
           >
             How Heal Her identifies distress, supports mental well-being, and guides you through moments of panic or confusion.
           </motion.p>
        </div>
      </section>

      {/* --- CRITICAL WARNING (The Red Bar) --- */}
      <section className="pb-16 px-4">
        <div className="mx-auto max-w-4xl">
            <motion.div 
              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-rose-950/30 border border-rose-500/30 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left"
            >
               <div className="p-4 bg-rose-500/10 rounded-xl shrink-0">
                  <AlertTriangle className="h-8 w-8 text-rose-500" />
               </div>
               <div>
                  <h3 className="text-xl font-bold text-white mb-2">Safety First Policy</h3>
                  <p className="text-[#CCCCD9] text-sm leading-relaxed mb-4">
                     Heal Her is a guidance tool, not a replacement for emergency services. If you are in immediate physical danger, feeling unsafe, or need urgent medical help, we will instruct you to call <span className="text-white font-bold">112 / 911</span> or a trusted adult immediately.
                  </p>
               </div>
            </motion.div>
        </div>
      </section>

      {/* --- 3-TIER SYSTEM (Support Levels) --- */}
      <section className="py-20 border-y border-white/5 bg-[#231854]/30">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16 text-center text-3xl font-bold text-white"
            >
              Three-Tier Support Logic
            </motion.h2>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid gap-8 lg:grid-cols-3"
            >
               
               {/* LEVEL 1: IMMEDIATE HELP */}
               <motion.div variants={fadeInUp} className="h-full">
                 <SpotlightCard className="p-0 h-full bg-[#1C1246] border-rose-900/50">
                    <div className="p-6 border-b border-rose-900/30 bg-rose-950/10">
                       <div className="flex justify-between items-start mb-4">
                          <div className="p-3 bg-rose-500 rounded-xl text-white shadow-lg shadow-rose-500/20">
                             <Phone className="h-6 w-6" />
                          </div>
                          <span className="px-3 py-1 rounded bg-rose-500/10 text-rose-500 text-xs font-bold border border-rose-500/20 animate-pulse">
                             LEVEL 1: URGENT
                          </span>
                       </div>
                       <h3 className="text-xl font-bold text-white">Immediate Help</h3>
                    </div>
                    <div className="p-6">
                       <p className="text-[#CCCCD9] text-sm mb-6">
                          System detects distress keywords (harm, assault, severe pain). AI locks into "Safety Mode" and provides emergency numbers immediately.
                       </p>
                       <ul className="space-y-3 text-sm text-[#CCCCD9]">
                          {["Thoughts of self-harm", "Physical assault / Abuse", "Severe physical pain", "Panic attacks (Severe)", "Unsafe environment"].map((item, i) => (
                             <li key={i} className="flex gap-3">
                                <div className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                                {item}
                             </li>
                          ))}
                       </ul>
                    </div>
                 </SpotlightCard>
               </motion.div>

               {/* LEVEL 2: SUPPORT */}
               <motion.div variants={fadeInUp} className="h-full">
                 <SpotlightCard className="p-0 h-full bg-[#1C1246] border-amber-900/50">
                    <div className="p-6 border-b border-amber-900/30 bg-amber-950/10">
                       <div className="flex justify-between items-start mb-4">
                          <div className="p-3 bg-amber-500 rounded-xl text-white shadow-lg shadow-amber-500/20">
                             <Shield className="h-6 w-6" />
                          </div>
                          <span className="px-3 py-1 rounded bg-amber-500/10 text-amber-500 text-xs font-bold border border-amber-500/20">
                             LEVEL 2: SUPPORT
                          </span>
                       </div>
                       <h3 className="text-xl font-bold text-white">Guidance Needed</h3>
                    </div>
                    <div className="p-6">
                       <p className="text-[#CCCCD9] text-sm mb-6">
                          Condition is serious but not life-threatening. AI advises talking to a parent, school nurse, or counselor and offers coping strategies.
                       </p>
                       <ul className="space-y-3 text-sm text-[#CCCCD9]">
                          {["Persistent sadness / Anxiety", "Bullying issues", "Period irregularities", "Relationship stress", "Body image concerns"].map((item, i) => (
                             <li key={i} className="flex gap-3">
                                <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                                {item}
                             </li>
                          ))}
                       </ul>
                    </div>
                 </SpotlightCard>
               </motion.div>

               {/* LEVEL 3: EDUCATION */}
               <motion.div variants={fadeInUp} className="h-full">
                 <SpotlightCard className="p-0 h-full bg-[#1C1246] border-[#DA8CA0]/50">
                    <div className="p-6 border-b border-[#DA8CA0]/30 bg-[#DA8CA0]/10">
                       <div className="flex justify-between items-start mb-4">
                          <div className="p-3 bg-[#DA8CA0] rounded-xl text-[#1C1246] shadow-lg shadow-[#DA8CA0]/20">
                             <MessageCircle className="h-6 w-6" />
                          </div>
                          <span className="px-3 py-1 rounded bg-[#DA8CA0]/10 text-[#DA8CA0] text-xs font-bold border border-[#DA8CA0]/20">
                             LEVEL 3: LEARN
                          </span>
                       </div>
                       <h3 className="text-xl font-bold text-white">Curiosity & Facts</h3>
                    </div>
                    <div className="p-6">
                       <p className="text-[#CCCCD9] text-sm mb-6">
                          General questions about growing up. AI acts as a big sister, explaining facts clearly, gently, and without judgment.
                       </p>
                       <ul className="space-y-3 text-sm text-[#CCCCD9]">
                          {["How periods work", "Acne and skin care", "Friendship advice", "Hygiene tips", "Puberty changes"].map((item, i) => (
                             <li key={i} className="flex gap-3">
                                <div className="h-1.5 w-1.5 rounded-full bg-[#DA8CA0] mt-2 shrink-0" />
                                {item}
                             </li>
                          ))}
                       </ul>
                    </div>
                 </SpotlightCard>
               </motion.div>

            </motion.div>
         </div>
      </section>

      {/* --- INTELLIGENT DETECTION (The Brain) --- */}
      <section className="py-24">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
               
               <motion.div 
                 initial="hidden"
                 whileInView="visible"
                 viewport={{ once: true }}
                 variants={staggerContainer}
                 className="space-y-8"
               >
                  <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 text-[#DA8CA0] font-mono text-sm">
                     <BrainCircuit className="h-4 w-4" /> EMPATHY ENGINE ACTIVE
                  </motion.div>
                  <motion.h2 variants={fadeInUp} className="text-3xl font-bold text-white">Understanding Your Feelings</motion.h2>
                  <motion.p variants={fadeInUp} className="text-lg leading-relaxed text-[#CCCCD9]">
                     Heal Her doesn't just read words; it feels the emotion behind them. The AI continuously scans for emotional distress to provide the right kind of support.
                  </motion.p>
                  
                  <motion.div variants={staggerContainer} className="space-y-6">
                     <motion.div variants={fadeInUp} className="flex gap-4 p-4 rounded-xl bg-[#231854] border border-white/5">
                        <div className="mt-1 h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/20 shrink-0">
                           <Heart className="h-4 w-4" />
                        </div>
                        <div>
                           <h4 className="text-white font-bold mb-1">Emotional Analysis</h4>
                           <p className="text-sm text-[#CCCCD9]">Detecting sadness, fear, or confusion to adjust the tone of the response to be warmer and more comforting.</p>
                        </div>
                     </motion.div>
                     
                     <motion.div variants={fadeInUp} className="flex gap-4 p-4 rounded-xl bg-[#231854] border border-white/5">
                        <div className="mt-1 h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20 shrink-0">
                           <ShieldCheck className="h-4 w-4" />
                        </div>
                        <div>
                           <h4 className="text-white font-bold mb-1">Safety Triggers</h4>
                           <p className="text-sm text-[#CCCCD9]">Identifying words that signal unsafe situations (like "scared to go home") to prioritize safety resources.</p>
                        </div>
                     </motion.div>

                     <motion.div variants={fadeInUp} className="flex gap-4 p-4 rounded-xl bg-[#231854] border border-white/5">
                        <div className="mt-1 h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20 shrink-0">
                           <Clock className="h-4 w-4" />
                        </div>
                        <div>
                           <h4 className="text-white font-bold mb-1">Urgency Detection</h4>
                           <p className="text-sm text-[#CCCCD9]">Recognizing when you need an answer "right now" versus general curiosity.</p>
                        </div>
                     </motion.div>
                  </motion.div>
               </motion.div>

               {/* Data Visualization Card */}
               <motion.div 
                 initial={{ opacity: 0, x: 50 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.8 }}
               >
                 <SpotlightCard className="p-8 bg-[#1C1246] border-white/10 relative overflow-hidden h-[500px] flex flex-col justify-between">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                       <Activity className="h-64 w-64 text-white" />
                    </div>
                    
                    <div>
                       <h3 className="text-xl font-bold text-white mb-6">Response Weighting</h3>
                       <div className="space-y-6">
                          <div>
                             <div className="flex justify-between text-xs text-[#CCCCD9] mb-2">
                                <span>Emotional Distress</span>
                                <span className="text-white">High Sensitivity</span>
                             </div>
                             <div className="h-2 bg-[#231854] rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }} 
                                  whileInView={{ width: "90%" }} 
                                  viewport={{ once: true }}
                                  transition={{ duration: 1.5, delay: 0.2 }}
                                  className="h-full bg-purple-500" 
                                />
                             </div>
                          </div>
                          <div>
                             <div className="flex justify-between text-xs text-[#CCCCD9] mb-2">
                                <span>Physical Safety Risk</span>
                                <span className="text-white">Critical Priority</span>
                             </div>
                             <div className="h-2 bg-[#231854] rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }} 
                                  whileInView={{ width: "95%" }} 
                                  viewport={{ once: true }}
                                  transition={{ duration: 1.5, delay: 0.4 }}
                                  className="h-full bg-rose-500" 
                                />
                             </div>
                          </div>
                          <div>
                             <div className="flex justify-between text-xs text-[#CCCCD9] mb-2">
                                <span>Educational Value</span>
                                <span className="text-white">Clarity Focus</span>
                             </div>
                             <div className="h-2 bg-[#231854] rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }} 
                                  whileInView={{ width: "80%" }} 
                                  viewport={{ once: true }}
                                  transition={{ duration: 1.5, delay: 0.6 }}
                                  className="h-full bg-[#DA8CA0]" 
                                />
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="bg-[#231854] rounded-xl p-4 border border-white/5">
                       <div className="flex items-center gap-3 text-xs text-[#CCCCD9]">
                          <Shield className="h-4 w-4 text-emerald-500" />
                          <span>Core Directive:</span>
                       </div>
                       <p className="text-white font-mono text-sm mt-2">
                          "If user feels unsafe, prioritize PROTECTION protocols over education."
                       </p>
                    </div>
                 </SpotlightCard>
               </motion.div>

            </div>
         </div>
      </section>

      {/* --- RESPONSIBILITY BOUNDARIES (Legal & Ethical) --- */}
      <section className="py-24 border-t border-white/5 bg-[#231854]/20">
         <div className="mx-auto max-w-4xl px-4 text-center">
            <motion.h2 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-white mb-12"
            >
              What We Do (and Don't) Do
            </motion.h2>
            
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 gap-8 text-left"
            >
               <motion.div variants={fadeInUp} className="p-6 rounded-2xl bg-emerald-950/10 border border-emerald-500/20">
                  <h3 className="text-emerald-400 font-bold mb-4 flex items-center gap-2">
                     <CheckCircle2 className="h-5 w-5" /> We DO
                  </h3>
                  <ul className="space-y-3 text-[#CCCCD9] text-sm">
                     <li className="flex gap-2"><div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-2" /> Answer questions about puberty & body.</li>
                     <li className="flex gap-2"><div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-2" /> Listen when you feel sad or lonely.</li>
                     <li className="flex gap-2"><div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-2" /> Guide you to safe resources.</li>
                     <li className="flex gap-2"><div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-2" /> Keep your secrets (unless you're in danger).</li>
                  </ul>
               </motion.div>

               <motion.div variants={fadeInUp} className="p-6 rounded-2xl bg-rose-950/10 border border-rose-500/20">
                  <h3 className="text-rose-400 font-bold mb-4 flex items-center gap-2">
                     <AlertCircle className="h-5 w-5" /> We Do NOT
                  </h3>
                  <ul className="space-y-3 text-[#CCCCD9] text-sm">
                     <li className="flex gap-2"><div className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-2" /> Diagnose medical diseases.</li>
                     <li className="flex gap-2"><div className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-2" /> Tell you what medicines to take.</li>
                     <li className="flex gap-2"><div className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-2" /> Replace your parents or doctor.</li>
                     <li className="flex gap-2"><div className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-2" /> Judge you for your questions.</li>
                  </ul>
               </motion.div>
            </motion.div>
         </div>
      </section>

      <Footer />
    </div>
  )
}