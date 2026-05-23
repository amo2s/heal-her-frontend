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
  Compass,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Stethoscope,
  Lightbulb,
  Globe,
  Lock,
  ArrowRight,
  ShieldCheck,
  Activity,
  BookOpen,
  ShieldAlert
} from "lucide-react"

// ============================================================================
// ULTRA-PREMIUM UTILITY COMPONENTS & ANIMATIONS
// ============================================================================

// Apple-style ultra-smooth easing
const ultraSmooth: [number, number, number, number] = [0.16, 1, 0.3, 1]

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)",
    transition: { duration: 1.2, ease: ultraSmooth } 
  }
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 }
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
        "group relative overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-[#231854]/80 to-[#1C1246]/95 border border-white/10 border-t-white/20 backdrop-blur-2xl shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_15px_30px_-10px_rgba(28,18,70,0.8)] transition-all duration-700 hover:border-[#DA8CA0]/50 hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.3),0_25px_50px_-12px_rgba(218,140,160,0.25)]",
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
      <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-[#DA8CA0]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="relative h-full z-10">{children}</div>
    </motion.div>
  )
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function ScopeOfCarePage() {
  return (
    <div className="relative min-h-screen bg-[#1C1246] text-[#FAFAFA] selection:bg-[#DA8CA0]/30 selection:text-[#DA8CA0]">
      <Navigation />

      {/* ========== FULL-WIDTH HERO SECTION ========== */}
      <section className="relative min-h-[95vh] md:min-h-[85vh] flex items-center justify-center overflow-hidden">
        
        <div className="absolute inset-0 z-0">
          <Image
            src="/fourth-hero.png"
            alt="The Crystal Compass - Guidance and Clarity"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1C1246]/80 via-[#1C1246]/40 to-[#1C1246]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#1C1246_100%)] opacity-80" />
        </div>
        
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10 text-center mt-20">
           <motion.div
             initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
             animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
             transition={{ duration: 1.2, ease: ultraSmooth }}
             className="mb-8"
           >
             <GlowingBadge icon={Compass}>Our Scope of Care</GlowingBadge>
           </motion.div>

           <motion.h1 
             initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
             animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
             transition={{ duration: 1.4, delay: 0.1, ease: ultraSmooth }}
             className="text-5xl sm:text-6xl md:text-8xl font-extrabold tracking-tight text-white mb-6 leading-[1.05] drop-shadow-2xl"
           >
             Absolute <br/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DA8CA0] via-[#E8B4C1] to-[#DA8CA0] drop-shadow-lg">Empowerment.</span>
           </motion.h1>

           <motion.p 
             initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
             animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
             transition={{ duration: 1.4, delay: 0.2, ease: ultraSmooth }}
             className="max-w-2xl mx-auto text-lg md:text-2xl text-[#FAFAFA] leading-relaxed font-light mb-12 drop-shadow-md"
           >
             We are here to educate and arm you with the truth about your body. Here is our clear, transparent promise on exactly what we do, and the boundaries that keep you safe.
           </motion.p>
        </div>

        {/* --- WATERMARK HIDER / TRUST BADGE --- */}
        <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 z-20">
          <div className="backdrop-blur-xl bg-[#1C1246]/80 border border-white/10 rounded-2xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4 shadow-[0_20px_40px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.2)]">
             <div className="bg-[#DA8CA0]/20 p-2 rounded-xl border border-[#DA8CA0]/30">
               <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#DA8CA0]" />
             </div>
             <div className="text-left hidden sm:block pr-2">
               <p className="text-white text-xs font-bold uppercase tracking-widest">Verified Boundaries</p>
               <p className="text-[#CCCCD9] text-[10px] font-medium">Safe & Transparent</p>
             </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 1: THE SHIELD OF KNOWLEDGE (Replaces "Bridge to Doctor") --- */}
      <section className="py-24 sm:py-32 px-4 bg-[#231854]/20 border-t border-white/5 relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
         
         <div className="mx-auto max-w-6xl relative z-10">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="flex flex-col md:flex-row items-center gap-12 md:gap-20"
            >
               <motion.div variants={fadeInUp} className="w-full md:w-5/12 flex justify-center">
                  <div className="relative group">
                     <div className="absolute -inset-6 bg-gradient-to-r from-[#DA8CA0]/40 to-purple-500/40 blur-3xl rounded-full opacity-70 group-hover:opacity-100 transition-opacity duration-1000" />
                     <div className="h-48 w-48 sm:h-72 sm:w-72 rounded-full bg-[#1C1246] border-2 border-[#DA8CA0]/30 flex items-center justify-center relative z-10 shadow-[0_0_40px_rgba(218,140,160,0.2)] overflow-hidden">
                        <Image 
                          src="/heal-logo.png" 
                          alt="Heal Her Logo" 
                          width={140} 
                          height={140} 
                          className="object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] transform group-hover:scale-105 transition-transform duration-1000 ease-out" 
                        />
                     </div>
                  </div>
               </motion.div>
               
               <motion.div variants={fadeInUp} className="w-full md:w-7/12 text-center md:text-left">
                  <h2 className="text-sm font-bold tracking-widest text-[#DA8CA0] uppercase mb-4">Body Literacy</h2>
                  <h3 className="text-3xl md:text-5xl font-extrabold text-white mb-6">The Shield of Knowledge</h3>
                  <p className="text-lg text-[#CCCCD9] font-light leading-relaxed mb-6">
                     When you understand exactly how your reproductive system works, you take back your power. We don't just explain biology; we give you the deep literacy required to recognize what is healthy and what is a severe red flag.
                  </p>
                  <p className="text-lg text-[#CCCCD9] font-light leading-relaxed">
                     From spotting physical warning signs to recognizing predatory behavior and unsafe situations, knowledge is your ultimate defense. You leave this platform enlightened, secure, and fiercely in control of your own body.
                  </p>
               </motion.div>
            </motion.div>
         </div>
      </section>

      {/* --- SECTION 2: THE SCOPE MATRIX (What we do vs What we don't) --- */}
      <section className="py-24 sm:py-32 px-4 border-t border-white/5 bg-[#1C1246]">
        <div className="mx-auto max-w-7xl">
           <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">Clear Medical Boundaries</h2>
              <p className="text-lg text-[#CCCCD9] font-light max-w-2xl mx-auto">
                 We believe true safety starts with honesty. Heal Her is a powerful educational sanctuary, but it operates with absolute, strict limits to protect your well-being.
              </p>
           </div>

           <motion.div 
             variants={staggerContainer}
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true }}
             className="grid md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12"
           >
              {/* THE GREEN ZONE (What we do) */}
              <motion.div variants={fadeInUp} className="h-full">
                <SpotlightCard className="p-8 md:p-10 h-full border-emerald-500/20">
                   <div className="flex items-center gap-4 mb-8">
                      <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-inner">
                         <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                      </div>
                      <h3 className="text-3xl font-bold text-white">Our Perfect Role</h3>
                   </div>
                   <p className="text-[#CCCCD9] text-base font-light mb-8 leading-relaxed">
                      We act as an incredibly smart, highly empathetic health educator. We are here to arm you with the facts accurately and without judgment.
                   </p>
                   <div className="space-y-5">
                      {[
                         "Provide fact-based reproductive and body education.",
                         "Clearly explain the phases of the menstrual cycle.",
                         "Teach you how to spot physical and emotional red flags.",
                         "Translate complex medical terminology into simple English.",
                         "Help you recognize predatory behavior and set strict boundaries."
                      ].map((item, i) => (
                         <div key={i} className="flex gap-4">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 mt-2.5 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                            <span className="text-base text-[#FAFAFA] font-light">{item}</span>
                         </div>
                      ))}
                   </div>
                </SpotlightCard>
              </motion.div>

              {/* THE AMBER ZONE (What we don't do) */}
              <motion.div variants={fadeInUp} className="h-full">
                <SpotlightCard className="p-8 md:p-10 h-full border-amber-500/20">
                   <div className="flex items-center gap-4 mb-8">
                      <div className="h-14 w-14 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-inner">
                         <XCircle className="h-7 w-7 text-amber-400" />
                      </div>
                      <h3 className="text-3xl font-bold text-white">System Limitations</h3>
                   </div>
                   <p className="text-[#CCCCD9] text-base font-light mb-8 leading-relaxed">
                      We are an intelligence engine, not a hospital. We cannot see you, and we cannot replace a trained, human physician who can examine you in person.
                   </p>
                   <div className="space-y-5">
                      {[
                         "We DO NOT provide official medical diagnoses.",
                         "We DO NOT prescribe medicine or recommend dosages.",
                         "We DO NOT perform or replace physical examinations.",
                         "We DO NOT guarantee personal health outcomes.",
                         "We DO NOT replace the critical guidance of your parents or guardians."
                      ].map((item, i) => (
                         <div key={i} className="flex gap-4 opacity-90">
                            <div className="h-2 w-2 rounded-full bg-amber-500 mt-2.5 shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                            <span className="text-base text-[#FAFAFA] font-light">{item}</span>
                         </div>
                      ))}
                   </div>
                </SpotlightCard>
              </motion.div>
           </motion.div>
        </div>
      </section>

      {/* --- SECTION 3: THE EMPOWERMENT GUARANTEE --- */}
      <section className="py-24 sm:py-32 px-4 bg-[#231854]/40 border-y border-white/5">
         <div className="mx-auto max-w-7xl text-center">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
               <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-[#DA8CA0]/10 border border-[#DA8CA0]/20 mb-8 shadow-inner">
                  <ShieldAlert className="h-8 w-8 text-[#DA8CA0]" />
               </div>
               <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">The Empowerment Guarantee</h2>
               <p className="text-lg text-[#CCCCD9] font-light max-w-3xl mx-auto leading-relaxed">
                  Ignorance breeds fear; knowledge builds armor. Our ultimate guarantee is that by using this platform, you will build long-lasting, unshakeable health literacy. By reading our verified educational content, you agree to use this knowledge to protect yourself, make informed decisions, and understand that final clinical treatments are always between you and a physical healthcare provider.
               </p>
            </motion.div>
         </div>
      </section>

      {/* --- SECTION 4: EMERGENCY PROTOCOL --- */}
      <section className="py-20 px-4 bg-[#1C1246] relative overflow-hidden">
        <div className="mx-auto max-w-5xl relative z-10">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, filter: "blur(10px)" }}
              whileInView={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: ultraSmooth }}
              className="relative overflow-hidden rounded-[2.5rem] border border-amber-500/30 bg-gradient-to-br from-amber-900/20 to-transparent p-1 shadow-[0_20px_40px_-15px_rgba(245,158,11,0.15)]"
            >
              <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(245,158,11,0.03)_10px,rgba(245,158,11,0.03)_20px)]" />
              <div className="relative bg-[#1C1246]/95 backdrop-blur-md rounded-[2.3rem] p-8 md:p-12 flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start text-center md:text-left">
                 <div className="shrink-0">
                    <div className="h-20 w-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-[inset_0_2px_10px_rgba(245,158,11,0.2)]">
                       <AlertTriangle className="h-10 w-10" />
                    </div>
                 </div>
                 <div>
                    <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">
                       When to Drop the Phone
                    </h2>
                    <p className="text-[#CCCCD9] leading-relaxed text-lg font-light mb-8">
                       If you are experiencing severe, unbearable pain, heavy uncontrolled bleeding, a life-threatening mental health crisis, or if you have been assaulted, an AI cannot protect you. You need human heroes right now.
                    </p>
                    <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold text-sm tracking-widest uppercase hover:bg-amber-500/30 transition-colors">
                       <Activity className="h-5 w-5" />
                       CONTACT EMERGENCY SERVICES (112 / 911)
                    </div>
                 </div>
              </div>
            </motion.div>
        </div>
      </section>

      {/* --- SECTION 5: PLAIN-ENGLISH LEGAL PROTECTIONS --- */}
      <section className="py-24 sm:py-32 px-4 border-t border-white/5 bg-[#1C1246]">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mx-auto max-w-4xl space-y-10"
        >
           <h2 className="text-3xl font-extrabold text-white text-center mb-16">The Simple Truths (Legal Translation)</h2>

           {/* Point 1 */}
           <motion.div variants={fadeInUp} className="group p-8 rounded-[2rem] bg-[#231854]/30 border border-white/5 hover:border-[#DA8CA0]/30 hover:bg-[#231854]/50 transition-all duration-500">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-4">
                 <div className="p-3 bg-[#DA8CA0]/10 rounded-xl border border-[#DA8CA0]/20">
                    <Stethoscope className="h-6 w-6 text-[#DA8CA0]" />
                 </div>
                 Educators, Not Physicians
              </h3>
              <p className="text-[#CCCCD9] text-lg font-light leading-relaxed pl-[4.5rem]">
                 Using Heal Her does not create a formal "doctor-patient" relationship. We do not have access to your full medical history, blood tests, or genetic background. Therefore, all advice provided is strictly educational, not a personalized medical prescription.
              </p>
           </motion.div>

           {/* Point 2 */}
           <motion.div variants={fadeInUp} className="group p-8 rounded-[2rem] bg-[#231854]/30 border border-white/5 hover:border-[#DA8CA0]/30 hover:bg-[#231854]/50 transition-all duration-500">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-4">
                 <div className="p-3 bg-[#DA8CA0]/10 rounded-xl border border-[#DA8CA0]/20">
                    <BookOpen className="h-6 w-6 text-[#DA8CA0]" />
                 </div>
                 Clinical Precision
              </h3>
              <p className="text-[#CCCCD9] text-lg font-light leading-relaxed pl-[4.5rem]">
                 We anchor our AI strictly to verified global health databases. However, AI is an automated technology and can occasionally misinterpret complex phrasing. By using the platform, you agree to use common sense and cross-reference critical concerns with a human professional.
              </p>
           </motion.div>

           {/* Point 3 */}
           <motion.div variants={fadeInUp} className="group p-8 rounded-[2rem] bg-[#231854]/30 border border-white/5 hover:border-[#DA8CA0]/30 hover:bg-[#231854]/50 transition-all duration-500">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-4">
                 <div className="p-3 bg-[#DA8CA0]/10 rounded-xl border border-[#DA8CA0]/20">
                    <Globe className="h-6 w-6 text-[#DA8CA0]" />
                 </div>
                 Global Knowledge, Local Action
              </h3>
              <p className="text-[#CCCCD9] text-lg font-light leading-relaxed pl-[4.5rem]">
                 Our health education applies to the human body globally, but our system is highly optimized for young women navigating the cultural and medical landscape of Nigeria. You are entirely responsible for knowing the specific emergency protocols in your physical location.
              </p>
           </motion.div>

           {/* Point 4 */}
           <motion.div variants={fadeInUp} className="group p-8 rounded-[2rem] bg-[#231854]/30 border border-white/5 hover:border-[#DA8CA0]/30 hover:bg-[#231854]/50 transition-all duration-500">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-4">
                 <div className="p-3 bg-[#DA8CA0]/10 rounded-xl border border-[#DA8CA0]/20">
                    <Lock className="h-6 w-6 text-[#DA8CA0]" />
                 </div>
                 Your Data is Yours
              </h3>
              <p className="text-[#CCCCD9] text-lg font-light leading-relaxed pl-[4.5rem]">
                 We protect your interactions fiercely. We do not and will never sell your health questions to third-party advertisers. Your safety, education, and peace of mind are our product, not your data.
              </p>
           </motion.div>

        </motion.div>
      </section>

      {/* ========== FINAL CTA ========== */}
      <section className="relative py-24 sm:py-32 overflow-hidden border-t border-[#DA8CA0]/10 bg-[#1C1246]">
         <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] sm:w-[1200px] h-[400px] sm:h-[600px] bg-[#DA8CA0]/15 blur-[120px] sm:blur-[150px] rounded-full pointer-events-none" />
         </div>

         <motion.div 
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: ultraSmooth }}
            className="relative z-10 mx-auto max-w-4xl px-4 text-center"
         >
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 sm:mb-8 drop-shadow-lg">
               Take Back Your Power.
            </h2>
            <p className="text-lg sm:text-xl text-[#CCCCD9] mb-10 sm:mb-12 max-w-2xl mx-auto font-light leading-relaxed">
               Now that you understand our boundaries, step into an environment built entirely for your growth, education, and absolute protection.
            </p>
            <div className="flex justify-center">
               <Button asChild className="group relative overflow-hidden h-14 sm:h-18 rounded-full bg-gradient-to-b from-[#f3cbd4] to-[#DA8CA0] px-10 sm:px-14 text-lg sm:text-xl font-bold text-[#1C1246] border border-[#DA8CA0]/50 border-t-white/80 shadow-[inset_0_2px_5px_rgba(255,255,255,0.9),0_15px_40px_-10px_rgba(218,140,160,0.6)] hover:from-[#fae0e6] hover:to-[#e19eb0] hover:scale-105 transition-all duration-700 ease-out">
                  <Link href="/login">
                    <div className="absolute top-0 left-[-100%] w-[150%] h-full bg-gradient-to-r from-transparent via-white/50 to-transparent group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
                    <span className="relative z-10 flex items-center gap-3">
                       Enter The Sanctuary <ArrowRight className="h-5 w-5" />
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