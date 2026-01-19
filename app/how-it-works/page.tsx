"use client"

import React from "react"
import Link from "next/link"
import { motion, useMotionTemplate, useMotionValue, Variants } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Brain,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Ear,
  ScanLine,
  Heart,
  Lock,
  BookOpen,
  Globe,
  Baby,
  Shield,
  Database,
  FileText
} from "lucide-react"

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

export default function HowItWorksPage() {
  return (
    <div className="relative min-h-screen bg-[#1C1246] text-[#FAFAFA] selection:bg-[#DA8CA0]/30 selection:text-[#DA8CA0]">
      <GrainOverlay />
      <Navigation />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#DA8CA0]/20 via-[#1C1246] to-[#1C1246]" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
           <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.8 }}
             className="mb-8 inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-[#231854] border border-[#DA8CA0]/20 shadow-2xl shadow-[#DA8CA0]/10"
           >
             <Brain className="h-10 w-10 text-[#DA8CA0]" />
           </motion.div>

           <TextReveal 
             text="The Intelligence Core." 
             className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6"
           />

           <motion.p 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.6, duration: 0.8 }}
             className="max-w-3xl mx-auto text-lg text-[#CCCCD9] leading-relaxed"
           >
             Heal Her is not just a chatbot. It is a sophisticated AI engine calibrated to global medical standards, designed to provide safe, verified guidance while protecting your anonymity at every step.
           </motion.p>
        </div>
      </section>

      {/* --- THE FLOW (Vertical Timeline) --- */}
      <section className="relative py-24">
        {/* Central connecting line */}
        <div className="absolute left-4 lg:left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[#DA8CA0]/30 to-transparent lg:-translate-x-1/2" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-24 relative z-10">
            
            {/* STEP 1: LISTENING */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="grid lg:grid-cols-2 gap-12 items-center"
            >
               <div className="lg:text-right pl-12 lg:pl-0 lg:pr-16 relative">
                  <div className="absolute left-[-5px] lg:left-auto lg:right-[-38px] top-2 h-3 w-3 rounded-full bg-[#DA8CA0] shadow-[0_0_15px_rgba(218,140,160,1)] z-20" />
                  
                  <h3 className="text-sm font-mono text-[#DA8CA0] mb-2">STEP 01</h3>
                  <h2 className="text-3xl font-bold text-white mb-4">Sentiment & Context Analysis</h2>
                  <p className="text-[#CCCCD9] leading-relaxed">
                     When you type a message, our Natural Language Processing (NLP) engine breaks it down. It doesn't just look for keywords like "pain" or "period"; it analyzes the <em>sentiment</em>. Are you panicked? Curious? Or just looking for a friend? This allows the AI to determine if it should respond with cold facts or warm reassurance.
                  </p>
               </div>
               <div className="pl-12 lg:pl-0">
                  <SpotlightCard className="p-6 bg-[#231854]/80 border-[#DA8CA0]/10">
                     <div className="flex items-start gap-4">
                        <div className="p-3 bg-[#DA8CA0]/10 rounded-lg text-[#DA8CA0]">
                           <Ear className="h-6 w-6" />
                        </div>
                        <div className="space-y-3 w-full">
                           <div className="bg-[#1C1246]/50 p-3 rounded-lg border border-[#DA8CA0]/10">
                              <p className="text-xs text-[#CCCCD9] uppercase mb-1">Your Message</p>
                              <p className="text-white italic">"I'm scared... I think I'm bleeding but not hurt..."</p>
                           </div>
                           <div className="flex justify-center">
                              <ArrowRight className="h-4 w-4 text-[#CCCCD9] rotate-90" />
                           </div>
                           <div className="bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                              <p className="text-xs text-emerald-500 uppercase mb-1">System Analysis</p>
                              <p className="text-emerald-400 font-mono text-sm">Topic: MENSTRUATION | Emotion: FEAR | Action: REASSURE & EXPLAIN</p>
                           </div>
                        </div>
                     </div>
                  </SpotlightCard>
               </div>
            </motion.div>

            {/* STEP 2: SAFETY CHECK */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="grid lg:grid-cols-2 gap-12 items-center"
            >
               <div className="lg:order-2 pl-12 lg:pl-16 relative">
                  <div className="absolute left-[-5px] top-2 h-3 w-3 rounded-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,1)] z-20" />
                  
                  <h3 className="text-sm font-mono text-indigo-400 mb-2">STEP 02</h3>
                  <h2 className="text-3xl font-bold text-white mb-4">The Safety Guardrails</h2>
                  <p className="text-[#CCCCD9] leading-relaxed">
                     Before generating a single word, the system runs a rigorous safety scan. It checks for "Red Flag" indicators such as self-harm, physical abuse, or life-threatening symptoms (e.g., severe blood loss, difficulty breathing). If any of these are detected, the AI overrides its standard conversational mode and immediately provides emergency resources and helpline numbers.
                  </p>
               </div>
               <div className="lg:order-1 pl-12 lg:pl-0">
                  <SpotlightCard className="p-6 bg-[#231854]/80 border-indigo-500/20">
                     <div className="flex items-center gap-4 mb-6">
                        <ScanLine className="h-6 w-6 text-indigo-400 animate-pulse" />
                        <div className="h-1 flex-1 bg-[#1C1246] rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }} 
                             whileInView={{ width: "100%" }} 
                             transition={{ duration: 1.5, repeat: Infinity }}
                             className="h-full bg-indigo-500" 
                           />
                        </div>
                        <span className="text-xs font-mono text-indigo-400">SCANNING...</span>
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                        {['Self Harm', 'Abuse', 'Severe Pain', 'Breathing'].map((item) => (
                           <div key={item} className="p-3 bg-[#1C1246] rounded-lg border border-[#DA8CA0]/5 flex justify-between items-center">
                              <span className="text-sm text-[#CCCCD9]">{item}</span>
                              <div className="h-2 w-2 rounded-full bg-emerald-500" /> {/* Green light = Safe */}
                           </div>
                        ))}
                     </div>
                  </SpotlightCard>
               </div>
            </motion.div>

            {/* STEP 3: KNOWLEDGE RETRIEVAL */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="grid lg:grid-cols-2 gap-12 items-center"
            >
               <div className="lg:text-right pl-12 lg:pl-0 lg:pr-16 relative">
                  <div className="absolute left-[-5px] lg:left-auto lg:right-[-38px] top-2 h-3 w-3 rounded-full bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,1)] z-20" />
                  
                  <h3 className="text-sm font-mono text-purple-400 mb-2">STEP 03</h3>
                  <h2 className="text-3xl font-bold text-white mb-4">Anchored Verification</h2>
                  <p className="text-[#CCCCD9] leading-relaxed">
                     The AI is not allowed to "hallucinate" or invent medical advice. It acts as a specialized health librarian, retrieving information strictly from a "Knowledge Vault" that contains guidelines from the WHO, UNICEF, and other verified health bodies. If the answer isn't in the verified vault, the AI will admit it doesn't know rather than guess.
                  </p>
               </div>
               <div className="pl-12 lg:pl-0">
                  <div className="relative p-[1px] rounded-3xl bg-gradient-to-br from-purple-500/50 to-[#1C1246]">
                     <div className="bg-[#231854] rounded-3xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-20">
                           <BookOpen className="h-24 w-24 text-purple-500" />
                        </div>
                        <div className="relative z-10 space-y-4">
                           <div className="flex items-center gap-3">
                              <Brain className="h-6 w-6 text-purple-500" />
                              <h3 className="text-lg font-bold text-white">Protocol Match</h3>
                           </div>
                           <p className="text-[#CCCCD9] text-sm">Cross-referencing verified sources...</p>
                           <div className="flex flex-wrap gap-2">
                              <span className="px-2 py-1 bg-purple-500/20 rounded text-xs font-mono text-purple-400 border border-purple-500/30">MATCH: WHO_GUIDELINES</span>
                              <span className="px-2 py-1 bg-purple-500/20 rounded text-xs font-mono text-purple-400 border border-purple-500/30">MATCH: UNICEF_ADOLESCENT</span>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </motion.div>

            {/* STEP 4: THE RESPONSE */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="grid lg:grid-cols-2 gap-12 items-center"
            >
               <div className="lg:order-2 pl-12 lg:pl-16 relative">
                  <div className="absolute left-[-5px] top-2 h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,1)] z-20" />
                  
                  <h3 className="text-sm font-mono text-emerald-400 mb-2">STEP 04</h3>
                  <h2 className="text-3xl font-bold text-white mb-4">Empathetic Translation</h2>
                  <p className="text-[#CCCCD9] leading-relaxed">
                     Medical data can be cold and confusing. The final step of our process is "translation." The AI takes the clinical facts and rewrites them into warm, supportive language that feels like a big sister talking to you. It simplifies complex terms and offers reassurance alongside the facts.
                  </p>
               </div>
               <div className="lg:order-1 pl-12 lg:pl-0">
                  <SpotlightCard className="p-6 bg-[#231854]/80">
                     <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                           <MessageSquare className="h-5 w-5 text-emerald-400" />
                           <span className="text-sm font-bold text-white">Heal Her Says:</span>
                        </div>
                        <div className="p-4 bg-[#1C1246] rounded-xl border-l-4 border-emerald-500">
                           <p className="text-white text-base font-medium">"Take a deep breath! This is totally normal. It's just your first period."</p>
                        </div>
                        <div className="p-4 bg-[#1C1246]/50 rounded-xl border-l-4 border-emerald-500/30">
                           <p className="text-[#CCCCD9] text-sm">"Here is how to make a pad if you don't have one right now..."</p>
                        </div>
                     </div>
                  </SpotlightCard>
               </div>
            </motion.div>

        </div>
      </section>

      {/* --- THE KNOWLEDGE VAULT (New: Sources of Truth) --- */}
      <section className="py-24 bg-[#231854]/20 border-y border-white/5">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
               <h2 className="text-3xl font-bold text-white mb-4">The Sources of Truth</h2>
               <p className="text-[#CCCCD9] max-w-2xl mx-auto">
                  Our AI is trained to strictly follow the clinical guidelines established by the world's most trusted health organizations. We do not create medical advice; we make established medical advice accessible.
               </p>
            </motion.div>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-8"
            >
               {/* WHO Card */}
               <motion.div variants={fadeInUp}>
                 <div className="h-full bg-[#1C1246] rounded-3xl p-8 border border-[#0093d5]/30 relative overflow-hidden group hover:border-[#0093d5]/50 transition-colors shadow-lg">
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#0093d5]" />
                    <div className="w-16 h-16 rounded-2xl bg-[#0093d5]/10 flex items-center justify-center mb-6">
                       <Globe className="h-8 w-8 text-[#0093d5]" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">World Health Org.</h3>
                    <p className="text-[#0093d5] text-xs font-mono mb-4 uppercase tracking-widest">Global Standard</p>
                    <p className="text-[#CCCCD9] text-sm leading-relaxed">
                       We align our general health and hygiene protocols with the WHO's International Technical Guidance on Sexuality Education. This ensures that every piece of advice is culturally relevant, scientifically accurate, and globally recognized as the best practice for adolescent health.
                    </p>
                 </div>
               </motion.div>

               {/* UNICEF Card */}
               <motion.div variants={fadeInUp}>
                 <div className="h-full bg-[#1C1246] rounded-3xl p-8 border border-[#1CABE2]/30 relative overflow-hidden group hover:border-[#1CABE2]/50 transition-colors shadow-lg">
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#1CABE2]" />
                    <div className="w-16 h-16 rounded-2xl bg-[#1CABE2]/10 flex items-center justify-center mb-6">
                       <Baby className="h-8 w-8 text-[#1CABE2]" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">UNICEF</h3>
                    <p className="text-[#1CABE2] text-xs font-mono mb-4 uppercase tracking-widest">Child & Youth Focus</p>
                    <p className="text-[#CCCCD9] text-sm leading-relaxed">
                       Our approach to puberty and development is guided by UNICEF's extensive data on Menstrual Hygiene Management (MHM). We focus on dignity, reducing stigma, and providing practical solutions for girls in low-resource settings.
                    </p>
                 </div>
               </motion.div>

               {/* CDC Card */}
               <motion.div variants={fadeInUp}>
                 <div className="h-full bg-[#1C1246] rounded-3xl p-8 border border-[#005AA7]/30 relative overflow-hidden group hover:border-[#005AA7]/50 transition-colors shadow-lg">
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#005AA7]" />
                    <div className="w-16 h-16 rounded-2xl bg-[#005AA7]/10 flex items-center justify-center mb-6">
                       <Shield className="h-8 w-8 text-[#005AA7]" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">CDC Guidelines</h3>
                    <p className="text-[#005AA7] text-xs font-mono mb-4 uppercase tracking-widest">Disease Prevention</p>
                    <p className="text-[#CCCCD9] text-sm leading-relaxed">
                       For topics regarding infectious diseases, vaccinations, and reproductive health safety, we cross-reference the Centers for Disease Control and Prevention (CDC) to ensure our users receive the most up-to-date scientific safeguards.
                    </p>
                 </div>
               </motion.div>

            </motion.div>
         </div>
      </section>

      {/* --- THE PRIVACY PROMISE --- */}
      <section className="py-24">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white text-center mb-16">The Privacy Promise</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
               <SpotlightCard className="p-8 h-full bg-[#1C1246] border-white/10">
                  <Lock className="h-10 w-10 text-[#DA8CA0] mb-6" />
                  <h3 className="text-xl font-bold text-white mb-4">No Real Names</h3>
                  <p className="text-[#CCCCD9] text-sm leading-relaxed">
                     You do not need to create an account with your legal name. We utilize anonymous identifiers so that your identity remains completely separate from your health questions. You are free to be honest without fear of exposure.
                  </p>
               </SpotlightCard>

               <SpotlightCard className="p-8 h-full bg-[#1C1246] border-white/10">
                  <ShieldCheck className="h-10 w-10 text-emerald-500 mb-6" />
                  <h3 className="text-xl font-bold text-white mb-4">Zero Data Sales</h3>
                  <p className="text-[#CCCCD9] text-sm leading-relaxed">
                     We are not an advertising company. We do not sell your chat history, location data, or health concerns to third parties. Your data exists solely to provide you with the help you asked for, and nothing else.
                  </p>
               </SpotlightCard>

               <SpotlightCard className="p-8 h-full bg-[#1C1246] border-white/10">
                  <Database className="h-10 w-10 text-blue-500 mb-6" />
                  <h3 className="text-xl font-bold text-white mb-4">Data Minimization</h3>
                  <p className="text-[#CCCCD9] text-sm leading-relaxed">
                     We operate on a "need-to-know" basis. We only process the text required to answer your current question. Chat logs can be set to auto-delete, ensuring that your digital footprint remains as light as possible.
                  </p>
               </SpotlightCard>
            </div>
         </div>
      </section>

      {/* --- CTA --- */}
      <section className="py-24 relative overflow-hidden">
         <div className="absolute inset-0 bg-[#DA8CA0]/10" />
         <div className="mx-auto max-w-4xl px-4 text-center relative z-10">
            <h2 className="text-4xl font-bold text-white mb-6">Trust the Science. Feel the Love.</h2>
            <p className="text-lg text-[#CCCCD9] mb-8">
               Verified medical knowledge, delivered with the kindness of a sister.
            </p>
            <Button asChild size="lg" className="h-14 rounded-full bg-white text-[#1C1246] text-lg font-bold hover:bg-[#DA8CA0] hover:text-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]">
               <Link href="/chat" className="flex items-center gap-2">
                  Start Chatting <ArrowRight className="h-5 w-5" />
               </Link>
            </Button>
         </div>
      </section>

      <Footer />
    </div>
  )
}