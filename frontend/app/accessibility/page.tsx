"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useMotionTemplate, useMotionValue, Variants, AnimatePresence } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { cn } from "@/lib/utils"
import { 
  Heart, 
  ShieldCheck, 
  CheckCircle2,
  Lock,
  Video,
  MessageSquare,
  AlertTriangle,
  Brain,
  EyeOff,
  Database,
  BookOpen,
  User,
  Users,
  Baby,
  Sparkles,
  ArrowRight
} from "lucide-react"

// ============================================================================
// PREMIUM UTILITIES & SMOOTH PHYSICS
// ============================================================================

const premiumSmooth: [number, number, number, number] = [0.16, 1, 0.3, 1]

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)", 
    transition: { duration: 1.2, ease: premiumSmooth } 
  }
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.05 }
  }
}

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95, filter: "blur(5px)" },
  visible: { 
    opacity: 1, 
    scale: 1, 
    filter: "blur(0px)",
    transition: { duration: 1.2, ease: premiumSmooth } 
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

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  return (
    <div
      className={cn(
        "group relative border border-white/10 bg-[#231854]/40 overflow-hidden rounded-[2rem] transition-all duration-700 hover:border-[#DA8CA0]/30 hover:bg-[#231854]/60",
        className
      )}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[2rem] opacity-0 transition duration-700 group-hover:opacity-100"
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
      <div className="relative h-full z-10">{children}</div>
    </div>
  )
}

// ============================================================================
// GLOSSY BUTTON COMPONENT
// ============================================================================
function GlossyButton({ href, children }: { href: string, children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-b from-[#DA8CA0] to-[#b86981] text-[#1C1246] font-extrabold text-sm md:text-base tracking-wide overflow-hidden shadow-[0_8px_30px_rgba(218,140,160,0.3)] hover:shadow-[0_8px_40px_rgba(218,140,160,0.6)] transition-all duration-500 will-change-transform hover:-translate-y-1"
    >
      {/* Top Highlight */}
      <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-t-full pointer-events-none" />
      {/* Inner Border Overlay */}
      <div className="absolute inset-0 rounded-full border border-white/50 mix-blend-overlay pointer-events-none" />
      
      {/* Animated Shine Effect */}
      <motion.div 
        className="absolute top-0 left-0 w-[150%] h-[150%] bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[-45deg]"
        initial={{ x: "-150%" }}
        whileHover={{ x: "150%" }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </Link>
  )
}

// ============================================================================
// SCENARIO TRAINING SIMULATOR
// ============================================================================
function RedFlagSimulator() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 4)
    }, 4500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full bg-[#0a0a0a] rounded-[2rem] border border-white/10 overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] min-h-[420px] md:h-[450px] flex flex-col">
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-500 via-indigo-500 to-[#DA8CA0]" />
      
      {/* Header */}
      <div className="px-5 md:px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#1C1246]/50">
        <div className="flex items-center gap-2 md:gap-3">
          <Brain className="h-4 w-4 md:h-5 md:w-5 text-[#DA8CA0]" />
          <span className="text-white font-bold text-xs md:text-sm tracking-wide">Interactive Scenario Training</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#CCCCD9] text-[10px] md:text-xs font-mono bg-white/5 px-2 py-1 rounded">Module 3: Online Safety</span>
        </div>
      </div>

      {/* Simulator Body */}
      <div className="p-4 md:p-6 flex-grow flex flex-col justify-center relative bg-[radial-gradient(ellipse_at_center,rgba(28,18,70,0.5)_0%,transparent_100%)]">
        <AnimatePresence mode="wait">
          
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.8, ease: premiumSmooth }} className="space-y-4">
              <div className="text-center mb-4 md:mb-6">
                <p className="text-[#CCCCD9] text-xs md:text-sm uppercase tracking-widest font-bold mb-2">Practice Scenario</p>
                <p className="text-white text-sm md:text-base">Read the message below. Is this safe?</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 md:p-5 rounded-2xl w-full max-w-[95%] md:max-w-[90%] mx-auto shadow-inner">
                <p className="text-[#CCCCD9] text-sm md:text-base leading-relaxed">"You look really pretty today. Don't tell your parents we are talking, okay? It can be our little secret."</p>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.8, ease: premiumSmooth }} className="space-y-5 md:space-y-6">
               <div className="bg-white/5 border border-white/10 p-4 md:p-5 rounded-2xl w-full max-w-[95%] md:max-w-[90%] mx-auto">
                <p className="text-[#CCCCD9] text-sm md:text-base leading-relaxed">"You look really pretty today. <span className="bg-rose-500/20 text-rose-300 px-1 rounded inline-block my-0.5">Don't tell your parents</span> we are talking, okay? It can be <span className="bg-rose-500/20 text-rose-300 px-1 rounded inline-block my-0.5">our little secret</span>."</p>
              </div>
              <div className="flex flex-col items-center gap-3">
                 <div className="animate-bounce bg-rose-500/20 p-2 rounded-full">
                    <AlertTriangle className="h-5 w-5 md:h-6 md:w-6 text-rose-400" />
                 </div>
                 <p className="text-rose-400 text-sm md:text-base font-bold tracking-wide">Red Flags Identified!</p>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.8, ease: premiumSmooth }} className="space-y-4">
              <div className="bg-indigo-500/10 border border-indigo-500/30 p-5 md:p-6 rounded-2xl text-center">
                <Brain className="h-6 w-6 md:h-8 md:w-8 text-indigo-400 mx-auto mb-3" />
                <h4 className="text-white font-bold text-base md:text-lg mb-2">Why is this dangerous?</h4>
                <p className="text-[#CCCCD9] text-xs md:text-sm leading-relaxed">Predators often ask you to keep secrets. This is a trick to isolate you from people who can protect you. Safe adults will never ask you to hide things from your parents.</p>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.8, ease: premiumSmooth }} className="space-y-4 text-center">
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-5 md:p-6 rounded-2xl">
                <CheckCircle2 className="h-6 w-6 md:h-8 md:w-8 text-emerald-400 mx-auto mb-3" />
                <h4 className="text-white font-bold text-base md:text-lg mb-2">How to respond:</h4>
                <p className="text-[#CCCCD9] text-xs md:text-sm leading-relaxed mb-4">You do not have to reply. Block the person immediately and tell a trusted adult what happened.</p>
                <div className="inline-flex items-center gap-2 text-emerald-400 text-[10px] md:text-xs font-bold tracking-widest uppercase bg-emerald-500/20 px-4 py-2 rounded-full">
                  Lesson Completed
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function PlatformFeaturesPage() {
  return (
    <div className="relative min-h-screen bg-[#1C1246] text-[#FAFAFA] selection:bg-[#DA8CA0]/30 selection:text-[#DA8CA0]">
      <GrainOverlay />
      <Navigation />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden min-h-[90vh] flex items-center border-b border-white/5">
        
        {/* Background Setup */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/eight-hero.png"
            alt="Health Education Platform"
            fill
            className="object-cover object-[75%_center] md:object-center opacity-60 md:opacity-70"
            priority
          />
          {/* Deep gradients for readability across all devices */}
          <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-[#1C1246] via-[#1C1246]/95 to-transparent w-full md:w-[75%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1246] via-[#1C1246]/40 md:via-[#1C1246]/20 to-transparent" />
        </div>
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 w-full">
           <div className="grid md:grid-cols-2 gap-12 items-center">
             
             <motion.div 
               initial="hidden"
               animate="visible"
               variants={staggerContainer}
               className="max-w-xl text-center md:text-left pt-10 md:pt-0"
             >
                <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[#DA8CA0] text-[10px] md:text-xs font-bold uppercase tracking-widest mb-6 md:mb-8 backdrop-blur-md">
                   <Sparkles className="h-3 w-3 md:h-4 md:w-4" /> Professional Standard
                </motion.div>

                <motion.h1 
                  variants={fadeInUp}
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]"
                >
                  Learn Safely. <br className="hidden md:block"/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DA8CA0] to-indigo-400">Grow Confidently.</span>
                </motion.h1>

                <motion.p 
                  variants={fadeInUp}
                  className="text-base sm:text-lg md:text-xl text-[#CCCCD9] leading-relaxed font-light mb-10 max-w-lg mx-auto md:mx-0"
                >
                  A highly secure, trusted space where girls learn about their bodies, understand boundaries, and develop the skills to stay safe online and offline.
                </motion.p>

                <motion.div variants={fadeInUp} className="flex justify-center md:justify-start">
                  <GlossyButton href="/login">
                    Explore Platform <ArrowRight className="h-4 w-4" />
                  </GlossyButton>
                </motion.div>
             </motion.div>
             
           </div>
        </div>

        {/* THIN WATERMARK COVER PILL */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 1, ease: premiumSmooth }}
          className="absolute bottom-6 right-4 md:bottom-8 md:right-8 z-50 flex items-center gap-2 bg-[#1C1246]/95 backdrop-blur-xl border border-emerald-500/30 px-3 py-1.5 md:px-4 md:py-2 rounded-full shadow-[0_8px_30px_rgba(16,185,129,0.15)] group"
        >
           <ShieldCheck className="w-3 h-3 md:w-4 md:h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
           <span className="text-white text-[9px] md:text-[10px] uppercase font-bold tracking-widest mt-0.5">Verified Secure</span>
        </motion.div>

      </section>

      {/* --- SECTION 1: STRICT AGE CATEGORIZATION --- */}
      <section className="py-20 md:py-32 bg-[#231854]/20">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-100px" }}
               transition={{ duration: 1, ease: premiumSmooth }}
               className="text-center mb-12 md:mb-16"
            >
               <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Age-Appropriate Learning</h2>
               <p className="text-[#CCCCD9] text-base md:text-lg max-w-2xl mx-auto font-light leading-relaxed">
                  We organize our information into three distinct groups. This ensures that every user only sees lessons that are safe, helpful, and meant for their exact age.
               </p>
            </motion.div>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
            >
               <motion.div variants={fadeInUp}>
                  <SpotlightCard className="p-6 md:p-8 h-full bg-[#1C1246]">
                     <div className="inline-flex items-center justify-center h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-6">
                        <Baby className="h-6 w-6 md:h-7 md:w-7" />
                     </div>
                     <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Kids (0 - 12)</h3>
                     <p className="text-[#CCCCD9] text-sm leading-relaxed mb-4 md:mb-6 font-light">
                        Simple, gentle lessons focusing on basic hygiene, naming body parts correctly, and understanding personal boundaries.
                     </p>
                  </SpotlightCard>
               </motion.div>

               <motion.div variants={fadeInUp}>
                  <SpotlightCard className="p-6 md:p-8 h-full bg-[#1C1246] relative border-[#DA8CA0]/30 shadow-[0_0_30px_rgba(218,140,160,0.1)]">
                     <div className="inline-flex items-center justify-center h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-[#DA8CA0]/10 text-[#DA8CA0] border border-[#DA8CA0]/20 mb-6">
                        <User className="h-6 w-6 md:h-7 md:w-7" />
                     </div>
                     <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Teens (13 - 17)</h3>
                     <p className="text-[#CCCCD9] text-sm leading-relaxed mb-4 md:mb-6 font-light">
                        Guidance through puberty, handling peer pressure, emotional changes, and learning how to navigate the internet safely.
                     </p>
                  </SpotlightCard>
               </motion.div>

               <motion.div variants={fadeInUp}>
                  <SpotlightCard className="p-6 md:p-8 h-full bg-[#1C1246]">
                     <div className="inline-flex items-center justify-center h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-6">
                        <Users className="h-6 w-6 md:h-7 md:w-7" />
                     </div>
                     <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Adults (18+)</h3>
                     <p className="text-[#CCCCD9] text-sm leading-relaxed mb-4 md:mb-6 font-light">
                        Complete access to reproductive health facts, relationship advice, and tools for making independent medical decisions.
                     </p>
                  </SpotlightCard>
               </motion.div>
            </motion.div>
         </div>
      </section>

      {/* --- SECTION 2: SCENARIO TRAINING --- */}
      <section className="py-20 md:py-32 border-y border-white/5">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
               
               <motion.div 
                 initial={{ opacity: 0, x: -30 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true, margin: "-100px" }}
                 transition={{ duration: 1.2, ease: premiumSmooth }}
                 className="space-y-8 order-2 lg:order-1"
               >
                  <div>
                     <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 md:mb-6">Learn to Spot Danger.</h2>
                     <p className="text-base md:text-lg text-[#CCCCD9] font-light leading-relaxed">
                        Knowing facts is not enough. Girls need to know how to act when they face uncomfortable situations. We use safe, interactive practice scenarios to teach them how to spot red flags and protect themselves.
                     </p>
                  </div>

                  <div className="space-y-4">
                     <div className="flex gap-4 p-4 md:p-5 rounded-2xl bg-[#231854]/40 border border-white/5">
                        <div className="mt-1 bg-[#DA8CA0]/20 p-2 rounded-lg shrink-0">
                           <AlertTriangle className="h-5 w-5 text-[#DA8CA0]" />
                        </div>
                        <div>
                           <h4 className="text-white font-bold mb-1 text-sm md:text-base">Red Flag Recognition</h4>
                           <p className="text-xs md:text-sm text-[#CCCCD9] font-light leading-relaxed">We show users examples of tricky or harmful messages, teaching them exactly which words and behaviors are warning signs.</p>
                        </div>
                     </div>
                     <div className="flex gap-4 p-4 md:p-5 rounded-2xl bg-[#231854]/40 border border-white/5">
                        <div className="mt-1 bg-indigo-500/20 p-2 rounded-lg shrink-0">
                           <MessageSquare className="h-5 w-5 text-indigo-400" />
                        </div>
                        <div>
                           <h4 className="text-white font-bold mb-1 text-sm md:text-base">Building Confidence</h4>
                           <p className="text-xs md:text-sm text-[#CCCCD9] font-light leading-relaxed">By practicing in a safe simulation, girls build the confidence to say "No," block strangers, and report bad behavior in real life.</p>
                        </div>
                     </div>
                  </div>
               </motion.div>

               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: true, margin: "-100px" }}
                 transition={{ duration: 1.2, delay: 0.2, ease: premiumSmooth }}
                 className="order-1 lg:order-2"
               >
                  <RedFlagSimulator />
               </motion.div>

            </div>
         </div>
      </section>

      {/* --- SECTION 3: THE LEARNING JOURNEY --- */}
      <section className="py-20 md:py-32 bg-[#1C1246]">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-100px" }}
               transition={{ duration: 1, ease: premiumSmooth }}
               className="text-center mb-12 md:mb-16"
            >
               <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">What We Teach</h2>
               <p className="text-[#CCCCD9] text-base md:text-lg max-w-2xl mx-auto font-light">
                  Our content is built by experts to cover everything a growing girl needs to know, explained simply and kindly.
               </p>
            </motion.div>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
            >
               {[
                 { icon: Heart, title: "Body Positivity", desc: "Learning to love and care for your changing body." },
                 { icon: ShieldCheck, title: "Boundaries", desc: "Understanding that you are in charge of your own space." },
                 { icon: Brain, title: "Mental Health", desc: "Tools to handle stress, sadness, and peer pressure." },
                 { icon: BookOpen, title: "Factual Health", desc: "Breaking myths with true, doctor-approved information." }
               ].map((item, index) => (
                 <motion.div key={index} variants={fadeInUp} className="bg-[#231854]/30 border border-white/5 p-6 rounded-[2rem] hover:bg-[#231854]/60 transition-colors">
                    <div className="bg-white/5 w-12 h-12 rounded-xl flex items-center justify-center mb-5 md:mb-6">
                       <item.icon className="h-5 w-5 md:h-6 md:w-6 text-[#DA8CA0]" />
                    </div>
                    <h3 className="text-white font-bold text-base md:text-lg mb-2">{item.title}</h3>
                    <p className="text-[#CCCCD9] text-xs md:text-sm font-light leading-relaxed">{item.desc}</p>
                 </motion.div>
               ))}
            </motion.div>
         </div>
      </section>

      {/* --- SECTION 4: ABSOLUTE PRIVACY GUARANTEE --- */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-[#231854]/20 to-[#1C1246] border-t border-white/5">
         <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
            <motion.div 
               variants={scaleIn}
               initial="hidden"
               whileInView="visible"
               viewport={{ once: true, margin: "-100px" }}
            >
               <div className="inline-flex items-center justify-center h-14 w-14 md:h-16 md:w-16 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-6 md:mb-8">
                  <Lock className="h-6 w-6 md:h-8 md:w-8" />
               </div>
               <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 md:mb-6">Your Privacy is Guaranteed</h2>
               <p className="text-base md:text-lg text-[#CCCCD9] font-light leading-relaxed mb-10 md:mb-12 max-w-3xl mx-auto">
                  We know that health questions are deeply personal. That is why our platform is built on strict privacy rules. We do not track you, we do not sell your data, and your questions remain entirely your own.
               </p>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 text-left">
                  <div className="p-5 md:p-6 bg-white/5 rounded-2xl border border-white/10">
                     <EyeOff className="h-5 w-5 md:h-6 md:w-6 text-[#DA8CA0] mb-3 md:mb-4" />
                     <h4 className="text-white font-bold mb-2 text-sm md:text-base">Total Anonymity</h4>
                     <p className="text-xs md:text-sm text-[#CCCCD9] font-light">You don't need to provide your real name or personal details to ask questions.</p>
                  </div>
                  <div className="p-5 md:p-6 bg-white/5 rounded-2xl border border-white/10">
                     <Database className="h-5 w-5 md:h-6 md:w-6 text-emerald-400 mb-3 md:mb-4" />
                     <h4 className="text-white font-bold mb-2 text-sm md:text-base">Zero Data Selling</h4>
                     <p className="text-xs md:text-sm text-[#CCCCD9] font-light">We will never sell your information to advertisers or outside companies. Ever.</p>
                  </div>
                  <div className="p-5 md:p-6 bg-white/5 rounded-2xl border border-white/10">
                     <ShieldCheck className="h-5 w-5 md:h-6 md:w-6 text-indigo-400 mb-3 md:mb-4" />
                     <h4 className="text-white font-bold mb-2 text-sm md:text-base">Secure Connections</h4>
                     <p className="text-xs md:text-sm text-[#CCCCD9] font-light">Every chat and lesson is protected by professional-grade encryption.</p>
                  </div>
               </div>
            </motion.div>
         </div>
      </section>

      {/* --- SECTION 5: LANGUAGE ROADMAP --- */}
      <section className="py-20 md:py-32 border-t border-white/5">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-100px" }}
               transition={{ duration: 1, ease: premiumSmooth }}
               className="text-center mb-12 md:mb-16"
            >
               <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Speaking Your Language</h2>
               <p className="text-[#CCCCD9] text-base md:text-lg max-w-2xl mx-auto font-light">
                  We are working hard to make sure our platform is available to everyone, no matter what language they speak at home.
               </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
               <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}>
                  <SpotlightCard className="p-6 md:p-8 border-[#DA8CA0]/30 bg-[#231854]">
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-8 gap-4 sm:gap-0">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#DA8CA0]/10 text-[#DA8CA0] border border-[#DA8CA0]/20">
                           <MessageSquare className="h-5 w-5 md:h-6 md:w-6" />
                        </div>
                        <span className="w-fit px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-emerald-500/30">
                           Available Now
                        </span>
                     </div>
                     <h3 className="text-lg md:text-xl font-bold text-white mb-2 md:mb-3">Live Chat Translation</h3>
                     <p className="text-[#CCCCD9] text-sm leading-relaxed font-light">
                        Our intelligent chat can already understand and reply in English, Pidgin English, Yorùbá, Hausa, and Igbo. You can ask questions comfortably in your own dialect.
                     </p>
                  </SpotlightCard>
               </motion.div>

               <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}>
                  <SpotlightCard className="p-6 md:p-8 border-white/10 bg-[#231854]">
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-8 gap-4 sm:gap-0">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                           <Video className="h-5 w-5 md:h-6 md:w-6" />
                        </div>
                        <span className="w-fit px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-blue-500/30">
                           Coming Soon
                        </span>
                     </div>
                     <h3 className="text-lg md:text-xl font-bold text-white mb-2 md:mb-3">Translated Videos</h3>
                     <p className="text-[#CCCCD9] text-sm leading-relaxed font-light">
                        We are currently working to translate and record all of our educational videos into multiple local languages, ensuring everyone can learn visually.
                     </p>
                  </SpotlightCard>
               </motion.div>
            </div>
         </div>
      </section>

      {/* --- SECTION 6: FINAL CALL TO ACTION --- */}
      <section className="py-20 md:py-32 relative overflow-hidden bg-[#231854]/40 border-t border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[400px] bg-[#DA8CA0]/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: premiumSmooth }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight">
              Ready to Begin?
            </h2>
            <p className="text-base md:text-xl text-[#CCCCD9] font-light leading-relaxed mb-10 max-w-2xl mx-auto">
              Join thousands of girls who are learning, growing, and building confidence in a perfectly secure environment.
            </p>
            <GlossyButton href="/login">
              Access the Platform <ArrowRight className="h-4 w-4" />
            </GlossyButton>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}