"use client"

import React from "react"
import Image from "next/image"
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
  ShieldCheck,
  ShieldAlert
} from "lucide-react"

// ============================================================================
// ULTRA-PREMIUM UTILITY COMPONENTS & ANIMATIONS
// ============================================================================

const ultraSmooth: [number, number, number, number] = [0.16, 1, 0.3, 1]

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
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
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1
    }
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

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent<HTMLDivElement>) {
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  return (
    <motion.div
      className={cn(
        "group relative border border-white/10 bg-[#231854]/50 overflow-hidden rounded-[1.5rem] md:rounded-[2rem] transition-all duration-700 hover:border-[#DA8CA0]/30 hover:shadow-[0_15px_40px_-10px_rgba(218,140,160,0.15)] will-change-transform",
        className
      )}
      onMouseMove={handleMouseMove}
      whileHover={{ y: -4, transition: { duration: 0.4, ease: ultraSmooth } }}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[1.5rem] md:rounded-[2rem] opacity-0 transition duration-700 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(218, 140, 160, 0.12),
              transparent 80%
            )
          `,
        }}
      />
      <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-[#DA8CA0]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="relative h-full z-10">{children}</div>
    </motion.div>
  )
}

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
// MAIN PAGE COMPONENT
// ============================================================================

export default function EmergencyResponsePage() {
  return (
    <div className="relative min-h-screen bg-[#1C1246] text-[#FAFAFA] selection:bg-[#DA8CA0]/30 selection:text-[#DA8CA0] font-sans">
      <GrainOverlay />
      <Navigation />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden min-h-[70vh] flex flex-col justify-center">
        
        {/* Background Image Integration */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/sixth-hero.png"
            alt="Real-Time Protection and Support"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1C1246]/90 via-[#1C1246]/70 to-[#1C1246]" />
        </div>
        
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
           <motion.div
             variants={scaleIn}
             initial="hidden"
             animate="visible"
             className="mb-6 md:mb-8 inline-flex items-center justify-center h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-[#231854]/80 backdrop-blur-xl border border-[#DA8CA0]/30 shadow-2xl shadow-[#DA8CA0]/20"
           >
             <ShieldCheck className="h-6 w-6 md:h-8 md:w-8 text-[#DA8CA0]" />
           </motion.div>

           <TextReveal 
             text="Real-Time Protection." 
             className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-4 md:mb-6 drop-shadow-lg"
           />

           <motion.p 
             initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
             animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
             transition={{ delay: 0.4, duration: 1.2, ease: ultraSmooth }}
             className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-[#CCCCD9] leading-relaxed font-light px-2"
           >
             When she feels unsafe or confused, we step in instantly. See exactly how our platform identifies danger, offers immediate support, and guides her through moments of panic.
           </motion.p>
        </div>
      </section>

      {/* --- CRITICAL WARNING (Immediate Crisis Protocol) --- */}
      <section className="pb-16 md:pb-24 px-4 relative z-10">
        <div className="mx-auto max-w-4xl">
            <motion.div 
              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-rose-950/40 backdrop-blur-md border border-rose-500/30 rounded-[1.5rem] p-6 md:p-8 flex flex-col md:flex-row gap-5 md:gap-6 items-center md:items-start text-center md:text-left shadow-[0_20px_40px_-10px_rgba(225,29,72,0.1)]"
            >
               <div className="p-3 md:p-4 bg-rose-500/10 rounded-xl shrink-0 border border-rose-500/20">
                  <AlertTriangle className="h-7 w-7 md:h-8 md:w-8 text-rose-500" />
               </div>
               <div>
                  <h3 className="text-lg md:text-xl font-bold text-white mb-2 tracking-wide">Immediate Crisis Protocol</h3>
                  <p className="text-[#CCCCD9] text-sm md:text-base leading-relaxed font-light">
                     We know our limits. Heal Her is built to educate and support, not to replace real-world emergency services. If a user is in immediate physical danger or needs urgent medical help, our system automatically locks and instructs her to contact <strong className="text-white font-bold bg-rose-500/20 px-2 py-0.5 rounded">112 / 911</strong> or a trusted adult immediately.
                  </p>
               </div>
            </motion.div>
        </div>
      </section>

      {/* --- 3-TIER SYSTEM (Clear Zones of Care) --- */}
      <section className="py-20 md:py-32 border-y border-white/5 bg-[#231854]/20 relative">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none" />
         
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: ultraSmooth }}
              className="text-center mb-12 md:mb-20"
            >
              <h2 className="text-xs md:text-sm font-bold tracking-widest text-[#DA8CA0] uppercase mb-3">Structured Care</h2>
              <h3 className="text-3xl md:text-5xl font-extrabold text-white">Three Levels of Support</h3>
            </motion.div>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid gap-6 lg:gap-8 lg:grid-cols-3"
            >
               
               {/* LEVEL 1: CRISIS DEFENSE */}
               <motion.div variants={fadeInUp} className="h-full">
                 <SpotlightCard className="p-0 h-full bg-[#1C1246]/80 border-rose-900/40 flex flex-col">
                    <div className="p-6 md:p-8 border-b border-rose-900/30 bg-rose-950/10">
                       <div className="flex justify-between items-start mb-5">
                          <div className="p-3 md:p-4 bg-rose-500 rounded-xl text-white shadow-[0_10px_20px_-5px_rgba(225,29,72,0.4)]">
                             <ShieldAlert className="h-6 w-6" />
                          </div>
                          <span className="px-3 py-1.5 rounded-full bg-rose-500/10 text-rose-400 text-[10px] md:text-xs font-bold border border-rose-500/20 uppercase tracking-wider animate-pulse">
                             Level 1: Urgent
                          </span>
                       </div>
                       <h3 className="text-xl md:text-2xl font-bold text-white">Crisis Defense</h3>
                    </div>
                    <div className="p-6 md:p-8 flex-grow">
                       <p className="text-[#CCCCD9] text-sm md:text-base font-light mb-6 leading-relaxed">
                          If the system detects severe danger or pain, it instantly stops normal conversation and provides emergency contacts.
                       </p>
                       <ul className="space-y-4 text-sm md:text-base text-[#CCCCD9] font-light">
                          {["Physical assault or abuse", "Severe, unexplained pain", "Thoughts of self-harm", "Unsafe physical environments"].map((item, i) => (
                             <li key={i} className="flex gap-3 items-start">
                                <div className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-2 shrink-0 shadow-[0_0_8px_rgba(225,29,72,0.8)]" />
                                <span>{item}</span>
                             </li>
                          ))}
                       </ul>
                    </div>
                 </SpotlightCard>
               </motion.div>

               {/* LEVEL 2: GUIDED SUPPORT */}
               <motion.div variants={fadeInUp} className="h-full">
                 <SpotlightCard className="p-0 h-full bg-[#1C1246]/80 border-amber-900/40 flex flex-col">
                    <div className="p-6 md:p-8 border-b border-amber-900/30 bg-amber-950/10">
                       <div className="flex justify-between items-start mb-5">
                          <div className="p-3 md:p-4 bg-amber-500 rounded-xl text-white shadow-[0_10px_20px_-5px_rgba(245,158,11,0.4)]">
                             <Heart className="h-6 w-6" />
                          </div>
                          <span className="px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] md:text-xs font-bold border border-amber-500/20 uppercase tracking-wider">
                             Level 2: Care
                          </span>
                       </div>
                       <h3 className="text-xl md:text-2xl font-bold text-white">Guided Support</h3>
                    </div>
                    <div className="p-6 md:p-8 flex-grow">
                       <p className="text-[#CCCCD9] text-sm md:text-base font-light mb-6 leading-relaxed">
                          For strong emotional struggles, we provide comforting advice and gently suggest speaking to a parent or counselor.
                       </p>
                       <ul className="space-y-4 text-sm md:text-base text-[#CCCCD9] font-light">
                          {["Persistent anxiety or sadness", "Dealing with bullies", "Body image worries", "Stress about school or friends"].map((item, i) => (
                             <li key={i} className="flex gap-3 items-start">
                                <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-2 shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                                <span>{item}</span>
                             </li>
                          ))}
                       </ul>
                    </div>
                 </SpotlightCard>
               </motion.div>

               {/* LEVEL 3: EVERYDAY EDUCATION */}
               <motion.div variants={fadeInUp} className="h-full">
                 <SpotlightCard className="p-0 h-full bg-[#1C1246]/80 border-[#DA8CA0]/40 flex flex-col">
                    <div className="p-6 md:p-8 border-b border-[#DA8CA0]/20 bg-[#DA8CA0]/10">
                       <div className="flex justify-between items-start mb-5">
                          <div className="p-3 md:p-4 bg-[#DA8CA0] rounded-xl text-[#1C1246] shadow-[0_10px_20px_-5px_rgba(218,140,160,0.4)]">
                             <MessageCircle className="h-6 w-6" />
                          </div>
                          <span className="px-3 py-1.5 rounded-full bg-[#DA8CA0]/10 text-[#DA8CA0] text-[10px] md:text-xs font-bold border border-[#DA8CA0]/30 uppercase tracking-wider">
                             Level 3: Growth
                          </span>
                       </div>
                       <h3 className="text-xl md:text-2xl font-bold text-white">Everyday Education</h3>
                    </div>
                    <div className="p-6 md:p-8 flex-grow">
                       <p className="text-[#CCCCD9] text-sm md:text-base font-light mb-6 leading-relaxed">
                          For everyday questions about growing up, the platform acts as a smart, judgment-free educator.
                       </p>
                       <ul className="space-y-4 text-sm md:text-base text-[#CCCCD9] font-light">
                          {["Understanding periods", "Healthy hygiene habits", "Basic skincare facts", "General puberty changes"].map((item, i) => (
                             <li key={i} className="flex gap-3 items-start">
                                <div className="h-1.5 w-1.5 rounded-full bg-[#DA8CA0] mt-2 shrink-0 shadow-[0_0_8px_rgba(218,140,160,0.8)]" />
                                <span>{item}</span>
                             </li>
                          ))}
                       </ul>
                    </div>
                 </SpotlightCard>
               </motion.div>

            </motion.div>
         </div>
      </section>

      {/* --- SMART SAFETY AUTOMATION --- */}
      <section className="py-20 md:py-32 relative overflow-hidden">
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,_var(--tw-gradient-stops))] from-[#DA8CA0]/10 via-[#1C1246] to-[#1C1246] -z-10" />
         
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
               
               <motion.div 
                 initial="hidden"
                 whileInView="visible"
                 viewport={{ once: true }}
                 variants={staggerContainer}
                 className="space-y-6 md:space-y-8"
               >
                  <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[#DA8CA0] text-[10px] md:text-xs font-bold uppercase tracking-widest">
                     <BrainCircuit className="h-4 w-4" /> Smart Safety Automation
                  </motion.div>
                  <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight">Listening for Danger,<br/>Not Just Words.</motion.h2>
                  <motion.p variants={fadeInUp} className="text-base md:text-lg font-light leading-relaxed text-[#CCCCD9]">
                     Our platform doesn't just read messages; it understands context. It continuously checks for emotional distress and hidden risks to figure out the safest way to respond.
                  </motion.p>
                  
                  <motion.div variants={staggerContainer} className="space-y-4 md:space-y-5 pt-4">
                     <motion.div variants={fadeInUp} className="flex gap-4 md:gap-5 p-5 md:p-6 rounded-[1.5rem] bg-[#231854]/40 border border-white/5 backdrop-blur-sm hover:bg-[#231854]/60 transition-colors">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20 shrink-0">
                           <Heart className="h-5 w-5 md:h-6 md:w-6" />
                        </div>
                        <div>
                           <h4 className="text-white text-lg font-bold mb-1">Reading Emotion</h4>
                           <p className="text-sm font-light text-[#CCCCD9]">Adjusts its tone to be warmer and more comforting if it notices she is sad or scared.</p>
                        </div>
                     </motion.div>
                     
                     <motion.div variants={fadeInUp} className="flex gap-4 md:gap-5 p-5 md:p-6 rounded-[1.5rem] bg-[#231854]/40 border border-white/5 backdrop-blur-sm hover:bg-[#231854]/60 transition-colors">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/20 shrink-0">
                           <ShieldCheck className="h-5 w-5 md:h-6 md:w-6" />
                        </div>
                        <div>
                           <h4 className="text-white text-lg font-bold mb-1">Spotting Red Flags</h4>
                           <p className="text-sm font-light text-[#CCCCD9]">Instantly flags phrases that mean she might be in an unsafe place or talking to a predator.</p>
                        </div>
                     </motion.div>

                     <motion.div variants={fadeInUp} className="flex gap-4 md:gap-5 p-5 md:p-6 rounded-[1.5rem] bg-[#231854]/40 border border-white/5 backdrop-blur-sm hover:bg-[#231854]/60 transition-colors">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20 shrink-0">
                           <Clock className="h-5 w-5 md:h-6 md:w-6" />
                        </div>
                        <div>
                           <h4 className="text-white text-lg font-bold mb-1">Acting Fast</h4>
                           <p className="text-sm font-light text-[#CCCCD9]">Knows the difference between a general question and a moment where she needs help *right now*.</p>
                        </div>
                     </motion.div>
                  </motion.div>
               </motion.div>

               {/* Data Visualization Card - Mobile Optimized Layout */}
               <motion.div 
                 initial={{ opacity: 0, x: 30, filter: "blur(10px)" }}
                 whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                 viewport={{ once: true }}
                 transition={{ duration: 1.2, ease: ultraSmooth }}
                 className="mt-8 lg:mt-0"
               >
                 <SpotlightCard className="p-6 md:p-10 bg-[#1C1246] border-white/5 relative h-[380px] md:h-[450px] flex flex-col justify-between shadow-2xl">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                       <Activity className="h-48 w-48 md:h-64 md:w-64 text-white" />
                    </div>
                    
                    <div className="relative z-10">
                       <h3 className="text-lg md:text-xl font-bold text-white mb-8">Live Priority Checking</h3>
                       <div className="space-y-6 md:space-y-8">
                          <div>
                             <div className="flex justify-between text-xs md:text-sm text-[#CCCCD9] mb-3">
                                <span>Physical Safety Risk</span>
                                <span className="text-white font-bold tracking-wide">CRITICAL</span>
                             </div>
                             <div className="h-2 md:h-2.5 bg-[#231854] rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }} 
                                  whileInView={{ width: "95%" }} 
                                  viewport={{ once: true }}
                                  transition={{ duration: 1.5, delay: 0.2, ease: ultraSmooth }}
                                  className="h-full bg-rose-500 shadow-[0_0_10px_rgba(225,29,72,0.8)]" 
                                />
                             </div>
                          </div>
                          <div>
                             <div className="flex justify-between text-xs md:text-sm text-[#CCCCD9] mb-3">
                                <span>Emotional Stress</span>
                                <span className="text-white font-bold tracking-wide">HIGH</span>
                             </div>
                             <div className="h-2 md:h-2.5 bg-[#231854] rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }} 
                                  whileInView={{ width: "85%" }} 
                                  viewport={{ once: true }}
                                  transition={{ duration: 1.5, delay: 0.4, ease: ultraSmooth }}
                                  className="h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]" 
                                />
                             </div>
                          </div>
                          <div>
                             <div className="flex justify-between text-xs md:text-sm text-[#CCCCD9] mb-3">
                                <span>General Question</span>
                                <span className="text-white font-bold tracking-wide">NORMAL</span>
                             </div>
                             <div className="h-2 md:h-2.5 bg-[#231854] rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }} 
                                  whileInView={{ width: "40%" }} 
                                  viewport={{ once: true }}
                                  transition={{ duration: 1.5, delay: 0.6, ease: ultraSmooth }}
                                  className="h-full bg-[#DA8CA0] shadow-[0_0_10px_rgba(218,140,160,0.8)]" 
                                />
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="relative z-10 bg-[#231854]/80 backdrop-blur-md rounded-xl p-4 md:p-5 border border-white/5">
                       <div className="flex items-center gap-3 text-xs md:text-sm text-[#CCCCD9] mb-2">
                          <Shield className="h-4 w-4 md:h-5 md:w-5 text-emerald-400" />
                          <span className="uppercase tracking-widest font-bold text-[10px] md:text-xs text-emerald-400">System Rule</span>
                       </div>
                       <p className="text-white font-light text-xs md:text-sm leading-relaxed">
                          "If a user mentions feeling unsafe, immediately stop education logic and switch to pure protection protocols."
                       </p>
                    </div>
                 </SpotlightCard>
               </motion.div>

            </div>
         </div>
      </section>

      {/* --- RESPONSIBILITY BOUNDARIES (Plain English Legal Trust) --- */}
      <section className="py-20 md:py-32 border-t border-white/5 bg-[#231854]/20">
         <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
            <motion.h2 
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: ultraSmooth }}
              className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-12 md:mb-16"
            >
              Our Clear Commitments
            </motion.h2>
            
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 gap-6 md:gap-8 text-left"
            >
               {/* WE DO */}
               <motion.div variants={fadeInUp} className="p-8 md:p-10 rounded-[2rem] bg-[#1C1246]/60 backdrop-blur-sm border border-emerald-500/20 shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)] transition-all hover:border-emerald-500/40 hover:bg-[#1C1246]">
                  <div className="inline-flex p-3 md:p-4 rounded-2xl bg-emerald-500/10 mb-6 border border-emerald-500/20">
                     <CheckCircle2 className="h-6 w-6 md:h-8 md:w-8 text-emerald-400" />
                  </div>
                  <h3 className="text-xl md:text-2xl text-white font-bold mb-6">What We Guarantee</h3>
                  <ul className="space-y-4 text-[#CCCCD9] text-sm md:text-base font-light">
                     <li className="flex gap-3 items-start"><div className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" /> Answer questions about her body safely and honestly.</li>
                     <li className="flex gap-3 items-start"><div className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" /> Provide comforting, proven ways to handle stress and worry.</li>
                     <li className="flex gap-3 items-start"><div className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" /> Show her how to report online predators or bullying.</li>
                     <li className="flex gap-3 items-start"><div className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" /> Keep her data completely private and never sell it.</li>
                  </ul>
               </motion.div>

               {/* WE DO NOT */}
               <motion.div variants={fadeInUp} className="p-8 md:p-10 rounded-[2rem] bg-[#1C1246]/60 backdrop-blur-sm border border-rose-500/20 shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)] transition-all hover:border-rose-500/40 hover:bg-[#1C1246]">
                  <div className="inline-flex p-3 md:p-4 rounded-2xl bg-rose-500/10 mb-6 border border-rose-500/20">
                     <AlertCircle className="h-6 w-6 md:h-8 md:w-8 text-rose-400" />
                  </div>
                  <h3 className="text-xl md:text-2xl text-white font-bold mb-6">Our Strict Limits</h3>
                  <ul className="space-y-4 text-[#CCCCD9] text-sm md:text-base font-light opacity-90">
                     <li className="flex gap-3 items-start"><div className="h-2 w-2 rounded-full bg-rose-500 mt-1.5 shrink-0" /> We do not diagnose real medical diseases or conditions.</li>
                     <li className="flex gap-3 items-start"><div className="h-2 w-2 rounded-full bg-rose-500 mt-1.5 shrink-0" /> We do not tell users what medicines or pills to take.</li>
                     <li className="flex gap-3 items-start"><div className="h-2 w-2 rounded-full bg-rose-500 mt-1.5 shrink-0" /> We do not try to replace the advice of her parents or doctors.</li>
                     <li className="flex gap-3 items-start"><div className="h-2 w-2 rounded-full bg-rose-500 mt-1.5 shrink-0" /> We do not judge, shame, or talk down to anyone asking for help.</li>
                  </ul>
               </motion.div>
            </motion.div>
         </div>
      </section>

      <Footer />
    </div>
  )
}