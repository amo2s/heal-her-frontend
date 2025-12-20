"use client"

import React from "react"
import { motion, useMotionTemplate, useMotionValue, Variants } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { cn } from "@/lib/utils"
import { 
  CheckCircle, 
  Circle, 
  Target, 
  Flag, 
  Clock, 
  Zap, 
  Server, 
  Smartphone, 
  Activity, 
  Eye, 
  Radio, 
  Users, 
  Shield 
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

export default function RoadmapPage() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30 selection:text-blue-200">
      <GrainOverlay />
      <Navigation />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-900/10 blur-[120px] rounded-full -z-10" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
           <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="mb-8 inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-blue-500/10"
           >
              <Target className="h-8 w-8 text-blue-500" />
           </motion.div>

           <TextReveal 
             text="Strategic Roadmap." 
             className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6"
           />

           <p className="max-w-2xl mx-auto text-lg text-slate-400 leading-relaxed">
             Our vision for the future of MedGuard AI. We are building the infrastructure for the next generation of emergency response.
           </p>
        </div>
      </section>

      {/* --- TIMELINE CONTAINER --- */}
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-32">
         {/* Vertical Connector Line */}
         <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-blue-500 via-purple-500 to-slate-800 md:-translate-x-1/2 opacity-20" />

         {/* --- PHASE 1: FOUNDATION (Completed) --- */}
         <div className="relative mb-24">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8">
               <div className="md:w-1/2 md:pr-12 md:text-right pl-16 md:pl-0 relative">
                  <div className="absolute left-[-2px] md:left-auto md:right-[-6px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] z-10 ring-4 ring-slate-950" />
                  <h2 className="text-3xl font-bold text-white mb-2">Phase 1: Foundation</h2>
                  <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs font-mono border border-emerald-500/20">
                     <CheckCircle className="h-3 w-3" /> STATUS: DEPLOYED
                  </div>
               </div>
               <div className="md:w-1/2 pl-16 md:pl-12 hidden md:block" />
            </div>

            <div className="grid md:grid-cols-2 gap-8 pl-16 md:pl-0">
               <SpotlightCard className="p-6 bg-slate-900/80 md:mr-6">
                  <div className="flex items-center gap-3 mb-4">
                     <Zap className="h-6 w-6 text-emerald-500" />
                     <h3 className="font-bold text-white">Core Emergency Guidance</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-400">
                     <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-emerald-500" /> Natural language assessment</li>
                     <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-emerald-500" /> Life-threatening detection</li>
                     <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-emerald-500" /> Step-by-step first aid instructions</li>
                     <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-emerald-500" /> Automatic 112/911 escalation logic</li>
                  </ul>
               </SpotlightCard>

               <SpotlightCard className="p-6 bg-slate-900/80 md:ml-6">
                  <div className="flex items-center gap-3 mb-4">
                     <Shield className="h-6 w-6 text-emerald-500" />
                     <h3 className="font-bold text-white">Safety & Compliance</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-400">
                     <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-emerald-500" /> HIPAA-ready infrastructure</li>
                     <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-emerald-500" /> Medical protocol validation</li>
                     <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-emerald-500" /> Multi-layer safety guardrails</li>
                     <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-emerald-500" /> Privacy-first data handling</li>
                  </ul>
               </SpotlightCard>
            </div>
         </div>

         {/* --- PHASE 2: EXPANSION (Active) --- */}
         <div className="relative mb-24">
            <div className="flex flex-col md:flex-row-reverse items-center justify-between mb-8">
               <div className="md:w-1/2 md:pl-12 pl-16 relative">
                  <div className="absolute left-[-2px] md:left-[-6px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] z-10 ring-4 ring-slate-950" />
                  <h2 className="text-3xl font-bold text-white mb-2">Phase 2: Expansion</h2>
                  <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-blue-500/10 text-blue-400 text-xs font-mono border border-blue-500/20">
                     <Activity className="h-3 w-3 animate-pulse" /> STATUS: IN PROGRESS (Q2-Q3 2025)
                  </div>
               </div>
               <div className="md:w-1/2 md:pr-12 md:text-right hidden md:block" />
            </div>

            <div className="grid md:grid-cols-2 gap-8 pl-16 md:pl-0">
               {/* Left Column */}
               <div className="space-y-6 md:mr-6 md:text-right">
                  <SpotlightCard className="p-6 bg-slate-900/60 border-l-4 md:border-l-0 md:border-r-4 border-blue-500">
                     <h3 className="font-bold text-white mb-2">Expanded Language Support</h3>
                     <p className="text-sm text-slate-400">Adding Vietnamese, Tagalog, Korean, and regional dialects to serve diverse global communities.</p>
                  </SpotlightCard>
                  <SpotlightCard className="p-6 bg-slate-900/60 border-l-4 md:border-l-0 md:border-r-4 border-blue-500">
                     <h3 className="font-bold text-white mb-2">Voice Interface</h3>
                     <p className="text-sm text-slate-400">Hands-free voice interaction for situations where typing isn't practical or possible.</p>
                  </SpotlightCard>
                  <SpotlightCard className="p-6 bg-slate-900/60 border-l-4 md:border-l-0 md:border-r-4 border-blue-500">
                     <h3 className="font-bold text-white mb-2">Pediatric Specialization</h3>
                     <p className="text-sm text-slate-400">Enhanced guidance specifically for child emergencies with age-appropriate protocols.</p>
                  </SpotlightCard>
               </div>

               {/* Right Column */}
               <div className="space-y-6 md:ml-6">
                  <SpotlightCard className="p-6 bg-slate-900/60 border-l-4 border-blue-500">
                     <h3 className="font-bold text-white mb-2">Offline Mode</h3>
                     <p className="text-sm text-slate-400">Full functionality without internet connection for remote areas and disaster scenarios.</p>
                  </SpotlightCard>
                  <SpotlightCard className="p-6 bg-slate-900/60 border-l-4 border-blue-500">
                     <h3 className="font-bold text-white mb-2">Visual Guidance</h3>
                     <p className="text-sm text-slate-400">Diagrams and animations to supplement text instructions for complex procedures.</p>
                  </SpotlightCard>
                  <SpotlightCard className="p-6 bg-slate-900/60 border-l-4 border-blue-500">
                     <h3 className="font-bold text-white mb-2">Community Features</h3>
                     <p className="text-sm text-slate-400">Verified user stories, educational resources, and community support forums.</p>
                  </SpotlightCard>
               </div>
            </div>
         </div>

         {/* --- PHASE 3: INNOVATION (Future) --- */}
         <div className="relative">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8">
               <div className="md:w-1/2 md:pr-12 md:text-right pl-16 md:pl-0 relative">
                  <div className="absolute left-[-2px] md:left-auto md:right-[-6px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)] z-10 ring-4 ring-slate-950" />
                  <h2 className="text-3xl font-bold text-white mb-2">Phase 3: Innovation</h2>
                  <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-purple-500/10 text-purple-400 text-xs font-mono border border-purple-500/20">
                     <Clock className="h-3 w-3" /> STATUS: PLANNED (2026)
                  </div>
               </div>
               <div className="md:w-1/2 pl-16 md:pl-12 hidden md:block" />
            </div>

            <div className="grid md:grid-cols-2 gap-8 pl-16 md:pl-0">
               <SpotlightCard className="p-6 bg-slate-900/40 md:mr-6 border border-purple-500/20">
                  <div className="flex items-center gap-3 mb-3">
                     <Smartphone className="h-5 w-5 text-purple-500" />
                     <h3 className="font-bold text-white">Wearable Integration</h3>
                  </div>
                  <p className="text-sm text-slate-400 mb-4">Direct integration with smartwatches for automatic fall detection and heart rate anomaly alerts.</p>
               </SpotlightCard>

               <SpotlightCard className="p-6 bg-slate-900/40 md:ml-6 border border-purple-500/20">
                  <div className="flex items-center gap-3 mb-3">
                     <Eye className="h-5 w-5 text-purple-500" />
                     <h3 className="font-bold text-white">Computer Vision Support</h3>
                  </div>
                  <p className="text-sm text-slate-400 mb-4">Real-time video analysis to assess burn severity, wound types, and verify CPR technique.</p>
               </SpotlightCard>

               <SpotlightCard className="p-6 bg-slate-900/40 md:mr-6 border border-purple-500/20">
                  <div className="flex items-center gap-3 mb-3">
                     <Radio className="h-5 w-5 text-purple-500" />
                     <h3 className="font-bold text-white">EMS Data Link</h3>
                  </div>
                  <p className="text-sm text-slate-400 mb-4">Automatic data handover to dispatchers, sharing location and patient vitals before the ambulance arrives.</p>
               </SpotlightCard>

               <SpotlightCard className="p-6 bg-slate-900/40 md:ml-6 border border-purple-500/20">
                  <div className="flex items-center gap-3 mb-3">
                     <Activity className="h-5 w-5 text-purple-500" />
                     <h3 className="font-bold text-white">Predictive Guidance</h3>
                  </div>
                  <p className="text-sm text-slate-400 mb-4">Proactive health monitoring algorithms to detect early warning signs of chronic condition flare-ups.</p>
               </SpotlightCard>
            </div>
         </div>

      </div>

      {/* --- COMMUNITY INPUT --- */}
      <section className="py-24 border-t border-white/5 bg-slate-900/20">
         <div className="mx-auto max-w-3xl px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Your Voice Shapes Our Roadmap</h2>
            <p className="text-lg leading-relaxed text-slate-400 mb-8">
               This roadmap is not static. It evolves based on user feedback, community needs, and medical advisory input. If you have ideas for features that would help your community, we want to hear from you.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 text-sm font-mono">
               <Users className="h-4 w-4" /> Suggest a Feature: <span className="text-white">medguardai@gmail.com</span>
            </div>
         </div>
      </section>

      <Footer />
    </div>
  )
}