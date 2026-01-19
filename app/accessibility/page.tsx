"use client"

import React from "react"
import { motion, useMotionTemplate, useMotionValue, Variants } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { cn } from "@/lib/utils"
import { 
  Globe, 
  Languages, 
  Accessibility, 
  Heart, 
  MapPin, 
  Eye, 
  Signal, 
  CheckCircle2,
  MousePointer,
  Sparkles,
  Ear,
  Cpu,
  Users
} from "lucide-react"

// --- ANIMATION VARIANTS ---

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
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
  visible: { scale: 1, opacity: 1, transition: { duration: 0.6 } }
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

export default function AccessibilityPage() {
  return (
    <div className="relative min-h-screen bg-[#1C1246] text-[#FAFAFA] selection:bg-[#DA8CA0]/30 selection:text-[#DA8CA0]">
      <GrainOverlay />
      <Navigation />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Updated Gradient to Indigo/Rose */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#DA8CA0]/10 via-[#1C1246] to-[#1C1246] -z-10" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
           <motion.div
             initial={{ scale: 0.9, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ duration: 0.8 }}
             className="mb-8 inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-[#DA8CA0]/10 border border-[#DA8CA0]/20 shadow-2xl shadow-[#DA8CA0]/10"
           >
             <Heart className="h-8 w-8 text-[#DA8CA0]" />
           </motion.div>

           <TextReveal 
             text="Inclusive by Design." 
             className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6"
           />

           <motion.p 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.6, duration: 0.8 }}
             className="max-w-2xl mx-auto text-lg text-[#CCCCD9] leading-relaxed"
           >
             Every girl deserves to understand her body. We are breaking down barriers—language, disability, and connectivity—to ensure no one is left behind.
           </motion.p>
        </div>
      </section>

      {/* --- CORE MISSION --- */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        className="py-20 border-y border-white/5 bg-[#231854]/30"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
           <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-white mb-6">Health Education for All</h2>
              <p className="text-lg leading-relaxed text-[#CCCCD9]">
                 Puberty and health questions don't discriminate. Neither should access to answers. Heal Her is committed to serving all girls, especially those traditionally underserved by healthcare and education systems.
              </p>
           </div>
        </div>
      </motion.section>

      {/* --- MULTILINGUAL SUPPORT --- */}
      <section className="py-24">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
               
               {/* Left: Text Content */}
               <motion.div 
                 initial="hidden"
                 whileInView="visible"
                 viewport={{ once: true }}
                 variants={staggerContainer}
                 className="space-y-8"
               >
                  <motion.div variants={scaleIn} className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#DA8CA0]/10 text-[#DA8CA0] border border-[#DA8CA0]/20">
                     <Languages className="h-6 w-6" />
                  </motion.div>
                  <motion.h2 variants={fadeInUp} className="text-3xl font-bold text-white">We Speak Your Language</motion.h2>
                  <motion.p variants={fadeInUp} className="text-lg leading-relaxed text-[#CCCCD9]">
                     You shouldn't have to translate your feelings. Heal Her is built to understand natural speech, slang, and local dialects.
                  </motion.p>
                  
                  <motion.div variants={staggerContainer} className="space-y-6">
                     <motion.div variants={fadeInUp} className="flex gap-4 p-4 rounded-xl bg-[#231854] border border-white/5">
                        <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#DA8CA0]" />
                        <div>
                           <p className="font-bold text-white mb-1">Pidgin & Slang Friendly</p>
                           <p className="text-sm text-[#CCCCD9]">
                             "My body dey do me somehow." We understand that. Speak freely in the language you use with your friends.
                           </p>
                        </div>
                     </motion.div>
                     <motion.div variants={fadeInUp} className="flex gap-4 p-4 rounded-xl bg-[#231854] border border-white/5">
                        <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#DA8CA0]" />
                        <div>
                           <p className="font-bold text-white mb-1">Cultural Context</p>
                           <p className="text-sm text-[#CCCCD9]">Guidance adapted for cultural norms in Nigeria, respecting local values while providing medical facts.</p>
                        </div>
                     </motion.div>
                     <motion.div variants={fadeInUp} className="flex gap-4 p-4 rounded-xl bg-[#231854] border border-white/5">
                        <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#DA8CA0]" />
                        <div>
                           <p className="font-bold text-white mb-1">Instant Translation</p>
                           <p className="text-sm text-[#CCCCD9]">Switch between English, Yorùbá, Hausa, or Igbo seamlessly during your chat.</p>
                        </div>
                     </motion.div>
                  </motion.div>
               </motion.div>

               {/* Right: Language Card */}
               <motion.div
                 initial={{ opacity: 0, x: 50 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.8 }}
               >
                 <SpotlightCard className="p-8 bg-[#1C1246] border-white/10">
                    <div className="flex items-center gap-3 mb-6">
                       <Globe className="h-5 w-5 text-[#DA8CA0]" />
                       <h3 className="font-bold text-white">Supported Languages</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-[#CCCCD9]">
                       <div className="p-2 border-b border-white/10 text-white font-medium">English</div>
                       <div className="p-2 border-b border-white/10 text-white font-medium">Pidgin English</div>
                       <div className="p-2 border-b border-white/10 text-white font-medium">Yorùbá</div>
                       <div className="p-2 border-b border-white/10 text-white font-medium">Igbo</div>
                       <div className="p-2 border-b border-white/10 text-white font-medium">Hausa</div>
                       <div className="p-2 border-b border-white/10">Français</div>
                       <div className="p-2 border-b border-white/10">Español</div>
                       <div className="p-2 border-b border-white/10">Swahili</div>
                    </div>
                    
                    <div className="mt-8 pt-4 border-t border-white/10 flex items-start gap-3">
                       <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                       <p className="text-xs text-[#CCCCD9]">
                          <span className="text-white font-bold">Universal Core Active:</span> Type in any mix of languages. Our AI is trained to understand code-switching.
                       </p>
                    </div>
                 </SpotlightCard>
               </motion.div>

            </div>
         </div>
      </section>

      {/* --- UNDERSERVED COMMUNITIES --- */}
      <section className="py-24 bg-[#231854]/20 border-y border-white/5">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.h2 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="mb-16 text-center text-3xl font-bold text-white"
            >
               No Girl Left Behind
            </motion.h2>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
            >
               
               <motion.div variants={fadeInUp}>
                 <SpotlightCard className="p-8 h-full bg-[#1C1246]">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                       <MapPin className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">Rural & Remote Areas</h3>
                    <p className="leading-relaxed text-[#CCCCD9] text-sm">
                       For girls far from clinics or libraries, Heal Her acts as a personal health tutor. Our lightweight app works even on slow 2G/3G networks.
                    </p>
                 </SpotlightCard>
               </motion.div>

               <motion.div variants={fadeInUp}>
                 <SpotlightCard className="p-8 h-full bg-[#1C1246]">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                       <Sparkles className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">Neurodivergent Girls</h3>
                    <p className="leading-relaxed text-[#CCCCD9] text-sm">
                       We use clear, direct language and avoid overwhelming visuals. Perfect for girls with ADHD or Autism who prefer straightforward, calm communication.
                    </p>
                 </SpotlightCard>
               </motion.div>

               <motion.div variants={fadeInUp}>
                 <SpotlightCard className="p-8 h-full bg-[#1C1246]">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#DA8CA0]/10 text-[#DA8CA0] border border-[#DA8CA0]/20">
                       <Heart className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">Low-Income Access</h3>
                    <p className="leading-relaxed text-[#CCCCD9] text-sm">
                       Information is a right, not a privilege. Heal Her is free to use for individual girls, ensuring economic status never blocks access to health facts.
                    </p>
                 </SpotlightCard>
               </motion.div>

               <motion.div variants={fadeInUp}>
                 <SpotlightCard className="p-8 h-full bg-[#1C1246]">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                       <Accessibility className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">Disability Friendly</h3>
                    <p className="leading-relaxed text-[#CCCCD9] text-sm">
                       Built with screen-reader compatibility and high-contrast modes for girls with visual impairments or blindness.
                    </p>
                 </SpotlightCard>
               </motion.div>

               <motion.div variants={fadeInUp}>
                 <SpotlightCard className="p-8 h-full bg-[#1C1246]">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                       <Ear className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">Deaf & Hard of Hearing</h3>
                    <p className="leading-relaxed text-[#CCCCD9] text-sm">
                       Our text-based interface ensures that girls who are hard of hearing have the exact same access to information as everyone else.
                    </p>
                 </SpotlightCard>
               </motion.div>

               <motion.div variants={fadeInUp}>
                 <SpotlightCard className="p-8 h-full bg-[#1C1246]">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                       <Users className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">Private & Safe</h3>
                    <p className="leading-relaxed text-[#CCCCD9] text-sm">
                       For girls in conservative environments, privacy is safety. Our discreet interface ensures you can learn without fear of judgment.
                    </p>
                 </SpotlightCard>
               </motion.div>

            </motion.div>
         </div>
      </section>

      {/* --- TECHNICAL ACCESSIBILITY FEATURES --- */}
      <section className="py-24">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.h2 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="mb-16 text-center text-3xl font-bold text-white"
            >
               Built for Every Body
            </motion.h2>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto"
            >
               
               <motion.div variants={fadeInUp}>
                 <SpotlightCard className="p-8 bg-[#231854]">
                    <div className="flex items-center gap-3 mb-6">
                       <Eye className="h-6 w-6 text-[#DA8CA0]" />
                       <h3 className="text-xl font-bold text-white">Visual Accessibility</h3>
                    </div>
                    <ul className="space-y-3 text-sm text-[#CCCCD9]">
                       <li className="flex items-center gap-3">
                          <CheckCircle2 className="h-4 w-4 text-[#DA8CA0]" /> Screen reader compatible
                       </li>
                       <li className="flex items-center gap-3">
                          <CheckCircle2 className="h-4 w-4 text-[#DA8CA0]" /> High contrast mode
                       </li>
                       <li className="flex items-center gap-3">
                          <CheckCircle2 className="h-4 w-4 text-[#DA8CA0]" /> Calming color palette (no flashing)
                       </li>
                       <li className="flex items-center gap-3">
                          <CheckCircle2 className="h-4 w-4 text-[#DA8CA0]" /> Clear visual hierarchy
                       </li>
                    </ul>
                 </SpotlightCard>
               </motion.div>

               <motion.div variants={fadeInUp}>
                 <SpotlightCard className="p-8 bg-[#231854]">
                    <div className="flex items-center gap-3 mb-6">
                       <MousePointer className="h-6 w-6 text-purple-400" />
                       <h3 className="text-xl font-bold text-white">Motor Accessibility</h3>
                    </div>
                    <ul className="space-y-3 text-sm text-[#CCCCD9]">
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
                          <CheckCircle2 className="h-4 w-4 text-purple-500" /> Simple, one-thumb interactions
                       </li>
                    </ul>
                 </SpotlightCard>
               </motion.div>

               <motion.div variants={fadeInUp}>
                 <SpotlightCard className="p-8 bg-[#231854]">
                    <div className="flex items-center gap-3 mb-6">
                       <Cpu className="h-6 w-6 text-amber-400" />
                       <h3 className="text-xl font-bold text-white">Cognitive Accessibility</h3>
                    </div>
                    <ul className="space-y-3 text-sm text-[#CCCCD9]">
                       <li className="flex items-center gap-3">
                          <CheckCircle2 className="h-4 w-4 text-amber-500" /> Plain language options
                       </li>
                       <li className="flex items-center gap-3">
                          <CheckCircle2 className="h-4 w-4 text-amber-500" /> "Explain like I'm 10" feature
                       </li>
                       <li className="flex items-center gap-3">
                          <CheckCircle2 className="h-4 w-4 text-amber-500" /> Consistent layout
                       </li>
                       <li className="flex items-center gap-3">
                          <CheckCircle2 className="h-4 w-4 text-amber-500" /> No medical jargon
                       </li>
                    </ul>
                 </SpotlightCard>
               </motion.div>

               <motion.div variants={fadeInUp}>
                 <SpotlightCard className="p-8 bg-[#231854]">
                    <div className="flex items-center gap-3 mb-6">
                       <Signal className="h-6 w-6 text-rose-400" />
                       <h3 className="text-xl font-bold text-white">Tech Accessibility</h3>
                    </div>
                    <ul className="space-y-3 text-sm text-[#CCCCD9]">
                       <li className="flex items-center gap-3">
                          <CheckCircle2 className="h-4 w-4 text-rose-500" /> Lightweight app size
                       </li>
                       <li className="flex items-center gap-3">
                          <CheckCircle2 className="h-4 w-4 text-rose-500" /> Works on older phones
                       </li>
                       <li className="flex items-center gap-3">
                          <CheckCircle2 className="h-4 w-4 text-rose-500" /> Minimal data usage
                       </li>
                       <li className="flex items-center gap-3">
                          <CheckCircle2 className="h-4 w-4 text-rose-500" /> Fast loading on 3G
                       </li>
                    </ul>
                 </SpotlightCard>
               </motion.div>

            </motion.div>
         </div>
      </section>

      {/* --- COMMITMENT --- */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        className="py-24 border-t border-white/5"
      >
         <div className="mx-auto max-w-3xl px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Our Ongoing Commitment</h2>
            <p className="text-lg leading-relaxed text-[#CCCCD9] mb-6">
               Accessibility isn't a feature—it's love in action. We continuously test with diverse groups of girls to ensure Heal Her feels like a home for everyone.
            </p>
            <p className="text-lg leading-relaxed text-[#CCCCD9]">
               If you encounter barriers or have suggestions for improvement, please contact us. We are listening.
            </p>
         </div>
      </motion.section>

      <Footer />
    </div>
  )
}