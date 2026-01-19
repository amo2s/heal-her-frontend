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
  Stethoscope,
  Sparkles,
  BookOpen
} from "lucide-react"

// --- ANIMATION VARIANTS ---

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const scaleIn: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.5, ease: "backOut" } }
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
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
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

export default function EthicsPage() {
  return (
    <div className="relative min-h-screen bg-[#1C1246] text-[#FAFAFA] selection:bg-[#DA8CA0]/30 selection:text-[#DA8CA0]">
      <GrainOverlay />
      <Navigation />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#DA8CA0]/20 via-[#1C1246] to-[#1C1246] -z-10" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
           <motion.div
             variants={scaleIn}
             initial="hidden"
             animate="visible"
             className="mb-8 inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-[#231854] border border-[#DA8CA0]/20 shadow-2xl shadow-[#DA8CA0]/10"
           >
             <FileBadge className="h-8 w-8 text-[#DA8CA0]" />
           </motion.div>

           <TextReveal 
             text="Our Ethical Promise." 
             className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6"
           />

           <motion.p 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.6, duration: 0.8 }}
             className="max-w-2xl mx-auto text-lg text-[#CCCCD9] leading-relaxed"
           >
             This is our constitution. Our unwavering commitment to your privacy, safety, and the truth. We prioritize your well-being above all else.
           </motion.p>
        </div>
      </section>

      {/* --- THE FOUR PILLARS (Bioethics) --- */}
      <section className="py-20 border-y border-white/5 bg-[#231854]/30">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
               <h2 className="text-3xl font-bold text-white mb-4">Foundational Principles</h2>
               <p className="text-[#CCCCD9]">Built on global standards of bioethics and digital safety.</p>
            </motion.div>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 gap-8"
            >
               
               {/* Pillar 1: Privacy */}
               <motion.div variants={fadeInUp} className="h-full">
                 <SpotlightCard className="p-8 h-full bg-[#1C1246] border-[#DA8CA0]/20">
                    <div className="flex items-start justify-between mb-6">
                       <div className="p-3 bg-[#DA8CA0]/10 rounded-lg text-[#DA8CA0]">
                          <Lock className="h-6 w-6" />
                       </div>
                       <span className="text-[10px] font-mono text-[#DA8CA0] bg-[#DA8CA0]/10 px-2 py-1 rounded border border-[#DA8CA0]/20">DIRECTIVE: PROTECT</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">Uncompromising Privacy</h3>
                    <p className="text-[#CCCCD9] leading-relaxed mb-6">
                       Your questions are yours alone. We do not track your identity, we do not sell your data, and we ensure your conversations remain encrypted and anonymous.
                    </p>
                    <div className="pt-6 border-t border-white/10">
                       <p className="text-xs text-[#CCCCD9] font-mono flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3" /> Implementation: Zero-knowledge architecture.
                       </p>
                    </div>
                 </SpotlightCard>
               </motion.div>

               {/* Pillar 2: Safety */}
               <motion.div variants={fadeInUp} className="h-full">
                 <SpotlightCard className="p-8 h-full bg-[#1C1246] border-rose-500/20">
                    <div className="flex items-start justify-between mb-6">
                       <div className="p-3 bg-rose-500/10 rounded-lg text-rose-400">
                          <Shield className="h-6 w-6" />
                       </div>
                       <span className="text-[10px] font-mono text-rose-500 bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20">DIRECTIVE: SAFEGUARD</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">Do No Harm</h3>
                    <p className="text-[#CCCCD9] leading-relaxed mb-6">
                       We rigorously test our guidance to ensure it is medically accurate and safe. If a topic is too complex for AI, we immediately direct you to a human professional.
                    </p>
                    <div className="pt-6 border-t border-white/10">
                       <p className="text-xs text-[#CCCCD9] font-mono flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3" /> Implementation: Conservative Triage Protocols.
                       </p>
                    </div>
                 </SpotlightCard>
               </motion.div>

               {/* Pillar 3: Non-Judgment */}
               <motion.div variants={fadeInUp} className="h-full">
                 <SpotlightCard className="p-8 h-full bg-[#1C1246] border-purple-500/20">
                    <div className="flex items-start justify-between mb-6">
                       <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400">
                          <Heart className="h-6 w-6" />
                       </div>
                       <span className="text-[10px] font-mono text-purple-500 bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20">DIRECTIVE: EMPATHY</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">Zero Judgment</h3>
                    <p className="text-[#CCCCD9] leading-relaxed mb-6">
                       No question is "too weird" or "shameful." We foster a supportive environment where you can ask anything about your body without fear of criticism.
                    </p>
                    <div className="pt-6 border-t border-white/10">
                       <p className="text-xs text-[#CCCCD9] font-mono flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3" /> Implementation: Tone-checked responses.
                       </p>
                    </div>
                 </SpotlightCard>
               </motion.div>

               {/* Pillar 4: Inclusivity */}
               <motion.div variants={fadeInUp} className="h-full">
                 <SpotlightCard className="p-8 h-full bg-[#1C1246] border-emerald-500/20">
                    <div className="flex items-start justify-between mb-6">
                       <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
                          <Scale className="h-6 w-6" />
                       </div>
                       <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">DIRECTIVE: EQUITY</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">For Every Girl</h3>
                    <p className="text-[#CCCCD9] leading-relaxed mb-6">
                       Heal Her is designed for everyone, regardless of background, location, or ability. We work tirelessly to remove language and economic barriers to health education.
                    </p>
                    <div className="pt-6 border-t border-white/10">
                       <p className="text-xs text-[#CCCCD9] font-mono flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3" /> Implementation: Free Access & Multilingual Support.
                       </p>
                    </div>
                 </SpotlightCard>
               </motion.div>

            </motion.div>
         </div>
      </section>

      {/* --- SAFETY GUARDRAILS (Defense Systems) --- */}
      <section className="py-24">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 mb-16">
               <div className="h-[1px] flex-1 bg-white/10" />
               <h2 className="text-2xl font-bold text-white">Safety Architecture</h2>
               <div className="h-[1px] flex-1 bg-white/10" />
            </div>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-6"
            >
               <motion.div variants={fadeInUp}>
                 <SpotlightCard className="p-6 bg-[#231854] border-t-2 border-[#DA8CA0]">
                    <h3 className="text-lg font-bold text-white mb-2">Fact-Based Core</h3>
                    <p className="text-sm text-[#CCCCD9] leading-relaxed mb-4">
                       All guidance is derived from established medical protocols and recognized health organizations. No myths or rumors.
                    </p>
                    <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-[#DA8CA0]/10 text-[#DA8CA0] text-[10px] font-mono">
                       <BookOpen className="h-3 w-3" /> VERIFIED SOURCES
                    </div>
                 </SpotlightCard>
               </motion.div>

               <motion.div variants={fadeInUp}>
                 <SpotlightCard className="p-6 bg-[#231854] border-t-2 border-rose-500">
                    <h3 className="text-lg font-bold text-white mb-2">Crisis Detection</h3>
                    <p className="text-sm text-[#CCCCD9] leading-relaxed mb-4">
                       Our AI detects words related to self-harm or abuse and immediately switches to "Safety Mode," providing helplines.
                    </p>
                    <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-rose-500/10 text-rose-400 text-[10px] font-mono">
                       <AlertTriangle className="h-3 w-3" /> FAIL-SAFE ACTIVE
                    </div>
                 </SpotlightCard>
               </motion.div>

               <motion.div variants={fadeInUp}>
                 <SpotlightCard className="p-6 bg-[#231854] border-t-2 border-blue-500">
                    <h3 className="text-lg font-bold text-white mb-2">Clear Limitations</h3>
                    <p className="text-sm text-[#CCCCD9] leading-relaxed mb-4">
                       We explicitly state what we cannot do. Transparency about our limitations is a safety feature, not a weakness.
                    </p>
                    <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-blue-500/10 text-blue-400 text-[10px] font-mono">
                       <Eye className="h-3 w-3" /> FULL DISCLOSURE
                    </div>
                 </SpotlightCard>
               </motion.div>

               <motion.div variants={fadeInUp}>
                 <SpotlightCard className="p-6 bg-[#231854] border-t-2 border-purple-500">
                    <h3 className="text-lg font-bold text-white mb-2">No Diagnosis</h3>
                    <p className="text-sm text-[#CCCCD9] leading-relaxed mb-4">
                       We help you understand your body, but we never claim to be a doctor. Diagnosis belongs to medical professionals.
                    </p>
                 </SpotlightCard>
               </motion.div>

               <motion.div variants={fadeInUp}>
                 <SpotlightCard className="p-6 bg-[#231854] border-t-2 border-amber-500">
                    <h3 className="text-lg font-bold text-white mb-2">Age Appropriateness</h3>
                    <p className="text-sm text-[#CCCCD9] leading-relaxed mb-4">
                       Our content is tailored to be understandable and safe for young girls, avoiding overly graphic or confusing language.
                    </p>
                 </SpotlightCard>
               </motion.div>

               <motion.div variants={fadeInUp}>
                 <SpotlightCard className="p-6 bg-[#231854] border-t-2 border-indigo-500">
                    <h3 className="text-lg font-bold text-white mb-2">Human Oversight</h3>
                    <p className="text-sm text-[#CCCCD9] leading-relaxed mb-4">
                       Medical professionals review our protocols to ensure our AI aligns with human empathy and medical judgment.
                    </p>
                 </SpotlightCard>
               </motion.div>
            </motion.div>
         </div>
      </section>

      {/* --- RESPONSIBLE AI (Black Box Transparency) --- */}
      <section className="py-24 border-t border-white/5">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
               <motion.div 
                 initial={{ opacity: 0, x: -30 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.8 }}
                 className="space-y-8"
               >
                  <h2 className="text-4xl font-bold text-white">Responsible AI Development</h2>
                  <p className="text-lg text-[#CCCCD9] leading-relaxed">
                     We don't just build smart code; we build moral code. Our development process includes strict ethical checkpoints to ensure Heal Her is safe for you.
                  </p>
                  
                  <div className="space-y-6">
                     <div className="flex gap-4">
                        <div className="mt-1 h-8 w-8 rounded-lg bg-[#DA8CA0]/10 flex items-center justify-center text-[#DA8CA0] border border-[#DA8CA0]/20">
                           <Eye className="h-4 w-4" />
                        </div>
                        <div>
                           <h4 className="text-white font-bold">Transparency</h4>
                           <p className="text-[#CCCCD9] text-sm">We explain how our AI works. No secrets when your health is involved.</p>
                        </div>
                     </div>
                     <div className="flex gap-4">
                        <div className="mt-1 h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                           <Scale className="h-4 w-4" />
                        </div>
                        <div>
                           <h4 className="text-white font-bold">Bias Mitigation</h4>
                           <p className="text-[#CCCCD9] text-sm">We actively work to ensure our advice is fair and accurate for girls of all races and backgrounds.</p>
                        </div>
                     </div>
                     <div className="flex gap-4">
                        <div className="mt-1 h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                           <Lock className="h-4 w-4" />
                        </div>
                        <div>
                           <h4 className="text-white font-bold">Privacy by Design</h4>
                           <p className="text-[#CCCCD9] text-sm">We never ask for your real name or address in the chat. You are safe here.</p>
                        </div>
                     </div>
                  </div>
               </motion.div>

               {/* Commitment Card */}
               <motion.div
                 initial={{ opacity: 0, x: 30 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.8 }}
               >
                 <SpotlightCard className="p-10 bg-[#1C1246] border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5">
                       <Fingerprint className="h-64 w-64 text-white" />
                    </div>
                    
                    <div className="relative z-10 space-y-6">
                       <h3 className="text-2xl font-bold text-white border-b border-white/10 pb-4">Our Ironclad Commitments</h3>
                       <ul className="space-y-4 text-[#CCCCD9]">
                          {[
                             "Never sell or share your secrets.",
                             "Keep learning and improving our medical accuracy.",
                             "Prioritize your safety over everything else.",
                             "Remain free and accessible to girls everywhere.",
                             "Always listen to your feedback."
                          ].map((item, i) => (
                             <li key={i} className="flex items-center gap-3">
                                <div className="h-1.5 w-1.5 rounded-full bg-[#DA8CA0]" />
                                {item}
                             </li>
                          ))}
                       </ul>
                       <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between">
                          <div className="text-xs text-[#CCCCD9] font-mono">
                             Signed digitally by Heal Her Team
                          </div>
                          <CheckCircle2 className="h-5 w-5 text-[#DA8CA0]" />
                       </div>
                    </div>
                 </SpotlightCard>
               </motion.div>
            </div>
         </div>
      </section>

      {/* --- MEDICAL DISCLAIMER (Critical) --- */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="py-20 bg-[#231854]/30 border-t border-[#DA8CA0]/20"
      >
         <div className="mx-auto max-w-4xl px-4 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DA8CA0]/10 text-[#DA8CA0] text-xs font-bold uppercase mb-6">
               <Activity className="h-4 w-4" /> Important Reminder
            </div>
            <h2 className="text-3xl font-bold text-white mb-6">We Are Not Doctors</h2>
            <div className="space-y-4 text-lg leading-relaxed text-[#CCCCD9]">
               <p>
                  Heal Her is an educational tool designed to support you. It is <span className="text-white">not a substitute for professional medical advice, diagnosis, or treatment.</span>
               </p>
               <p>
                  Always talk to a parent, school nurse, or doctor if you are worried about your health. If you feel unsafe or are in an emergency, please call 112/911 immediately.
               </p>
               <p className="font-bold text-[#DA8CA0] pt-4">
                  Using Heal Her means you understand we are here to guide, not to cure.
               </p>
            </div>
         </div>
      </motion.section>

      <Footer />
    </div>
  )
}