"use client"

import React, { useState } from "react"
import { motion, useMotionTemplate, useMotionValue, Variants, AnimatePresence } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { cn } from "@/lib/utils"
import { 
  Heart, 
  Thermometer, 
  Shield, 
  CheckCircle2, 
  XCircle, 
  Stethoscope, 
  Zap, 
  AlertTriangle, 
  Activity,
  Droplets,
  Brain,
  Smile,
  Sun,
  BookOpen,
  ArrowRight,
  RefreshCcw,
  HelpCircle,
  ChevronDown,
  Calendar
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

const float: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
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

// --- MYTH BUSTER CARD COMPONENT ---
function MythCard({ myth, fact }: { myth: string; fact: string }) {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div 
      className="relative h-64 w-full cursor-pointer perspective-1000" 
      onClick={() => setIsFlipped(!isFlipped)}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <motion.div
        className="w-full h-full relative preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front (Myth) */}
        <div className="absolute inset-0 backface-hidden bg-[#231854] border border-rose-500/30 rounded-2xl p-6 flex flex-col justify-center items-center text-center shadow-xl">
           <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mb-4 text-rose-500">
              <XCircle className="w-6 h-6" />
           </div>
           <h3 className="text-[#CCCCD9] font-mono text-xs uppercase tracking-widest mb-2">The Myth</h3>
           <p className="text-white font-bold text-lg">"{myth}"</p>
           <div className="absolute bottom-4 right-4 text-rose-500/50">
              <RefreshCcw className="w-4 h-4" />
           </div>
        </div>

        {/* Back (Fact) */}
        <div 
          className="absolute inset-0 backface-hidden bg-[#1C1246] border border-emerald-500/30 rounded-2xl p-6 flex flex-col justify-center items-center text-center shadow-xl" 
          style={{ transform: "rotateY(180deg)" }}
        >
           <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 text-emerald-500">
              <CheckCircle2 className="w-6 h-6" />
           </div>
           <h3 className="text-[#CCCCD9] font-mono text-xs uppercase tracking-widest mb-2">The Fact</h3>
           <p className="text-white text-md leading-relaxed">{fact}</p>
        </div>
      </motion.div>
    </div>
  )
}

// --- FAQ COMPONENT ---
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div 
      className="border-b border-white/10"
      initial={false}
    >
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-4 text-left group"
      >
        <span className={`font-medium transition-colors ${isOpen ? "text-[#DA8CA0]" : "text-white group-hover:text-[#DA8CA0]"}`}>
          {question}
        </span>
        <ChevronDown className={`w-5 h-5 text-[#DA8CA0] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-[#CCCCD9] text-sm leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// --- PAGE COMPONENT ---

export default function FirstAidPage() {
  return (
    <div className="relative min-h-screen bg-[#1C1246] text-[#FAFAFA] selection:bg-[#DA8CA0]/30 selection:text-[#DA8CA0] overflow-hidden">
      <GrainOverlay />
      <Navigation />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#DA8CA0]/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '10s' }} />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
           <motion.div
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ duration: 0.8, type: "spring" }}
             className="mb-8 inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-[#231854] border border-[#DA8CA0]/20 shadow-2xl shadow-[#DA8CA0]/10"
           >
             <Heart className="h-10 w-10 text-[#DA8CA0]" />
           </motion.div>

           <TextReveal 
             text="Your Body Guide." 
             className="text-5xl md:text-8xl font-bold tracking-tight text-white mb-6"
           />

           <motion.p 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.6, duration: 0.8 }}
             className="max-w-2xl mx-auto text-lg md:text-xl text-[#CCCCD9] leading-relaxed"
           >
             Navigating health doesn't have to be scary. From unexpected periods to mental health moments, Heal Her is your private, judgment-free guide.
           </motion.p>
        </div>
      </section>

      {/* --- THE TRIAGE PROCESS (New) --- */}
      <section className="py-24 border-y border-white/5 bg-[#231854]/20">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0 }} 
              whileInView={{ opacity: 1 }} 
              viewport={{ once: true }}
              className="text-center mb-16"
            >
               <h2 className="text-3xl font-bold text-white mb-4">How We Help You</h2>
               <p className="text-[#CCCCD9]">Three simple steps to peace of mind.</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 relative">
               {/* Connector Line (Desktop) */}
               <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-[2px] bg-gradient-to-r from-transparent via-[#DA8CA0]/30 to-transparent -z-10" />

               {[
                  { title: "Ask Freely", desc: "Type your question in plain language. No medical jargon needed.", icon: HelpCircle },
                  { title: "Instant Analysis", desc: "Our AI checks for safety flags and understands your context immediately.", icon: Activity },
                  { title: "Personalized Guide", desc: "Receive a step-by-step action plan tailored just for you.", icon: CheckCircle2 }
               ].map((step, i) => (
                  <motion.div 
                     key={i}
                     initial={{ opacity: 0, y: 20 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true }}
                     transition={{ delay: i * 0.2 }}
                     className="flex flex-col items-center text-center"
                  >
                     <div className="w-24 h-24 rounded-full bg-[#1C1246] border border-[#DA8CA0]/30 flex items-center justify-center mb-6 shadow-lg relative group">
                        <step.icon className="w-10 h-10 text-[#DA8CA0] group-hover:scale-110 transition-transform duration-300" />
                        <div className="absolute inset-0 rounded-full border border-[#DA8CA0] opacity-0 group-hover:animate-ping" />
                     </div>
                     <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                     <p className="text-[#CCCCD9] text-sm leading-relaxed max-w-xs">{step.desc}</p>
                  </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* --- COVERAGE MATRIX (Cards) --- */}
      <section className="py-24">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-12"
            >
               <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
               <h2 className="text-sm font-mono text-emerald-500 uppercase tracking-widest">Active Support Protocols</h2>
            </motion.div>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
               
               {/* Card 1 */}
               <motion.div variants={fadeInUp} className="h-full">
                 <SpotlightCard className="p-8 h-full bg-[#1C1246] border-[#DA8CA0]/20">
                    <div className="mb-6 flex items-center justify-between">
                       <div className="p-3 bg-[#DA8CA0]/10 rounded-lg text-[#DA8CA0]">
                          <Droplets className="h-6 w-6" />
                       </div>
                       <span className="text-[10px] font-mono text-[#CCCCD9]">ID: CYCLE-01</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">Period & Cycle</h3>
                    

[Image of the menstrual cycle phases]

                    <p className="text-sm text-[#CCCCD9] mb-4 mt-2 leading-relaxed">
                       Comprehensive support for menstrual health.
                    </p>
                    <ul className="space-y-3 text-sm text-[#CCCCD9]">
                       <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Managing severe cramps</li>
                       <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Irregular periods</li>
                       <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Emergency leak solutions</li>
                    </ul>
                 </SpotlightCard>
               </motion.div>

               {/* Card 2 */}
               <motion.div variants={fadeInUp} className="h-full">
                 <SpotlightCard className="p-8 h-full bg-[#1C1246] border-purple-500/20">
                    <div className="mb-6 flex items-center justify-between">
                       <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400">
                          <Brain className="h-6 w-6" />
                       </div>
                       <span className="text-[10px] font-mono text-[#CCCCD9]">ID: MIND-02</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">Mental Wellness</h3>
                    <ul className="space-y-3 text-sm text-[#CCCCD9]">
                       <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Exam anxiety grounding</li>
                       <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Coping with loneliness</li>
                       <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Body image affirmations</li>
                    </ul>
                 </SpotlightCard>
               </motion.div>

               {/* Card 3 */}
               <motion.div variants={fadeInUp} className="h-full">
                 <SpotlightCard className="p-8 h-full bg-[#1C1246] border-amber-500/20">
                    <div className="mb-6 flex items-center justify-between">
                       <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400">
                          <Sun className="h-6 w-6" />
                       </div>
                       <span className="text-[10px] font-mono text-[#CCCCD9]">ID: GLOW-03</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">Body & Skin</h3>
                    <ul className="space-y-3 text-sm text-[#CCCCD9]">
                       <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Acne care routines</li>
                       <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Puberty changes explained</li>
                       <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Hygiene best practices</li>
                    </ul>
                 </SpotlightCard>
               </motion.div>

               {/* Card 4 */}
               <motion.div variants={fadeInUp} className="h-full">
                 <SpotlightCard className="p-8 h-full bg-[#1C1246] border-blue-500/20">
                    <div className="mb-6 flex items-center justify-between">
                       <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                          <Smile className="h-6 w-6" />
                       </div>
                       <span className="text-[10px] font-mono text-[#CCCCD9]">ID: SOCIAL-04</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">Social & Friends</h3>
                    <ul className="space-y-3 text-sm text-[#CCCCD9]">
                       <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Handling peer pressure</li>
                       <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Bullying advice</li>
                       <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Setting boundaries</li>
                    </ul>
                 </SpotlightCard>
               </motion.div>

               {/* Card 5 */}
               <motion.div variants={fadeInUp} className="h-full">
                 <SpotlightCard className="p-8 h-full bg-[#1C1246] border-emerald-500/20">
                    <div className="mb-6 flex items-center justify-between">
                       <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
                          <BookOpen className="h-6 w-6" />
                       </div>
                       <span className="text-[10px] font-mono text-[#CCCCD9]">ID: SCHOOL-05</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">Academic Stress</h3>
                    <ul className="space-y-3 text-sm text-[#CCCCD9]">
                       <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Focus techniques (Pomodoro)</li>
                       <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Burnout prevention</li>
                       <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Sleep schedule tips</li>
                    </ul>
                 </SpotlightCard>
               </motion.div>

               {/* Card 6 */}
               <motion.div variants={fadeInUp} className="h-full">
                 <SpotlightCard className="p-8 h-full bg-[#1C1246] border-rose-500/20">
                    <div className="mb-6 flex items-center justify-between">
                       <div className="p-3 bg-rose-500/10 rounded-lg text-rose-400">
                          <Shield className="h-6 w-6" />
                       </div>
                       <span className="text-[10px] font-mono text-[#CCCCD9]">ID: SAFE-06</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">Personal Safety</h3>
                    <ul className="space-y-3 text-sm text-[#CCCCD9]">
                       <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Online privacy settings</li>
                       <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Recognizing harassment</li>
                       <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Travel safety tips</li>
                    </ul>
                 </SpotlightCard>
               </motion.div>

            </motion.div>
         </div>
      </section>

      {/* --- MYTH BUSTERS (New) --- */}
      <section className="py-24 bg-[#231854]/20 border-y border-white/5">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="text-center mb-16"
            >
               <h2 className="text-3xl font-bold text-white mb-4">Myth Busters</h2>
               <p className="text-[#CCCCD9]">Tap a card to reveal the truth.</p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
               <MythCard 
                  myth="Periods are dirty blood leaving the body." 
                  fact="Not true! Period blood is just the lining of your uterus shedding. It's a natural, healthy process." 
               />
               <MythCard 
                  myth="You can't get pregnant on your period." 
                  fact="While less likely, it IS possible. Sperm can survive in the body for up to 5 days." 
               />
               <MythCard 
                  myth="You should wash inside your vagina." 
                  fact="No! The vagina is self-cleaning. Only wash the outside (vulva) with warm water." 
               />
            </div>
         </div>
      </section>

      {/* --- WELLNESS TOOLKIT (New) --- */}
      <section className="py-24">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white mb-12 text-center">Your Wellness Toolkit</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               {[
                  { name: "Cycle Tracker", icon: Calendar, color: "text-[#DA8CA0]" },
                  { name: "Mood Journal", icon: Smile, color: "text-purple-400" },
                  { name: "Safety Plan", icon: Shield, color: "text-emerald-400" },
                  { name: "Breathing", icon: Zap, color: "text-blue-400" },
               ].map((tool, i) => (
                  <motion.div 
                     key={i}
                     whileHover={{ scale: 1.05, y: -5 }}
                     className="bg-[#231854] border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-[#1C1246] transition-colors"
                  >
                     <tool.icon className={`w-10 h-10 ${tool.color}`} />
                     <span className="text-white font-medium">{tool.name}</span>
                  </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* --- EXCLUSIONS (Red Zone) --- */}
      <section className="py-24 bg-rose-950/10 border-y border-rose-500/20">
         <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-3xl font-bold text-white">When to See a Doctor</h2>
               <div className="px-3 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono uppercase">
                  Escalate Immediately
               </div>
            </div>

            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative rounded-3xl border border-rose-500/20 bg-rose-950/5 overflow-hidden"
            >
               <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                  <AlertTriangle className="h-48 w-48 text-rose-500" />
               </div>
               
               <div className="p-8 relative z-10">
                  <p className="text-lg text-[#CCCCD9] mb-8 max-w-2xl">
                     Heal Her is a big sister, not a doctor. If you experience any of the following, please <span className="text-white font-bold">tell a parent, nurse, or doctor immediately</span>:
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-x-12 gap-y-4">
                     {[
                        "Pain so bad you can't walk or stand",
                        "Bleeding that soaks a pad in 1 hour",
                        "Thoughts of hurting yourself",
                        "Lumps in breast or body",
                        "Fever higher than 39°C (102°F)",
                        "Fainting or loss of consciousness",
                        "Physical abuse or assault",
                        "Sudden vision changes",
                        "Severe allergic reactions",
                        "Unexplained weight loss"
                     ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 py-2 border-b border-rose-500/10">
                           <XCircle className="h-5 w-5 text-rose-500 shrink-0" />
                           <span className="text-[#CCCCD9] text-sm">{item}</span>
                        </div>
                     ))}
                  </div>
               </div>
            </motion.div>
         </div>
      </section>

      {/* --- FAQ SECTION (New) --- */}
      <section className="py-24">
         <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white mb-12 text-center">Frequently Asked Questions</h2>
            <div className="space-y-2">
               <FaqItem 
                  question="Is this conversation really private?" 
                  answer="Yes. We do not ask for your real name, and we do not save chat logs linked to your identity. Your secrets stay between you and the AI." 
               />
               <FaqItem 
                  question="Does it cost money?" 
                  answer="No. Heal Her is free to use because we believe every girl deserves access to health information." 
               />
               <FaqItem 
                  question="Can I ask embarrassing questions?" 
                  answer="Absolutely! There is no such thing as a weird question here. We've heard it all and we are here to help, not judge." 
               />
               <FaqItem 
                  question="What if I'm in danger?" 
                  answer="If you are unsafe, please type 'Help'. We will provide you with emergency numbers and resources to get you to safety immediately." 
               />
            </div>
         </div>
      </section>

      {/* --- ESCALATION PROTOCOL --- */}
      <section className="py-20 border-t border-white/5 bg-[#231854]/30">
         <div className="mx-auto max-w-3xl px-4 text-center">
            <motion.div 
              variants={float}
              animate="animate"
              className="mb-6 inline-flex items-center justify-center h-16 w-16 rounded-full bg-[#1C1246] border border-white/10 shadow-xl"
            >
               <Stethoscope className="h-8 w-8 text-[#DA8CA0]" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-6">The "Red Flag" System</h2>
            <div className="text-left bg-[#1C1246] rounded-2xl p-8 border border-white/10 shadow-lg">
               <p className="text-[#CCCCD9] mb-6 font-medium">
                  Our AI is trained to recognize "Red Flags." If you mention these things, we stop the chat and give you emergency numbers:
               </p>
               <ul className="space-y-4">
                  {[
                     "Keywords related to self-harm or suicide.",
                     "Mentions of physical or sexual abuse.",
                     "Symptoms of severe infection (Sepsis).",
                     "Breathing difficulties.",
                     "Unsafe home environments."
                  ].map((item, i) => (
                     <li key={i} className="flex gap-4">
                        <div className="h-6 w-6 rounded-full bg-[#DA8CA0]/10 flex items-center justify-center text-[#DA8CA0] text-xs font-bold shrink-0">
                           {i + 1}
                        </div>
                        <span className="text-[#CCCCD9] text-sm">{item}</span>
                     </li>
                  ))}
               </ul>
               <div className="mt-8 pt-6 border-t border-white/10 text-center">
                  <p className="text-xs text-slate-500">
                     SYSTEM DIRECTIVE: When in doubt, we always choose SAFETY over advice.
                  </p>
               </div>
            </div>
         </div>
      </section>

      <Footer />
    </div>
  )
}