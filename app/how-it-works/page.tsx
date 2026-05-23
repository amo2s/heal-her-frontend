"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence, useMotionTemplate, useMotionValue } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  ArrowRight,
  ShieldCheck,
  Lock,
  Sparkles,
  Baby,
  User,
  GraduationCap,
  Fingerprint,
  EyeOff,
  MessageCircle,
  Activity,
  Shield
} from "lucide-react"

// ============================================================================
// PREMIUM UTILITY COMPONENTS
// ============================================================================

const smoothEase: [number, number, number, number] = [0.22, 1, 0.36, 1]

const GlowingBadge = ({ children, icon: Icon }: { children: React.ReactNode; icon?: any }) => (
  <div className="inline-flex items-center gap-2 rounded-full border border-white/20 border-t-[#DA8CA0]/60 bg-gradient-to-r from-[#DA8CA0]/20 to-black/20 px-5 py-2 text-sm font-bold tracking-wide text-white backdrop-blur-xl shadow-[inset_0_1px_2px_rgba(255,255,255,0.3)]">
    {Icon && <Icon className="h-4 w-4 text-[#DA8CA0] animate-pulse" />}
    {children}
  </div>
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
        "group relative overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-[#231854]/80 to-[#1C1246]/95 border border-white/10 border-t-white/20 backdrop-blur-2xl shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_15px_30px_-10px_rgba(28,18,70,0.8)] transition-all duration-700 hover:border-[#DA8CA0]/40 hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.2),0_20px_40px_-10px_rgba(218,140,160,0.2)]",
        className
      )}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[2.5rem] opacity-0 transition duration-700 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              800px circle at ${mouseX}px ${mouseY}px,
              rgba(218, 140, 160, 0.15),
              transparent 80%
            )
          `,
        }}
      />
      <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-[#DA8CA0]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="relative h-full z-10">{children}</div>
    </motion.div>
  )
}

// ============================================================================
// TIER DATA FOR INTERACTIVE TAB SYSTEM (WITH PRO UI WIREFRAMES)
// ============================================================================

const EVOLUTION_TIERS = {
  kids: {
    id: "kids",
    title: "The Safe Guardian",
    age: "Ages 0 – 11",
    icon: Baby,
    color: "from-emerald-400 to-teal-500",
    description: "We fiercely protect childhood. The AI acts as a strictly monitored digital guardian, using playground-friendly language to teach body basics, hygiene, and critical real-world safety—without ever using scary or adult terminology.",
    features: ["Stranger Safety Protocols", "Gentle Hygiene Education", "Monitored 'Big Sister' AI"],
    visual: (
      <div className="relative w-full h-full min-h-[320px] rounded-3xl bg-gradient-to-br from-emerald-500/5 to-[#1C1246] border border-emerald-500/20 p-6 flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
        {/* Pro UI Wireframe: Kids Chat */}
        <div className="relative z-10 space-y-4 w-full max-w-sm mx-auto">
           <div className="flex items-end gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/30">
                 <Shield className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="bg-[#231854] border border-white/5 rounded-2xl rounded-bl-sm p-4 shadow-lg w-full">
                 <div className="h-2 w-16 bg-emerald-400/30 rounded-full mb-3" />
                 <div className="h-2 w-full bg-white/20 rounded-full mb-2" />
                 <div className="h-2 w-4/5 bg-white/20 rounded-full" />
              </div>
           </div>
           <div className="flex items-end gap-3 justify-end">
              <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-2xl rounded-br-sm p-4 shadow-lg w-3/4">
                 <div className="h-2 w-full bg-emerald-400/50 rounded-full mb-2" />
                 <div className="h-2 w-3/4 bg-emerald-400/50 rounded-full" />
              </div>
           </div>
           <div className="w-full h-12 rounded-full bg-[#1C1246] border border-white/10 flex items-center px-4 mt-2">
              <span className="text-white/30 text-xs font-medium">Ask a safe question...</span>
           </div>
        </div>
      </div>
    )
  },
  teens: {
    id: "teens",
    title: "The Dynamic Vibe",
    age: "Ages 12 – 17",
    icon: GraduationCap,
    color: "from-violet-400 to-fuchsia-500",
    description: "Real answers for real life. The AI seamlessly matches a teenager's communication style to talk through puberty, social anxieties, and healthy relationships naturally. It feels like texting a trusted older sister.",
    features: ["Empathetic Vibe-Matching", "Puberty & Anxiety Support", "Healthy Boundary Building"],
    visual: (
      <div className="relative w-full h-full min-h-[320px] rounded-3xl bg-gradient-to-br from-fuchsia-500/5 to-[#1C1246] border border-fuchsia-500/20 p-6 flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
        {/* Pro UI Wireframe: Teen Mood/Vibe Tracker */}
        <div className="relative z-10 w-full max-w-sm mx-auto bg-[#231854] border border-white/10 rounded-[2rem] p-5 shadow-2xl">
           <div className="flex justify-between items-center mb-6">
              <span className="text-white font-bold text-sm">Today's Vibe</span>
              <Activity className="w-4 h-4 text-fuchsia-400" />
           </div>
           <div className="flex gap-3 mb-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className={cn("h-16 rounded-xl flex-1 border transition-colors", i === 2 ? "bg-fuchsia-500/20 border-fuchsia-400/50" : "bg-[#1C1246] border-white/5")} />
              ))}
           </div>
           <div className="space-y-3">
              <div className="h-10 w-full bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 rounded-xl border border-fuchsia-500/30 flex items-center px-4">
                 <div className="h-2 w-1/3 bg-fuchsia-400/50 rounded-full" />
              </div>
           </div>
        </div>
      </div>
    )
  },
  adults: {
    id: "adults",
    title: "The Secure Vault",
    age: "Ages 18+",
    icon: User,
    color: "from-[#DA8CA0] to-[#E8B4C1]",
    description: "Ultimate independence and unbreakable privacy. Unlock highly advanced tools for cycle tracking, complex relationship boundaries, and legal rights resources. All your data is locked behind clinical-grade encryption.",
    features: ["Clinical-Grade Encryption", "Advanced Cycle Tracking", "Legal & Rights Resources"],
    visual: (
      <div className="relative w-full h-full min-h-[320px] rounded-3xl bg-gradient-to-br from-[#DA8CA0]/10 to-[#1C1246] border border-[#DA8CA0]/20 p-6 flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
        {/* Pro UI Wireframe: Adult Secure Vault */}
        <div className="relative z-10 w-full max-w-sm mx-auto space-y-4">
           <div className="flex items-center gap-4 bg-[#231854] p-4 rounded-2xl border border-white/10 shadow-lg">
              <div className="w-12 h-12 rounded-full bg-[#DA8CA0]/20 flex items-center justify-center border border-[#DA8CA0]/40 shrink-0">
                 <Lock className="w-5 h-5 text-[#DA8CA0]" />
              </div>
              <div className="flex-1">
                 <div className="h-3 w-1/2 bg-white/40 rounded-full mb-2" />
                 <div className="h-2 w-3/4 bg-white/20 rounded-full" />
              </div>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#231854] p-4 rounded-2xl border border-white/10 h-24 flex flex-col justify-end shadow-lg">
                 <div className="h-2 w-full bg-[#DA8CA0]/40 rounded-full mb-2" />
                 <div className="h-2 w-2/3 bg-white/20 rounded-full" />
              </div>
              <div className="bg-[#231854] p-4 rounded-2xl border border-white/10 h-24 flex flex-col justify-end shadow-lg">
                 <div className="h-2 w-full bg-[#DA8CA0]/40 rounded-full mb-2" />
                 <div className="h-2 w-1/2 bg-white/20 rounded-full" />
              </div>
           </div>
        </div>
      </div>
    )
  }
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function HowItWorksPage() {
  const [activeTab, setActiveTab] = useState<keyof typeof EVOLUTION_TIERS>("kids")

  return (
    <div className="relative min-h-screen bg-background text-[#FAFAFA] selection:bg-[#DA8CA0]/30 selection:text-[#DA8CA0]">
      <Navigation />

      {/* ========== FULL-WIDTH HERO SECTION ========== */}
      <section className="relative min-h-[95vh] md:min-h-[85vh] flex items-center justify-center overflow-hidden">
        
        {/* Full Screen Image Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/first-hero.png"
            alt="The Architecture of Growth"
            fill
            className="object-cover object-center"
            priority
          />
          {/* Glass-morphic Gradient Overlays for perfect text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_var(--background)_100%)] opacity-80" />
          
          {/* Option 2 FIX: Gradient mask now strictly utilizes the theme's background variable */}
          <div className="absolute bottom-0 inset-x-0 h-32 md:h-64 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        </div>
        
        {/* Floating Text Content */}
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10 text-center mt-20">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, ease: smoothEase }}
             className="mb-8"
           >
             <GlowingBadge icon={Sparkles}>The Heal Her Ecosystem</GlowingBadge>
           </motion.div>

           <motion.h1 
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 1, delay: 0.1, ease: smoothEase }}
             className="text-5xl sm:text-6xl md:text-8xl font-extrabold tracking-tight text-white mb-6 leading-[1.05] drop-shadow-2xl"
           >
             One Safe Space.<br/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DA8CA0] via-[#E8B4C1] to-[#DA8CA0] drop-shadow-lg">Three Tailored Worlds.</span>
           </motion.h1>

           <motion.p 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2, duration: 1, ease: smoothEase }}
             className="max-w-2xl mx-auto text-lg md:text-2xl text-[#FAFAFA] leading-relaxed font-light mb-12 drop-shadow-md"
           >
             Heal Her isn't a generic chatbot. It's a smart platform that morphs entirely based on age—giving your child a strict digital guardian, and giving you an advanced health vault.
           </motion.p>

           <motion.div
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.4, duration: 0.8, ease: smoothEase }}
           >
             {/* Glossy Liquid Action Button */}
             <Button asChild className="group relative overflow-hidden h-16 sm:h-18 rounded-full bg-gradient-to-b from-[#f3cbd4] to-[#DA8CA0] px-10 sm:px-12 text-lg sm:text-xl font-bold text-[#1C1246] border border-[#DA8CA0]/50 border-t-white/80 shadow-[inset_0_2px_5px_rgba(255,255,255,0.9),0_15px_40px_-10px_rgba(218,140,160,0.8)] hover:from-[#fae0e6] hover:to-[#e19eb0] hover:scale-105 transition-all duration-500">
                <Link href="/login">
                  <div className="absolute top-0 left-[-100%] w-[150%] h-full bg-gradient-to-r from-transparent via-white/50 to-transparent group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
                  <span className="relative z-10 flex items-center gap-2">
                     Get Started Today <ArrowRight className="h-5 w-5" />
                  </span>
                </Link>
             </Button>
           </motion.div>
        </div>

        {/* --- WATERMARK HIDER / TRUST BADGE (Bottom Right) --- */}
        <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 z-20">
          <div className="backdrop-blur-xl bg-[#1C1246]/80 border border-white/10 rounded-2xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4 shadow-[0_20px_40px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.2)]">
             <div className="bg-emerald-500/20 p-2 rounded-xl border border-emerald-500/30">
               <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
             </div>
             <div className="text-left hidden sm:block pr-2">
               <p className="text-white text-xs font-bold uppercase tracking-widest">Verified Secure</p>
               <p className="text-[#CCCCD9] text-[10px] font-medium">End-to-End Encryption</p>
             </div>
          </div>
        </div>
      </section>

      {/* ========== THE EVOLUTION PATHS (INTERACTIVE TAB SYSTEM) ========== */}
      <section className="relative py-24 sm:py-32 bg-background border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">Built to Grow With You</h2>
            <p className="text-base sm:text-lg text-[#CCCCD9] max-w-2xl mx-auto font-light">
              Select an age group below to see how our platform completely transforms its language, safety protocols, and features to provide the perfect environment.
            </p>
          </div>

          {/* Interactive Liquid Tab Switcher */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-12 sm:mb-16 relative z-20">
            {Object.values(EVOLUTION_TIERS).map((tier) => {
              const isActive = activeTab === tier.id
              return (
                <button
                  key={tier.id}
                  onClick={() => setActiveTab(tier.id as keyof typeof EVOLUTION_TIERS)}
                  className={cn(
                    "relative px-5 sm:px-8 py-3 rounded-full text-sm sm:text-base font-bold transition-all duration-500 border overflow-hidden",
                    isActive 
                      ? "text-[#1C1246] border-transparent shadow-[inset_0_2px_5px_rgba(255,255,255,0.9),0_10px_20px_-5px_rgba(218,140,160,0.5)]" 
                      : "text-[#CCCCD9] bg-[#231854]/50 border-white/10 hover:border-white/30 hover:bg-white/5"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-tab-bg"
                      className="absolute inset-0 bg-gradient-to-r from-[#DA8CA0] to-[#E8B4C1] -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <tier.icon className="w-4 h-4 hidden sm:block" /> {tier.age}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Tab Content Display */}
          <div className="relative min-h-[600px] lg:min-h-[450px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                transition={{ duration: 0.5, ease: smoothEase }}
                className="absolute inset-0 w-full"
              >
                <SpotlightCard className="p-6 sm:p-8 md:p-12 h-full">
                  <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center h-full">
                    
                    {/* Text Details */}
                    <div className="order-2 lg:order-1 flex flex-col justify-center h-full text-center lg:text-left">
                      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4 mb-6">
                        <div className={cn("p-4 rounded-2xl bg-gradient-to-br shadow-lg", EVOLUTION_TIERS[activeTab].color)}>
                           {React.createElement(EVOLUTION_TIERS[activeTab].icon, { className: "w-7 h-7 text-white" })}
                        </div>
                        <h3 className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-md mt-2 lg:mt-0">
                          {EVOLUTION_TIERS[activeTab].title}
                        </h3>
                      </div>
                      
                      <p className="text-base sm:text-lg text-[#CCCCD9] leading-relaxed mb-8 font-light">
                        {EVOLUTION_TIERS[activeTab].description}
                      </p>

                      <div className="space-y-4 inline-block text-left mx-auto lg:mx-0">
                        {EVOLUTION_TIERS[activeTab].features.map((feat, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-[#DA8CA0] shadow-[0_0_8px_#DA8CA0]" />
                            <span className="text-sm sm:text-base font-medium text-white">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pro UI Visuals */}
                    <div className="order-1 lg:order-2 h-full w-full">
                      {EVOLUTION_TIERS[activeTab].visual}
                    </div>
                  </div>
                </SpotlightCard>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ========== THE PRIVACY PROMISE (SALES PITCH) ========== */}
      <section className="py-24 sm:py-32 relative overflow-hidden bg-background border-t border-white/5">
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
         
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: smoothEase }}
              className="text-center mb-16"
            >
               <h2 className="text-xs sm:text-sm font-bold tracking-widest text-[#DA8CA0] uppercase mb-4">Uncompromising Security</h2>
               <h3 className="text-4xl md:text-5xl font-extrabold text-white mb-6">The Privacy Promise</h3>
               <p className="text-base sm:text-lg text-[#CCCCD9] max-w-2xl mx-auto font-light">
                  A safe space isn't safe if it tracks you. We built our platform with military-grade privacy standards so you can ask the hard questions without a single worry.
               </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
               <SpotlightCard className="p-8 h-full bg-[#1C1246] border-white/10 group-hover:border-[#DA8CA0]/40">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)]">
                    <Fingerprint className="h-7 w-7 text-[#DA8CA0]" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Zero Record Linkage</h3>
                  <p className="text-[#CCCCD9] text-sm sm:text-base leading-relaxed font-light">
                     No real names required. We utilize anonymous identifiers so your identity remains completely separate from your health questions. What happens in her safe space, stays in her safe space.
                  </p>
               </SpotlightCard>

               <SpotlightCard className="p-8 h-full bg-[#1C1246] border-white/10 group-hover:border-[#DA8CA0]/40">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)]">
                    <EyeOff className="h-7 w-7 text-[#DA8CA0]" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Zero Data Sales</h3>
                  <p className="text-[#CCCCD9] text-sm sm:text-base leading-relaxed font-light">
                     We are a health platform, not an advertising company. We never sell chat history, location data, or health concerns to third parties. Your data exists solely to help you.
                  </p>
               </SpotlightCard>

               <SpotlightCard className="p-8 h-full bg-[#1C1246] border-white/10 group-hover:border-[#DA8CA0]/40 sm:col-span-2 lg:col-span-1">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)]">
                    <Lock className="h-7 w-7 text-[#DA8CA0]" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Total Encryption</h3>
                  <p className="text-[#CCCCD9] text-sm sm:text-base leading-relaxed font-light">
                     Military-grade security ensures conversations are locked and accessible only by you. Our "need-to-know" architecture means even our engineers cannot read your private logs.
                  </p>
               </SpotlightCard>
            </div>
         </div>
      </section>

      {/* ========== FINAL CTA ========== */}
      <section className="relative py-24 sm:py-32 overflow-hidden border-t border-[#DA8CA0]/10">
         <div className="absolute inset-0 bg-background">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] sm:w-[1200px] h-[400px] sm:h-[600px] bg-[#DA8CA0]/15 blur-[120px] sm:blur-[150px] rounded-full pointer-events-none" />
         </div>

         <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: smoothEase }}
            className="relative z-10 mx-auto max-w-4xl px-4 text-center"
         >
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 sm:mb-8 drop-shadow-lg">
               Trust the Science.<br/>Feel the Love.
            </h2>
            <p className="text-lg sm:text-xl text-[#CCCCD9] mb-10 sm:mb-12 max-w-2xl mx-auto font-light leading-relaxed">
               Verified medical knowledge, delivered with the kindness of a sister. Register today and unlock your stage.
            </p>
            <div className="flex justify-center">
               <Button asChild className="group relative overflow-hidden h-14 sm:h-16 rounded-full bg-gradient-to-b from-[#f3cbd4] to-[#DA8CA0] px-8 sm:px-12 text-lg sm:text-xl font-bold text-[#1C1246] border border-[#DA8CA0]/50 border-t-white/80 shadow-[inset_0_2px_5px_rgba(255,255,255,0.9),0_10px_30px_-10px_rgba(218,140,160,0.6)] hover:from-[#fae0e6] hover:to-[#e19eb0] hover:scale-105 transition-all duration-500">
                  <Link href="/login">
                    <div className="absolute top-0 left-[-100%] w-[150%] h-full bg-gradient-to-r from-transparent via-white/50 to-transparent group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
                    <span className="relative z-10 flex items-center gap-2">
                       Create Your Free Account <ArrowRight className="h-5 w-5" />
                    </span>
                  </Link>
               </Button>
            </div>
         </motion.div>
      </section>

      <Footer />
    </div>
  )
}