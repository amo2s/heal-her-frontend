"use client"

import React from "react"
import { motion, useMotionTemplate, useMotionValue, Variants } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { cn } from "@/lib/utils"
import { 
  CheckCircle, 
  Target, 
  Clock, 
  Zap, 
  Smartphone, 
  Activity, 
  Eye, 
  Radio, 
  Users, 
  Heart,
  Milestone,
  Globe,
  Sparkles,
  MessageCircle,
  MapPin,
  Calendar,
  Shield,
  Link
} from "lucide-react"
import { Button } from "@/components/ui/button"

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
      staggerChildren: 0.15,
      delayChildren: 0.2
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
    <div className="relative min-h-screen bg-[#1C1246] text-[#FAFAFA] selection:bg-[#DA8CA0]/30 selection:text-[#DA8CA0]">
      <GrainOverlay />
      <Navigation />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[#DA8CA0]/10 blur-[120px] rounded-full -z-10" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
           <motion.div
             initial={{ scale: 0.9, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ duration: 0.8 }}
             className="mb-8 inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-[#231854] border border-[#DA8CA0]/20 shadow-2xl shadow-[#DA8CA0]/10"
           >
             <Milestone className="h-8 w-8 text-[#DA8CA0]" />
           </motion.div>

           <TextReveal 
             text="The Path Forward." 
             className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6"
           />

           <p className="max-w-2xl mx-auto text-lg text-[#CCCCD9] leading-relaxed">
             Our vision for the future of Heal Her. From a campus pilot to a national movement for girls' health and safety.
           </p>
        </div>
      </section>

      {/* --- TIMELINE CONTAINER --- */}
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-32">
         {/* Vertical Connector Line */}
         <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#DA8CA0] via-purple-500 to-[#1C1246] md:-translate-x-1/2 opacity-20" />

         {/* --- PHASE 1: FOUNDATION (Completed) --- */}
         <div className="relative mb-24">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8">
               <div className="md:w-1/2 md:pr-12 md:text-right pl-16 md:pl-0 relative">
                  <div className="absolute left-[-2px] md:left-auto md:right-[-6px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] z-10 ring-4 ring-[#1C1246]" />
                  <h2 className="text-3xl font-bold text-white mb-2">Phase 1: Foundation</h2>
                  <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs font-mono border border-emerald-500/20">
                     <CheckCircle className="h-3 w-3" /> STATUS: LIVE (Campus Beta)
                  </div>
               </div>
               <div className="md:w-1/2 pl-16 md:pl-12 hidden md:block" />
            </div>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 gap-8 pl-16 md:pl-0"
            >
               <motion.div variants={fadeInUp}>
                 <SpotlightCard className="p-6 bg-[#231854]/80 md:mr-6 border-[#DA8CA0]/10">
                    <div className="flex items-center gap-3 mb-4">
                       <Heart className="h-6 w-6 text-[#DA8CA0]" />
                       <h3 className="font-bold text-white">Core Empathy Engine</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-[#CCCCD9]">
                       <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-emerald-500" /> Sentiment analysis for comforting responses</li>
                       <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-emerald-500" /> "Big Sister" persona calibration</li>
                       <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-emerald-500" /> Basic cycle tracking advice</li>
                    </ul>
                 </SpotlightCard>
               </motion.div>

               <motion.div variants={fadeInUp}>
                 <SpotlightCard className="p-6 bg-[#231854]/80 md:ml-6 border-[#DA8CA0]/10">
                    <div className="flex items-center gap-3 mb-4">
                       <Shield className="h-6 w-6 text-[#DA8CA0]" />
                       <h3 className="font-bold text-white">Privacy Architecture</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-[#CCCCD9]">
                       <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-emerald-500" /> Zero-knowledge user IDs</li>
                       <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-emerald-500" /> Ephemeral chat storage</li>
                       <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-emerald-500" /> "Red Flag" safety overrides</li>
                    </ul>
                 </SpotlightCard>
               </motion.div>
            </motion.div>
         </div>

         {/* --- PHASE 2: GROWTH (Active) --- */}
         <div className="relative mb-24">
            <div className="flex flex-col md:flex-row-reverse items-center justify-between mb-8">
               <div className="md:w-1/2 md:pl-12 pl-16 relative">
                  <div className="absolute left-[-2px] md:left-[-6px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#DA8CA0] shadow-[0_0_15px_rgba(218,140,160,0.5)] z-10 ring-4 ring-[#1C1246]" />
                  <h2 className="text-3xl font-bold text-white mb-2">Phase 2: Growth</h2>
                  <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-[#DA8CA0]/10 text-[#DA8CA0] text-xs font-mono border border-[#DA8CA0]/20">
                     <Activity className="h-3 w-3 animate-pulse" /> STATUS: IN PROGRESS (Q2 2026)
                  </div>
               </div>
               <div className="md:w-1/2 md:pr-12 md:text-right hidden md:block" />
            </div>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 gap-8 pl-16 md:pl-0"
            >
               {/* Left Column */}
               <div className="space-y-6 md:mr-6 md:text-right">
                  <motion.div variants={fadeInUp}>
                    <SpotlightCard className="p-6 bg-[#231854]/60 border-l-4 md:border-l-0 md:border-r-4 border-[#DA8CA0]">
                       <h3 className="font-bold text-white mb-2">Mobile App Launch</h3>
                       <p className="text-sm text-[#CCCCD9]">Dedicated iOS and Android apps with offline mode for girls in rural areas with poor internet.</p>
                    </SpotlightCard>
                  </motion.div>
                  <motion.div variants={fadeInUp}>
                    <SpotlightCard className="p-6 bg-[#231854]/60 border-l-4 md:border-l-0 md:border-r-4 border-[#DA8CA0]">
                       <h3 className="font-bold text-white mb-2">Local Languages</h3>
                       <p className="text-sm text-[#CCCCD9]">Adding Pidgin, Hausa, Yoruba, and Igbo to ensure language is never a barrier to health.</p>
                    </SpotlightCard>
                  </motion.div>
               </div>

               {/* Right Column */}
               <div className="space-y-6 md:ml-6">
                  <motion.div variants={fadeInUp}>
                    <SpotlightCard className="p-6 bg-[#231854]/60 border-l-4 border-[#DA8CA0]">
                       <h3 className="font-bold text-white mb-2">Community Hub</h3>
                       <p className="text-sm text-[#CCCCD9]">Verified, anonymous forums where girls can share stories and support each other.</p>
                    </SpotlightCard>
                  </motion.div>
                  <motion.div variants={fadeInUp}>
                    <SpotlightCard className="p-6 bg-[#231854]/60 border-l-4 border-[#DA8CA0]">
                       <h3 className="font-bold text-white mb-2">Voice Chat</h3>
                       <p className="text-sm text-[#CCCCD9]">Speak naturally to Heal Her. Perfect for users who struggle with typing or reading.</p>
                    </SpotlightCard>
                  </motion.div>
               </div>
            </motion.div>
         </div>

         {/* --- PHASE 3: EXPANSION (Future) --- */}
         <div className="relative">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8">
               <div className="md:w-1/2 md:pr-12 md:text-right pl-16 md:pl-0 relative">
                  <div className="absolute left-[-2px] md:left-auto md:right-[-6px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)] z-10 ring-4 ring-[#1C1246]" />
                  <h2 className="text-3xl font-bold text-white mb-2">Phase 3: Impact</h2>
                  <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-purple-500/10 text-purple-400 text-xs font-mono border border-purple-500/20">
                     <Clock className="h-3 w-3" /> STATUS: PLANNED (2027+)
                  </div>
               </div>
               <div className="md:w-1/2 pl-16 md:pl-12 hidden md:block" />
            </div>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 gap-8 pl-16 md:pl-0"
            >
               <motion.div variants={fadeInUp}>
                 <SpotlightCard className="p-6 bg-[#231854]/40 md:mr-6 border border-purple-500/20">
                    <div className="flex items-center gap-3 mb-3">
                       <MapPin className="h-5 w-5 text-purple-500" />
                       <h3 className="font-bold text-white">Tele-Health Connect</h3>
                    </div>
                    <p className="text-sm text-[#CCCCD9] mb-4">Direct booking integration with partner clinics and verified doctors for cases AI cannot handle.</p>
                 </SpotlightCard>
               </motion.div>

               <motion.div variants={fadeInUp}>
                 <SpotlightCard className="p-6 bg-[#231854]/40 md:ml-6 border border-purple-500/20">
                    <div className="flex items-center gap-3 mb-3">
                       <Users className="h-5 w-5 text-purple-500" />
                       <h3 className="font-bold text-white">School Partnerships</h3>
                    </div>
                    <p className="text-sm text-[#CCCCD9] mb-4">Official rollout into secondary school curriculums across Nigeria as a digital health supplement.</p>
                 </SpotlightCard>
               </motion.div>
            </motion.div>
         </div>

      </div>

      {/* --- WHY THIS TIMELINE? (New Section) --- */}
      <section className="py-24 bg-[#231854]/20 border-t border-white/5">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white text-center mb-16">The Strategy</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
               <SpotlightCard className="p-8 h-full bg-[#1C1246] border-[#DA8CA0]/10">
                  <div className="w-12 h-12 rounded-full bg-[#DA8CA0]/10 flex items-center justify-center mb-6">
                     <Heart className="h-6 w-6 text-[#DA8CA0]" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">1. Build Trust First</h3>
                  <p className="text-[#CCCCD9] text-sm leading-relaxed">
                     We started on a university campus (Uni Jos) because trust is local. By proving our value to 5,000 students, we create ambassadors who will carry the message home.
                  </p>
               </SpotlightCard>

               <SpotlightCard className="p-8 h-full bg-[#1C1246] border-[#DA8CA0]/10">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
                     <Globe className="h-6 w-6 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">2. Solve Access</h3>
                  <p className="text-[#CCCCD9] text-sm leading-relaxed">
                     Once the AI is perfect, we focus on distribution. Offline mode and local languages break the barriers that keep rural girls from getting help.
                  </p>
               </SpotlightCard>

               <SpotlightCard className="p-8 h-full bg-[#1C1246] border-[#DA8CA0]/10">
                  <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-6">
                     <Target className="h-6 w-6 text-purple-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">3. Systemic Change</h3>
                  <p className="text-[#CCCCD9] text-sm leading-relaxed">
                     Ultimately, we integrate with the healthcare system. We don't replace doctors; we become the smartest, fastest triage nurse in the country.
                  </p>
               </SpotlightCard>
            </div>
         </div>
      </section>

      {/* --- COMMUNITY MILESTONES (New Section) --- */}
      <section className="py-24 border-t border-white/5 bg-[#231854]/30">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
               <h2 className="text-3xl font-bold text-white">Community Goals</h2>
               <div className="flex items-center gap-2 text-xs text-[#DA8CA0] font-mono">
                  <Calendar className="h-4 w-4" /> 2026 PROJECTIONS
               </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               <div className="p-6 rounded-2xl bg-[#1C1246] border border-[#DA8CA0]/20 text-center">
                  <div className="text-3xl font-bold text-white mb-2">10k+</div>
                  <div className="text-xs text-[#CCCCD9] uppercase">Active Users</div>
               </div>
               <div className="p-6 rounded-2xl bg-[#1C1246] border border-[#DA8CA0]/20 text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">50</div>
                  <div className="text-xs text-[#CCCCD9] uppercase">Partner Schools</div>
               </div>
               <div className="p-6 rounded-2xl bg-[#1C1246] border border-[#DA8CA0]/20 text-center">
                  <div className="text-3xl font-bold text-emerald-400 mb-2">100k</div>
                  <div className="text-xs text-[#CCCCD9] uppercase">Questions Answered</div>
               </div>
               <div className="p-6 rounded-2xl bg-[#1C1246] border border-[#DA8CA0]/20 text-center">
                  <div className="text-3xl font-bold text-rose-400 mb-2">5</div>
                  <div className="text-xs text-[#CCCCD9] uppercase">Universities</div>
               </div>
            </div>
         </div>
      </section>

      {/* --- CTA --- */}
      <section className="py-24 relative overflow-hidden">
         <div className="absolute inset-0 bg-[#DA8CA0]/10" />
         <div className="mx-auto max-w-4xl px-4 text-center relative z-10">
            <h2 className="text-4xl font-bold text-white mb-6">Be Part of the Journey.</h2>
            <p className="text-lg text-[#CCCCD9] mb-8">
               Your feedback shapes this roadmap. Join us in building the future of girls' health.
            </p>
            <Button asChild size="lg" className="h-14 rounded-full bg-white text-[#1C1246] text-lg font-bold hover:bg-[#DA8CA0] hover:text-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]">
               <Link href="/chat" className="flex items-center gap-2">
                  Join the Beta <MessageCircle className="h-5 w-5" />
               </Link>
            </Button>
         </div>
      </section>

      <Footer />
    </div>
  )
}