"use client"

import React, { useState, useEffect } from "react"
import { motion, useMotionTemplate, useMotionValue, useScroll, useTransform, Variants, useInView } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { cn } from "@/lib/utils"
import {
  Heart,
  Shield,
  Globe,
  Zap,
  Activity,
  Brain,
  Lock,
  MessageCircle,
  Stethoscope,
  Radio,
  Cpu,
  Sparkles,
  Fingerprint,
  ArrowRight,
  Clock,
  Server,
  Code,
  Database
} from "lucide-react"

// --- ANIMATION VARIANTS ---

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
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

// A card that glows when you hover over it
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
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
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

// Typewriter effect for scenarios
const TypewriterText = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState("")
  const ref = React.useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })

  useEffect(() => {
    if (isInView) {
      let i = 0
      const timer = setInterval(() => {
        if (i < text.length) {
          setDisplayedText((prev) => prev + text.charAt(i))
          i++
        } else {
          clearInterval(timer)
        }
      }, 30) // Speed of typing
      return () => clearInterval(timer)
    }
  }, [isInView, text])

  return <span ref={ref}>{displayedText}</span>
}

// Text Reveal for Headlines
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

const CORE_MODULES = [
  {
    icon: Brain,
    title: "Empathy Engine",
    desc: "Uses advanced Sentiment Analysis to detect fear, curiosity, or pain, adjusting the AI's tone from 'Clinical' to 'Sisterly' instantly.",
    color: "text-[#DA8CA0]",
    bg: "bg-[#DA8CA0]/10"
  },
  {
    icon: Shield,
    title: "Guardian Protocol",
    desc: "A dedicated safety layer that scans every interaction for self-harm, abuse, or critical medical emergencies before replying.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10"
  },
  {
    icon: Globe,
    title: "Polyglot Core",
    desc: "Native understanding of English, Pidgin, Hausa, Yoruba, and Igbo, ensuring no girl is left behind due to language barriers.",
    color: "text-blue-400",
    bg: "bg-blue-500/10"
  }
]

// --- PAGE COMPONENT ---

export default function FeaturesPage() {
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], [0, -50])

  return (
    <div className="relative min-h-screen bg-[#1C1246] text-[#FAFAFA] selection:bg-[#DA8CA0]/30 selection:text-[#DA8CA0]">
      <GrainOverlay />
      <Navigation />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 overflow-hidden min-h-[60vh] flex flex-col justify-center">
        {/* Animated Background Blob */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#DA8CA0]/10 blur-[120px] rounded-full -z-10 animate-pulse" style={{ animationDuration: '8s' }} />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
           <motion.div
             initial={{ opacity: 0, scale: 0.5 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.8, type: "spring" }}
             className="mb-8 inline-flex items-center justify-center h-24 w-24 rounded-3xl bg-[#231854] border border-[#DA8CA0]/20 shadow-2xl shadow-[#DA8CA0]/10"
           >
             <Cpu className="h-12 w-12 text-[#DA8CA0]" />
           </motion.div>

           <motion.div style={{ y }}>
             <TextReveal 
               text="The Brain & The Heart." 
               className="text-5xl md:text-8xl font-bold tracking-tight text-white mb-6"
             />
           </motion.div>

           <motion.p 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.5 }}
             className="max-w-2xl mx-auto text-lg text-[#CCCCD9] leading-relaxed"
           >
             Heal Her combines the precision of a medical database with the warmth of a best friend. Explore the technology that makes it possible.
           </motion.p>
        </div>
      </section>

      {/* --- NEW SECTION: SYSTEM HEARTBEAT (The Extra Section) --- */}
      <section className="py-12 border-y border-white/5 bg-[#231854]/30 overflow-hidden">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="flex items-center gap-4">
                  <div className="relative">
                     <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-75" />
                     <div className="relative h-3 w-3 bg-emerald-500 rounded-full" />
                  </div>
                  <h3 className="text-sm font-mono text-emerald-400">SYSTEM STATUS: OPERATIONAL</h3>
               </div>
               
               {/* Simulated Live Metrics */}
               <div className="grid grid-cols-3 gap-8 w-full md:w-auto">
                  <div className="text-center">
                     <p className="text-[10px] text-[#CCCCD9] uppercase tracking-wider mb-1">Latency</p>
                     <p className="text-xl font-bold text-white font-mono">42ms</p>
                  </div>
                  <div className="text-center">
                     <p className="text-[10px] text-[#CCCCD9] uppercase tracking-wider mb-1">Active Threads</p>
                     <p className="text-xl font-bold text-white font-mono">842</p>
                  </div>
                  <div className="text-center">
                     <p className="text-[10px] text-[#CCCCD9] uppercase tracking-wider mb-1">Safety Checks</p>
                     <p className="text-xl font-bold text-emerald-400 font-mono">100%</p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* --- MODULE 1: THE CORE TRIAD --- */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
           <motion.div 
             variants={staggerContainer}
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true }}
             className="grid md:grid-cols-3 gap-8"
           >
              {CORE_MODULES.map((feature, i) => (
                 <motion.div key={i} variants={fadeInUp} className="h-full">
                   <SpotlightCard className="p-8 h-full bg-[#1C1246] border-[#DA8CA0]/10">
                      <div className={`mb-6 w-14 h-14 rounded-2xl flex items-center justify-center border border-white/5 ${feature.bg}`}>
                         <feature.icon className={`h-7 w-7 ${feature.color}`} />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                         {feature.title}
                      </h3>
                      <p className="text-[#CCCCD9] leading-relaxed text-sm">
                         {feature.desc}
                      </p>
                   </SpotlightCard>
                 </motion.div>
              ))}
           </motion.div>
        </div>
      </section>

      {/* --- ANATOMY OF AN ANSWER (Animated Pipeline) --- */}
      <section className="py-24 bg-[#231854]/30 border-y border-white/5 relative overflow-hidden">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
               <h2 className="text-3xl font-bold text-white mb-4">The Anatomy of an Answer</h2>
               <p className="text-[#CCCCD9]">How a raw question becomes a safe, helpful response in 0.5 seconds.</p>
            </div>

            <div className="relative">
               {/* Animated Connecting Line (Desktop) */}
               <svg className="hidden md:block absolute top-12 left-0 right-0 w-full h-20 overflow-visible z-0">
                  <motion.path 
                     d="M 100 20 L 300 20 L 600 20 L 900 20"
                     stroke="#DA8CA0"
                     strokeWidth="2"
                     strokeDasharray="10 10"
                     fill="none"
                     initial={{ pathLength: 0, opacity: 0 }}
                     whileInView={{ pathLength: 1, opacity: 0.3 }}
                     transition={{ duration: 2, ease: "easeInOut" }}
                  />
               </svg>

               <div className="grid md:grid-cols-4 gap-8">
                  {[
                     { step: "01", title: "Ingest", icon: MessageCircle, text: "User Input: 'My chest hurts and I'm scared.' NLP parses symptoms vs. emotion." },
                     { step: "02", title: "Safety Scan", icon: Radio, text: "Red Flag Detected? Check against emergency database. Result: Safe to proceed." },
                     { step: "03", title: "Fact Retrieval", icon: Database, text: "Query Verified Medical DB. Retrieve: 'Panic Attack Symptoms' & 'Grounding Techniques'." },
                     { step: "04", title: "Empathy Layer", icon: Sparkles, text: "Rewrite facts into 'Sisterly Tone'. Add reassurance. Final Output Generated." }
                  ].map((item, i) => (
                     <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.3 }}
                        className="relative pt-8 group"
                     >
                        {/* Step Circle */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#1C1246] border-2 border-[#DA8CA0] flex items-center justify-center text-xs font-bold text-[#DA8CA0] z-10 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(218,140,160,0.3)]">
                           {item.step}
                        </div>
                        
                        <SpotlightCard className="p-6 h-full bg-[#1C1246] border-[#DA8CA0]/10 text-center">
                           <item.icon className="h-8 w-8 text-[#DA8CA0] mx-auto mb-4 group-hover:animate-bounce" />
                           <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                           <p className="text-xs text-[#CCCCD9] leading-relaxed">{item.text}</p>
                        </SpotlightCard>
                     </motion.div>
                  ))}
               </div>
            </div>
         </div>
      </section>

      {/* --- REAL WORLD SCENARIOS (Typewriter Effect) --- */}
      <section className="py-24">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white text-center mb-16">Moments We Are There</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
               <SpotlightCard className="p-8 bg-[#231854]/20 border-l-4 border-l-purple-500">
                  <div className="flex justify-between items-start mb-6">
                     <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
                        <Clock className="h-6 w-6" />
                     </div>
                     <span className="text-xs font-mono text-[#CCCCD9] bg-white/5 px-2 py-1 rounded">SCENARIO: 01</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">The "2 AM Scare"</h3>
                  <p className="text-[#CCCCD9] text-sm mb-6 italic">
                     "It's the middle of the night. I feel a lump. I can't wake my mom yet."
                  </p>
                  <div className="p-4 bg-[#1C1246] rounded-lg border border-purple-500/20">
                     <p className="text-sm text-purple-200 font-mono">
                        <strong>Heal Her:</strong> <TypewriterText text= "Don't panic, sis. Lumps can happen for many reasons, often just hormones. Here is how to check properly..." />
                     </p>
                  </div>
               </SpotlightCard>

               <SpotlightCard className="p-8 bg-[#231854]/20 border-l-4 border-l-emerald-500">
                  <div className="flex justify-between items-start mb-6">
                     <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                        <Stethoscope className="h-6 w-6" />
                     </div>
                     <span className="text-xs font-mono text-[#CCCCD9] bg-white/5 px-2 py-1 rounded">SCENARIO: 02</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">The "Village Clinic"</h3>
                  <p className="text-[#CCCCD9] text-sm mb-6 italic">
                     "The doctor is 2 hours away. My sister cut her leg and it won't stop bleeding."
                  </p>
                  <div className="p-4 bg-[#1C1246] rounded-lg border border-emerald-500/20">
                     <p className="text-sm text-emerald-200 font-mono">
                        <strong>Heal Her:</strong> <TypewriterText text= "EMERGENCY MODE: Apply firm pressure with a clean cloth NOW. Elevate the leg above heart level. Do not remove the cloth." />
                     </p>
                  </div>
               </SpotlightCard>
            </div>
         </div>
      </section>

      {/* --- NEW SECTION: CONTINUOUS LEARNING LOOP --- */}
      <section className="py-24 bg-[#231854]/20 border-t border-white/5">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
               <motion.div 
                 initial={{ opacity: 0, x: -30 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
               >
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase mb-6">
                     <Server className="h-4 w-4" /> Machine Learning
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-6">It Gets Smarter Every Day.</h2>
                  <p className="text-[#CCCCD9] text-lg leading-relaxed mb-6">
                     Heal Her isn't static. It learns from anonymized interactions. If 500 girls ask about a new flu strain, the system flags it for our medical team to review and update the core database immediately.
                  </p>
                  <ul className="space-y-4">
                     <li className="flex items-center gap-3 text-[#CCCCD9]">
                        <Code className="h-5 w-5 text-blue-400" />
                        <span>Real-time trend detection</span>
                     </li>
                     <li className="flex items-center gap-3 text-[#CCCCD9]">
                        <Code className="h-5 w-5 text-blue-400" />
                        <span>Regional dialect adaptation</span>
                     </li>
                     <li className="flex items-center gap-3 text-[#CCCCD9]">
                        <Code className="h-5 w-5 text-blue-400" />
                        <span>Medical protocol updates (via WHO API)</span>
                     </li>
                  </ul>
               </motion.div>
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: true }}
               >
                  <SpotlightCard className="p-10 flex items-center justify-center bg-[#1C1246] border border-blue-500/20 aspect-square">
                     <div className="relative">
                        <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 animate-pulse" />
                        <Activity className="h-32 w-32 text-blue-500 relative z-10" />
                     </div>
                  </SpotlightCard>
               </motion.div>
            </div>
         </div>
      </section>

      {/* --- MODULE 3: PRIVACY & TECH SPECS --- */}
      <section className="py-20 bg-[#1C1246] border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
           <div className="flex items-center gap-4 mb-12">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#DA8CA0]/50" />
              <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-[#DA8CA0]/10 border border-[#DA8CA0]/30 text-[#DA8CA0] text-sm font-mono tracking-widest uppercase">
                 <Lock className="h-4 w-4" /> The Vault
              </div>
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#DA8CA0]/50" />
           </div>

           <div className="grid md:grid-cols-3 gap-8">
              {[
                 { 
                    title: "Ephemeral Storage", 
                    desc: "Chats are 'Ram-Only' for the duration of the session. Once you clear history, it's digitally shredded.",
                    icon: Zap,
                    color: "text-amber-400"
                 },
                 { 
                    title: "Zero-Knowledge ID", 
                    desc: "We don't link your chat logs to your email. Your health profile is stored under a random hash.",
                    icon: Fingerprint,
                    color: "text-cyan-400"
                 },
                 { 
                    title: "Local Caching", 
                    desc: "Critical first-aid protocols are cached on your device, so the app works even if the internet fails.",
                    icon: Activity,
                    color: "text-rose-400"
                 }
              ].map((feature, i) => (
                 <SpotlightCard key={i} className="p-8 h-full bg-[#231854]/40">
                    <div className="flex items-center gap-4 mb-4">
                       <feature.icon className={`h-6 w-6 ${feature.color}`} />
                       <h3 className="text-lg font-bold text-white">{feature.title}</h3>
                    </div>
                    <p className="text-[#CCCCD9] text-sm leading-relaxed">{feature.desc}</p>
                 </SpotlightCard>
              ))}
           </div>
        </div>
      </section>

      {/* --- CTA --- */}
      <section className="py-24 relative overflow-hidden">
         <div className="absolute inset-0 bg-[#DA8CA0]/5" />
         <div className="mx-auto max-w-3xl px-4 text-center relative z-10">
            <h2 className="text-3xl font-bold text-white mb-6">Complex Code. Simple Mission.</h2>
            <p className="text-[#CCCCD9] mb-8">
               We built the most advanced health AI in Africa so that you can simply feel better.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
               {[
                  { label: "Uptime", val: "99.9%" },
                  { label: "Encryption", val: "AES-256" },
                  { label: "Response", val: "<0.5s" },
                  { label: "Cost", val: "$0" },
               ].map((stat, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-[#231854] border border-[#DA8CA0]/20 hover:scale-105 transition-transform cursor-default">
                     <div className="text-xl font-bold text-white">{stat.val}</div>
                     <div className="text-xs text-[#CCCCD9] uppercase tracking-wide">{stat.label}</div>
                  </div>
               ))}
            </div>
         </div>
      </section>

      <Footer />
    </div>
  )
}