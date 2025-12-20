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
  Siren,
  Stethoscope,
  HeartPulse,
  BrainCircuit,
  Thermometer,
  Timer,
  CheckCircle2 // Added missing import
} from "lucide-react"

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
    <div
      className={cn(
        "group relative border border-white/10 bg-slate-900/50 overflow-hidden rounded-3xl",
        className
      )}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(59, 130, 246, 0.15),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
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
    <div className="relative min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30 selection:text-blue-200">
      <GrainOverlay />
      <Navigation />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-rose-900/20 via-slate-950 to-slate-950 -z-10" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
           <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="mb-8 inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-rose-500/10"
           >
              <Siren className="h-8 w-8 text-rose-500 animate-pulse" />
           </motion.div>

           <TextReveal 
             text="Triage & Response Protocol." 
             className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6"
           />

           <p className="max-w-2xl mx-auto text-lg text-slate-400 leading-relaxed">
             How MedGuard AI identifies danger, escalates critical cases, and guides you through the golden hour of emergency response.
           </p>
        </div>
      </section>

      {/* --- CRITICAL WARNING (The Red Bar) --- */}
      <section className="pb-16 px-4">
        <div className="mx-auto max-w-4xl">
           <div className="bg-rose-950/30 border border-rose-500/30 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
              <div className="p-4 bg-rose-500/10 rounded-xl shrink-0">
                 <AlertTriangle className="h-8 w-8 text-rose-500" />
              </div>
              <div>
                 <h3 className="text-xl font-bold text-white mb-2">Mandatory Escalation Override</h3>
                 <p className="text-slate-300 text-sm leading-relaxed mb-4">
                    MedGuard AI is a guidance tool, not a replacement for emergency services. If a condition is life-threatening (no pulse, severe bleeding, unconsciousness), the AI is programmed to stop and instruct you to call <span className="text-white font-bold">112 / 911</span> immediately.
                 </p>
              </div>
           </div>
        </div>
      </section>

      {/* --- 3-TIER SYSTEM (Defcon Levels) --- */}
      <section className="py-20 border-y border-white/5 bg-slate-900/20">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-16 text-center text-3xl font-bold text-white">Three-Tier Response Logic</h2>

            <div className="grid gap-8 lg:grid-cols-3">
               
               {/* LEVEL 1: CRITICAL */}
               <SpotlightCard className="p-0 h-full bg-slate-950 border-rose-900/50">
                  <div className="p-6 border-b border-rose-900/30 bg-rose-950/10">
                     <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-rose-500 rounded-xl text-white shadow-lg shadow-rose-500/20">
                           <Phone className="h-6 w-6" />
                        </div>
                        <span className="px-3 py-1 rounded bg-rose-500/10 text-rose-500 text-xs font-bold border border-rose-500/20 animate-pulse">
                           LEVEL 1: CRITICAL
                        </span>
                     </div>
                     <h3 className="text-xl font-bold text-white">Immediate Escalation</h3>
                  </div>
                  <div className="p-6">
                     <p className="text-slate-400 text-sm mb-6">
                        System detects life-threatening keywords. AI locks into "Rescue Mode" providing CPR/Bleeding control steps while urging a 112/911 call.
                     </p>
                     <ul className="space-y-3 text-sm text-slate-300">
                        {["Cardiac arrest / Chest pain", "Severe difficulty breathing", "Uncontrolled bleeding", "Loss of consciousness", "Stroke symptoms"].map((item, i) => (
                           <li key={i} className="flex gap-3">
                              <div className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                              {item}
                           </li>
                        ))}
                     </ul>
                  </div>
               </SpotlightCard>

               {/* LEVEL 2: URGENT */}
               <SpotlightCard className="p-0 h-full bg-slate-950 border-amber-900/50">
                  <div className="p-6 border-b border-amber-900/30 bg-amber-950/10">
                     <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-amber-500 rounded-xl text-white shadow-lg shadow-amber-500/20">
                           <Clock className="h-6 w-6" />
                        </div>
                        <span className="px-3 py-1 rounded bg-amber-500/10 text-amber-500 text-xs font-bold border border-amber-500/20">
                           LEVEL 2: URGENT
                        </span>
                     </div>
                     <h3 className="text-xl font-bold text-white">Professional Care</h3>
                  </div>
                  <div className="p-6">
                     <p className="text-slate-400 text-sm mb-6">
                        Condition is serious but stable. AI advises immediate transport to Urgent Care or ER and provides stabilization instructions.
                     </p>
                     <ul className="space-y-3 text-sm text-slate-300">
                        {["High fever with severe symptoms", "Suspected fractures", "Deep cuts needing stitches", "Severe burns (2nd/3rd degree)", "Head injuries (Concussion)"].map((item, i) => (
                           <li key={i} className="flex gap-3">
                              <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                              {item}
                           </li>
                        ))}
                     </ul>
                  </div>
               </SpotlightCard>

               {/* LEVEL 3: FIRST AID */}
               <SpotlightCard className="p-0 h-full bg-slate-950 border-blue-900/50">
                  <div className="p-6 border-b border-blue-900/30 bg-blue-950/10">
                     <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-500 rounded-xl text-white shadow-lg shadow-blue-500/20">
                           <Activity className="h-6 w-6" />
                        </div>
                        <span className="px-3 py-1 rounded bg-blue-500/10 text-blue-500 text-xs font-bold border border-blue-500/20">
                           LEVEL 3: GUIDANCE
                        </span>
                     </div>
                     <h3 className="text-xl font-bold text-white">Home Management</h3>
                  </div>
                  <div className="p-6">
                     <p className="text-slate-400 text-sm mb-6">
                        Non-emergency situation. AI provides detailed, step-by-step home care protocols and monitoring advice.
                     </p>
                     <ul className="space-y-3 text-sm text-slate-300">
                        {["Minor cuts and scrapes", "Small burns (1st degree)", "Sprains and strains", "Insect bites", "Common illnesses (Flu/Cold)"].map((item, i) => (
                           <li key={i} className="flex gap-3">
                              <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                              {item}
                           </li>
                        ))}
                     </ul>
                  </div>
               </SpotlightCard>

            </div>
         </div>
      </section>

      {/* --- INTELLIGENT DETECTION (The Brain) --- */}
      <section className="py-24">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
               
               <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 text-indigo-400 font-mono text-sm">
                     <BrainCircuit className="h-4 w-4" /> NEURAL ENGINE ACTIVE
                  </div>
                  <h2 className="text-3xl font-bold text-white">Real-Time Threat Analysis</h2>
                  <p className="text-lg leading-relaxed text-slate-400">
                     MedGuard doesn't just read text; it analyzes context. The AI continuously scans user input for 4 key signal vectors to determine the safety trajectory.
                  </p>
                  
                  <div className="space-y-6">
                     <div className="flex gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                        <div className="mt-1 h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 shrink-0">
                           <HeartPulse className="h-4 w-4" />
                        </div>
                        <div>
                           <h4 className="text-white font-bold mb-1">Vital Sign Proxy</h4>
                           <p className="text-sm text-slate-400">Analyzing descriptions of breathing rate, pulse quality, and consciousness levels.</p>
                        </div>
                     </div>
                     
                     <div className="flex gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                        <div className="mt-1 h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20 shrink-0">
                           <Thermometer className="h-4 w-4" />
                        </div>
                        <div>
                           <h4 className="text-white font-bold mb-1">Severity & Pain</h4>
                           <p className="text-sm text-slate-400">Quantifying reported pain levels and visible trauma extent (e.g., "bone visible").</p>
                        </div>
                     </div>

                     <div className="flex gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                        <div className="mt-1 h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20 shrink-0">
                           <Timer className="h-4 w-4" />
                        </div>
                        <div>
                           <h4 className="text-white font-bold mb-1">Progression Velocity</h4>
                           <p className="text-sm text-slate-400">Tracking how fast symptoms are worsening. Rapid decline triggers instant Level 1 escalation.</p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Data Visualization Card */}
               <SpotlightCard className="p-8 bg-slate-950 border-slate-800 relative overflow-hidden h-[500px] flex flex-col justify-between">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                     <Activity className="h-64 w-64 text-white" />
                  </div>
                  
                  <div>
                     <h3 className="text-xl font-bold text-white mb-6">Contextual Weighting</h3>
                     <div className="space-y-6">
                        <div>
                           <div className="flex justify-between text-xs text-slate-400 mb-2">
                              <span>Patient Age (Pediatric/Elderly)</span>
                              <span className="text-white">High Sensitivity</span>
                           </div>
                           <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500 w-[90%]" />
                           </div>
                        </div>
                        <div>
                           <div className="flex justify-between text-xs text-slate-400 mb-2">
                              <span>Underlying Conditions</span>
                              <span className="text-white">Critical Multiplier</span>
                           </div>
                           <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-rose-500 w-[85%]" />
                           </div>
                        </div>
                        <div>
                           <div className="flex justify-between text-xs text-slate-400 mb-2">
                              <span>Mechanism of Injury</span>
                              <span className="text-white">Trauma Logic</span>
                           </div>
                           <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-500 w-[70%]" />
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                     <div className="flex items-center gap-3 text-xs text-slate-400">
                        <Shield className="h-4 w-4 text-emerald-500" />
                        <span>Algorithm Directive:</span>
                     </div>
                     <p className="text-white font-mono text-sm mt-2">
                        "If uncertainty &gt; 15%, default to ESCALATION protocol."
                     </p>
                  </div>
               </SpotlightCard>

            </div>
         </div>
      </section>

      {/* --- RESPONSIBILITY BOUNDARIES (Legal & Ethical) --- */}
      <section className="py-24 border-t border-white/5 bg-slate-900/20">
         <div className="mx-auto max-w-4xl px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-12">Operational Boundaries</h2>
            
            <div className="grid md:grid-cols-2 gap-8 text-left">
               <div className="p-6 rounded-2xl bg-emerald-950/10 border border-emerald-500/20">
                  <h3 className="text-emerald-400 font-bold mb-4 flex items-center gap-2">
                     <CheckCircle2 className="h-5 w-5" /> What We Do
                  </h3>
                  <ul className="space-y-3 text-slate-300 text-sm">
                     <li className="flex gap-2"><div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-2" /> Provide evidence-based first aid steps.</li>
                     <li className="flex gap-2"><div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-2" /> Explain complex symptoms clearly.</li>
                     <li className="flex gap-2"><div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-2" /> Guide basic life support (CPR) in real-time.</li>
                     <li className="flex gap-2"><div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-2" /> Offer triage recommendations.</li>
                  </ul>
               </div>

               <div className="p-6 rounded-2xl bg-rose-950/10 border border-rose-500/20">
                  <h3 className="text-rose-400 font-bold mb-4 flex items-center gap-2">
                     <AlertCircle className="h-5 w-5" /> What We Do NOT Do
                  </h3>
                  <ul className="space-y-3 text-slate-300 text-sm">
                     <li className="flex gap-2"><div className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-2" /> Diagnose medical conditions officially.</li>
                     <li className="flex gap-2"><div className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-2" /> Prescribe medications or dosages.</li>
                     <li className="flex gap-2"><div className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-2" /> Replace professional medical judgment.</li>
                     <li className="flex gap-2"><div className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-2" /> Guarantee survival outcomes.</li>
                  </ul>
               </div>
            </div>
         </div>
      </section>

      <Footer />
    </div>
  )
}