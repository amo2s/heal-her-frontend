"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useMotionTemplate, useMotionValue, Variants, AnimatePresence } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { cn } from "@/lib/utils"
import { 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2,
  Lock,
  Video,
  Brain,
  AlertTriangle,
  EyeOff,
  PhoneCall,
  User,
  Users,
  Baby,
  ArrowRight,
  CalendarHeart,
  HelpCircle
} from "lucide-react"

// ============================================================================
// ULTRA-PREMIUM PHYSICS & UTILITIES
// ============================================================================

const premiumSmooth: [number, number, number, number] = [0.16, 1, 0.3, 1]

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)", 
    transition: { duration: 1.4, ease: premiumSmooth } 
  }
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 }
  }
}

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95, filter: "blur(8px)" },
  visible: { 
    opacity: 1, 
    scale: 1, 
    filter: "blur(0px)",
    transition: { duration: 1.4, ease: premiumSmooth } 
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
        "group relative border border-white/10 bg-[#231854]/40 overflow-hidden rounded-[1.5rem] md:rounded-[2rem] transition-all duration-700 hover:border-[#DA8CA0]/40 hover:bg-[#231854]/70",
        className
      )}
      onMouseMove={handleMouseMove}
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
      <div className="relative h-full z-10">{children}</div>
    </div>
  )
}

// ============================================================================
// GLOSSY BUTTON COMPONENT
// ============================================================================
function GlossyButton({ href, children, className = "" }: { href: string, children: React.ReactNode, className?: string }) {
  return (
    <Link 
      href={href} 
      className={cn(
        "group relative inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4 rounded-full bg-gradient-to-b from-[#DA8CA0] to-[#b86981] text-[#1C1246] font-extrabold text-xs md:text-sm lg:text-base tracking-wide overflow-hidden shadow-[0_10px_40px_rgba(218,140,160,0.3)] hover:shadow-[0_10px_50px_rgba(218,140,160,0.6)] transition-all duration-500 will-change-transform hover:-translate-y-1",
        className
      )}
    >
      <div className="absolute top-0 inset-x-0 h-[45%] bg-gradient-to-b from-white/50 to-transparent rounded-t-full pointer-events-none" />
      <div className="absolute inset-0 rounded-full border border-white/40 mix-blend-overlay pointer-events-none" />
      <motion.div 
        className="absolute top-0 left-0 w-[150%] h-[150%] bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-[-45deg]"
        initial={{ x: "-150%" }}
        whileHover={{ x: "150%" }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
      />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </Link>
  )
}

// ============================================================================
// RED FLAG SIMULATOR
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
    <div className="w-full bg-[#0a0a0a] rounded-[1.5rem] md:rounded-[2rem] border border-white/10 overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] min-h-[380px] flex flex-col">
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-500 via-indigo-500 to-[#DA8CA0]" />
      
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-[#1C1246]/50">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-[#DA8CA0]" />
          <span className="text-white font-bold text-xs md:text-sm tracking-wide">Spotting Danger Game</span>
        </div>
        <span className="text-[#CCCCD9] text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded">Practice Module</span>
      </div>

      <div className="p-4 md:p-6 flex-grow flex flex-col justify-center relative bg-[radial-gradient(ellipse_at_center,rgba(28,18,70,0.5)_0%,transparent_100%)]">
        <AnimatePresence mode="wait">
          
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.6 }} className="space-y-4">
              <p className="text-white text-center text-sm md:text-base font-medium">A stranger online sends this message. Is it safe?</p>
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl max-w-[90%] mx-auto">
                <p className="text-[#CCCCD9] text-sm md:text-base italic">&quot;You look so pretty. Let&apos;s keep our chats a secret from everyone else, okay? Just between us.&quot;</p>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.6 }} className="space-y-4">
               <div className="bg-white/5 border border-white/10 p-4 rounded-xl max-w-[90%] mx-auto">
                <p className="text-[#CCCCD9] text-sm md:text-base">&quot;You look so pretty. <span className="bg-rose-500/20 text-rose-300 px-1 rounded font-bold">Let&apos;s keep our chats a secret</span> from everyone else, okay? Just between us.&quot;</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                 <AlertTriangle className="h-5 w-5 text-rose-400 animate-pulse" />
                 <p className="text-rose-400 text-xs md:text-sm font-bold uppercase tracking-wider">Warning: Secrecy Trap Found</p>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.6 }} className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-center max-w-[95%] mx-auto">
               <HelpCircle className="h-6 w-6 text-indigo-400 mx-auto mb-2" />
               <h4 className="text-white font-bold text-sm md:text-base mb-1">Why is this a red flag?</h4>
               <p className="text-[#CCCCD9] text-xs md:text-sm leading-relaxed">Bad people use secrets to isolate girls from adults who can protect them. Safe adults will never ask a child to hide things from their parents.</p>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.6 }} className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center max-w-[95%] mx-auto">
               <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
               <h4 className="text-white font-bold text-sm md:text-base mb-1">The Right Reaction:</h4>
               <p className="text-[#CCCCD9] text-xs md:text-sm leading-relaxed mb-3">Stop reply, block the person instantly, and report the message to a trusted adult.</p>
               <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full font-bold uppercase tracking-wider">Skill Learned</span>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function EnterpriseSecurityPage() {
  return (
    <div className="relative min-h-screen bg-[#1C1246] text-[#FAFAFA] selection:bg-[#DA8CA0]/30 selection:text-[#DA8CA0] overflow-x-hidden">
      <GrainOverlay />
      <Navigation />

      {/* --- SECTION 1: THE AWAKENING (Hero) --- */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 min-h-[100svh] flex flex-col justify-center border-b border-white/5">
        
        <div className="absolute inset-0 z-0">
          <Image
            src="/nine-hero.png"
            alt="Heal Her Platform Core"
            fill
            className="object-cover object-center opacity-75 md:opacity-85"
            priority
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#1C1246_90%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1C1246]/80 via-[#1C1246]/30 to-[#1C1246]" />
        </div>
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 w-full text-center">
             <motion.div 
               initial="hidden"
               animate="visible"
               variants={staggerContainer}
               className="max-w-4xl mx-auto pt-6 md:pt-0"
             >
                <motion.div variants={scaleIn} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1C1246]/90 border border-rose-500/30 text-rose-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-6 md:mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(244,63,94,0.15)]">
                   <AlertTriangle className="h-3.5 w-3.5 md:h-4 md:w-4" /> Crucial Protection Directive
                </motion.div>

                <motion.h1 
                  variants={fadeInUp}
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1] drop-shadow-2xl"
                >
                  Before she asks the internet,<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-[#DA8CA0]">empower her with the truth.</span>
                </motion.h1>

                <motion.p 
                  variants={fadeInUp}
                  className="text-sm sm:text-base md:text-xl text-[#CCCCD9] leading-relaxed font-light mb-8 md:mb-10 max-w-2xl mx-auto px-2"
                >
                  When girls lack a safe space to ask questions, they turn to unverified forums and online strangers. We provide a completely anonymous, secure ecosystem delivering clinical facts and psychological defense training.
                </motion.p>

                <motion.div variants={fadeInUp} className="flex justify-center">
                  <GlossyButton href="/login">
                    Secure Her Education Now <ArrowRight className="h-4 w-4" />
                  </GlossyButton>
                </motion.div>
             </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 1.2, ease: premiumSmooth }}
          className="absolute bottom-6 right-4 md:bottom-8 md:right-8 z-50 flex items-center gap-2 bg-[#1C1246]/95 backdrop-blur-xl border border-[#DA8CA0]/30 px-3 py-1.5 md:px-4 md:py-2 rounded-full shadow-[0_8px_30px_rgba(218,140,160,0.15)]"
        >
           <div className="relative flex h-2 w-2">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
           </div>
           <span className="text-[#DA8CA0] text-[9px] md:text-[10px] uppercase font-mono tracking-widest mt-0.5">AI Guardian Protection: ACTIVE</span>
        </motion.div>
      </section>

      {/* --- SECTION 2: THE LIABILITY GAP (The Pain) --- */}
      <section className="py-20 md:py-32 bg-[#1C1246]">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-50px" }}
               transition={{ duration: 1.2, ease: premiumSmooth }}
               className="text-center mb-12 md:mb-20"
            >
               <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-6">The True Danger of Silence</h2>
               <p className="text-[#CCCCD9] text-base md:text-lg lg:text-xl max-w-3xl mx-auto font-light leading-relaxed px-2">
                  When reproductive health is treated like a shameful secret, girls don&apos;t stop being curious. Instead, they look for answers in dangerous places.
               </p>
            </motion.div>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto"
            >
               <motion.div variants={fadeInUp} className="p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] bg-rose-500/5 border border-rose-500/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-[50px]" />
                  <EyeOff className="h-6 w-6 md:h-8 md:w-8 text-rose-400 mb-4 md:mb-6" />
                  <h3 className="text-lg md:text-xl font-bold text-white mb-3">What Happens Without Facts</h3>
                  <ul className="space-y-3 md:space-y-4 text-xs md:text-sm lg:text-base text-[#CCCCD9] font-light">
                     <li className="flex items-start gap-2.5">
                        <span className="text-rose-400 font-bold mt-0.5">×</span> Girls rely on scary playground rumors and harmful social media myths.
                     </li>
                     <li className="flex items-start gap-2.5">
                        <span className="text-rose-400 font-bold mt-0.5">×</span> They follow dangerous medical trends because they are too ashamed to ask adults.
                     </li>
                     <li className="flex items-start gap-2.5">
                        <span className="text-rose-400 font-bold mt-0.5">×</span> Online predators spot this confusion easily and use secrets to trap them.
                     </li>
                  </ul>
               </motion.div>

               <motion.div variants={fadeInUp} className="p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] bg-emerald-500/5 border border-emerald-500/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px]" />
                  <ShieldCheck className="h-6 w-6 md:h-8 md:w-8 text-emerald-400 mb-4 md:mb-6" />
                  <h3 className="text-lg md:text-xl font-bold text-white mb-3">How Heal Her Protects Them</h3>
                  <ul className="space-y-3 md:space-y-4 text-xs md:text-sm lg:text-base text-[#CCCCD9] font-light">
                     <li className="flex items-start gap-2.5">
                        <span className="text-emerald-400 font-bold mt-0.5">✓</span> Honest, doctor-approved facts are delivered clearly without any judgment.
                     </li>
                     <li className="flex items-start gap-2.5">
                        <span className="text-emerald-400 font-bold mt-0.5">✓</span> Total anonymity keeps questions strictly private so girls never feel shame.
                     </li>
                     <li className="flex items-start gap-2.5">
                        <span className="text-emerald-400 font-bold mt-0.5">✓</span> Dynamic games train users to see red flags and block manipulators safely.
                     </li>
                  </ul>
               </motion.div>
            </motion.div>
         </div>
      </section>

      {/* --- SECTION 3: TRI-TIER ARCHITECTURE (Structural Relief) --- */}
      <section className="py-20 md:py-32 bg-[#231854]/20 border-y border-white/5">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-50px" }}
               transition={{ duration: 1.2, ease: premiumSmooth }}
               className="text-center mb-12 md:mb-16"
            >
               <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-6">Strict, Safe Separation</h2>
               <p className="text-[#CCCCD9] text-base md:text-lg max-w-3xl mx-auto font-light leading-relaxed px-2">
                  We treat safety with total seriousness. Content is entirely restricted by age, meaning a child will only see lessons that are strictly safe and right for them.
               </p>
            </motion.div>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
            >
               <motion.div variants={fadeInUp} className="h-full">
                  <SpotlightCard className="p-6 md:p-8 h-full bg-[#1C1246]">
                     <div className="flex justify-between items-start mb-6">
                        <div className="h-12 w-12 md:h-14 md:w-14 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                           <Baby className="h-6 w-6 md:h-7 md:w-7 text-indigo-400" />
                        </div>
                        <span className="text-[9px] font-bold tracking-widest text-indigo-400 uppercase bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">0 - 12 Years</span>
                     </div>
                     <h3 className="text-xl md:text-2xl font-bold text-white mb-3">Kids Category</h3>
                     <p className="text-[#CCCCD9] text-xs md:text-sm leading-relaxed font-light">
                        Gentle, guarded lessons. Focuses on basic body facts, healthy hygiene, and learning how to set firm personal space boundaries early.
                     </p>
                  </SpotlightCard>
               </motion.div>

               <motion.div variants={fadeInUp} className="h-full">
                  <SpotlightCard className="p-6 md:p-8 h-full bg-[#1C1246] border-[#DA8CA0]/30 shadow-[0_0_30px_rgba(218,140,160,0.1)]">
                     <div className="flex justify-between items-start mb-6">
                        <div className="h-12 w-12 md:h-14 md:w-14 rounded-xl bg-[#DA8CA0]/10 flex items-center justify-center border border-[#DA8CA0]/20">
                           <User className="h-6 w-6 md:h-7 md:w-7 text-[#DA8CA0]" />
                        </div>
                        <span className="text-[9px] font-bold tracking-widest text-[#DA8CA0] uppercase bg-[#DA8CA0]/10 px-3 py-1 rounded-full border border-[#DA8CA0]/20">13 - 17 Years</span>
                     </div>
                     <h3 className="text-xl md:text-2xl font-bold text-white mb-3">Teens Category</h3>
                     <p className="text-[#CCCCD9] text-xs md:text-sm leading-relaxed font-light">
                        Navigating peer changes. Guides them through periods, body shifts, handling internet dating pressure, and learning how to refuse sharing private pictures.
                     </p>
                  </SpotlightCard>
               </motion.div>

               <motion.div variants={fadeInUp} className="h-full">
                  <SpotlightCard className="p-6 md:p-8 h-full bg-[#1C1246]">
                     <div className="flex justify-between items-start mb-6">
                        <div className="h-12 w-12 md:h-14 md:w-14 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                           <Users className="h-6 w-6 md:h-7 md:w-7 text-emerald-400" />
                        </div>
                        <span className="text-[9px] font-bold tracking-widest text-emerald-400 uppercase bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">18+ Years</span>
                     </div>
                     <h3 className="text-xl md:text-2xl font-bold text-white mb-3">Young Adults</h3>
                     <p className="text-[#CCCCD9] text-xs md:text-sm leading-relaxed font-light">
                        Complete reproductive health literacy. Covers adult wellness, legal self-defense rights, relationship equality, and secure clinical guidance.
                     </p>
                  </SpotlightCard>
               </motion.div>
            </motion.div>
         </div>
      </section>

      {/* --- SECTION 4: THE ACTIVE SHIELD (Core Features) --- */}
      <section className="py-20 md:py-32 bg-[#1C1246]">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div 
               initial={{ opacity: 0, x: -30 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true, margin: "-50px" }}
               transition={{ duration: 1.2, ease: premiumSmooth }}
               className="mb-12 md:mb-16 text-center md:text-left"
            >
               <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-6">The Platform Features</h2>
               <p className="text-[#CCCCD9] text-base md:text-lg max-w-2xl font-light leading-relaxed mx-auto md:mx-0">
                  Every tool inside Heal Her is built with intention. We provide the protective education that traditional systems fail to deliver.
               </p>
            </motion.div>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
            >
               <motion.div variants={fadeInUp} className="h-full">
                  <SpotlightCard className="p-6 md:p-8 h-full bg-[#231854]/40">
                     <AlertTriangle className="h-6 w-6 md:h-8 md:w-8 text-rose-400 mb-4 md:mb-6" />
                     <h3 className="text-base md:text-lg font-bold text-white mb-2">Red-Flag Detector</h3>
                     <p className="text-[#CCCCD9] text-xs md:text-sm font-light leading-relaxed">
                        An advanced helper module. Users can test messaging scenarios to see if an online stranger is utilizing manipulation or grooming tactics against them.
                     </p>
                  </SpotlightCard>
               </motion.div>

               <motion.div variants={fadeInUp} className="h-full">
                  <SpotlightCard className="p-6 md:p-8 h-full bg-[#231854]/40">
                     <CalendarHeart className="h-6 w-6 md:h-8 md:w-8 text-[#DA8CA0] mb-4 md:mb-6" />
                     <h3 className="text-base md:text-lg font-bold text-white mb-2">Cycle & Phase Logs</h3>
                     <p className="text-[#CCCCD9] text-xs md:text-sm font-light leading-relaxed">
                        Enables older users to track periods and follicular phases safely. Connects daily body variations with real medical science.
                     </p>
                  </SpotlightCard>
               </motion.div>

               <motion.div variants={fadeInUp} className="h-full">
                  <SpotlightCard className="p-6 md:p-8 h-full bg-[#231854]/40">
                     <Brain className="h-6 w-6 md:h-8 md:w-8 text-indigo-400 mb-4 md:mb-6" />
                     <h3 className="text-base md:text-lg font-bold text-white mb-2">Interactive Scenarios</h3>
                     <p className="text-[#CCCCD9] text-xs md:text-sm font-light leading-relaxed">
                        Safe learning games where girls practice identifying real-world dangers, answering practice prompts to boost their boundary-setting skills.
                     </p>
                  </SpotlightCard>
               </motion.div>

               <motion.div variants={fadeInUp} className="h-full">
                  <SpotlightCard className="p-6 md:p-8 h-full bg-[#231854]/40">
                     <Video className="h-6 w-6 md:h-8 md:w-8 text-emerald-400 mb-4 md:mb-6" />
                     <h3 className="text-base md:text-lg font-bold text-white mb-2">Video & Lesson Vault</h3>
                     <p className="text-[#CCCCD9] text-xs md:text-sm font-light leading-relaxed">
                        Clear, short video assets that break down anatomical facts simply. Keeps attention focused on verified, clinically solid facts.
                     </p>
                  </SpotlightCard>
                </motion.div>
            </motion.div>
         </div>
      </section>

      {/* --- SECTION 5: ESCALATION PROTOCOL (Authority & Control) --- */}
      <section className="py-20 md:py-32 bg-[#231854]/20 border-y border-white/5 overflow-hidden">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
               
               <motion.div 
                 initial={{ opacity: 0, x: -30 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true, margin: "-50px" }}
                 transition={{ duration: 1.2, ease: premiumSmooth }}
                 className="order-2 lg:order-1"
               >
                  <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-6">When danger is real, help is one tap away.</h2>
                  <p className="text-[#CCCCD9] text-sm md:text-lg font-light leading-relaxed mb-6 md:mb-8">
                     Education builds protection, but crisis requires active assistance. Heal Her provides a direct bridge to real-world safety whenever defensive limits are crossed.
                  </p>
                  <ul className="space-y-4 md:space-y-6">
                     <li className="flex items-start gap-3 md:gap-4">
                        <div className="p-2.5 md:p-3 rounded-xl bg-[#1C1246] border border-white/10 shrink-0">
                           <PhoneCall className="h-4 w-4 md:h-5 md:w-5 text-emerald-400" />
                        </div>
                        <div>
                           <h4 className="text-white font-bold mb-1 text-sm md:text-base">Authority Connections</h4>
                           <p className="text-xs md:text-sm text-[#CCCCD9] font-light">Enables immediate routing to verified support help, school guidance advisors, or local protection groups when a real threat is active.</p>
                        </div>
                     </li>
                     <li className="flex items-start gap-3 md:gap-4">
                        <div className="p-2.5 md:p-3 rounded-xl bg-[#1C1246] border border-white/10 shrink-0">
                           <ShieldCheck className="h-4 w-4 md:h-5 md:w-5 text-indigo-400" />
                        </div>
                        <div>
                           <h4 className="text-white font-bold mb-1 text-sm md:text-base">Trusted Guardians Ping</h4>
                           <p className="text-xs md:text-sm text-[#CCCCD9] font-light">Users can securely add trusted contacts. In a scary situation, emergency alerts are dispatched instantly to their pre-chosen support circles.</p>
                        </div>
                     </li>
                  </ul>
               </motion.div>

               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: true, margin: "-50px" }}
                 transition={{ duration: 1.4, ease: premiumSmooth }}
                 className="order-1 lg:order-2 w-full max-w-md mx-auto lg:max-w-none"
               >
                  <RedFlagSimulator />
               </motion.div>

            </div>
         </div>
      </section>

      {/* --- SECTION 6: THE ULTIMATUM (Final CTA) --- */}
      <section className="py-24 md:py-40 relative overflow-hidden bg-[#1C1246]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[800px] h-[300px] md:h-[500px] bg-[#DA8CA0]/10 blur-[100px] md:blur-[150px] rounded-full pointer-events-none" />
        
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 1.2, ease: premiumSmooth }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/5 border border-white/10 text-white text-[10px] md:text-xs font-bold uppercase tracking-widest mb-6 md:mb-8">
               <Lock className="h-3 w-3 md:h-4 md:w-4 text-[#DA8CA0]" /> Break the Cycle
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold text-white mb-6 md:mb-8 tracking-tight leading-[1.1]">
              Every single day we wait,<br className="hidden md:block" /> more girls ask the wrong sources.
            </h2>
            <p className="text-sm md:text-xl text-[#CCCCD9] font-light leading-relaxed mb-10 md:mb-12 max-w-2xl mx-auto px-4">
              Do not leave them exposed to scary myths and silent grooming tactics. Introduce them to a non-judgmental big sister asset built for their absolute safety.
            </p>
            <GlossyButton href="/login" className="scale-105 md:scale-110">
              Deploy Shield Protection Now <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
            </GlossyButton>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}