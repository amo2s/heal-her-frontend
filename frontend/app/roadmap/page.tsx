"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useMotionTemplate, useMotionValue, Variants } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { cn } from "@/lib/utils"
import { 
  CheckCircle, 
  Clock, 
  Activity, 
  Users, 
  Heart,
  Milestone,
  Sparkles,
  MessageCircle,
  Shield,
  Lightbulb,
  Stethoscope,
  Database,
  ArrowRight
} from "lucide-react"

// ============================================================================
// ULTRA-PREMIUM PHYSICS & UTILITIES
// ============================================================================

const premiumSmooth: [number, number, number, number] = [0.16, 1, 0.3, 1]

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
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
    transition: { staggerChildren: 0.12, delayChildren: 0.1 }
  }
}

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95, filter: "blur(8px)" },
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
        "group relative border border-white/10 bg-[#231854]/40 overflow-hidden rounded-[1.5rem] md:rounded-[2rem] transition-all duration-700 hover:border-[#DA8CA0]/40 hover:bg-[#231854]/60",
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
// MAIN PAGE COMPONENT
// ============================================================================

export default function RoadmapPage() {
  return (
    <div className="relative min-h-screen bg-[#1C1246] text-[#FAFAFA] selection:bg-[#DA8CA0]/30 selection:text-[#DA8CA0] overflow-x-hidden">
      <GrainOverlay />
      <Navigation />

      {/* --- SECTION 1: THE ILLUMINATED HORIZON (Hero) --- */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 min-h-[100svh] flex flex-col justify-center border-b border-white/5 overflow-hidden">
        
        <div className="absolute inset-0 z-0">
          <Image
            src="/eleven-hero.png"
            alt="The Clear Path Forward"
            fill
            className="object-cover object-center opacity-70 md:opacity-85"
            priority
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#1C1246_90%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1C1246]/95 via-[#1C1246]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1246] via-transparent to-[#1C1246]/40" />
        </div>
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 w-full text-left pt-12 md:pt-0">
           <motion.div 
             initial="hidden"
             animate="visible"
             variants={staggerContainer}
             className="max-w-2xl"
           >
              <motion.div variants={scaleIn} className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/5 border border-white/10 text-white text-[10px] md:text-xs font-bold uppercase tracking-widest mb-6 md:mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(218,140,160,0.15)]">
                 <Milestone className="h-3.5 w-3.5 text-[#DA8CA0]" /> Strategic Trajectory
              </motion.div>

              <motion.h1 
                variants={fadeInUp}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1] drop-shadow-2xl"
              >
                The Path Forward.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DA8CA0] to-[#E8B4C1]">Built by the community.</span>
              </motion.h1>

              <motion.p 
                variants={fadeInUp}
                className="text-sm sm:text-base md:text-xl text-[#CCCCD9] leading-relaxed font-light mb-8 md:mb-10 max-w-lg drop-shadow-lg"
              >
                We do not guess what young women need. We listen. Explore how our active, organic grassroots movement is shaping the future of global digital health.
              </motion.p>
           </motion.div>
        </div>

        {/* THIN WATERMARK COVER STICKER */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 1.2, ease: premiumSmooth }}
          className="absolute bottom-6 right-4 md:bottom-8 md:right-8 z-50 flex items-center gap-2 bg-[#1C1246]/95 backdrop-blur-xl border border-[#DA8CA0]/30 px-3 py-1.5 md:px-4 md:py-2 rounded-full shadow-[0_8px_30px_rgba(218,140,160,0.15)]"
        >
           <div className="relative flex h-2 w-2 md:h-2.5 md:w-2.5">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DA8CA0] opacity-75"></span>
             <span className="relative inline-flex rounded-full h-2 w-2 md:h-2.5 md:w-2.5 bg-[#DA8CA0]"></span>
           </div>
           <span className="text-[#DA8CA0] text-[9px] md:text-[10px] uppercase font-mono tracking-widest mt-0.5">Timeline: SYNCHRONIZED</span>
        </motion.div>
      </section>

      {/* --- SECTION 2: THE ENHANCED LADDER (Timeline) --- */}
      <section className="py-20 md:py-32 bg-[#1C1246]">
         <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative">
            
            {/* The Glowing Spine */}
            <div className="absolute left-[39px] md:left-[49px] top-8 bottom-8 w-[2px] bg-gradient-to-b from-[#DA8CA0] via-indigo-500 to-[#1C1246] opacity-30 shadow-[0_0_15px_rgba(218,140,160,0.5)]" />

            <div className="space-y-20 md:space-y-32">
               
               {/* PHASE 1 */}
               <motion.div 
                 initial="hidden" 
                 whileInView="visible" 
                 viewport={{ once: true, margin: "-100px" }} 
                 variants={staggerContainer}
                 className="relative pl-20 md:pl-28"
               >
                  {/* Spine Node */}
                  <div className="absolute left-[24px] md:left-[34px] top-0 w-8 h-8 rounded-full bg-[#1C1246] border-2 border-emerald-500 flex items-center justify-center z-10 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                     <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </div>

                  <motion.div variants={fadeInUp} className="mb-6">
                     <h2 className="text-3xl md:text-5xl font-bold text-white mb-3">Grassroots Foundation</h2>
                     <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[10px] md:text-xs font-bold tracking-widest uppercase border border-emerald-500/20">
                        <CheckCircle className="h-3 w-3" /> Status: Active Alignment
                     </div>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                     <SpotlightCard className="p-6 md:p-8 bg-[#231854]/40 border-emerald-500/10">
                        <div className="flex items-center gap-4 mb-4">
                           <div className="p-3 bg-emerald-500/10 rounded-xl">
                              <Users className="h-6 w-6 text-emerald-400" />
                           </div>
                           <h3 className="text-xl md:text-2xl font-bold text-white">The Core 200+</h3>
                        </div>
                        <p className="text-[#CCCCD9] text-sm md:text-base leading-relaxed font-light mb-6">
                           We bypassed hypothetical data and built our foundation on truth. Over 200 individuals have organically come together in our community. They are actively testing the platform, breaking long-held taboos, and sharing exactly what information they need regarding their bodies. Their immediate feedback dictates our entire architecture.
                        </p>
                        <div className="flex flex-wrap gap-2">
                           <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] md:text-xs text-[#CCCCD9]">Real-world validation</span>
                           <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] md:text-xs text-[#CCCCD9]">Direct feedback loops</span>
                        </div>
                     </SpotlightCard>
                  </motion.div>
               </motion.div>

               {/* PHASE 2 */}
               <motion.div 
                 initial="hidden" 
                 whileInView="visible" 
                 viewport={{ once: true, margin: "-100px" }} 
                 variants={staggerContainer}
                 className="relative pl-20 md:pl-28"
               >
                  {/* Spine Node */}
                  <div className="absolute left-[24px] md:left-[34px] top-0 w-8 h-8 rounded-full bg-[#1C1246] border-2 border-[#DA8CA0] flex items-center justify-center z-10 shadow-[0_0_20px_rgba(218,140,160,0.3)]">
                     <div className="w-2.5 h-2.5 rounded-full bg-[#DA8CA0] animate-pulse" />
                  </div>

                  <motion.div variants={fadeInUp} className="mb-6">
                     <h2 className="text-3xl md:text-5xl font-bold text-white mb-3">Feature Expansion</h2>
                     <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#DA8CA0]/10 text-[#DA8CA0] text-[10px] md:text-xs font-bold tracking-widest uppercase border border-[#DA8CA0]/20">
                        <Activity className="h-3 w-3" /> Status: In Development
                     </div>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                     <SpotlightCard className="p-6 md:p-8 bg-[#231854]/40 border-[#DA8CA0]/20 shadow-[0_10px_40px_rgba(218,140,160,0.05)]">
                        <div className="flex items-center gap-4 mb-4">
                           <div className="p-3 bg-[#DA8CA0]/10 rounded-xl">
                              <Database className="h-6 w-6 text-[#DA8CA0]" />
                           </div>
                           <h3 className="text-xl md:text-2xl font-bold text-white">Engineering Scale</h3>
                        </div>
                        <p className="text-[#CCCCD9] text-sm md:text-base leading-relaxed font-light">
                           Translating grassroots insights into robust technology. We are currently finalizing our lightweight offline-caching protocols to ensure girls in areas with slow internet can still access critical cycle logs and emergency red-flag simulations instantly.
                        </p>
                     </SpotlightCard>
                  </motion.div>
               </motion.div>

               {/* PHASE 3 */}
               <motion.div 
                 initial="hidden" 
                 whileInView="visible" 
                 viewport={{ once: true, margin: "-100px" }} 
                 variants={staggerContainer}
                 className="relative pl-20 md:pl-28"
               >
                  {/* Spine Node */}
                  <div className="absolute left-[24px] md:left-[34px] top-0 w-8 h-8 rounded-full bg-[#1C1246] border-2 border-indigo-500 flex items-center justify-center z-10 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                     <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  </div>

                  <motion.div variants={fadeInUp} className="mb-6">
                     <h2 className="text-3xl md:text-5xl font-bold text-white mb-3">Systemic Impact</h2>
                     <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-indigo-500/10 text-indigo-400 text-[10px] md:text-xs font-bold tracking-widest uppercase border border-indigo-500/20">
                        <Clock className="h-3 w-3" /> Status: Scheduled Roadmap
                     </div>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                     <SpotlightCard className="p-6 md:p-8 bg-[#231854]/40 border-indigo-500/10">
                        <div className="flex items-center gap-4 mb-4">
                           <div className="p-3 bg-indigo-500/10 rounded-xl">
                              <Shield className="h-6 w-6 text-indigo-400" />
                           </div>
                           <h3 className="text-xl md:text-2xl font-bold text-white">Institutional Integration</h3>
                        </div>
                        <p className="text-[#CCCCD9] text-sm md:text-base leading-relaxed font-light">
                           The ultimate goal is to fuse the Heal Her platform with official educational and healthcare infrastructure. Deploying customized, age-gated versions directly into school curriculums and establishing secure bridges to certified clinical professionals.
                        </p>
                     </SpotlightCard>
                  </motion.div>
               </motion.div>

            </div>
         </div>
      </section>

      {/* --- SECTION 3: FEATURE RELEASE PLAN --- */}
      <section className="py-20 md:py-32 bg-[#231854]/20 border-y border-white/5">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-50px" }}
               transition={{ duration: 1.2, ease: premiumSmooth }}
               className="text-center mb-16 md:mb-20"
            >
               <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Feature Release Plan</h2>
               <p className="text-[#CCCCD9] text-sm md:text-lg max-w-2xl mx-auto font-light leading-relaxed px-2">
                  We do not believe in phantom metrics. Here is exactly what our community is interacting with right now, and what we are building next.
               </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
               
               {/* In Beta */}
               <motion.div 
                 initial={{ opacity: 0, x: -30 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true, margin: "-50px" }}
                 transition={{ duration: 1.2, ease: premiumSmooth }}
                 className="space-y-6"
               >
                  <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                     <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                     <h3 className="text-xl font-bold text-white uppercase tracking-wider">Live in Beta</h3>
                  </div>
                  
                  <SpotlightCard className="p-6 bg-[#1C1246] border-emerald-500/20">
                     <h4 className="text-white font-bold text-lg mb-2">Plain-Language Interface</h4>
                     <p className="text-[#CCCCD9] text-xs md:text-sm font-light">Stripping away complex medical jargon so explanations about puberty and cycles are instantly understandable for young users.</p>
                  </SpotlightCard>

                  <SpotlightCard className="p-6 bg-[#1C1246] border-emerald-500/20">
                     <h4 className="text-white font-bold text-lg mb-2">Red-Flag Simulator</h4>
                     <p className="text-[#CCCCD9] text-xs md:text-sm font-light">An interactive module where users practice identifying predatory language and coercion tactics in safe, simulated chat scenarios.</p>
                  </SpotlightCard>
               </motion.div>

               {/* In Queue */}
               <motion.div 
                 initial={{ opacity: 0, x: 30 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true, margin: "-50px" }}
                 transition={{ duration: 1.2, ease: premiumSmooth }}
                 className="space-y-6"
               >
                  <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                     <div className="h-2 w-2 rounded-full bg-[#DA8CA0]" />
                     <h3 className="text-xl font-bold text-white uppercase tracking-wider">In the Queue</h3>
                  </div>
                  
                  <SpotlightCard className="p-6 bg-[#1C1246] border-[#DA8CA0]/20">
                     <h4 className="text-white font-bold text-lg mb-2">Clinical Bridge API</h4>
                     <p className="text-[#CCCCD9] text-xs md:text-sm font-light">A secure routing system that detects acute medical distress and offers direct connection links to verified partner clinics and counselors.</p>
                  </SpotlightCard>

                  <SpotlightCard className="p-6 bg-[#1C1246] border-[#DA8CA0]/20">
                     <h4 className="text-white font-bold text-lg mb-2">Vernacular Support</h4>
                     <p className="text-[#CCCCD9] text-xs md:text-sm font-light">Expanding the core logic engine to natively process and respond in Pidgin English, Hausa, Yoruba, and Igbo dialects.</p>
                  </SpotlightCard>
               </motion.div>

            </div>
         </div>
      </section>

      {/* --- SECTION 4: THE COMMUNITY PULSE (Insights Core) --- */}
      <section className="py-20 md:py-32 bg-[#1C1246]">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-50px" }}
               transition={{ duration: 1.2, ease: premiumSmooth }}
               className="mb-12 md:mb-16"
            >
               <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white text-[10px] md:text-xs font-bold uppercase tracking-widest mb-6">
                  <Lightbulb className="h-3.5 w-3.5 text-[#DA8CA0]" /> Live Insights
               </div>
               <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">The Community Pulse</h2>
               <p className="text-[#CCCCD9] text-sm md:text-lg max-w-2xl font-light leading-relaxed">
                  Our roadmap isn't guessed in a boardroom. It is built directly from the anonymized knowledge gaps and critical needs discovered inside our 200+ member group.
               </p>
            </motion.div>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
               <motion.div variants={fadeInUp} className="h-full">
                  <SpotlightCard className="p-6 md:p-8 h-full bg-[#231854]/40">
                     <h3 className="text-4xl font-bold text-white mb-2 opacity-50">01</h3>
                     <h4 className="text-lg font-bold text-[#DA8CA0] mb-4">Total Anonymity</h4>
                     <p className="text-[#CCCCD9] text-sm font-light leading-relaxed">
                        Insight: Girls will not ask vital questions if they fear their profile is tracked. Absolute, zero-knowledge privacy is not a feature, it is the fundamental requirement for trust.
                     </p>
                  </SpotlightCard>
               </motion.div>

               <motion.div variants={fadeInUp} className="h-full">
                  <SpotlightCard className="p-6 md:p-8 h-full bg-[#231854]/40">
                     <h3 className="text-4xl font-bold text-white mb-2 opacity-50">02</h3>
                     <h4 className="text-lg font-bold text-indigo-400 mb-4">Myth Decoupling</h4>
                     <p className="text-[#CCCCD9] text-sm font-light leading-relaxed">
                        Insight: Over 60% of initial health questions involve verifying dangerous internet rumors. The AI must aggressively detect and dismantle social media misinformation instantly.
                     </p>
                  </SpotlightCard>
               </motion.div>

               <motion.div variants={fadeInUp} className="h-full">
                  <SpotlightCard className="p-6 md:p-8 h-full bg-[#231854]/40">
                     <h3 className="text-4xl font-bold text-white mb-2 opacity-50">03</h3>
                     <h4 className="text-lg font-bold text-emerald-400 mb-4">Actionable Scripts</h4>
                     <p className="text-[#CCCCD9] text-sm font-light leading-relaxed">
                        Insight: Knowing a situation is unsafe isn't enough. Users explicitly requested exact phrases and scripts they can copy to shut down manipulation from online strangers.
                     </p>
                  </SpotlightCard>
               </motion.div>
            </motion.div>
         </div>
      </section>

      {/* --- SECTION 5: CO-CREATION FRAMEWORK (Institutional CTA) --- */}
      <section className="py-24 md:py-32 relative overflow-hidden bg-[#231854]/20 border-t border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-indigo-500/10 blur-[100px] md:blur-[150px] rounded-full pointer-events-none" />
        
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 1.2, ease: premiumSmooth }}
          >
            <div className="mx-auto w-16 h-16 rounded-2xl bg-[#1C1246] border border-white/10 flex items-center justify-center mb-8 shadow-xl">
               <Stethoscope className="h-8 w-8 text-white" />
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight leading-[1.1]">
              Shape the Architecture.
            </h2>
            <p className="text-sm md:text-lg text-[#CCCCD9] font-light leading-relaxed mb-10 md:mb-12 max-w-3xl mx-auto px-4">
              We are actively expanding our Co-Creation Framework. If you are a medical practitioner, a specialized health educator, or a UI/UX architect passionate about digital safety, we invite you to audit, refine, and build alongside us.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
               <GlossyButton href="/contact" className="w-full sm:w-auto">
                 Initiate Collaboration <ArrowRight className="h-4 w-4" />
               </GlossyButton>
               <Link href="/about" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-colors font-bold text-sm tracking-wide">
                 Review Our Methodology
               </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}