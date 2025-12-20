"use client"

import React from "react"
import { motion, useMotionTemplate, useMotionValue, Variants } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { cn } from "@/lib/utils"
import { 
  Globe, 
  Users, 
  Languages, 
  Accessibility, 
  Heart, 
  MapPin, 
  Eye, 
  Cpu, 
  Signal, 
  CheckCircle2,
  Mic,
  MousePointer
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

export default function AccessibilityPage() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30 selection:text-blue-200">
      <GrainOverlay />
      <Navigation />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 -z-10" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
           <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="mb-8 inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-indigo-500/10"
           >
              <Users className="h-8 w-8 text-indigo-500" />
           </motion.div>

           <TextReveal 
             text="Accessibility & Inclusion." 
             className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6"
           />

           <p className="max-w-2xl mx-auto text-lg text-slate-400 leading-relaxed">
             Emergency medical guidance should be available to everyone, everywhere. From Lagos to London, language is no longer a barrier.
           </p>
        </div>
      </section>

      {/* --- CORE MISSION --- */}
      <section className="py-20 border-y border-white/5 bg-slate-900/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
           <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-white mb-6">Healthcare for All</h2>
              <p className="text-lg leading-relaxed text-slate-300">
                 Medical emergencies don't discriminate. Neither should access to life-saving guidance. We're committed to serving all communities, especially those traditionally underserved by healthcare systems.
              </p>
           </div>
        </div>
      </section>

      {/* --- MULTILINGUAL SUPPORT --- */}
      <section className="py-24">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
               
               {/* Left: Text Content */}
               <div className="space-y-8">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                     <Languages className="h-6 w-6" />
                  </div>
                  <h2 className="text-3xl font-bold text-white">Multilingual Core</h2>
                  <p className="text-lg leading-relaxed text-slate-400">
                     Language should never be a barrier to emergency care. MedGuard AI is built to understand human speech, regardless of the dialect or language used.
                  </p>
                  
                  <div className="space-y-6">
                     <div className="flex gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                        <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                        <div>
                           <p className="font-bold text-white mb-1">Universal Language Understanding</p>
                           <p className="text-sm text-slate-400">
                             Speak in English, Yorùbá, Pidgin, or any other language. The AI understands the meaning instantly without needing you to switch settings.
                           </p>
                        </div>
                     </div>
                     <div className="flex gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                        <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                        <div>
                           <p className="font-bold text-white mb-1">Cultural & Regional Context</p>
                           <p className="text-sm text-slate-400">Guidance adapted for cultural norms and regional medical practices in Nigeria and beyond.</p>
                        </div>
                     </div>
                     <div className="flex gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                        <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                        <div>
                           <p className="font-bold text-white mb-1">Pidgin & Dialect Support</p>
                           <p className="text-sm text-slate-400">Optimized to understand broken English and local dialects for immediate comprehension.</p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Right: Language Card */}
               <SpotlightCard className="p-8 bg-slate-950 border-slate-800">
                  <div className="flex items-center gap-3 mb-6">
                     <Globe className="h-5 w-5 text-blue-500" />
                     <h3 className="font-bold text-white">Major Languages Detected</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-slate-400">
                     <div className="p-2 border-b border-slate-800 text-white font-medium">English</div>
                     <div className="p-2 border-b border-slate-800 text-white font-medium">Pidgin</div>
                     <div className="p-2 border-b border-slate-800 text-white font-medium">Yorùbá</div>
                     <div className="p-2 border-b border-slate-800 text-white font-medium">Igbo</div>
                     <div className="p-2 border-b border-slate-800 text-white font-medium">Hausa</div>
                     <div className="p-2 border-b border-slate-800">Français</div>
                     <div className="p-2 border-b border-slate-800">Español</div>
                     <div className="p-2 border-b border-slate-800">Swahili</div>
                     <div className="p-2 border-b border-slate-800">العربية</div>
                     <div className="p-2 border-b border-slate-800">Português</div>
                     <div className="p-2 border-b border-slate-800">Mandarin</div>
                     <div className="p-2 border-b border-slate-800">Hindi</div>
                  </div>
                  
                  <div className="mt-8 pt-4 border-t border-slate-800 flex items-start gap-3">
                     <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                     <p className="text-xs text-slate-400">
                        <span className="text-white font-bold">Universal Translation Core Active:</span> Speak in any language or dialect not listed above. We understand it automatically.
                     </p>
                  </div>
               </SpotlightCard>

            </div>
         </div>
      </section>

      {/* --- UNDERSERVED COMMUNITIES --- */}
      <section className="py-24 bg-slate-900/20 border-y border-white/5">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-16 text-center text-3xl font-bold text-white">Serving Underserved Communities</h2>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
               
               <SpotlightCard className="p-8 h-full bg-slate-950">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                     <MapPin className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Rural & Remote Areas</h3>
                  <p className="leading-relaxed text-slate-400 text-sm">
                     Where emergency services may take longer to arrive, MedGuard AI provides critical guidance during the extended wait time. Offline capabilities ensure access even with limited connectivity.
                  </p>
               </SpotlightCard>

               <SpotlightCard className="p-8 h-full bg-slate-950">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                     <Users className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Low-Income Communities</h3>
                  <p className="leading-relaxed text-slate-400 text-sm">
                     Free or subsidized access ensures economic barriers don't prevent someone from receiving emergency guidance. Healthcare assistance shouldn't require a credit card.
                  </p>
               </SpotlightCard>

               <SpotlightCard className="p-8 h-full bg-slate-950">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                     <Globe className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Immigrant Communities</h3>
                  <p className="leading-relaxed text-slate-400 text-sm">
                     Multilingual support and cultural sensitivity help immigrant families navigate emergencies without language barriers or fear of navigating unfamiliar healthcare systems.
                  </p>
               </SpotlightCard>

               <SpotlightCard className="p-8 h-full bg-slate-950">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                     <Accessibility className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Disability Accommodations</h3>
                  <p className="leading-relaxed text-slate-400 text-sm">
                     Voice interaction, screen reader compatibility, and adjustable text ensure people with visual, hearing, or mobility challenges can access guidance.
                  </p>
               </SpotlightCard>

               <SpotlightCard className="p-8 h-full bg-slate-950">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                     <Heart className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Elderly Population</h3>
                  <p className="leading-relaxed text-slate-400 text-sm">
                     Simple, clear interface designed for ease of use. No technical expertise required. Large text, clear buttons, and patient guidance for those less familiar with technology.
                  </p>
               </SpotlightCard>

               <SpotlightCard className="p-8 h-full bg-slate-950">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                     <Users className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Single Parents & Caregivers</h3>
                  <p className="leading-relaxed text-slate-400 text-sm">
                     When you're alone with a child or elderly parent in an emergency, MedGuard AI provides the support and guidance you need to stay calm and take appropriate action.
                  </p>
               </SpotlightCard>

            </div>
         </div>
      </section>

      {/* --- TECHNICAL ACCESSIBILITY FEATURES --- */}
      <section className="py-24">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-16 text-center text-3xl font-bold text-white">Technical Accessibility Features</h2>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
               
               <SpotlightCard className="p-8 bg-slate-900/50">
                  <div className="flex items-center gap-3 mb-6">
                     <Eye className="h-6 w-6 text-blue-400" />
                     <h3 className="text-xl font-bold text-white">Visual Accessibility</h3>
                  </div>
                  <ul className="space-y-3 text-sm text-slate-400">
                     <li className="flex items-center gap-3">
                        <CheckCircle2 className="h-4 w-4 text-blue-500" /> Screen reader compatible
                     </li>
                     <li className="flex items-center gap-3">
                        <CheckCircle2 className="h-4 w-4 text-blue-500" /> High contrast mode
                     </li>
                     <li className="flex items-center gap-3">
                        <CheckCircle2 className="h-4 w-4 text-blue-500" /> Adjustable text size
                     </li>
                     <li className="flex items-center gap-3">
                        <CheckCircle2 className="h-4 w-4 text-blue-500" /> Clear visual hierarchy
                     </li>
                     <li className="flex items-center gap-3">
                        <CheckCircle2 className="h-4 w-4 text-blue-500" /> Color-blind friendly design
                     </li>
                  </ul>
               </SpotlightCard>

               <SpotlightCard className="p-8 bg-slate-900/50">
                  <div className="flex items-center gap-3 mb-6">
                     <MousePointer className="h-6 w-6 text-purple-400" />
                     <h3 className="text-xl font-bold text-white">Motor Accessibility</h3>
                  </div>
                  <ul className="space-y-3 text-sm text-slate-400">
                     <li className="flex items-center gap-3">
                        <CheckCircle2 className="h-4 w-4 text-purple-500" /> Keyboard navigation
                     </li>
                     <li className="flex items-center gap-3">
                        <CheckCircle2 className="h-4 w-4 text-purple-500" /> Large touch targets
                     </li>
                     <li className="flex items-center gap-3">
                        <CheckCircle2 className="h-4 w-4 text-purple-500" /> Voice input support
                     </li>
                     <li className="flex items-center gap-3">
                        <CheckCircle2 className="h-4 w-4 text-purple-500" /> No time-sensitive actions
                     </li>
                     <li className="flex items-center gap-3">
                        <CheckCircle2 className="h-4 w-4 text-purple-500" /> Simple, clear interactions
                     </li>
                  </ul>
               </SpotlightCard>

               <SpotlightCard className="p-8 bg-slate-900/50">
                  <div className="flex items-center gap-3 mb-6">
                     <Cpu className="h-6 w-6 text-amber-400" />
                     <h3 className="text-xl font-bold text-white">Cognitive Accessibility</h3>
                  </div>
                  <ul className="space-y-3 text-sm text-slate-400">
                     <li className="flex items-center gap-3">
                        <CheckCircle2 className="h-4 w-4 text-amber-500" /> Plain language options
                     </li>
                     <li className="flex items-center gap-3">
                        <CheckCircle2 className="h-4 w-4 text-amber-500" /> Clear, simple instructions
                     </li>
                     <li className="flex items-center gap-3">
                        <CheckCircle2 className="h-4 w-4 text-amber-500" /> Consistent layout
                     </li>
                     <li className="flex items-center gap-3">
                        <CheckCircle2 className="h-4 w-4 text-amber-500" /> Step-by-step guidance
                     </li>
                     <li className="flex items-center gap-3">
                        <CheckCircle2 className="h-4 w-4 text-amber-500" /> No medical jargon required
                     </li>
                  </ul>
               </SpotlightCard>

               <SpotlightCard className="p-8 bg-slate-900/50">
                  <div className="flex items-center gap-3 mb-6">
                     <Signal className="h-6 w-6 text-rose-400" />
                     <h3 className="text-xl font-bold text-white">Low-Bandwidth Support</h3>
                  </div>
                  <ul className="space-y-3 text-sm text-slate-400">
                     <li className="flex items-center gap-3">
                        <CheckCircle2 className="h-4 w-4 text-rose-500" /> Lightweight interface
                     </li>
                     <li className="flex items-center gap-3">
                        <CheckCircle2 className="h-4 w-4 text-rose-500" /> Works on slow connections
                     </li>
                     <li className="flex items-center gap-3">
                        <CheckCircle2 className="h-4 w-4 text-rose-500" /> Offline mode available
                     </li>
                     <li className="flex items-center gap-3">
                        <CheckCircle2 className="h-4 w-4 text-rose-500" /> Minimal data usage
                     </li>
                     <li className="flex items-center gap-3">
                        <CheckCircle2 className="h-4 w-4 text-rose-500" /> Mobile-optimized
                     </li>
                  </ul>
               </SpotlightCard>

            </div>
         </div>
      </section>

      {/* --- COMMITMENT --- */}
      <section className="py-24 border-t border-white/5">
         <div className="mx-auto max-w-3xl px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Our Ongoing Commitment</h2>
            <p className="text-lg leading-relaxed text-slate-400 mb-6">
               Accessibility isn't a feature—it's a fundamental requirement. We continuously test with diverse user groups, seek feedback from underserved communities, and improve our platform to ensure everyone can access life-saving guidance when they need it most.
            </p>
            <p className="text-lg leading-relaxed text-slate-400">
               If you encounter accessibility barriers or have suggestions for improvement, please contact us. Your feedback helps us serve everyone better.
            </p>
         </div>
      </section>

      <Footer />
    </div>
  )
}