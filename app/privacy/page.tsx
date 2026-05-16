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
  AlertTriangle,
  ArrowRight,
  ShieldCheck
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

export default function PrivacyPage() {
  return (
    <div className="relative min-h-screen bg-[#1C1246] text-[#FAFAFA] selection:bg-[#DA8CA0]/30 selection:text-[#DA8CA0]">
      <Navigation />

      {/* ========== FULL-WIDTH HERO SECTION ========== */}
      <section className="relative min-h-[95vh] md:min-h-[85vh] flex items-center justify-center overflow-hidden">
        
        {/* Full Screen Image Background (The Crystal Embrace) */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/four-hero.png"
            alt="The Crystal Embrace"
            fill
            className="object-cover object-center"
            priority
          />
          {/* Glass-morphic Gradient Overlays for perfect text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#1C1246]/80 via-[#1C1246]/40 to-[#1C1246]" />
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
             <GlowingBadge icon={Lock}>100% Secure Sanctuary</GlowingBadge>
           </motion.div>

           <motion.h1 
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 1, delay: 0.1, ease: smoothEase }}
             className="text-5xl sm:text-6xl md:text-8xl font-extrabold tracking-tight text-white mb-6 leading-[1.05] drop-shadow-2xl"
           >
             Your Secrets <br/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DA8CA0] via-[#E8B4C1] to-[#DA8CA0] drop-shadow-lg">Stay Yours.</span>
           </motion.h1>

           <motion.p 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2, duration: 1, ease: smoothEase }}
             className="max-w-2xl mx-auto text-lg md:text-2xl text-[#FAFAFA] leading-relaxed font-light mb-12 drop-shadow-md"
           >
             Health is personal. We use unbreakable security, anonymous accounts, and a strict "No-Sell" policy to ensure your dignity is protected at all costs.
           </motion.p>
        </div>

        {/* --- WATERMARK HIDER / TRUST BADGE (Bottom Right) --- */}
        <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 z-20">
          <div className="backdrop-blur-xl bg-[#1C1246]/80 border border-white/10 rounded-2xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4 shadow-[0_20px_40px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.2)]">
             <div className="bg-[#DA8CA0]/20 p-2 rounded-xl border border-[#DA8CA0]/30">
               <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#DA8CA0]" />
             </div>
             <div className="text-left hidden sm:block pr-2">
               <p className="text-white text-xs font-bold uppercase tracking-widest">Verified Secure</p>
               <p className="text-[#CCCCD9] text-[10px] font-medium">Bank-Grade Privacy</p>
             </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 1: IDENTITY PROTECTION (Simplified for Customers) --- */}
      <section className="py-24 sm:py-32 px-4 border-t border-white/5 bg-[#1C1246]">
        <div className="mx-auto max-w-7xl">
           <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">How We Hide Your Identity</h2>
              <p className="text-lg text-[#CCCCD9] font-light max-w-2xl mx-auto">We completely separate <strong className="text-white">who you are</strong> from <strong className="text-white">what you ask</strong>.</p>
           </div>

           <motion.div 
             variants={staggerContainer}
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true }}
             className="grid md:grid-cols-3 gap-6 sm:gap-8"
           >
              <motion.div variants={fadeInUp} className="h-full">
                <SpotlightCard className="p-8 md:p-10 h-full">
                   <div className="mb-8 h-14 w-14 rounded-2xl bg-[#DA8CA0]/10 flex items-center justify-center border border-[#DA8CA0]/20 shadow-inner">
                      <VenetianMask className="h-7 w-7 text-[#DA8CA0]" />
                   </div>
                   <h3 className="text-2xl font-bold text-white mb-4">Nicknames Only</h3>
                   <p className="text-[#CCCCD9] text-base font-light leading-relaxed">
                      While you need an email to recover a lost password, the AI never sees it. We ask you to pick a safe Nickname. To the system, you are just "StarGirl" or "Bluebird."
                   </p>
                </SpotlightCard>
              </motion.div>

              <motion.div variants={fadeInUp} className="h-full">
                <SpotlightCard className="p-8 md:p-10 h-full">
                   <div className="mb-8 h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-inner">
                      <Fingerprint className="h-7 w-7 text-emerald-400" />
                   </div>
                   <h3 className="text-2xl font-bold text-white mb-4">The "Iron Wall"</h3>
                   <p className="text-[#CCCCD9] text-base font-light leading-relaxed">
                      We store your account info in one locked vault, and your health chats in a completely different one. Even our own team cannot connect your real identity to your personal questions.
                   </p>
                </SpotlightCard>
              </motion.div>

              <motion.div variants={fadeInUp} className="h-full">
                <SpotlightCard className="p-8 md:p-10 h-full">
                   <div className="mb-8 h-14 w-14 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shadow-inner">
                      <Trash2 className="h-7 w-7 text-purple-400" />
                   </div>
                   <h3 className="text-2xl font-bold text-white mb-4">Total Erasure</h3>
                   <p className="text-[#CCCCD9] text-base font-light leading-relaxed">
                      If you ever decide to delete your account, your data isn't just hidden—it is destroyed. Your chat history becomes digital dust, completely unreadable and unrecoverable forever.
                   </p>
                </SpotlightCard>
              </motion.div>
           </motion.div>
        </div>
      </section>

      {/* --- SECTION 2: THE MESSAGE JOURNEY (No Tech Jargon) --- */}
      <section className="py-24 sm:py-32 px-4 bg-[#231854]/20 border-y border-white/5 relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
         
         <div className="mx-auto max-w-5xl relative z-10">
            <div className="text-center mb-16">
               <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">The Life of a Message</h2>
               <p className="text-lg text-[#CCCCD9] font-light max-w-2xl mx-auto">Follow your data from your screen directly into our unbreakable core.</p>
            </div>

            <div className="relative space-y-16">
               {/* Connecting Line (Desktop) */}
               <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#DA8CA0]/50 via-purple-500/50 to-emerald-500/50 -ml-[1px]" />

               {/* Step 1: Transit */}
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 className="relative flex flex-col md:flex-row items-center gap-8 md:gap-16"
               >
                  <div className="hidden md:block absolute left-1/2 -ml-3 h-6 w-6 rounded-full bg-[#1C1246] border-4 border-[#DA8CA0] z-10 shadow-[0_0_15px_#DA8CA0]" />
                  <div className="md:w-1/2 md:text-right text-center">
                     <div className="md:hidden inline-flex mb-4 h-12 w-12 rounded-full bg-[#1C1246] border-4 border-[#DA8CA0] items-center justify-center text-[#DA8CA0] font-bold">1</div>
                     <h4 className="text-2xl font-bold text-white mb-3">The Safe Tunnel</h4>
                     <p className="text-base text-[#CCCCD9] font-light leading-relaxed">
                        As soon as you hit send, your message is wrapped in an unbreakable digital lock. It travels through the internet in a secure, private tunnel that hackers cannot see into or penetrate.
                     </p>
                  </div>
                  <div className="md:w-1/2 flex justify-center md:justify-start">
                     <SpotlightCard className="p-6">
                        <Network className="h-10 w-10 text-[#DA8CA0]" />
                     </SpotlightCard>
                  </div>
               </motion.div>

               {/* Step 2: Processing */}
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 className="relative flex flex-col md:flex-row-reverse items-center gap-8 md:gap-16"
               >
                  <div className="hidden md:block absolute left-1/2 -ml-3 h-6 w-6 rounded-full bg-[#1C1246] border-4 border-purple-500 z-10 shadow-[0_0_15px_rgba(168,85,247,0.8)]" />
                  <div className="md:w-1/2 md:text-left text-center">
                     <div className="md:hidden inline-flex mb-4 h-12 w-12 rounded-full bg-[#1C1246] border-4 border-purple-500 items-center justify-center text-purple-400 font-bold">2</div>
                     <h4 className="text-2xl font-bold text-white mb-3">The Private Room</h4>
                     <p className="text-base text-[#CCCCD9] font-light leading-relaxed">
                        The message arrives in our highly protected "Clean Room." The AI reads it, generates a helpful answer, and immediately forgets the context based on your strict privacy settings.
                     </p>
                  </div>
                  <div className="md:w-1/2 flex justify-center md:justify-end">
                     <SpotlightCard className="p-6">
                        <Server className="h-10 w-10 text-purple-500" />
                     </SpotlightCard>
                  </div>
               </motion.div>

               {/* Step 3: Storage */}
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 className="relative flex flex-col md:flex-row items-center gap-8 md:gap-16"
               >
                  <div className="hidden md:block absolute left-1/2 -ml-3 h-6 w-6 rounded-full bg-[#1C1246] border-4 border-emerald-500 z-10 shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                  <div className="md:w-1/2 md:text-right text-center">
                     <div className="md:hidden inline-flex mb-4 h-12 w-12 rounded-full bg-[#1C1246] border-4 border-emerald-500 items-center justify-center text-emerald-400 font-bold">3</div>
                     <h4 className="text-2xl font-bold text-white mb-3">The Locked Vault</h4>
                     <p className="text-base text-[#CCCCD9] font-light leading-relaxed">
                        If you choose to save your chat history, it sits in our database sealed with bank-grade locks. Without your personal login key, it looks like complete, unreadable gibberish to anyone else.
                     </p>
                  </div>
                  <div className="md:w-1/2 flex justify-center md:justify-start">
                     <SpotlightCard className="p-6">
                        <FileKey className="h-10 w-10 text-emerald-500" />
                     </SpotlightCard>
                  </div>
               </motion.div>
            </div>
         </div>
      </section>

      {/* --- SECTION 3: DATA COLLECTION MATRIX (The Transparency List) --- */}
      <section className="py-24 sm:py-32 px-4 bg-[#1C1246]">
         <div className="mx-auto max-w-6xl">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white text-center mb-16">The Transparency List</h2>
            
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
               
               {/* What We Collect */}
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 className="h-full"
               >
                  <SpotlightCard className="p-8 md:p-10 h-full border-emerald-500/20">
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-4">
                           <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                           </div>
                           <h3 className="text-2xl font-bold text-white">Data We Keep</h3>
                        </div>
                        <span className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-500/20 font-bold tracking-widest uppercase w-fit">Strictly Minimal</span>
                     </div>
                     <div className="space-y-4">
                        {[
                           "Email (Kept separate, used only for login recovery)",
                           "Chat Text (Saved only so you can read past advice)",
                           "General Region (To ensure emergency numbers work)",
                           "Device Type (To fit the app beautifully to your screen)"
                        ].map((item, i) => (
                           <div key={i} className="flex gap-4 p-5 rounded-2xl bg-[#231854]/40 border border-white/5">
                              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                              <span className="text-base text-[#CCCCD9] font-light leading-snug">{item}</span>
                           </div>
                        ))}
                     </div>
                  </SpotlightCard>
               </motion.div>

               {/* What We DO NOT Collect */}
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: 0.2 }}
                 className="h-full"
               >
                  <SpotlightCard className="p-8 md:p-10 h-full border-rose-500/20">
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-4">
                           <div className="h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center">
                              <XCircle className="h-6 w-6 text-rose-400" />
                           </div>
                           <h3 className="text-2xl font-bold text-white">Data We Ban</h3>
                        </div>
                        <span className="text-xs bg-rose-500/10 text-rose-400 px-3 py-1.5 rounded-full border border-rose-500/20 font-bold tracking-widest uppercase w-fit">Never Ever</span>
                     </div>
                     <div className="space-y-4">
                        {[
                           "Real Names (Unless you willingly choose it as a nickname)",
                           "Phone Contact Lists (We never scan your friends)",
                           "Advertising Trackers (No sneaky pixels following you)",
                           "Browser History (What you do outside Heal Her is private)"
                        ].map((item, i) => (
                           <div key={i} className="flex gap-4 p-5 rounded-2xl bg-[#231854]/40 border border-white/5 opacity-80">
                              <XCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                              <span className="text-base text-[#CCCCD9] font-light leading-snug">{item}</span>
                           </div>
                        ))}
                     </div>
                  </SpotlightCard>
               </motion.div>

            </div>
         </div>
      </section>

      {/* --- SECTION 4: EMERGENCY PROTOCOL --- */}
      <section className="py-24 sm:py-32 px-4 border-t border-[#DA8CA0]/10 bg-[#231854]/30">
         <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-widest mb-8 shadow-inner">
               <AlertTriangle className="h-4 w-4" /> Important Exception
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">When Privacy Meets Danger</h2>
            <p className="text-lg text-[#CCCCD9] font-light leading-relaxed max-w-3xl mx-auto">
               We prioritize your absolute privacy, but we prioritize your <strong className="text-white font-semibold">life</strong> more. If our system detects an immediate life-threatening emergency (like an active suicide attempt or severe ongoing violence), we are ethically bound to break the chat flow to provide you with immediate emergency contacts. 
               <br/><br/>
               <span className="text-sm opacity-80 border-t border-white/10 pt-6 block mt-4">
                  Note: If you dial emergency services from our app, that call goes through your mobile carrier network, which is safely outside our encryption bubble.
               </span>
            </p>
         </div>
      </section>

      {/* ========== FINAL CTA ========== */}
      <section className="relative py-24 sm:py-32 overflow-hidden border-t border-[#DA8CA0]/10 bg-[#1C1246]">
         <div className="absolute inset-0">
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