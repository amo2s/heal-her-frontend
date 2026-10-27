"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useMotionTemplate, useMotionValue, Variants } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { 
  Shield, 
  Heart, 
  Scale, 
  EyeOff, 
  Lock, 
  CheckCircle2, 
  AlertTriangle,
  Fingerprint,
  Activity,
  Stethoscope,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Database,
  BrainCircuit,
  MessageSquareHeart
} from "lucide-react"

// ============================================================================
// PREMIUM UTILITY COMPONENTS & ANIMATIONS
// ============================================================================

const smoothEase: [number, number, number, number] = [0.22, 1, 0.36, 1]

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: smoothEase } }
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
}

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
// MAIN PAGE COMPONENT
// ============================================================================

export default function EthicsPage() {
  return (
    <div className="relative min-h-screen bg-[#1C1246] text-[#FAFAFA] selection:bg-[#DA8CA0]/30 selection:text-[#DA8CA0]">
      <Navigation />

      {/* ========== FULL-WIDTH HERO SECTION ========== */}
      <section className="relative min-h-[95vh] md:min-h-[85vh] flex items-center justify-center overflow-hidden">
        
        {/* Full Screen Image Background (The Sanctuary Shield) */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/second-hero.png"
            alt="The Sanctuary Shield"
            fill
            className="object-cover object-center"
            priority
          />
          {/* Glass-morphic Gradient Overlays for perfect text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#1C1246]/80 via-[#1C1246]/50 to-[#1C1246]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#1C1246_100%)] opacity-80" />
        </div>
        
        {/* Floating Text Content */}
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10 text-center mt-20">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, ease: smoothEase }}
             className="mb-8"
           >
             <GlowingBadge icon={Sparkles}>Our Unbreakable Promise</GlowingBadge>
           </motion.div>

           <motion.h1 
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 1, delay: 0.1, ease: smoothEase }}
             className="text-5xl sm:text-6xl md:text-8xl font-extrabold tracking-tight text-white mb-6 leading-[1.05] drop-shadow-2xl"
           >
             A Promise to Protect.<br/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DA8CA0] via-[#E8B4C1] to-[#DA8CA0] drop-shadow-lg">Her Ultimate Safe Haven.</span>
           </motion.h1>

           <motion.p 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2, duration: 1, ease: smoothEase }}
             className="max-w-2xl mx-auto text-lg md:text-2xl text-[#FAFAFA] leading-relaxed font-light mb-12 drop-shadow-md"
           >
             The internet can be a scary place. Heal Her was built to be the exact opposite. This is our ironclad guarantee of safety, privacy, and clinical truth.
           </motion.p>
        </div>

        {/* --- WATERMARK HIDER / TRUST BADGE (Bottom Right) --- */}
        <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 z-20">
          <div className="backdrop-blur-xl bg-[#1C1246]/80 border border-white/10 rounded-2xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4 shadow-[0_20px_40px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.2)]">
             <div className="bg-[#DA8CA0]/20 p-2 rounded-xl border border-[#DA8CA0]/30">
               <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#DA8CA0]" />
             </div>
             <div className="text-left hidden sm:block pr-2">
               <p className="text-white text-xs font-bold uppercase tracking-widest">Parent Approved</p>
               <p className="text-[#CCCCD9] text-[10px] font-medium">100% Safe Environment</p>
             </div>
          </div>
        </div>
      </section>

      {/* ========== THE FOUR PILLARS (Customer-Focused Promises) ========== */}
      <section className="py-24 sm:py-32 border-t border-white/5 bg-[#1C1246]">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: smoothEase }}
              className="text-center mb-16"
            >
               <h2 className="text-sm font-bold tracking-widest text-[#DA8CA0] uppercase mb-4">What You Deserve</h2>
               <h3 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Our Foundational Core</h3>
               <p className="text-lg text-[#CCCCD9] max-w-2xl mx-auto font-light">
                  We don't just build smart software; we build safe software. Here is exactly what we promise every single user who joins Heal Her.
               </p>
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
                 <SpotlightCard className="p-8 md:p-10 h-full group">
                    <div className="flex items-start justify-between mb-8">
                       <div className="p-4 bg-gradient-to-br from-[#DA8CA0]/20 to-transparent border border-[#DA8CA0]/30 rounded-2xl">
                          <EyeOff className="h-8 w-8 text-[#DA8CA0] drop-shadow-md" />
                       </div>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-4">Invisible to the World</h3>
                    <p className="text-[#CCCCD9] text-lg font-light leading-relaxed mb-6">
                       We don't want to know your real name, and neither will anyone else. By using anonymous accounts, your health questions can never be traced back to you. You are completely invisible.
                    </p>
                 </SpotlightCard>
               </motion.div>

               {/* Pillar 2: Safety & Truth */}
               <motion.div variants={fadeInUp} className="h-full">
                 <SpotlightCard className="p-8 md:p-10 h-full group">
                    <div className="flex items-start justify-between mb-8">
                       <div className="p-4 bg-gradient-to-br from-emerald-500/20 to-transparent border border-emerald-500/30 rounded-2xl">
                          <Stethoscope className="h-8 w-8 text-emerald-400 drop-shadow-md" />
                       </div>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-4">Verified Health Data</h3>
                    <p className="text-[#CCCCD9] text-lg font-light leading-relaxed mb-6">
                       The internet is full of scary, fake health advice. We hardwire our AI to only fetch data from trusted global health platforms. You get the clinical truth, delivered with the warmth of a big sister.
                    </p>
                 </SpotlightCard>
               </motion.div>

               {/* Pillar 3: Non-Judgment */}
               <motion.div variants={fadeInUp} className="h-full">
                 <SpotlightCard className="p-8 md:p-10 h-full group">
                    <div className="flex items-start justify-between mb-8">
                       <div className="p-4 bg-gradient-to-br from-fuchsia-500/20 to-transparent border border-fuchsia-500/30 rounded-2xl">
                          <Heart className="h-8 w-8 text-fuchsia-400 drop-shadow-md" />
                       </div>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-4">The "No Shame" Zone</h3>
                    <p className="text-[#CCCCD9] text-lg font-light leading-relaxed mb-6">
                       No question is "too weird," "too silly," or "embarrassing." We built an environment where you can ask absolutely anything about your body and mind without a single ounce of judgment.
                    </p>
                 </SpotlightCard>
               </motion.div>

               {/* Pillar 4: Inclusivity */}
               <motion.div variants={fadeInUp} className="h-full">
                 <SpotlightCard className="p-8 md:p-10 h-full group">
                    <div className="flex items-start justify-between mb-8">
                       <div className="p-4 bg-gradient-to-br from-blue-500/20 to-transparent border border-blue-500/30 rounded-2xl">
                          <Scale className="h-8 w-8 text-blue-400 drop-shadow-md" />
                       </div>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-4">For Every Girl</h3>
                    <p className="text-[#CCCCD9] text-lg font-light leading-relaxed mb-6">
                       Heal Her is designed for everyone. Our platform is trained to understand different cultures, backgrounds, and languages so every girl feels seen, heard, and deeply understood.
                    </p>
                 </SpotlightCard>
               </motion.div>
            </motion.div>
         </div>
      </section>

      {/* ========== THE VERIFICATION ENGINE (NEW SECTION: Accuracy & AI Sourcing) ========== */}
      <section className="py-24 sm:py-32 bg-[#231854]/20 border-t border-white/5 relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
         
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: smoothEase }}
              className="text-center mb-16"
            >
               <h2 className="text-sm font-bold tracking-widest text-[#DA8CA0] uppercase mb-4">Zero Guesswork</h2>
               <h3 className="text-4xl md:text-5xl font-extrabold text-white mb-6">The Verification Engine</h3>
               <p className="text-lg text-[#CCCCD9] max-w-3xl mx-auto font-light leading-relaxed">
                  How does Heal Her know the right answer? Our AI doesn't invent medical advice. It acts like a highly intelligent librarian, fetching answers purely from verified clinical sources and translating them just for you.
               </p>
            </motion.div>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid lg:grid-cols-3 gap-6 sm:gap-8"
            >
               {/* Step 1: Database Anchoring */}
               <motion.div variants={fadeInUp} className="h-full">
                 <div className="relative overflow-hidden rounded-[2rem] bg-[#1C1246] border border-white/10 p-8 h-full shadow-lg group hover:border-[#DA8CA0]/40 transition-colors duration-500">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                      <Database className="h-7 w-7 text-[#DA8CA0]" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">1. Trusted Medical Sources</h3>
                    <p className="text-[#CCCCD9] text-base leading-relaxed font-light">
                       When you ask a question, our system searches through a secured library of data sourced directly from the world's leading global health organizations and platforms. 
                    </p>
                 </div>
               </motion.div>

               {/* Step 2: Anti-Hallucination */}
               <motion.div variants={fadeInUp} className="h-full">
                 <div className="relative overflow-hidden rounded-[2rem] bg-[#1C1246] border border-white/10 p-8 h-full shadow-lg group hover:border-emerald-500/40 transition-colors duration-500">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                      <BrainCircuit className="h-7 w-7 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">2. Zero Hallucinations</h3>
                    <p className="text-[#CCCCD9] text-base leading-relaxed font-light">
                       We use highly advanced system instructions to stop the AI from making things up. If the answer isn't explicitly in the verified health databases, the AI will honestly tell you it doesn't know.
                    </p>
                 </div>
               </motion.div>

               {/* Step 3: Empathetic Translation */}
               <motion.div variants={fadeInUp} className="h-full">
                 <div className="relative overflow-hidden rounded-[2rem] bg-[#1C1246] border border-white/10 p-8 h-full shadow-lg group hover:border-fuchsia-500/40 transition-colors duration-500">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                      <MessageSquareHeart className="h-7 w-7 text-fuchsia-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">3. Sisterly Translation</h3>
                    <p className="text-[#CCCCD9] text-base leading-relaxed font-light">
                       Clinical facts can sound scary. The final step is translating that cold, verified medical data into warm, friendly, and easy-to-understand advice that perfectly fits your age.
                    </p>
                 </div>
               </motion.div>
            </motion.div>
         </div>
      </section>

      {/* --- ACTIVE DEFENSE SYSTEMS (Selling Safety) --- */}
      <section className="py-24 sm:py-32 bg-[#1C1246] border-y border-white/5 relative overflow-hidden">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex items-center gap-4 mb-16">
               <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/20" />
               <h2 className="text-2xl font-extrabold text-white">Active Defense Systems</h2>
               <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/20" />
            </div>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-6"
            >
               <motion.div variants={fadeInUp}>
                 <SpotlightCard className="p-8 bg-[#231854]/40 border-t-2 border-rose-500">
                    <AlertTriangle className="w-8 h-8 text-rose-500 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-3">Active Crisis Detection</h3>
                    <p className="text-[#CCCCD9] font-light leading-relaxed">
                       If the system detects language relating to self-harm, severe abuse, or critical danger, it instantly pauses standard chat and immediately provides emergency professional helplines.
                    </p>
                 </SpotlightCard>
               </motion.div>

               <motion.div variants={fadeInUp}>
                 <SpotlightCard className="p-8 bg-[#231854]/40 border-t-2 border-[#DA8CA0]">
                    <Shield className="w-8 h-8 text-[#DA8CA0] mb-4" />
                    <h3 className="text-xl font-bold text-white mb-3">Strict Fact Anchoring</h3>
                    <p className="text-[#CCCCD9] font-light leading-relaxed">
                       We don't let AI guess. Our intelligence engine is strictly hardwired to retrieve its guidance only from trusted global health platforms. It delivers pure clinical truth, never rumors.
                    </p>
                 </SpotlightCard>
               </motion.div>

               <motion.div variants={fadeInUp}>
                 <SpotlightCard className="p-8 bg-[#231854]/40 border-t-2 border-emerald-500">
                    <Lock className="w-8 h-8 text-emerald-400 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-3">Locked Vault Data</h3>
                    <p className="text-[#CCCCD9] font-light leading-relaxed">
                       Your private conversations stay private. They are heavily encrypted, meaning nobody—not even our own engineers—can read through your personal safe space.
                    </p>
                 </SpotlightCard>
               </motion.div>
            </motion.div>
         </div>
      </section>

      {/* --- IRONCLAD COMMITMENTS (Digital Certificate UI) --- */}
      <section className="py-24 sm:py-32">
         <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: smoothEase }}
            >
              <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-b from-[#231854]/90 to-[#1C1246] border border-white/20 border-t-white/40 p-8 sm:p-16 shadow-[inset_0_1px_3px_rgba(255,255,255,0.3),0_30px_60px_-15px_rgba(28,18,70,1)]">
                 
                 {/* Decorative Background Elements */}
                 <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                    <Fingerprint className="h-96 w-96 text-white" />
                 </div>
                 <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#DA8CA0]/20 rounded-full blur-[100px]" />
                 
                 <div className="relative z-10 space-y-8">
                    <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                       <div className="w-12 h-12 rounded-full bg-[#DA8CA0]/20 flex items-center justify-center border border-[#DA8CA0]/40">
                          <CheckCircle2 className="w-6 h-6 text-[#DA8CA0]" />
                       </div>
                       <h3 className="text-3xl sm:text-4xl font-extrabold text-white">Our Ironclad Signatures</h3>
                    </div>
                    
                    <ul className="space-y-6 text-lg text-[#CCCCD9] font-light">
                       {[
                          "We will never sell, trade, or expose your secrets.",
                          "We will always prioritize your physical and mental safety.",
                          "We will constantly update our knowledge from trusted health sources.",
                          "We will remain a fiercely protective space for every girl."
                       ].map((item, i) => (
                          <li key={i} className="flex items-start gap-4">
                             <div className="mt-2 h-2 w-2 rounded-full bg-[#DA8CA0] shadow-[0_0_10px_#DA8CA0] shrink-0" />
                             <span className="leading-relaxed">{item}</span>
                          </li>
                       ))}
                    </ul>
                    
                    <div className="pt-8 mt-8 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                       <div className="text-sm text-[#CCCCD9] font-mono tracking-wider">
                          ISSUED & VERIFIED BY THE HEAL HER TEAM
                       </div>
                       <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest rounded-full inline-flex items-center gap-2 w-fit">
                          <ShieldCheck className="w-4 h-4" /> Active Promise
                       </div>
                    </div>
                 </div>
              </div>
            </motion.div>
         </div>
      </section>

      {/* --- MEDICAL DISCLAIMER (Critical but Supportive) --- */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-20 bg-[#231854]/30 border-t border-[#DA8CA0]/20"
      >
         <div className="mx-auto max-w-4xl px-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#DA8CA0]/10 text-[#DA8CA0] text-xs font-bold uppercase tracking-widest mb-6 border border-[#DA8CA0]/20">
               <Activity className="h-4 w-4" /> Important Reminder
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-6">We Are Not Doctors</h2>
            <div className="space-y-4 text-lg font-light leading-relaxed text-[#CCCCD9]">
               <p>
                  Heal Her is a powerful educational and supportive tool. However, it is <strong className="text-white font-semibold">not a substitute for professional medical advice, diagnosis, or treatment.</strong>
               </p>
               <p>
                  If you are in pain, feel unsafe, or are experiencing a medical emergency, please talk to a trusted adult, a doctor, or call your local emergency services immediately. We are here to guide you, but true healing sometimes requires real-world heroes.
               </p>
            </div>
         </div>
      </motion.section>

      {/* ========== FINAL CTA ========== */}
      <section className="relative py-24 sm:py-32 overflow-hidden border-t border-[#DA8CA0]/10">
         <div className="absolute inset-0 bg-[#1C1246]">
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
               Step Into Her Safe Space.
            </h2>
            <p className="text-lg sm:text-xl text-[#CCCCD9] mb-10 sm:mb-12 max-w-2xl mx-auto font-light leading-relaxed">
               Give her the answers she needs, without the risks of the open internet. Register today for complete peace of mind.
            </p>
            <div className="flex justify-center">
               {/* Glossy Liquid Action Button */}
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