"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence, useMotionTemplate, useMotionValue, Variants } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { 
  School, 
  MapPin, 
  Users, 
  Heart, 
  Activity, 
  Zap, 
  ArrowRight,
  ShieldAlert,
  GraduationCap,
  WifiOff,      
  Smartphone,   
  Signal,       
  Sun,
  Moon,
  BookOpen,
  Smile,
  Lock,
  Wifi,
  Sparkles,
  Eye,
  ShieldCheck,
  BrainCircuit,
  Fingerprint,
  CheckCircle2
} from "lucide-react"

// ============================================================================
// ULTRA-PREMIUM UTILITY COMPONENTS & ANIMATIONS
// ============================================================================

const ultraSmooth: [number, number, number, number] = [0.16, 1, 0.3, 1]

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
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
    transition: { staggerChildren: 0.12, delayChildren: 0.1 }
  }
}

const GlowingBadge = ({ children, icon: Icon }: { children: React.ReactNode; icon?: any }) => (
  <div className="inline-flex items-center gap-2 rounded-full border border-white/20 border-t-[#DA8CA0]/60 bg-gradient-to-r from-[#DA8CA0]/20 to-black/20 px-4 py-1.5 md:px-5 md:py-2 text-xs md:text-sm font-bold tracking-wide text-white backdrop-blur-xl shadow-[inset_0_1px_2px_rgba(255,255,255,0.3)]">
    {Icon && <Icon className="h-3 w-3 md:h-4 md:w-4 text-[#DA8CA0] animate-pulse" />}
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
        "group relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem] bg-gradient-to-b from-[#231854]/80 to-[#1C1246]/95 border border-white/10 border-t-white/20 backdrop-blur-2xl shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_15px_30px_-10px_rgba(28,18,70,0.8)] transition-all duration-700 hover:border-[#DA8CA0]/40 hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.2),0_20px_40px_-10px_rgba(218,140,160,0.2)] will-change-transform",
        className
      )}
      onMouseMove={handleMouseMove}
      whileHover={{ scale: 1.02, transition: { duration: 0.4, ease: ultraSmooth } }}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[1.5rem] md:rounded-[2rem] opacity-0 transition duration-700 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              600px circle at ${mouseX}px ${mouseY}px,
              rgba(218, 140, 160, 0.15),
              transparent 80%
            )
          `,
        }}
      />
      <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-[#DA8CA0]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="relative h-full z-10">{children}</div>
    </motion.div>
  )
}

// ============================================================================
// COMPONENT: THE EMPOWERMENT PORTAL
// ============================================================================

function EmpowermentPortal() {
  const [activeIndex, setActiveIndex] = useState<number>(0)
  
  const portals = [
    {
       icon: Eye,
       title: "Predator Radar",
       risk: "Hidden grooming tactics or manipulative behavior online and offline.",
       armor: "Advanced behavioral pattern recognition and red-flag identification.",
       power: "The unshakeable confidence to block, report, and walk away."
    },
    {
       icon: Activity,
       title: "Reproductive Literacy",
       risk: "Ignoring severe physical symptoms due to fear, myths, or embarrassment.",
       armor: "Verified medical truths explaining exactly how her system functions.",
       power: "The ability to fiercely advocate for her own health in a doctor's office."
    },
    {
       icon: ShieldAlert,
       title: "Boundary Fortress",
       risk: "Yielding to peer pressure or unwanted physical advances.",
       armor: "Psychological tools and scripts to establish absolute personal limits.",
       power: "Total autonomy and control over her physical and digital space."
    }
  ]

  return (
    <div className="flex flex-col gap-3 md:gap-4 w-full">
      {portals.map((portal, index) => {
        const isActive = activeIndex === index
        return (
          <div 
            key={index}
            onClick={() => setActiveIndex(index)}
            className={cn(
              "cursor-pointer rounded-[1.5rem] md:rounded-[2rem] border transition-all duration-700 ease-out overflow-hidden relative group",
              isActive 
                ? "bg-[#231854] border-[#DA8CA0]/40 shadow-[0_15px_30px_-10px_rgba(218,140,160,0.2)]" 
                : "bg-[#1C1246]/50 border-white/5 hover:border-white/10 hover:bg-[#231854]/40"
            )}
          >
            <div className="p-5 md:p-6 flex items-center justify-between">
               <div className="flex items-center gap-3 md:gap-4">
                  <div className={cn(
                    "h-10 w-10 md:h-12 md:w-12 rounded-xl flex items-center justify-center transition-colors duration-500",
                    isActive ? "bg-[#DA8CA0]/20 text-[#DA8CA0]" : "bg-white/5 text-[#CCCCD9] group-hover:text-white"
                  )}>
                     <portal.icon className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                  <h3 className={cn("text-lg md:text-xl font-bold transition-colors duration-500", isActive ? "text-white" : "text-[#CCCCD9] group-hover:text-white")}>
                    {portal.title}
                  </h3>
               </div>
               <div className={cn(
                 "h-7 w-7 md:h-8 md:w-8 rounded-full border flex items-center justify-center transition-all duration-500",
                 isActive ? "border-[#DA8CA0]/50 bg-[#DA8CA0]/10" : "border-white/10 group-hover:border-white/20"
               )}>
                 <ArrowRight className={cn("h-3 w-3 md:h-4 md:w-4 transition-transform duration-500", isActive ? "text-[#DA8CA0] rotate-90" : "text-[#CCCCD9]")} />
               </div>
            </div>

            <AnimatePresence>
              {isActive && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.6, ease: ultraSmooth }}
                  className="overflow-hidden"
                >
                  <div className="px-5 md:px-6 pb-5 md:pb-6 pt-1 md:pt-2">
                    <div className="space-y-4 border-t border-white/10 pt-4">
                      <div>
                        <span className="text-[9px] md:text-[10px] text-rose-400 font-bold tracking-widest uppercase mb-1 block">The Threat</span>
                        <p className="text-[#CCCCD9] text-xs md:text-sm font-light leading-relaxed">{portal.risk}</p>
                      </div>
                      <div>
                        <span className="text-[9px] md:text-[10px] text-amber-400 font-bold tracking-widest uppercase mb-1 block">The Armor</span>
                        <p className="text-[#CCCCD9] text-xs md:text-sm font-light leading-relaxed">{portal.armor}</p>
                      </div>
                      <div>
                        <span className="text-[9px] md:text-[10px] text-emerald-400 font-bold tracking-widest uppercase mb-1 block">The Power</span>
                        <p className="text-white text-xs md:text-sm font-medium leading-relaxed">{portal.power}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function UseCasesPage() {
  const [activeTab, setActiveTab] = useState("safety")

  // --- 4 TABS CONFIGURATION ---
  const categories = {
    safety: {
      label: "Safety & Predators",
      icon: Lock,
      description: "Equipping her with the radar to spot grooming and physical threats instantly.",
      scenarios: [
        { title: "Digital Grooming", icon: Eye, context: "A stranger online is asking personal questions under the guise of friendship.", ai_action: "Exposes the manipulation tactic and initiates safe block/report protocols." },
        { title: "Physical Harassment", icon: ShieldAlert, context: "Feeling followed or uncomfortable in a public setting.", ai_action: "Provides immediate de-escalation tactics and urges moving to crowded, safe zones." },
        { title: "Peer Coercion", icon: Users, context: "Friends pressuring her to send inappropriate photos.", ai_action: "Delivers strict refusal scripts to establish unbreakable digital boundaries." },
        { title: "Unsafe Transit", icon: MapPin, context: "Navigating late from school and feeling anxious in a taxi.", ai_action: "Reminders for live-location sharing and maintaining environmental vigilance." }
      ]
    },
    body: {
      label: "Reproductive Literacy",
      icon: Heart,
      description: "Translating biological confusion into total ownership of her physical health.",
      scenarios: [
        { title: "Cycle Command", icon: Activity, context: "Irregular cycles causing extreme anxiety and fear.", ai_action: "Explains standard hormonal shifts vs. medical red flags requiring a doctor." },
        { title: "Pain Management", icon: Zap, context: "Debilitating cramps interfering with exams and daily life.", ai_action: "Delivers clinically safe relief methods and validates her physical pain." },
        { title: "Hygiene Autonomy", icon: ShieldCheck, context: "Unprepared for a cycle at school with zero supplies.", ai_action: "Practical, judgment-free survival tactics for makeshift hygiene solutions." },
        { title: "Anatomy Truths", icon: BrainCircuit, context: "Confused by harmful internet myths about physical development.", ai_action: "Destroys myths with verified, age-appropriate anatomical facts." }
      ]
    },
    mind: {
      label: "Mental Resilience",
      icon: Moon,
      description: "Building the emotional armor required to survive teenage psychological warfare.",
      scenarios: [
        { title: "Anxiety Deflection", icon: Activity, context: "Spiraling panic before a major social or academic event.", ai_action: "Initiates clinical grounding techniques (4-7-8 breathing) to reset the nervous system." },
        { title: "Image Fortitude", icon: Smile, context: "Crushed by toxic social media comparisons and body dysmorphia.", ai_action: "Anchors self-worth in internal capabilities rather than digital aesthetics." },
        { title: "Isolation Relief", icon: Users, context: "Feeling entirely alone and ostracized by friend groups.", ai_action: "Provides empathetic stabilization and strategies for identifying true allies." },
        { title: "Hormonal Context", icon: Sparkles, context: "Experiencing severe, unexplained mood drops.", ai_action: "Maps emotional states to cycle phases to remove the guilt of feeling down." }
      ]
    },
    school: {
      label: "Academic & Social",
      icon: School,
      description: "Navigating the high-stakes environment of school and peer hierarchies.",
      scenarios: [
        { title: "Bullying & Extortion", icon: ShieldAlert, context: "Targeted by classmates or seniors for intimidation.", ai_action: "Clear, safe blueprints for documenting abuse and involving proper authorities." },
        { title: "Focus Optimization", icon: BookOpen, context: "Unable to study due to overwhelming digital distractions.", ai_action: "Actionable frameworks for focus management and deep-work execution." },
        { title: "Social Hierarchies", icon: Users, context: "Caught in the middle of destructive gossip or rumors.", ai_action: "Tactics for emotional detachment and protecting personal reputation." },
        { title: "Performance Fear", icon: GraduationCap, context: "Paralyzed by the fear of failure or public speaking.", ai_action: "Cognitive reframing exercises to turn performance anxiety into focus." }
      ]
    }
  }

  return (
    <div className="relative min-h-screen bg-[#1C1246] text-[#FAFAFA] selection:bg-[#DA8CA0]/30 selection:text-[#DA8CA0] font-sans overflow-hidden">
      <Navigation />

      {/* ========== FULL-WIDTH HERO SECTION ========== */}
      <section className="relative min-h-[90vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden">
        
        <div className="absolute inset-0 z-0">
          <Image
            src="/fifth-hero.png"
            alt="The Lifeline Matrix - Interactive Safety Cards"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1C1246]/90 via-[#1C1246]/60 to-[#1C1246]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#1C1246_100%)] opacity-80" />
        </div>
        
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10 text-center mt-20 md:mt-24">
           <motion.div
             initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
             animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
             transition={{ duration: 1.2, ease: ultraSmooth }}
             className="mb-6 md:mb-8"
           >
             <GlowingBadge icon={Fingerprint}>The Ultimate Lifeline</GlowingBadge>
           </motion.div>

           <motion.h1 
             initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
             animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
             transition={{ duration: 1.4, delay: 0.1, ease: ultraSmooth }}
             className="text-4xl sm:text-6xl md:text-8xl font-extrabold tracking-tight text-white mb-4 md:mb-6 leading-[1.1] md:leading-[1.05] drop-shadow-2xl"
           >
             Intelligence as <br className="hidden sm:block"/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DA8CA0] via-[#E8B4C1] to-[#DA8CA0] drop-shadow-lg">Armor.</span>
           </motion.h1>

           <motion.p 
             initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
             animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
             transition={{ duration: 1.4, delay: 0.2, ease: ultraSmooth }}
             className="max-w-2xl mx-auto text-base sm:text-lg md:text-2xl text-[#FAFAFA] leading-relaxed font-light mb-10 md:mb-12 drop-shadow-md px-2"
           >
             This is not a toy. It is a highly secure intelligence engine designed to provide unbreakable safety, predator detection, and absolute reproductive literacy.
           </motion.p>
        </div>

        {/* --- WATERMARK HIDER / TRUST BADGE --- */}
        <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 z-20">
          <div className="backdrop-blur-xl bg-[#1C1246]/80 border border-white/10 rounded-2xl p-2.5 sm:p-4 flex items-center gap-3 sm:gap-4 shadow-[0_20px_40px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.2)]">
             <div className="bg-[#DA8CA0]/20 p-2 rounded-xl border border-[#DA8CA0]/30">
               <ShieldCheck className="w-4 h-4 sm:w-6 sm:h-6 text-[#DA8CA0]" />
             </div>
             <div className="text-left hidden sm:block pr-2">
               <p className="text-white text-xs font-bold uppercase tracking-widest">Verified Infrastructure</p>
               <p className="text-[#CCCCD9] text-[10px] font-medium">Enterprise Security Grade</p>
             </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 1: THE EMPOWERMENT PORTAL --- */}
      <section className="py-16 sm:py-24 md:py-32 px-4 border-t border-white/5 bg-[#1C1246] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
        
        <div className="mx-auto max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            
            {/* Left: Explanation */}
            <motion.div 
              initial={{ opacity: 0, x: -30, filter: "blur(10px)" }} 
              whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }} 
              viewport={{ once: true, margin: "-100px" }} 
              transition={{ duration: 1.2, ease: ultraSmooth }}
            >
              <h2 className="text-xs md:text-sm font-bold tracking-widest text-[#DA8CA0] uppercase mb-3 md:mb-4">Proactive Defense</h2>
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 md:mb-6 leading-tight">The Architecture of Protection.</h3>
              <p className="text-[#CCCCD9] text-base md:text-lg font-light mb-8 md:mb-10 leading-relaxed">
                When a young woman is confused, she is vulnerable. Heal Her removes the confusion immediately. It analyzes her situation and delivers <strong>predator-deflecting knowledge and clinical facts</strong> before danger escalates.
              </p>
              
              <div className="space-y-6 md:space-y-8 mt-8 md:mt-12">
                <div className="flex gap-4 md:gap-5">
                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-[#DA8CA0]/10 flex items-center justify-center border border-[#DA8CA0]/20 shrink-0 shadow-inner">
                     <BrainCircuit className="h-5 w-5 md:h-6 md:w-6 text-[#DA8CA0]" />
                  </div>
                  <div>
                    <h4 className="text-lg md:text-xl text-white font-bold mb-1 md:mb-2">Fact-Based Confidence</h4>
                    <p className="text-sm md:text-base text-[#CCCCD9] font-light leading-relaxed">Replaces dangerous internet rumors with verified biological and psychological truth.</p>
                  </div>
                </div>
                <div className="flex gap-4 md:gap-5">
                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shrink-0 shadow-inner">
                    <Lock className="h-5 w-5 md:h-6 md:w-6 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-lg md:text-xl text-white font-bold mb-1 md:mb-2">Unshakeable Boundaries</h4>
                    <p className="text-sm md:text-base text-[#CCCCD9] font-light leading-relaxed">Trains her to recognize manipulation and assert absolute control over her personal space.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: The Interactive Portal */}
            <motion.div 
              initial={{ opacity: 0, x: 30, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, delay: 0.2, ease: ultraSmooth }}
              className="relative mt-8 lg:mt-0"
            >
              <div className="absolute -inset-10 bg-gradient-to-r from-[#DA8CA0]/20 to-purple-500/20 blur-3xl rounded-full opacity-50 pointer-events-none" />
              <div className="relative">
                <EmpowermentPortal />
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* --- SECTION 2: DYNAMIC USE CASES (TABS) --- */}
      <section className="py-16 sm:py-24 md:py-32 bg-[#231854]/20 border-y border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: ultraSmooth }}
            className="text-center mb-10 md:mb-16"
          >
             <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-3 md:mb-4">Complete Coverage.</h2>
             <p className="text-base md:text-lg text-[#CCCCD9] font-light max-w-2xl mx-auto">Select a category below to see exactly how our intelligence engine processes real-world threats and uncertainties.</p>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div 
            className="flex flex-wrap justify-center gap-3 md:gap-4 mb-10 md:mb-16"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: ultraSmooth }}
          >
            {(Object.keys(categories) as Array<keyof typeof categories>).map((key) => {
              const CategoryIcon = categories[key].icon
              const isActive = activeTab === key
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={cn(
                    "flex items-center gap-2 md:gap-3 px-5 py-3 md:px-8 md:py-4 rounded-full text-xs md:text-sm font-bold transition-all duration-500 border overflow-hidden relative group",
                    isActive 
                      ? "bg-gradient-to-r from-[#DA8CA0] to-[#E8B4C1] border-transparent text-[#1C1246] shadow-[0_10px_30px_-10px_rgba(218,140,160,0.6)] scale-[1.02] md:scale-105" 
                      : "bg-[#231854]/80 border-white/10 text-[#CCCCD9] hover:border-[#DA8CA0]/50 hover:text-white backdrop-blur-md"
                  )}
                >
                  <CategoryIcon className={cn("h-4 w-4 md:h-5 md:w-5", isActive ? "text-[#1C1246]" : "text-[#DA8CA0]")} />
                  {categories[key].label}
                </button>
              )
            })}
          </motion.div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
              transition={{ duration: 0.5, ease: ultraSmooth }}
            >
              <div className="text-center mb-8 md:mb-12">
                <p className="text-[#DA8CA0] text-base md:text-lg font-medium max-w-2xl mx-auto px-4">
                  {categories[activeTab as keyof typeof categories].description}
                </p>
              </div>

              <motion.div 
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
              >
                {categories[activeTab as keyof typeof categories].scenarios.map((scenario, index) => (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    className="h-full"
                  >
                    <SpotlightCard className="bg-[#231854]/40 border-white/5 p-6 md:p-8 hover:border-[#DA8CA0]/30 h-full flex flex-col group cursor-default">
                      <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-[#1C1246] border border-white/10 flex items-center justify-center mb-5 md:mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                        <scenario.icon className="h-5 w-5 md:h-6 md:w-6 text-[#DA8CA0]" />
                      </div>
                      <h3 className="text-lg md:text-xl font-bold text-white mb-2 md:mb-3">{scenario.title}</h3>
                      <p className="text-[#CCCCD9] text-xs md:text-sm font-light mb-6 leading-relaxed flex-grow">
                        "{scenario.context}"
                      </p>
                      
                      <div className="pt-4 border-t border-white/10 mt-auto">
                        <p className="text-[9px] md:text-[10px] text-emerald-400 uppercase tracking-widest font-bold mb-2 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 md:w-3.5 md:h-3.5" /> System Output
                        </p>
                        <p className="text-white text-xs md:text-sm font-medium leading-relaxed">{scenario.ai_action}</p>
                      </div>
                    </SpotlightCard>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </AnimatePresence>

        </div>
      </section>

      {/* --- SECTION 3: UNIVERSAL ACCESS (FIXED LOW DATA SIMULATION) --- */}
      <section className="py-16 sm:py-24 md:py-32 border-t border-white/5 bg-[#1C1246]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
           <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30, filter: "blur(10px)" }}
                whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.2, ease: ultraSmooth }}
              >
                 <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 rounded-full bg-[#DA8CA0]/10 border border-[#DA8CA0]/20 text-[#DA8CA0] text-[10px] md:text-xs font-bold uppercase tracking-widest mb-5 md:mb-6">
                    <Signal className="h-3 w-3 md:h-4 md:w-4" /> Built for Nigeria
                 </div>
                 <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 md:mb-6 leading-tight">Zero Network?<br/>Zero Panic.</h2>
                 <p className="text-base md:text-lg text-[#CCCCD9] font-light mb-6 md:mb-8 leading-relaxed">
                    Safety cannot rely on expensive 5G networks. Heal Her is built with a hyper-efficient backend. When she needs an answer immediately, the system delivers—even on 2G/Edge network conditions in rural locations or deep inside school hostels.
                 </p>

                 <ul className="space-y-4 md:space-y-6">
                    <li className="flex items-start gap-3 md:gap-4">
                       <div className="p-2.5 md:p-3 rounded-xl bg-white/5 border border-white/10 shrink-0">
                         <WifiOff className="h-5 w-5 md:h-6 md:w-6 text-[#DA8CA0]" />
                       </div>
                       <div>
                          <strong className="text-white block text-base md:text-lg mb-1">Low-Bandwidth Execution</strong>
                          <span className="text-sm md:text-base font-light text-[#CCCCD9]">Core literacy guides load instantly without heavy images or tracking scripts.</span>
                       </div>
                    </li>
                    <li className="flex items-start gap-3 md:gap-4">
                       <div className="p-2.5 md:p-3 rounded-xl bg-white/5 border border-white/10 shrink-0">
                         <Smartphone className="h-5 w-5 md:h-6 md:w-6 text-[#DA8CA0]" />
                       </div>
                       <div>
                          <strong className="text-white block text-base md:text-lg mb-1">Hardware Agnostic</strong>
                          <span className="text-sm md:text-base font-light text-[#CCCCD9]">Flawlessly optimized for older Android devices and smaller screens.</span>
                       </div>
                    </li>
                 </ul>
              </motion.div>
              
              {/* FIXED LOW DATA SIMULATION */}
              <motion.div 
                initial={{ opacity: 0, x: 30, filter: "blur(10px)" }}
                whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.2, delay: 0.2, ease: ultraSmooth }}
                className="relative flex justify-center lg:justify-end mt-8 lg:mt-0"
              >
                 <div className="absolute inset-0 bg-[#DA8CA0]/20 rounded-full blur-[80px] md:blur-[100px] opacity-60 pointer-events-none" />
                 <div className="relative w-full max-w-md bg-[#0a0a0a] border border-[#2a2259] border-t-white/10 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] font-mono shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    
                    {/* Terminal Header */}
                    <div className="flex items-center justify-between border-b border-gray-800 pb-3 md:pb-4 mb-4 md:mb-6 text-[#DA8CA0] text-[10px] md:text-xs font-bold tracking-widest">
                       <span>SYS.LITE_v2.0</span>
                       <div className="flex items-center gap-1.5 md:gap-2 text-emerald-500">
                          <span className="animate-pulse">EDGE_NET</span>
                          <div className="flex gap-1 items-end h-2.5 md:h-3">
                             <div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-emerald-500 rounded-sm"/>
                             <div className="w-1 md:w-1.5 h-1.5 md:h-2 bg-emerald-500 rounded-sm"/>
                             <div className="w-1 md:w-1.5 h-2 md:h-3 bg-gray-800 rounded-sm"/>
                             <div className="w-1 md:w-1.5 h-2.5 md:h-4 bg-gray-800 rounded-sm"/>
                          </div>
                       </div>
                    </div>
                    
                    {/* Screen Content */}
                    <div className="space-y-4 md:space-y-5 text-xs md:text-sm lg:text-base">
                       <div className="text-gray-400">QUERY: PREDATOR_DETECTION_01...</div>
                       
                       <div className="w-full h-1 md:h-1.5 bg-gray-900 rounded overflow-hidden">
                          <motion.div 
                            className="h-full bg-emerald-500"
                            initial={{ width: "0%" }}
                            whileInView={{ width: "100%" }}
                            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2, ease: ultraSmooth }}
                          />
                       </div>

                       <div className="text-white space-y-1.5 md:space-y-2 pt-1 md:pt-2">
                          <p><span className="text-[#DA8CA0] font-bold">[!]</span> Isolation Tactic Detected.</p>
                          <p><span className="text-[#DA8CA0] font-bold">[&gt;]</span> Do not change location.</p>
                          <p><span className="text-[#DA8CA0] font-bold">[&gt;]</span> Stay in public view.</p>
                          <p><span className="text-[#DA8CA0] font-bold">[&gt;]</span> Block contact immediately.</p>
                       </div>

                       <div className="text-gray-500 text-[10px] md:text-xs mt-4 md:mt-6 border-t border-gray-800 pt-3 md:pt-4 flex items-center gap-2">
                          Awaiting input <span className="w-1.5 h-3 md:w-2 md:h-4 bg-[#DA8CA0] animate-pulse block" />
                       </div>
                    </div>
                 </div>
              </motion.div>
           </div>
        </div>
      </section>

      {/* ========== FINAL CTA ========== */}
      <section className="relative py-20 sm:py-28 md:py-32 overflow-hidden border-t border-[#DA8CA0]/10 bg-[#1C1246]">
         <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[800px] md:w-[1200px] h-[300px] sm:h-[400px] md:h-[600px] bg-[#DA8CA0]/15 blur-[100px] md:blur-[150px] rounded-full pointer-events-none" />
         </div>

         <motion.div 
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: ultraSmooth }}
            className="relative z-10 mx-auto max-w-4xl px-4 text-center"
         >
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-4 sm:mb-6 md:mb-8 drop-shadow-lg">
               Knowledge is Power.
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-[#CCCCD9] mb-8 sm:mb-10 md:mb-12 max-w-2xl mx-auto font-light leading-relaxed px-2">
               Give her the tools to protect herself, understand her body, and navigate the world with unbreakable confidence.
            </p>
            <div className="flex justify-center">
               <Button asChild className="group relative overflow-hidden h-12 sm:h-14 md:h-18 rounded-full bg-gradient-to-b from-[#f3cbd4] to-[#DA8CA0] px-8 sm:px-10 md:px-14 text-base sm:text-lg md:text-xl font-bold text-[#1C1246] border border-[#DA8CA0]/50 border-t-white/80 shadow-[inset_0_2px_5px_rgba(255,255,255,0.9),0_15px_40px_-10px_rgba(218,140,160,0.6)] hover:from-[#fae0e6] hover:to-[#e19eb0] hover:scale-105 transition-all duration-700 ease-out">
                  <Link href="/login">
                    <div className="absolute top-0 left-[-100%] w-[150%] h-full bg-gradient-to-r from-transparent via-white/50 to-transparent group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
                    <span className="relative z-10 flex items-center gap-2 md:gap-3">
                       Secure Her Access <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
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