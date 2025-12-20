"use client"

import React from "react"
import { motion, useMotionTemplate, useMotionValue, Variants } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { cn } from "@/lib/utils"
import { 
  Shield, 
  Heart, 
  Scale, 
  Eye, 
  Users, 
  Lock, 
  CheckCircle2, 
  AlertTriangle,
  FileBadge,
  Fingerprint,
  Activity,
  Brain,
  Stethoscope
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

export default function EthicsPage() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30 selection:text-blue-200">
      <GrainOverlay />
      <Navigation />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-teal-900/20 via-slate-950 to-slate-950 -z-10" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
           <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="mb-8 inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-teal-500/10"
           >
              <FileBadge className="h-8 w-8 text-teal-500" />
           </motion.div>

           <TextReveal 
             text="The Code of Conduct." 
             className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6"
           />

           <p className="max-w-2xl mx-auto text-lg text-slate-400 leading-relaxed">
             This is our constitution. Our unwavering commitment to ethical AI, patient safety, and responsible medical guidance.
           </p>
        </div>
      </section>

      {/* --- THE FOUR PILLARS (Bioethics) --- */}
      <section className="py-20 border-y border-white/5 bg-slate-900/20">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
               <h2 className="text-3xl font-bold text-white mb-4">Foundational Ethical Principles</h2>
               <p className="text-slate-400">Aligned with the Declaration of Helsinki and global bioethics standards.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
               
               {/* Pillar 1: Beneficence */}
               <SpotlightCard className="p-8 h-full bg-slate-950 border-slate-800">
                  <div className="flex items-start justify-between mb-6">
                     <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
                        <Heart className="h-6 w-6" />
                     </div>
                     <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">DIRECTIVE: DO GOOD</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Beneficence</h3>
                  <p className="text-slate-400 leading-relaxed mb-6">
                     Every feature, algorithm, and word is designed to benefit the user and improve outcomes. We actively work to maximize positive impact while being clear about our limitations as a guidance tool, not a medical professional.
                  </p>
                  <div className="pt-6 border-t border-slate-800">
                     <p className="text-xs text-slate-500 font-mono flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3" /> Implementation: Optimized for survival outcomes.
                     </p>
                  </div>
               </SpotlightCard>

               {/* Pillar 2: Non-Maleficence */}
               <SpotlightCard className="p-8 h-full bg-slate-950 border-slate-800">
                  <div className="flex items-start justify-between mb-6">
                     <div className="p-3 bg-rose-500/10 rounded-lg text-rose-400">
                        <Shield className="h-6 w-6" />
                     </div>
                     <span className="text-[10px] font-mono text-rose-500 bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20">DIRECTIVE: DO NO HARM</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Non-Maleficence</h3>
                  <p className="text-slate-400 leading-relaxed mb-6">
                     "First, do no harm." We rigorously test all guidance against medical best practices and err on the side of caution. When uncertain, we always direct users to professional medical care rather than risk providing inadequate guidance.
                  </p>
                  <div className="pt-6 border-t border-slate-800">
                     <p className="text-xs text-slate-500 font-mono flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3" /> Implementation: Conservative Triage Algorithms.
                     </p>
                  </div>
               </SpotlightCard>

               {/* Pillar 3: Autonomy */}
               <SpotlightCard className="p-8 h-full bg-slate-950 border-slate-800">
                  <div className="flex items-start justify-between mb-6">
                     <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                        <Users className="h-6 w-6" />
                     </div>
                     <span className="text-[10px] font-mono text-blue-500 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">DIRECTIVE: EMPOWER</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Autonomy</h3>
                  <p className="text-slate-400 leading-relaxed mb-6">
                     Users maintain full decision-making authority. We provide information and recommendations, but respect that you know your situation best. We never force specific actions, only guide and inform.
                  </p>
                  <div className="pt-6 border-t border-slate-800">
                     <p className="text-xs text-slate-500 font-mono flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3" /> Implementation: Transparent option presentation.
                     </p>
                  </div>
               </SpotlightCard>

               {/* Pillar 4: Justice */}
               <SpotlightCard className="p-8 h-full bg-slate-950 border-slate-800">
                  <div className="flex items-start justify-between mb-6">
                     <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400">
                        <Scale className="h-6 w-6" />
                     </div>
                     <span className="text-[10px] font-mono text-amber-500 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">DIRECTIVE: EQUITY</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Justice</h3>
                  <p className="text-slate-400 leading-relaxed mb-6">
                     Emergency medical guidance should be available to all, regardless of income, location, or background. We're committed to fair, unbiased access and actively work to serve underserved communities.
                  </p>
                  <div className="pt-6 border-t border-slate-800">
                     <p className="text-xs text-slate-500 font-mono flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3" /> Implementation: Free Access Tier & Bias Testing.
                     </p>
                  </div>
               </SpotlightCard>

            </div>
         </div>
      </section>

      {/* --- SAFETY GUARDRAILS (Defense Systems) --- */}
      <section className="py-24">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 mb-16">
               <div className="h-[1px] flex-1 bg-slate-800" />
               <h2 className="text-2xl font-bold text-white">Safety Architecture</h2>
               <div className="h-[1px] flex-1 bg-slate-800" />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
               <SpotlightCard className="p-6 bg-slate-900/30 border-t-2 border-teal-500">
                  <h3 className="text-lg font-bold text-white mb-2">Evidence-Based Core</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-4">
                     All guidance is derived from established medical protocols, peer-reviewed research, and recognized healthcare organizations. No experimental or unproven methods are ever sourced.
                  </p>
                  <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-teal-500/10 text-teal-400 text-[10px] font-mono">
                     <CheckCircle2 className="h-3 w-3" /> VERIFIED SOURCES
                  </div>
               </SpotlightCard>

               <SpotlightCard className="p-6 bg-slate-900/30 border-t-2 border-rose-500">
                  <h3 className="text-lg font-bold text-white mb-2">Conservative Escalation</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-4">
                     When in doubt, we escalate to professional care. Our system is designed to be overly cautious rather than dismissive of potentially serious conditions.
                  </p>
                  <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-rose-500/10 text-rose-400 text-[10px] font-mono">
                     <AlertTriangle className="h-3 w-3" /> FAIL-SAFE ACTIVE
                  </div>
               </SpotlightCard>

               <SpotlightCard className="p-6 bg-slate-900/30 border-t-2 border-blue-500">
                  <h3 className="text-lg font-bold text-white mb-2">Clear Limitations</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-4">
                     We explicitly state what we cannot do and when professional help is required. Transparency about limitations is a safety feature, not a weakness.
                  </p>
                  <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-blue-500/10 text-blue-400 text-[10px] font-mono">
                     <Eye className="h-3 w-3" /> FULL DISCLOSURE
                  </div>
               </SpotlightCard>

               <SpotlightCard className="p-6 bg-slate-900/30 border-t-2 border-purple-500">
                  <h3 className="text-lg font-bold text-white mb-2">No Diagnosis Claims</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-4">
                     We never claim to diagnose conditions. We help you understand symptoms and determine appropriate next steps, but diagnosis belongs to licensed medical professionals.
                  </p>
               </SpotlightCard>

               <SpotlightCard className="p-6 bg-slate-900/30 border-t-2 border-amber-500">
                  <h3 className="text-lg font-bold text-white mb-2">Continuous Monitoring</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-4">
                     Regular audits of guidance quality, user outcomes feedback, and alignment with current medical standards ensure we maintain high ethical standards.
                  </p>
               </SpotlightCard>

               <SpotlightCard className="p-6 bg-slate-900/30 border-t-2 border-indigo-500">
                  <h3 className="text-lg font-bold text-white mb-2">Human Oversight</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-4">
                     Medical professionals review our protocols, guidance patterns, and edge cases to ensure AI recommendations align with human medical judgment.
                  </p>
               </SpotlightCard>
            </div>
         </div>
      </section>

      {/* --- RESPONSIBLE AI (Black Box Transparency) --- */}
      <section className="py-24 border-t border-white/5">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
               <div className="space-y-8">
                  <h2 className="text-4xl font-bold text-white">Responsible AI Development</h2>
                  <p className="text-lg text-slate-400 leading-relaxed">
                     We don't just build smart code; we build moral code. Our development process includes strict ethical checkpoints at every stage of the model's lifecycle.
                  </p>
                  
                  <div className="space-y-6">
                     <div className="flex gap-4">
                        <div className="mt-1 h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                           <Eye className="h-4 w-4" />
                        </div>
                        <div>
                           <h4 className="text-white font-bold">Transparency</h4>
                           <p className="text-slate-400 text-sm">We're open about how our AI works, what data it uses, and how decisions are made. No black boxes when lives are at stake.</p>
                        </div>
                     </div>
                     <div className="flex gap-4">
                        <div className="mt-1 h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                           <Scale className="h-4 w-4" />
                        </div>
                        <div>
                           <h4 className="text-white font-bold">Bias Mitigation</h4>
                           <p className="text-slate-400 text-sm">Active work to identify and eliminate biases in guidance that could disadvantage any demographic, cultural, or geographic group.</p>
                        </div>
                     </div>
                     <div className="flex gap-4">
                        <div className="mt-1 h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                           <Fingerprint className="h-4 w-4" />
                        </div>
                        <div>
                           <h4 className="text-white font-bold">Accountability</h4>
                           <p className="text-slate-400 text-sm">Clear lines of responsibility for AI behavior, with processes to address errors and continuously improve.</p>
                        </div>
                     </div>
                     <div className="flex gap-4">
                        <div className="mt-1 h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                           <Lock className="h-4 w-4" />
                        </div>
                        <div>
                           <h4 className="text-white font-bold">Privacy by Design</h4>
                           <p className="text-slate-400 text-sm">User data protection isn't an afterthought—it's built into every system from the ground up.</p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Commitment Card */}
               <SpotlightCard className="p-10 bg-slate-950 border border-slate-800 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-5">
                     <Fingerprint className="h-64 w-64 text-white" />
                  </div>
                  
                  <div className="relative z-10 space-y-6">
                     <h3 className="text-2xl font-bold text-white border-b border-slate-800 pb-4">Our Ironclad Commitments</h3>
                     <ul className="space-y-4 text-slate-300">
                        <li className="flex items-center gap-3">
                           <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                           Never sell or share user health data.
                        </li>
                        <li className="flex items-center gap-3">
                           <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                           Maintain medical professional review of protocols.
                        </li>
                        <li className="flex items-center gap-3">
                           <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                           Update guidance as medical knowledge evolves.
                        </li>
                        <li className="flex items-center gap-3">
                           <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                           Respond promptly to identified issues or errors.
                        </li>
                        <li className="flex items-center gap-3">
                           <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                           Prioritize patient safety over growth metrics.
                        </li>
                        <li className="flex items-center gap-3">
                           <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                           Maintain accessibility for underserved communities.
                        </li>
                     </ul>
                     <div className="pt-6 mt-6 border-t border-slate-800 flex items-center justify-between">
                        <div className="text-xs text-slate-500 font-mono">
                           Signed digitally by MedGuard Board
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                     </div>
                  </div>
               </SpotlightCard>
            </div>
         </div>
      </section>

      {/* --- MEDICAL DISCLAIMER (Critical) --- */}
      <section className="py-20 bg-rose-950/10 border-t border-rose-500/20">
         <div className="mx-auto max-w-4xl px-4 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-bold uppercase mb-6">
               <Activity className="h-4 w-4" /> Critical Disclaimer
            </div>
            <h2 className="text-3xl font-bold text-white mb-6">Not a Replacement for Doctors</h2>
            <div className="space-y-4 text-lg leading-relaxed text-slate-400">
               <p>
                  MedGuard AI is designed to provide emergency first aid guidance and help users make informed decisions about seeking medical care. It is <span className="text-white">not a substitute for professional medical advice, diagnosis, or treatment.</span>
               </p>
               <p>
                  Always seek the advice of qualified health providers with any questions you may have regarding a medical condition. If you think you may have a medical emergency, call your doctor, go to the emergency department, or call 112/911 immediately.
               </p>
               <p className="font-bold text-rose-400 pt-4">
                  Reliance on any information provided by MedGuard AI is solely at your own risk.
               </p>
            </div>
         </div>
      </section>

      <Footer />
    </div>
  )
}