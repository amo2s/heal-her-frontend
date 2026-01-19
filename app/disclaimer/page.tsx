"use client"

import React from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { motion, useMotionTemplate, useMotionValue, Variants } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  AlertTriangle,
  ShieldAlert,
  FileText,
  CheckCircle2,
  XCircle,
  Siren,
  Globe,
  Scale,
  Lock,
  Activity,
  AlertOctagon,
  Info,
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

// --- DOCUMENT METADATA COMPONENT ---
function DocMetadata() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="w-full max-w-4xl mx-auto mb-12 border-y border-white/10 py-4 flex flex-wrap gap-6 justify-between items-center text-xs font-mono text-[#CCCCD9] uppercase tracking-wider"
    >
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-[#DA8CA0]" />
        <span>Doc_ID: HH-LEGAL-001</span>
      </div>
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-[#DA8CA0]" />
        <span>Revision: 2026.01.15</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-emerald-500">Status: ACTIVE_ENFORCEMENT</span>
      </div>
    </motion.div>
  )
}

export default function DisclaimerPage() {
  return (
    <div className="relative min-h-screen bg-[#1C1246] text-[#FAFAFA] selection:bg-[#DA8CA0]/30 selection:text-[#DA8CA0]">
      <GrainOverlay />
      <Navigation />

      {/* --- PAGE HEADER --- */}
      <section className="pt-32 pb-12 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#231854] border border-[#DA8CA0]/20 text-[#DA8CA0] text-xs font-mono uppercase mb-8"
          >
            <Scale className="h-3 w-3" /> Legal & Operational Protocol
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            Health Disclaimer
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg text-[#CCCCD9] max-w-2xl mx-auto"
          >
             Defining the boundaries of our educational AI. We are here to guide and support, not to replace your doctor.
          </motion.p>
        </div>
      </section>

      <DocMetadata />

      {/* --- CRITICAL WARNING BANNER --- */}
      <section className="pb-16 px-4">
        <div className="mx-auto max-w-4xl">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden rounded-3xl border border-rose-500/30 bg-rose-950/10 p-1"
            >
              <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(244,63,94,0.05)_10px,rgba(244,63,94,0.05)_20px)]" />
              <div className="relative bg-[#1C1246]/90 rounded-[22px] p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start">
                 <div className="shrink-0">
                    <div className="h-14 w-14 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                       <Siren className="h-7 w-7 animate-pulse" />
                    </div>
                 </div>
                 <div>
                    <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                       Critical Safety Mandate
                    </h2>
                    <p className="text-[#CCCCD9] leading-relaxed text-sm md:text-base">
                       Heal Her is <span className="text-rose-400 font-bold">NOT</span> a substitute for professional medical advice, diagnosis, or treatment. 
                       In life-threatening emergencies (severe pain, bleeding, assault), do not rely on this app.
                    </p>
                    <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-rose-900/20">
                       <AlertOctagon className="h-4 w-4" />
                       CONTACT EMERGENCY SERVICES (112 / 911)
                    </div>
                 </div>
              </div>
            </motion.div>
        </div>
      </section>

      {/* --- SCOPE OF PRACTICE MATRIX --- */}
      <section className="py-12 px-4">
        <div className="mx-auto max-w-6xl">
           <motion.div 
             variants={staggerContainer}
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true }}
             className="grid md:grid-cols-2 gap-8"
           >
              
              {/* WHAT WE ARE (Green Zone) */}
              <motion.div variants={fadeInUp}>
                <SpotlightCard className="p-8 border-emerald-500/20 bg-[#231854]">
                   <div className="flex items-center gap-3 mb-6">
                      <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                      <h2 className="text-2xl font-bold text-white">Our Role (Education)</h2>
                   </div>
                   <ul className="space-y-4">
                      {[
                         "Provide fact-based puberty & body education",
                         "Explain menstrual cycle phases clearly",
                         "Offer mental wellness & self-care tips",
                         "Translate health info into local languages",
                         "Help you formulate questions for your doctor"
                      ].map((item, i) => (
                         <li key={i} className="flex gap-3 text-[#CCCCD9] text-sm">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                            {item}
                         </li>
                      ))}
                   </ul>
                </SpotlightCard>
              </motion.div>

              {/* WHAT WE ARE NOT (Red Zone) */}
              <motion.div variants={fadeInUp}>
                <SpotlightCard className="p-8 border-rose-500/20 bg-[#231854]">
                   <div className="flex items-center gap-3 mb-6">
                      <XCircle className="h-6 w-6 text-rose-500" />
                      <h2 className="text-2xl font-bold text-white">System Limitations</h2>
                   </div>
                   <ul className="space-y-4">
                      {[
                         "We DO NOT provide official medical diagnoses",
                         "We DO NOT prescribe medications or dosages",
                         "We DO NOT perform physical examinations",
                         "We DO NOT guarantee health outcomes",
                         "We DO NOT replace your parents or guardians"
                      ].map((item, i) => (
                         <li key={i} className="flex gap-3 text-[#CCCCD9] text-sm">
                            <div className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                            {item}
                         </li>
                      ))}
                   </ul>
                </SpotlightCard>
              </motion.div>

           </motion.div>
        </div>
      </section>

      {/* --- DETAILED LEGAL TEXT --- */}
      <section className="py-12 px-4">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mx-auto max-w-4xl space-y-12"
        >
           
           {/* Section 1 */}
           <motion.div variants={fadeInUp} className="group">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 group-hover:text-[#DA8CA0] transition-colors">
                 <ShieldAlert className="h-5 w-5 text-slate-500 group-hover:text-[#DA8CA0]" />
                 1. No Doctor-Patient Relationship
              </h3>
              <div className="pl-7 border-l border-white/10 text-[#CCCCD9] leading-relaxed space-y-4">
                 <p>
                   Use of Heal Her does not create a doctor-patient relationship between you and Heal Her, its creators, or any medical board. The service provides general educational information, not personalized medical advice based on your history.
                 </p>
              </div>
           </motion.div>

           {/* Section 2 */}
           <motion.div variants={fadeInUp} className="group">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 group-hover:text-[#DA8CA0] transition-colors">
                 <BookOpen className="h-5 w-5 text-slate-500 group-hover:text-[#DA8CA0]" />
                 2. Accuracy & Educational Intent
              </h3>
              <div className="pl-7 border-l border-white/10 text-[#CCCCD9] leading-relaxed space-y-4">
                 <p>
                   While we align our content with standard health guidelines, Heal Her:
                 </p>
                 <ul className="list-disc pl-5 space-y-2">
                    <li>Is an automated system and can make errors (hallucinations).</li>
                    <li>Cannot see your body to verify symptoms.</li>
                    <li>Is designed for learning and support, not clinical treatment.</li>
                 </ul>
                 <p>
                    <strong className="text-white">Assumption of Risk:</strong> By using this platform, you acknowledge that you are using an AI tool for education and agree to hold Heal Her harmless for any outcomes.
                 </p>
              </div>
           </motion.div>

           {/* Section 3 */}
           <motion.div variants={fadeInUp} className="group">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 group-hover:text-[#DA8CA0] transition-colors">
                 <Globe className="h-5 w-5 text-slate-500 group-hover:text-[#DA8CA0]" />
                 3. Global Usage & Context
              </h3>
              <div className="pl-7 border-l border-white/10 text-[#CCCCD9] leading-relaxed space-y-4">
                 <p>
                   Heal Her operates globally but is optimized for the Nigerian context.
                 </p>
                 <p>
                   <strong>Emergency Numbers:</strong> We display local emergency numbers where possible (e.g., 112 in Nigeria), but you are responsible for knowing the emergency contact for your specific location.
                 </p>
              </div>
           </motion.div>

           {/* Section 4 */}
           <motion.div variants={fadeInUp} className="group">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 group-hover:text-[#DA8CA0] transition-colors">
                 <Lock className="h-5 w-5 text-slate-500 group-hover:text-[#DA8CA0]" />
                 4. Data Privacy & Safety
              </h3>
              <div className="pl-7 border-l border-white/10 text-[#CCCCD9] leading-relaxed space-y-4">
                 <p>
                   We process your questions to provide answers. However, we <strong className="text-white">DO NOT</strong> sell your personal health data to advertisers.
                 </p>
                 <p>
                   Conversations are encrypted. We prioritize your anonymity to ensure you feel safe asking sensitive questions.
                 </p>
              </div>
           </motion.div>

        </motion.div>
      </section>

      {/* --- FOOTER CTA --- */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-20 border-t border-white/5"
      >
         <div className="mx-auto max-w-3xl text-center px-4">
            <div className="bg-[#231854]/50 rounded-2xl p-8 border border-white/10">
               <Info className="h-8 w-8 text-[#DA8CA0] mx-auto mb-4" />
               <h3 className="text-xl font-bold text-white mb-2">Questions regarding compliance?</h3>
               <p className="text-[#CCCCD9] mb-6">
                  Our team is available for transparency inquiries.
               </p>
               <a href="mailto:medguardai@gmail.com" className="text-[#DA8CA0] hover:text-[#E8B4C1] font-mono text-sm border-b border-[#DA8CA0]/30 hover:border-[#DA8CA0] pb-0.5 transition-all">
                  medguardai@gmail.com
               </a>
            </div>
         </div>
      </motion.section>

      <Footer />
    </div>
  )
}