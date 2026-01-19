"use client"

import React from "react"
import { motion, useMotionTemplate, useMotionValue, Variants } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { cn } from "@/lib/utils"
import {
  Lock,
  Shield,
  Eye,
  Database,
  UserX,
  Server,
  Key,
  Trash2,
  CheckCircle2,
  XCircle,
  Sparkles,
  Mic,
  Image as ImageIcon,
  BrainCircuit,
  Heart,
  Fingerprint,
  VenetianMask,
  Network,
  FileKey,
  AlertTriangle
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
    <div
      className={cn(
        "group relative border border-white/10 bg-[#231854]/50 overflow-hidden rounded-3xl",
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
              rgba(218, 140, 160, 0.15),
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

export default function PrivacyPage() {
  return (
    <div className="relative min-h-screen bg-[#1C1246] text-[#FAFAFA] selection:bg-[#DA8CA0]/30 selection:text-[#DA8CA0]">
      <GrainOverlay />
      <Navigation />

      {/* --- HERO: THE VAULT --- */}
      <section className="relative pt-32 pb-12 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#DA8CA0]/20 via-[#1C1246] to-[#1C1246] -z-10" />
        
        <div className="mx-auto max-w-4xl text-center">
           <motion.div
             initial={{ scale: 0.9, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ duration: 0.5 }}
             className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-[#231854] border border-[#DA8CA0]/20 shadow-2xl shadow-[#DA8CA0]/10 mb-8"
           >
             <Lock className="h-10 w-10 text-[#DA8CA0]" />
           </motion.div>

           <TextReveal 
             text="Your Secrets Stay Yours." 
             className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight"
           />
           
           <motion.p 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.5 }}
             className="text-lg text-[#CCCCD9] max-w-2xl mx-auto leading-relaxed"
           >
             Health is personal. We use military-grade encryption, anonymous identifiers, and a strict "No-Sell" policy to ensure your dignity is protected at all costs.
           </motion.p>
        </div>
      </section>

      {/* --- SECTION 1: IDENTITY PROTECTION (The Logic) --- */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-7xl">
           <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-white mb-4">How We Hide Your Identity</h2>
              <p className="text-[#CCCCD9]">We separate *who you are* from *what you ask*.</p>
           </div>

           <motion.div 
             variants={staggerContainer}
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true }}
             className="grid md:grid-cols-3 gap-8"
           >
              <motion.div variants={fadeInUp} className="h-full">
                <SpotlightCard className="p-8 bg-[#231854]/60 h-full border-[#DA8CA0]/20">
                   <div className="mb-6 h-12 w-12 rounded-lg bg-[#DA8CA0]/10 flex items-center justify-center border border-[#DA8CA0]/20">
                      <VenetianMask className="h-6 w-6 text-[#DA8CA0]" />
                   </div>
                   <h3 className="text-xl font-bold text-white mb-3">Nicknames Only</h3>
                   <p className="text-[#CCCCD9] text-sm leading-relaxed">
                      While you need an email to create an account (for recovery), the AI never sees it. We ask you to pick a <strong>Nickname</strong>. To the system, you are just "StarGirl" or "Bluebird."
                   </p>
                </SpotlightCard>
              </motion.div>

              <motion.div variants={fadeInUp} className="h-full">
                <SpotlightCard className="p-8 bg-[#231854]/60 h-full border-[#DA8CA0]/20">
                   <div className="mb-6 h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                      <Fingerprint className="h-6 w-6 text-emerald-400" />
                   </div>
                   <h3 className="text-xl font-bold text-white mb-3">The "Iron Wall"</h3>
                   <p className="text-[#CCCCD9] text-sm leading-relaxed">
                      We store your Login Info in "Vault A" and your Health Chats in "Vault B". They are linked only by a scrambled code. Even our engineers cannot easily connect your real name to your chats.
                   </p>
                </SpotlightCard>
              </motion.div>

              <motion.div variants={fadeInUp} className="h-full">
                <SpotlightCard className="p-8 bg-[#231854]/60 h-full border-[#DA8CA0]/20">
                   <div className="mb-6 h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                      <Trash2 className="h-6 w-6 text-purple-400" />
                   </div>
                   <h3 className="text-xl font-bold text-white mb-3">Total Erasure</h3>
                   <p className="text-[#CCCCD9] text-sm leading-relaxed">
                      Delete your account, and the key linking Vault A and Vault B is destroyed. Your data becomes "digital dust"—unreadable and unrecoverable forever.
                   </p>
                </SpotlightCard>
              </motion.div>
           </motion.div>
        </div>
      </section>

      {/* --- SECTION 2: AI TRAINING & TRANSPARENCY (New Detail) --- */}
      <section className="py-24 bg-[#231854]/20 border-y border-white/5">
         <div className="mx-auto max-w-5xl px-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
               <h2 className="text-3xl font-bold text-white mb-4">How the AI Gets Smarter</h2>
               <p className="text-[#CCCCD9] max-w-2xl mx-auto">
                  To save lives, the AI needs to learn. We use data to improve, but we do it ethically. Here is the truth about how your chats help other girls.
               </p>
            </motion.div>
            
            <div className="grid md:grid-cols-2 gap-12">
               
               {/* Training Data Logic */}
               <motion.div 
                 initial={{ opacity: 0, x: -20 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
               >
                  <div className="flex items-center gap-3 mb-6">
                     <div className="h-10 w-10 rounded-full bg-[#DA8CA0]/10 flex items-center justify-center border border-[#DA8CA0]/20">
                        <BrainCircuit className="h-5 w-5 text-[#DA8CA0]" />
                     </div>
                     <h3 className="text-xl font-bold text-white">Pattern Recognition</h3>
                  </div>
                  <div className="space-y-6 text-[#CCCCD9] text-sm leading-relaxed">
                     <p>
                        We use <strong>aggregated, anonymized data</strong> to train the model. This means we strip away all personal details (names, specific locations, ages) and look only at the medical question.
                     </p>
                     <p className="pl-4 border-l-2 border-[#DA8CA0]/30">
                        <em>Example:</em> If 500 girls ask about "severe cramps," the AI learns that "cramps" are a high-priority topic and improves its advice on pain management. It learns the <strong>topic</strong>, not the <strong>user</strong>.
                     </p>
                  </div>
               </motion.div>

               {/* Multi-Modal Privacy */}
               <motion.div 
                 initial={{ opacity: 0, x: 20 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
               >
                  <div className="flex items-center gap-3 mb-6">
                     <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                        <Sparkles className="h-5 w-5 text-purple-400" />
                     </div>
                     <h3 className="text-xl font-bold text-white">Voice & Image Privacy</h3>
                  </div>
                  
                  <div className="space-y-4">
                     <div className="flex gap-4 p-4 rounded-xl bg-[#231854] border border-white/5">
                        <Mic className="h-6 w-6 text-purple-400 shrink-0" />
                        <div>
                           <h4 className="text-white font-bold text-sm">Voice Notes</h4>
                           <p className="text-[#CCCCD9] text-xs mt-1">
                              If you send audio (to explain symptoms in Pidgin, for example), we process the text transcript and discard the audio file. Your voiceprint is not stored.
                           </p>
                        </div>
                     </div>

                     <div className="flex gap-4 p-4 rounded-xl bg-[#231854] border border-white/5">
                        <ImageIcon className="h-6 w-6 text-emerald-400 shrink-0" />
                        <div>
                           <h4 className="text-white font-bold text-sm">Symptom Photos</h4>
                           <p className="text-[#CCCCD9] text-xs mt-1">
                              If you upload a photo (e.g., of a skin rash), our system automatically blurs faces and background details before the AI analyzes the medical condition.
                           </p>
                        </div>
                     </div>
                  </div>
               </motion.div>

            </div>
         </div>
      </section>

      {/* --- SECTION 3: THE DATA JOURNEY (Technical) --- */}
      <section className="py-20 px-4">
         <div className="mx-auto max-w-4xl">
            <div className="text-center mb-12">
               <h2 className="text-3xl font-bold text-white mb-4">The Life of a Message</h2>
               <p className="text-[#CCCCD9]">Follow your data from your thumb to our secure core.</p>
            </div>

            <div className="relative space-y-12">
               {/* Connecting Line */}
               <div className="absolute left-[20px] top-0 bottom-0 w-[2px] bg-[#DA8CA0]/20 md:left-1/2 md:-ml-[1px]" />

               {/* Step 1: Transit */}
               <motion.div 
                 initial={{ opacity: 0, x: -20 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 className="relative flex flex-col md:flex-row items-center gap-8"
               >
                  <div className="absolute left-0 md:left-1/2 md:-ml-3 h-6 w-6 rounded-full bg-[#1C1246] border-4 border-[#DA8CA0] z-10" />
                  <div className="md:w-1/2 md:text-right md:pr-12 pl-12 md:pl-0">
                     <h4 className="text-lg font-bold text-white">1. Encryption in Transit</h4>
                     <p className="text-sm text-[#CCCCD9] mt-2">
                        As soon as you hit send, your message is wrapped in TLS 1.3 encryption. It travels through the internet in a secure tunnel that hackers cannot penetrate.
                     </p>
                  </div>
                  <div className="md:w-1/2 pl-12 md:pl-12">
                     <div className="p-4 rounded-xl bg-[#231854] border border-white/5 inline-block">
                        <Network className="h-6 w-6 text-[#DA8CA0]" />
                     </div>
                  </div>
               </motion.div>

               {/* Step 2: Processing */}
               <motion.div 
                 initial={{ opacity: 0, x: 20 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 className="relative flex flex-col md:flex-row-reverse items-center gap-8"
               >
                  <div className="absolute left-0 md:left-1/2 md:-ml-3 h-6 w-6 rounded-full bg-[#1C1246] border-4 border-purple-500 z-10" />
                  <div className="md:w-1/2 md:text-left md:pl-12 pl-12">
                     <h4 className="text-lg font-bold text-white">2. Secure Enclave</h4>
                     <p className="text-sm text-[#CCCCD9] mt-2">
                        The message arrives in our "Secure Enclave" (a protected server). The AI reads it, generates an answer, and then the original message is either deleted or anonymized based on your settings.
                     </p>
                  </div>
                  <div className="md:w-1/2 md:text-right md:pr-12 pl-12">
                     <div className="p-4 rounded-xl bg-[#231854] border border-white/5 inline-block">
                        <Server className="h-6 w-6 text-purple-500" />
                     </div>
                  </div>
               </motion.div>

               {/* Step 3: Storage */}
               <motion.div 
                 initial={{ opacity: 0, x: -20 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 className="relative flex flex-col md:flex-row items-center gap-8"
               >
                  <div className="absolute left-0 md:left-1/2 md:-ml-3 h-6 w-6 rounded-full bg-[#1C1246] border-4 border-emerald-500 z-10" />
                  <div className="md:w-1/2 md:text-right md:pr-12 pl-12 md:pl-0">
                     <h4 className="text-lg font-bold text-white">3. Encryption at Rest</h4>
                     <p className="text-sm text-[#CCCCD9] mt-2">
                        If you choose to save your chat, it sits in our database encrypted with AES-256. This is the same standard banks use. Without your login key, it looks like random gibberish.
                     </p>
                  </div>
                  <div className="md:w-1/2 pl-12 md:pl-12">
                     <div className="p-4 rounded-xl bg-[#231854] border border-white/5 inline-block">
                        <FileKey className="h-6 w-6 text-emerald-500" />
                     </div>
                  </div>
               </motion.div>
            </div>
         </div>
      </section>

      {/* --- SECTION 4: DATA COLLECTION MATRIX --- */}
      <section className="py-20 px-4 bg-[#231854]/20 border-y border-white/5">
         <div className="mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold text-white text-center mb-16">The Transparency List</h2>
            
            <div className="grid md:grid-cols-2 gap-12">
               
               {/* What We Collect */}
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
               >
                  <div className="flex items-center gap-3 mb-6">
                     <div className="h-2 w-2 rounded-full bg-emerald-500" />
                     <h3 className="text-xl font-bold text-white">Data We Need</h3>
                     <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20">MINIMAL</span>
                  </div>
                  <div className="space-y-4">
                     {[
                        "Email/Phone (Encrypted, for login only)",
                        "Chat Text (To answer your questions)",
                        "General Region (To ensure emergency numbers work)",
                        "Device Type (To make sure the app fits your screen)"
                     ].map((item, i) => (
                        <div key={i} className="flex gap-3 p-4 rounded-xl bg-[#231854] border border-white/5">
                           <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                           <span className="text-sm text-[#CCCCD9]">{item}</span>
                        </div>
                     ))}
                  </div>
               </motion.div>

               {/* What We DO NOT Collect */}
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: 0.2 }}
               >
                  <div className="flex items-center gap-3 mb-6">
                     <div className="h-2 w-2 rounded-full bg-rose-500" />
                     <h3 className="text-xl font-bold text-white">Data We Ban</h3>
                     <span className="text-xs bg-rose-500/10 text-rose-400 px-2 py-1 rounded border border-rose-500/20">NEVER</span>
                  </div>
                  <div className="space-y-4">
                     {[
                        "Real Names (Unless you use it as a nickname)",
                        "Phone Contact Lists",
                        "Advertising IDs (No tracking pixels)",
                        "Other App Usage or Browser History"
                     ].map((item, i) => (
                        <div key={i} className="flex gap-3 p-4 rounded-xl bg-[#231854] border border-white/5 opacity-75">
                           <XCircle className="h-5 w-5 text-rose-500 shrink-0" />
                           <span className="text-sm text-[#CCCCD9]">{item}</span>
                        </div>
                     ))}
                  </div>
               </motion.div>

            </div>
         </div>
      </section>

      {/* --- SECTION 5: EMERGENCY PROTOCOL --- */}
      <section className="py-20 px-4">
         <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-mono uppercase tracking-wider mb-6">
               <AlertTriangle className="h-4 w-4" /> Important Exception
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">When Privacy Meets Danger</h2>
            <p className="text-[#CCCCD9] text-sm leading-relaxed max-w-2xl mx-auto">
               We prioritize your privacy, but we prioritize your <strong>life</strong> more. If our system detects an immediate life-threatening emergency (e.g., active suicide attempt or severe violence), we are ethically bound to provide you with emergency contacts (112/911). 
               <br/><br/>
               <strong>Note:</strong> If you dial 112 from our app, that call goes through your mobile carrier network, which is outside our encryption bubble.
            </p>
         </div>
      </section>

      {/* --- RIGHTS & FOOTER --- */}
      <section className="py-20 border-t border-white/5 bg-[#231854]/30">
         <div className="mx-auto max-w-4xl px-4 text-center">
            <h2 className="text-2xl font-bold text-white mb-8">You Are In Control</h2>
            <div className="flex flex-wrap justify-center gap-4">
               {["My Data, My Choice", "Right to Delete", "Right to Export", "Safety First"].map((right, i) => (
                  <div key={i} className="px-6 py-3 rounded-full bg-[#1C1246] border border-[#DA8CA0]/20 text-[#CCCCD9] text-sm hover:border-[#DA8CA0] transition-colors cursor-default">
                     {right}
                  </div>
               ))}
            </div>
            <p className="mt-12 text-[#CCCCD9] text-sm">
               Questions about your privacy? We are happy to answer. Email our Data Safety Officer at <a href="mailto:privacy@healher.ai" className="text-[#DA8CA0] hover:underline">privacy@healher.ai</a>
            </p>
         </div>
      </section>

      <Footer />
    </div>
  )
}