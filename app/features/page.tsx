"use client"

import React from "react"
import { motion, useMotionTemplate, useMotionValue, Variants } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { cn } from "@/lib/utils"
import {
  AlertTriangle,
  Heart,
  Phone,
  Globe,
  Shield,
  Clock,
  MessageSquare,
  Users,
  Zap,
  Activity,
  CheckCircle,
  Brain,
  Cpu,
  Lock,
  Scan,
  Radio
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

// --- FEATURE DATA ---

const INTELLIGENCE_FEATURES = [
  {
    icon: MessageSquare,
    title: "Conversational Core",
    desc: "Communicate naturally. No jargon required. The NLP engine parses panic and extracts medical facts instantly.",
    color: "blue"
  },
  {
    icon: Phone,
    title: "Smart Triage",
    desc: "Real-time assessment engine determines if you need 911, urgent care, or home treatment.",
    color: "indigo"
  },
  {
    icon: Brain,
    title: "Context Awareness",
    desc: "Adjusts guidance based on patient age and history. Pediatric instructions differ from Adult protocols.",
    color: "violet"
  }
]

const SAFETY_FEATURES = [
  {
    icon: Scan,
    title: "Emergency Detection",
    desc: "Background monitoring for 'trigger words' (e.g., 'not breathing', 'blue lips') that force immediate 911 escalation.",
    color: "rose"
  },
  {
    icon: Shield,
    title: "Privacy Vault",
    desc: "Healthcare-grade encryption. Your data is processed in a secure enclave and never sold.",
    color: "emerald"
  },
  {
    icon: CheckCircle,
    title: "Safety Guardrails",
    desc: "Dual-layer validation ensures AI never hallucinates dangerous medical advice.",
    color: "teal"
  }
]

const ACCESSIBILITY_FEATURES = [
  {
    icon: Globe,
    title: "Universal Translator",
    desc: "500+ Languages supported in real-time. Medical care should not have a language barrier.",
    color: "cyan"
  },
  {
    icon: Clock,
    title: "Zero Latency",
    desc: "Always awake. 24/7/365. No queues, no hold music, no waiting rooms.",
    color: "sky"
  },
  {
    icon: Users,
    title: "Family Mode",
    desc: "Specific UI modes for caregivers, parents, and bystanders to reduce cognitive load.",
    color: "orange"
  }
]

// --- PAGE COMPONENT ---

export default function FeaturesPage() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30 selection:text-blue-200">
      <GrainOverlay />
      <Navigation />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full -z-10" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
           <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="mb-8 inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-blue-500/10"
           >
              <Cpu className="h-8 w-8 text-blue-500" />
           </motion.div>

           <TextReveal 
             text="System Capabilities." 
             className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6"
           />

           <p className="max-w-2xl mx-auto text-lg text-slate-400 leading-relaxed">
             A breakdown of the modules that make MedGuard AI the most advanced emergency companion on the market.
           </p>
        </div>
      </section>

      {/* --- MODULE 1: INTELLIGENCE --- */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
           <div className="flex items-center gap-4 mb-12">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-blue-500/50" />
              <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-mono tracking-widest uppercase">
                 <Brain className="h-4 w-4" /> Intelligence Layer
              </div>
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-blue-500/50" />
           </div>

           <div className="grid md:grid-cols-3 gap-8">
              {INTELLIGENCE_FEATURES.map((feature, i) => (
                 <SpotlightCard key={i} className="p-8 h-full bg-slate-900/60">
                    <div className="mb-6 w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                       <feature.icon className="h-6 w-6 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                       {feature.title}
                       <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                    </h3>
                    <p className="text-slate-400 leading-relaxed text-sm">
                       {feature.desc}
                    </p>
                 </SpotlightCard>
              ))}
           </div>
        </div>
      </section>

      {/* --- MODULE 2: SAFETY (Highlighted) --- */}
      <section className="py-20 bg-slate-900/30 border-y border-white/5 relative overflow-hidden">
        {/* Radar Animation Background */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-10 pointer-events-none">
           <div className="absolute inset-0 border border-rose-500/30 rounded-full animate-[ping_4s_linear_infinite]" />
           <div className="absolute inset-[15%] border border-rose-500/40 rounded-full animate-[ping_4s_linear_infinite_1s]" />
           <div className="absolute inset-[30%] border border-rose-500/50 rounded-full animate-[ping_4s_linear_infinite_2s]" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
           <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div>
                 <h2 className="text-3xl font-bold text-white mb-2">Safety & Privacy Protocols</h2>
                 <p className="text-slate-400">Non-negotiable guardrails built into the core.</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono uppercase">
                 <Radio className="h-3 w-3 animate-pulse" /> Active Monitoring
              </div>
           </div>

           <div className="grid lg:grid-cols-2 gap-6">
              {/* Feature 1 (Large) */}
              <SpotlightCard className="p-8 lg:col-span-2 flex flex-col md:flex-row items-center gap-8 bg-gradient-to-br from-rose-900/20 to-slate-900">
                 <div className="relative shrink-0">
                    <div className="w-20 h-20 rounded-full bg-rose-500/20 flex items-center justify-center animate-pulse">
                       <AlertTriangle className="h-10 w-10 text-rose-500" />
                    </div>
                 </div>
                 <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Real-Time Threat Detection</h3>
                    <p className="text-slate-300 leading-relaxed mb-4">
                       Our "Watchdog" algorithm runs in parallel to the conversation. It listens specifically for keywords indicating imminent life threats (cardiac arrest, stroke, severe bleeding) and prepares an automated 911 handover packet instantly.
                    </p>
                    <div className="flex gap-2">
                       <span className="px-2 py-1 bg-rose-500/20 rounded text-xs font-mono text-rose-400 border border-rose-500/30">LATENCY: &lt;10ms</span>
                       <span className="px-2 py-1 bg-rose-500/20 rounded text-xs font-mono text-rose-400 border border-rose-500/30">ACCURACY: 99.9%</span>
                    </div>
                 </div>
              </SpotlightCard>

              {/* Feature 2 & 3 (Smaller) */}
              {SAFETY_FEATURES.slice(1).map((feature, i) => (
                 <SpotlightCard key={i} className="p-8 bg-slate-900/60">
                    <div className="flex items-center gap-4 mb-4">
                       <feature.icon className={`h-6 w-6 text-${feature.color}-400`} />
                       <h3 className="text-lg font-bold text-white">{feature.title}</h3>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                 </SpotlightCard>
              ))}
           </div>
        </div>
      </section>

      {/* --- MODULE 3: ACCESSIBILITY --- */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
           <div className="flex items-center gap-4 mb-12">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-emerald-500/50" />
              <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-mono tracking-widest uppercase">
                 <Globe className="h-4 w-4" /> Global Access
              </div>
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-emerald-500/50" />
           </div>

           <div className="grid md:grid-cols-3 gap-8">
              {ACCESSIBILITY_FEATURES.map((feature, i) => (
                 <SpotlightCard key={i} className="p-8 h-full bg-slate-900/60">
                    <div className="mb-6 w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                       <feature.icon className="h-6 w-6 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                       {feature.title}
                    </h3>
                    <p className="text-slate-400 leading-relaxed text-sm">
                       {feature.desc}
                    </p>
                 </SpotlightCard>
              ))}
           </div>
        </div>
      </section>

      {/* --- CTA --- */}
      <section className="py-24">
         <div className="mx-auto max-w-3xl px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Built for the real world.</h2>
            <p className="text-slate-400 mb-8">
               Technology is only useful if it works when everything else is falling apart. MedGuard is designed for chaos.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
               {[
                 { label: "Uptime", val: "99.99%" },
                 { label: "Encryption", val: "AES-256" },
                 { label: "Response", val: "<0.5s" },
                 { label: "Cost", val: "$0" },
               ].map((stat, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-900 border border-white/5">
                     <div className="text-xl font-bold text-white">{stat.val}</div>
                     <div className="text-xs text-slate-500 uppercase tracking-wide">{stat.label}</div>
                  </div>
               ))}
            </div>
         </div>
      </section>

      <Footer />
    </div>
  )
}