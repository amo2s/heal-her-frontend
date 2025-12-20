"use client"

import React from "react"
import Link from "next/link"
import { motion, useMotionTemplate, useMotionValue, useScroll, useTransform, Variants } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Brain,
  MessageSquare,
  Phone,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Cpu,
  Database,
  ShieldCheck,
  Zap,
  Activity,
  Ear,
  ScanLine
} from "lucide-react"

// --- REUSED PRO COMPONENTS ---

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
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.04 * i + delay },
    }),
  }
  
  const child: Variants = {
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: "blur(0px)", 
      transition: { type: "spring", damping: 12, stiffness: 100 } 
    },
    hidden: { 
      opacity: 0, 
      y: 20, 
      filter: "blur(10px)", 
      transition: { type: "spring", damping: 12, stiffness: 100 } 
    },
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

export default function HowItWorksPage() {
  const { scrollYProgress } = useScroll()
  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1])

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30 selection:text-blue-200">
      <GrainOverlay />
      <Navigation />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
           <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.8 }}
             className="mb-8 inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl shadow-blue-500/10"
           >
             <Cpu className="h-10 w-10 text-blue-500" />
           </motion.div>

           <TextReveal 
             text="The Logic Behind the Calm." 
             className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6"
           />

           <p className="max-w-2xl mx-auto text-lg text-slate-400 leading-relaxed">
             A look inside the "Digital Brain." How MedGuard AI processes panic into precision in under 500 milliseconds.
           </p>
        </div>
      </section>

      {/* --- THE FLOW (Vertical Timeline) --- */}
      <section className="relative py-24">
        {/* Central connecting line */}
        <div className="absolute left-4 lg:left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-blue-500/30 to-transparent lg:-translate-x-1/2" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-24 relative z-10">
           
           {/* STEP 1: INPUT */}
           <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="lg:text-right pl-12 lg:pl-0 lg:pr-16 relative">
                 {/* Timeline Node */}
                 <div className="absolute left-[-5px] lg:left-auto lg:right-[-38px] top-2 h-3 w-3 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,1)] z-20" />
                 
                 <h3 className="text-sm font-mono text-blue-400 mb-2">SEQUENCE 01</h3>
                 <h2 className="text-3xl font-bold text-white mb-4">Input & Normalization</h2>
                 <p className="text-slate-400 leading-relaxed">
                    You speak naturally. "My chest hurts." MedGuard ignores the stuttering and panic, using NLP to extract the core medical symptoms instantly.
                 </p>
              </div>
              <div className="pl-12 lg:pl-0">
                 <SpotlightCard className="p-6 bg-slate-900/80">
                    <div className="flex items-start gap-4">
                       <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                          <Ear className="h-6 w-6" />
                       </div>
                       <div className="space-y-3 w-full">
                          <div className="bg-slate-800/50 p-3 rounded-lg border border-white/5">
                             <p className="text-xs text-slate-500 uppercase mb-1">Raw Input</p>
                             <p className="text-slate-300 italic">"I... I think he's... he stopped breathing... oh god..."</p>
                          </div>
                          <div className="flex justify-center">
                             <ArrowRight className="h-4 w-4 text-slate-600 rotate-90" />
                          </div>
                          <div className="bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                             <p className="text-xs text-emerald-500 uppercase mb-1">Extracted Parameters</p>
                             <p className="text-emerald-400 font-mono text-sm">Subject: MALE | Status: UNCONSCIOUS | Respiration: ABSENT</p>
                          </div>
                       </div>
                    </div>
                 </SpotlightCard>
              </div>
           </div>

           {/* STEP 2: TRIAGE ENGINE */}
           <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="lg:order-2 pl-12 lg:pl-16 relative">
                 {/* Timeline Node */}
                 <div className="absolute left-[-5px] top-2 h-3 w-3 rounded-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,1)] z-20" />
                 
                 <h3 className="text-sm font-mono text-indigo-400 mb-2">SEQUENCE 02</h3>
                 <h2 className="text-3xl font-bold text-white mb-4">Protocol Matching</h2>
                 <p className="text-slate-400 leading-relaxed">
                    The engine references a localized database of medical protocols. It calculates severity scores in milliseconds to determine the threat level.
                 </p>
              </div>
              <div className="lg:order-1 pl-12 lg:pl-0">
                 <SpotlightCard className="p-6 bg-slate-900/80">
                    <div className="flex items-center gap-4 mb-6">
                       <ScanLine className="h-6 w-6 text-indigo-400 animate-pulse" />
                       <div className="h-1 flex-1 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full w-3/4 bg-indigo-500" />
                       </div>
                       <span className="text-xs font-mono text-indigo-400">ANALYZING</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                       {['Cardiac', 'Respiratory', 'Trauma', 'Toxicology'].map((item) => (
                          <div key={item} className="p-3 bg-slate-800/50 rounded-lg border border-white/5 flex justify-between items-center">
                             <span className="text-sm text-slate-300">{item}</span>
                             <div className="h-2 w-2 rounded-full bg-slate-600" />
                          </div>
                       ))}
                    </div>
                 </SpotlightCard>
              </div>
           </div>

           {/* STEP 3: THE DECISION (Special Logic Card) */}
           <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="lg:text-right pl-12 lg:pl-0 lg:pr-16 relative">
                 {/* Timeline Node (Alert Color) */}
                 <div className="absolute left-[-5px] lg:left-auto lg:right-[-38px] top-2 h-3 w-3 rounded-full bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,1)] z-20 animate-pulse" />
                 
                 <h3 className="text-sm font-mono text-rose-400 mb-2">CRITICAL CHECK</h3>
                 <h2 className="text-3xl font-bold text-white mb-4">The Safety Fork</h2>
                 <p className="text-slate-400 leading-relaxed">
                    If life-threatening markers are found, the "Calm Voice" instantly shifts to "Escalation Mode," triggering EMS dialing while providing CPR beats.
                 </p>
              </div>
              <div className="pl-12 lg:pl-0">
                 <div className="relative p-[1px] rounded-3xl bg-gradient-to-br from-rose-500/50 to-slate-800">
                    <div className="bg-slate-950 rounded-3xl p-6 relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-4 opacity-20">
                          <AlertTriangle className="h-24 w-24 text-rose-500" />
                       </div>
                       <div className="relative z-10 space-y-4">
                          <div className="flex items-center gap-3">
                             <Phone className="h-6 w-6 text-rose-500" />
                             <h3 className="text-lg font-bold text-white">Escalation Triggered</h3>
                          </div>
                          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                             <p className="text-sm font-mono text-rose-400 mb-2">&gt; DETECTED: NO_PULSE</p>
                             <p className="text-sm font-mono text-rose-400 mb-2">&gt; ACTION: DIAL_EMS(Loc)</p>
                             <p className="text-sm font-mono text-rose-400">&gt; ACTION: INITIATE_CPR_PROTOCOL</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* STEP 4: OUTPUT */}
           <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="lg:order-2 pl-12 lg:pl-16 relative">
                 {/* Timeline Node */}
                 <div className="absolute left-[-5px] top-2 h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,1)] z-20" />
                 
                 <h3 className="text-sm font-mono text-emerald-400 mb-2">SEQUENCE 04</h3>
                 <h2 className="text-3xl font-bold text-white mb-4">Audio-Visual Guidance</h2>
                 <p className="text-slate-400 leading-relaxed">
                    The AI generates audio instructions at a specific cadence to reduce listener heart rate, accompanied by simple visual loops.
                 </p>
              </div>
              <div className="lg:order-1 pl-12 lg:pl-0">
                 <SpotlightCard className="p-6 bg-slate-900/80">
                    <div className="space-y-4">
                       <div className="flex items-center gap-3 mb-2">
                          <Activity className="h-5 w-5 text-emerald-400" />
                          <span className="text-sm font-bold text-white">Guidance Interface</span>
                       </div>
                       <div className="p-4 bg-slate-800 rounded-xl border-l-4 border-emerald-500">
                          <p className="text-white text-lg font-medium">"Place hands on center of chest."</p>
                       </div>
                       <div className="p-4 bg-slate-800/50 rounded-xl border-l-4 border-emerald-500/30">
                          <p className="text-slate-400 text-base">"Push hard and fast."</p>
                       </div>
                    </div>
                 </SpotlightCard>
              </div>
           </div>

        </div>
      </section>

      {/* --- TECH SPECS (Grid) --- */}
      <section className="py-24 bg-slate-900/20 border-t border-white/5">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white text-center mb-16">System Capabilities</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
               {[
                  { icon: MessageSquare, title: "NLP Engine", desc: "Understands 50+ languages and dialects, even through heavy breathing or crying." },
                  { icon: Database, title: "Offline Mode", desc: "Core protocols are cached on-device. Works even when the signal drops." },
                  { icon: ShieldCheck, title: "Double-Check Guard", desc: "Outputs are run against a secondary safety algorithm before being spoken." },
                  { icon: Brain, title: "Context Awareness", desc: "Adapts instructions based on patient age (child vs adult) extracted from speech." },
                  { icon: Activity, title: "Pacing Algorithms", desc: "Adjusts speech speed based on user's stress level and responsiveness." },
                  { icon: Zap, title: "Instant Boot", desc: "App launches and is listening in under 800ms. No splash screens. No delays." },
               ].map((item, i) => (
                  <SpotlightCard key={i} className="p-8 hover:bg-slate-800/80 transition-colors">
                     <item.icon className="h-8 w-8 text-blue-500 mb-4" />
                     <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                     <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                  </SpotlightCard>
               ))}
            </div>
         </div>
      </section>

      {/* --- CTA --- */}
      <section className="py-24 relative overflow-hidden">
         <div className="absolute inset-0 bg-blue-600/10" />
         <div className="mx-auto max-w-4xl px-4 text-center relative z-10">
            <h2 className="text-4xl font-bold text-white mb-6">See the code in action.</h2>
            <p className="text-lg text-blue-200 mb-8">
               Experience the speed and calm of MedGuard AI right now.
            </p>
            <Button size="lg" className="h-14 rounded-full bg-white text-blue-900 text-lg font-bold hover:bg-blue-50 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]">
               {/* UPDATED: Direct link to the AI app */}
               <Link href="https://med-guard-ai.vercel.app" className="flex items-center gap-2">
                  Launch Demo <ArrowRight className="h-5 w-5" />
               </Link>
            </Button>
         </div>
      </section>

      <Footer />
    </div>
  )
}