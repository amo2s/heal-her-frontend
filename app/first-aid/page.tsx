"use client"

import React from "react"
import { motion, useMotionTemplate, useMotionValue, Variants } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { cn } from "@/lib/utils"
import { 
  Heart, 
  Thermometer, 
  Scissors, 
  Shield, 
  CheckCircle2, 
  XCircle, 
  Stethoscope, 
  Zap, 
  AlertTriangle, 
  Activity,
  Flame,
  Bug
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

export default function FirstAidPage() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30 selection:text-blue-200">
      <GrainOverlay />
      <Navigation />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-rose-900/20 via-slate-950 to-slate-950 -z-10" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
           <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="mb-8 inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-rose-500/10"
           >
              <Heart className="h-8 w-8 text-rose-500" />
           </motion.div>

           <TextReveal 
             text="Clinical Scope." 
             className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6"
           />

           <p className="max-w-2xl mx-auto text-lg text-slate-400 leading-relaxed">
             Understanding the operational boundaries of MedGuard AI. We provide clarity on what we treat, and when to escalate to professional care.
           </p>
        </div>
      </section>

      {/* --- COVERAGE MATRIX (Green Zone) --- */}
      <section className="py-20 border-y border-white/5 bg-slate-900/20">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-12">
               <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
               <h2 className="text-sm font-mono text-emerald-500 uppercase tracking-widest">Active Protocols</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
               
               <SpotlightCard className="p-8 h-full bg-slate-950 border-slate-800">
                  <div className="mb-6 flex items-center justify-between">
                     <div className="p-3 bg-rose-500/10 rounded-lg text-rose-400">
                        <Scissors className="h-6 w-6" />
                     </div>
                     <span className="text-[10px] font-mono text-slate-600">ID: TRAUMA-01</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Wounds & Bleeding</h3>
                  <ul className="space-y-3 text-sm text-slate-400">
                     <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Minor cuts and scrapes</li>
                     <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Nosebleeds</li>
                     <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Abrasions and road rash</li>
                     <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Puncture wounds (triage)</li>
                  </ul>
               </SpotlightCard>

               <SpotlightCard className="p-8 h-full bg-slate-950 border-slate-800">
                  <div className="mb-6 flex items-center justify-between">
                     <div className="p-3 bg-orange-500/10 rounded-lg text-orange-400">
                        <Flame className="h-6 w-6" />
                     </div>
                     <span className="text-[10px] font-mono text-slate-600">ID: THERMAL-02</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Burns & Temperature</h3>
                  <ul className="space-y-3 text-sm text-slate-400">
                     <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> 1st & 2nd degree burns</li>
                     <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Sunburn management</li>
                     <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Heat exhaustion</li>
                     <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Frostbite / Hypothermia</li>
                  </ul>
               </SpotlightCard>

               <SpotlightCard className="p-8 h-full bg-slate-950 border-slate-800">
                  <div className="mb-6 flex items-center justify-between">
                     <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                        <Activity className="h-6 w-6" />
                     </div>
                     <span className="text-[10px] font-mono text-slate-600">ID: ORTHO-03</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Musculoskeletal</h3>
                  <ul className="space-y-3 text-sm text-slate-400">
                     <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Sprains and strains</li>
                     <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Fracture stabilization</li>
                     <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Muscle cramps</li>
                     <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Non-traumatic back pain</li>
                  </ul>
               </SpotlightCard>

               <SpotlightCard className="p-8 h-full bg-slate-950 border-slate-800">
                  <div className="mb-6 flex items-center justify-between">
                     <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400">
                        <Bug className="h-6 w-6" />
                     </div>
                     <span className="text-[10px] font-mono text-slate-600">ID: IMMUNO-04</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Allergies & Reactions</h3>
                  <ul className="space-y-3 text-sm text-slate-400">
                     <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Mild allergic reactions</li>
                     <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Insect bites and stings</li>
                     <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Poison ivy/oak exposure</li>
                     <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Mild food allergies</li>
                  </ul>
               </SpotlightCard>

               <SpotlightCard className="p-8 h-full bg-slate-950 border-slate-800">
                  <div className="mb-6 flex items-center justify-between">
                     <div className="p-3 bg-teal-500/10 rounded-lg text-teal-400">
                        <Thermometer className="h-6 w-6" />
                     </div>
                     <span className="text-[10px] font-mono text-slate-600">ID: GENERAL-05</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Common Illnesses</h3>
                  <ul className="space-y-3 text-sm text-slate-400">
                     <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Fever management</li>
                     <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Dehydration checks</li>
                     <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Nausea and vomiting</li>
                     <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Diarrhea management</li>
                  </ul>
               </SpotlightCard>

               <SpotlightCard className="p-8 h-full bg-slate-950 border-slate-800">
                  <div className="mb-6 flex items-center justify-between">
                     <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400">
                        <Shield className="h-6 w-6" />
                     </div>
                     <span className="text-[10px] font-mono text-slate-600">ID: ENVIRO-06</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Environmental</h3>
                  <ul className="space-y-3 text-sm text-slate-400">
                     <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Snake/Animal bites</li>
                     <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Poisoning (guidance)</li>
                     <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Drowning (rescue steps)</li>
                     <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Altitude sickness</li>
                  </ul>
               </SpotlightCard>

            </div>
         </div>
      </section>

      {/* --- EXCLUSIONS (Red Zone) --- */}
      <section className="py-24">
         <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-3xl font-bold text-white">Operational Exclusions</h2>
               <div className="px-3 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono uppercase">
                  Out of Scope
               </div>
            </div>

            <div className="relative rounded-3xl border border-rose-500/20 bg-rose-950/5 overflow-hidden">
               <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                  <AlertTriangle className="h-48 w-48 text-rose-500" />
               </div>
               
               <div className="p-8 relative z-10">
                  <p className="text-lg text-slate-300 mb-8 max-w-2xl">
                     MedGuard AI is an emergency bridge, not a hospital. The following scenarios require <span className="text-white font-bold">immediate professional intervention</span> and are outside our guidance algorithms:
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-x-12 gap-y-4">
                     {[
                        "Chronic disease management",
                        "Mental health crises",
                        "Prescription medication advice",
                        "Pregnancy complications",
                        "Surgical procedures",
                        "Cancer treatment",
                        "Complex medical diagnoses",
                        "Invasive treatments",
                        "Long-term care planning",
                        "Medication interactions",
                        "Psychiatric emergencies",
                        "Substance abuse treatment"
                     ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 py-2 border-b border-rose-500/10">
                           <XCircle className="h-5 w-5 text-rose-500 shrink-0" />
                           <span className="text-slate-400 text-sm">{item}</span>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* --- ESCALATION PROTOCOL --- */}
      <section className="py-20 border-t border-white/5 bg-slate-900/30">
         <div className="mx-auto max-w-3xl px-4 text-center">
            <div className="mb-6 inline-flex items-center justify-center h-16 w-16 rounded-full bg-slate-900 border border-slate-800 shadow-xl">
               <Stethoscope className="h-8 w-8 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-6">Escalation Protocol</h2>
            <div className="text-left bg-slate-950 rounded-2xl p-8 border border-slate-800 shadow-lg">
               <p className="text-slate-400 mb-6 font-medium">
                  The AI is programmed to force an escalation to professional care if:
               </p>
               <ul className="space-y-4">
                  {[
                     "Symptoms worsen despite initial first aid application.",
                     "User input indicates uncertainty about severity (High-Risk Flag).",
                     "Pain levels are reported as 'Severe' or 'Unmanageable'.",
                     "The patient is identified as an infant, elderly, or high-risk.",
                     "Symptoms persist beyond the expected acute recovery window."
                  ].map((item, i) => (
                     <li key={i} className="flex gap-4">
                        <div className="h-6 w-6 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 text-xs font-bold shrink-0">
                           {i + 1}
                        </div>
                        <span className="text-slate-300 text-sm">{item}</span>
                     </li>
                  ))}
               </ul>
               <div className="mt-8 pt-6 border-t border-slate-800 text-center">
                  <p className="text-xs text-slate-500">
                     SYSTEM DIRECTIVE: When in doubt, the algorithm defaults to "SEEK PROFESSIONAL CARE."
                  </p>
               </div>
            </div>
         </div>
      </section>

      <Footer />
    </div>
  )
}