"use client"

import React, { useState, useEffect } from "react"
import { motion, useMotionTemplate, useMotionValue, Variants, AnimatePresence } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { cn } from "@/lib/utils"
import { 
  Heart, Globe, Users, TrendingUp, Target, Lightbulb, Activity, 
  HandHeart, Leaf, Network, Check, Server, Code2, 
  Copy, Building2, User, ShieldCheck, ChevronRight,
  Scale, BookOpen, Sparkles, Quote, Baby, GraduationCap,
  Zap, Share2
} from "lucide-react"
import { Button } from "@/components/ui/button"

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

const scaleIn: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.5, ease: "backOut" } }
}

const drawLine: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { 
    pathLength: 1, 
    opacity: 0.4, 
    transition: { duration: 1.5, ease: "easeInOut" } 
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

// --- NEW COMPONENT: THE LIVING CONNECTION VISUALIZATION ---
const RippleVisualization = () => {
  // Coordinates for the visualization
  const center = { x: 200, y: 200 }
  
  // Layer 1: Friends (5 nodes)
  const layer1 = [
    { x: 200, y: 120 }, { x: 276, y: 175 }, { x: 247, y: 265 }, { x: 153, y: 265 }, { x: 124, y: 175 }
  ]

  // Layer 2: Community (10 nodes) - Simplified positions
  const layer2 = [
    { x: 200, y: 50 }, { x: 320, y: 140 }, { x: 350, y: 250 }, { x: 250, y: 350 }, { x: 150, y: 350 },
    { x: 50, y: 250 }, { x: 80, y: 140 }, { x: 100, y: 60 }, { x: 300, y: 80 }, { x: 300, y: 320 }
  ]

  return (
    <div className="w-full h-full min-h-[400px] bg-[#1a1440] relative overflow-hidden rounded-3xl border border-[#DA8CA0]/20 shadow-2xl">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      {/* The Pulse Effect */}
      <div className="absolute inset-0 flex items-center justify-center">
         <motion.div 
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-96 h-96 bg-[#DA8CA0]/10 rounded-full blur-3xl"
         />
      </div>

      <svg viewBox="0 0 400 400" className="w-full h-full absolute inset-0">
        <motion.g initial="hidden" whileInView="visible" viewport={{ once: true }}>
          
          {/* CONNECTIONS: Center to Layer 1 */}
          {layer1.map((pos, i) => (
            <motion.line 
              key={`L1-${i}`}
              x1={center.x} y1={center.y} x2={pos.x} y2={pos.y}
              stroke="#DA8CA0" strokeWidth="2"
              variants={drawLine}
            />
          ))}

          {/* CONNECTIONS: Layer 1 to Layer 2 (Each L1 connects to 2 L2s) */}
          {layer2.map((pos, i) => {
            const parent = layer1[i % 5] // Reuse parents
            return (
              <motion.line 
                key={`L2-${i}`}
                x1={parent.x} y1={parent.y} x2={pos.x} y2={pos.y}
                stroke="#8b5cf6" strokeWidth="1"
                variants={drawLine}
                transition={{ delay: 1.5 }} // Delay for second ripple
              />
            )
          })}

          {/* NODES: Center Girl */}
          <motion.circle 
            cx={center.x} cy={center.y} r="12" fill="#DA8CA0"
            initial={{ scale: 0 }}
            animate={{ scale: 1, boxShadow: "0 0 20px #DA8CA0" }}
            transition={{ type: "spring", delay: 0.2 }}
          />
          <motion.circle 
            cx={center.x} cy={center.y} r="25" stroke="#DA8CA0" strokeWidth="1" fill="none"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* NODES: Layer 1 (Friends) */}
          {layer1.map((pos, i) => (
            <motion.circle 
              key={`N1-${i}`} cx={pos.x} cy={pos.y} r="6" fill="#c084fc"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ delay: 1 + (i * 0.1) }}
            />
          ))}

          {/* NODES: Layer 2 (Community) */}
          {layer2.map((pos, i) => (
            <motion.circle 
              key={`N2-${i}`} cx={pos.x} cy={pos.y} r="4" fill="#34d399"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ delay: 2.5 + (i * 0.1) }}
            />
          ))}

        </motion.g>
      </svg>

      {/* Overlay Text */}
      <div className="absolute bottom-6 left-6 right-6">
         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 3.5 }}
            className="bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-xl flex items-center gap-4"
         >
            <div className="bg-emerald-500/20 p-2 rounded-full">
               <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
               <p className="text-white text-sm font-bold">Network Effect Active</p>
               <p className="text-[#CCCCD9] text-xs">1 Girl Educated = 15+ Lives Impacted</p>
            </div>
         </motion.div>
      </div>
    </div>
  )
}

// --- ACCORDION COMPONENT ---
const TransparencyItem = ({ 
  icon: Icon, 
  title, 
  colorClass, 
  children 
}: { 
  icon: any, 
  title: string, 
  colorClass: string, 
  children: React.ReactNode 
}) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-[#DA8CA0]/20">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex w-full items-center justify-between py-4 text-left group"
      >
        <div className="flex items-center gap-3 text-[#CCCCD9] group-hover:text-white transition-colors">
           <Icon className={cn("h-4 w-4", colorClass)} />
           <span className="text-sm font-medium">{title}</span>
        </div>
        <ChevronRight className={cn("h-4 w-4 text-[#DA8CA0] transition-transform duration-200", isOpen && "rotate-90")} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: "auto", opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }} 
            className="overflow-hidden"
          >
            <div className="pb-4 pl-7 text-xs text-[#CCCCD9] leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// --- DIRECT BANK WIDGET ---
function BankTransferWidget() {
  const [copied, setCopied] = useState(false)

  const accountDetails = {
    bankName: "ALAT by Wema",
    accountName: "Nwaka Amos Chika",
    accountNumber: "0272309995" 
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(accountDetails.accountNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="relative h-full flex flex-col justify-center"
    >
      <div className="p-8 bg-[#231854] rounded-3xl border border-[#DA8CA0]/20 shadow-2xl relative overflow-hidden group">
        
        {/* Card Design Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#DA8CA0]/10 via-[#1C1246] to-purple-900/20 opacity-50" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#DA8CA0]/10 blur-3xl rounded-full" />
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-12">
            <div>
              <h3 className="text-white font-bold text-xl mb-1">Direct Funding</h3>
              <p className="text-[#CCCCD9] text-xs">Official Project Account</p>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
               <Building2 className="h-6 w-6 text-[#DA8CA0]" />
            </div>
          </div>

          {/* Account Number Display */}
          <div className="mb-10 text-center">
            <label className="text-[10px] uppercase tracking-widest text-[#DA8CA0] font-bold mb-3 block">Account Number</label>
            <div className="flex items-center justify-center gap-4">
              <span className="text-4xl sm:text-5xl font-mono font-bold text-white tracking-wider drop-shadow-lg">
                {accountDetails.accountNumber}
              </span>
            </div>
            <Button 
                onClick={handleCopy}
                variant="outline" 
                className="mt-6 h-10 border-[#DA8CA0]/30 bg-[#1C1246]/50 hover:bg-[#DA8CA0] hover:text-[#1C1246] transition-all text-xs gap-2"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {copied ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex items-center gap-2 font-bold"
                    >
                      <Check className="h-3 w-3" /> Copied Successfully
                    </motion.div>
                  ) : (
                    <motion.div
                      key="copy"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex items-center gap-2"
                    >
                      <Copy className="h-3 w-3" /> Copy Number
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
          </div>

          {/* Bank Details Grid */}
          <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-[#DA8CA0] font-bold mb-1 block">Bank Name</label>
              <div className="text-white font-medium flex items-center gap-2 text-sm">
                {accountDetails.bankName}
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-[#DA8CA0] font-bold mb-1 block">Account Name</label>
              <div className="text-white font-medium flex items-center gap-2 truncate text-sm">
                <User className="h-3 w-3 text-[#DA8CA0] shrink-0" /> {accountDetails.accountName}
              </div>
            </div>
          </div>

        </div>
      </div>
      
      <div className="mt-6 flex justify-center gap-6">
         <div className="flex items-center gap-2 text-[10px] text-[#CCCCD9]">
            <ShieldCheck className="h-3 w-3 text-emerald-500" /> Secure
         </div>
         <div className="flex items-center gap-2 text-[10px] text-[#CCCCD9]">
            <Activity className="h-3 w-3 text-blue-500" /> Direct Impact
         </div>
         <div className="flex items-center gap-2 text-[10px] text-[#CCCCD9]">
            <Heart className="h-3 w-3 text-[#DA8CA0]" /> No Fees
         </div>
      </div>
    </motion.div>
  )
}

// --- PAGE COMPONENT ---

export default function ImpactPage() {
  return (
    <div className="relative min-h-screen bg-[#1C1246] text-[#FAFAFA] selection:bg-[#DA8CA0]/30 selection:text-[#DA8CA0]">
      <GrainOverlay />
      <Navigation />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#DA8CA0]/20 via-[#1C1246] to-[#1C1246] -z-10" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
           <motion.div
             initial={{ scale: 0.9, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ duration: 0.8 }}
             className="mb-8 inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-[#231854] border border-[#DA8CA0]/20 shadow-2xl shadow-[#DA8CA0]/10"
           >
             <Heart className="h-8 w-8 text-[#DA8CA0]" />
           </motion.div>

           <TextReveal 
             text="Impact & Sisterhood." 
             className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6"
           />

           <p className="max-w-3xl mx-auto text-lg text-[#CCCCD9] leading-relaxed">
             Technology with purpose. How Heal Her is closing the gender health gap and empowering girls everywhere.
           </p>
        </div>
      </section>

      {/* --- MISSION STATEMENT --- */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        className="py-20 border-y border-white/5 bg-[#231854]/30"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold text-white mb-6">More Than an App: A Movement</h2>
            <p className="text-xl leading-relaxed text-[#CCCCD9]">
              Heal Her exists to address a fundamental inequality: <span className="text-white font-bold">access to shame-free health education.</span> Economic status should never determine whether a girl understands her own body. Every feature serves our commitment to confidence, dignity, and safety for all girls.
            </p>
          </div>
        </div>
      </motion.section>

      {/* --- MEASURING SUCCESS (Vital Signs Dashboard) --- */}
      <section className="py-24">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-3xl font-bold text-white">How We Measure Success</h2>
               <div className="flex items-center gap-2 text-xs text-[#DA8CA0] font-mono">
                  <div className="h-2 w-2 rounded-full bg-[#DA8CA0] animate-pulse" />
                  LIVE IMPACT
               </div>
            </div>

            <p className="text-[#CCCCD9] mb-12 max-w-2xl">
               Impact isn't just about downloads—it's about confidence gained and fears reduced. Here is our scorecard.
            </p>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5"
            >
               {[
                 { val: "24/7", label: "Availability", sub: "No appointment needed", color: "text-white" },
                 { val: "10+", label: "Languages", sub: "English, Pidgin, Local", color: "text-blue-400" },
                 { val: "100%", label: "Private", sub: "Zero Data Tracking", color: "text-emerald-400" },
                 { val: "∞", label: "Questions", sub: "Answered Safely", color: "text-rose-400" },
               ].map((stat, i) => (
                 <motion.div 
                   key={i} 
                   variants={fadeInUp}
                   className="bg-[#231854] p-8 flex flex-col items-center justify-center hover:bg-[#1C1246] transition-colors"
                 >
                    <div className={cn("text-4xl font-bold mb-2", stat.color)}>{stat.val}</div>
                    <div className="text-xs text-[#DA8CA0] uppercase tracking-widest font-mono text-center">{stat.label}<br/><span className="text-[#CCCCD9]/50 normal-case">{stat.sub}</span></div>
                 </motion.div>
               ))}
            </motion.div>
         </div>
      </section>

      {/* --- NEW SECTION 1: STORIES FROM THE SISTERHOOD --- */}
      <section className="py-24 bg-[#231854]/20 border-y border-white/5">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-white mb-16 text-center"
            >
              Stories from the Sisterhood
            </motion.h2>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-8"
            >
               {[
                 {
                   text: "I was too scared to ask my mom about my period pains. Heal Her explained everything without making me feel weird.",
                   age: "Student, 14",
                   loc: "Lagos"
                 },
                 {
                   text: "The mental health chat calmed me down during my exams. It felt like talking to a wise big sister who actually listens.",
                   age: "Student, 17",
                   loc: "Abuja"
                 },
                 {
                   text: "I live in a rural area where clinics are far. This app gave me the first aid steps I needed when my sister got hurt.",
                   age: "User, 19",
                   loc: "Jos"
                 }
               ].map((story, i) => (
                 <motion.div 
                   key={i} 
                   variants={fadeInUp}
                   whileHover={{ y: -5 }}
                   className="bg-[#1C1246] border border-[#DA8CA0]/10 p-8 rounded-2xl relative shadow-lg"
                 >
                    <Quote className="absolute top-6 left-6 h-8 w-8 text-[#DA8CA0]/20" />
                    <p className="text-[#CCCCD9] italic relative z-10 pt-6 mb-6 leading-relaxed">"{story.text}"</p>
                    <div className="flex items-center gap-3 border-t border-white/5 pt-4">
                       <div className="h-8 w-8 rounded-full bg-[#DA8CA0]/20 flex items-center justify-center text-[#DA8CA0] text-xs font-bold">
                          {story.age.charAt(0)}
                       </div>
                       <div>
                          <p className="text-white text-xs font-bold">{story.age}</p>
                          <p className="text-[#CCCCD9]/50 text-[10px] uppercase">{story.loc}</p>
                       </div>
                    </div>
                 </motion.div>
               ))}
            </motion.div>
         </div>
      </section>

      {/* --- NEW SECTION 2: THE RIPPLE EFFECT (Visualization) --- */}
      <section className="py-24">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
               <motion.div 
                 initial={{ opacity: 0, x: -30 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.8 }}
               >
                  <h2 className="text-3xl font-bold text-white mb-6">The Ripple Effect</h2>
                  <p className="text-lg text-[#CCCCD9] mb-8 leading-relaxed">
                     When you educate one girl, you don't just help her. You help her friends, her future family, and her community. Knowledge travels fast in sisterhoods.
                  </p>
                  
                  <div className="space-y-8 relative">
                     {/* Connecting Line */}
                     <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-[#DA8CA0]/20 -z-10" />

                     <div className="flex gap-6 items-start">
                        <div className="w-10 h-10 rounded-full bg-[#DA8CA0]/20 flex items-center justify-center border border-[#DA8CA0] shrink-0 z-10">
                           <User className="h-5 w-5 text-[#DA8CA0]" />
                        </div>
                        <div>
                           <h4 className="text-white font-bold text-lg">1 Girl Educated</h4>
                           <p className="text-[#CCCCD9] text-sm">She gains confidence and understanding of her body.</p>
                        </div>
                     </div>

                     <div className="flex gap-6 items-start">
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500 shrink-0 z-10">
                           <Users className="h-5 w-5 text-purple-500" />
                        </div>
                        <div>
                           <h4 className="text-white font-bold text-lg">5 Friends Informed</h4>
                           <p className="text-[#CCCCD9] text-sm">She shares safe advice with her circle, stopping myths from spreading.</p>
                        </div>
                     </div>

                     <div className="flex gap-6 items-start">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500 shrink-0 z-10">
                           <Baby className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div>
                           <h4 className="text-white font-bold text-lg">Future Generations Protected</h4>
                           <p className="text-[#CCCCD9] text-sm">An educated woman makes better health decisions for her future children.</p>
                        </div>
                     </div>
                  </div>
               </motion.div>

               <motion.div 
                 initial={{ opacity: 0, x: 30 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.8 }}
                 className="relative"
               >
                  {/* Option 1: Living Connection Component */}
                  <RippleVisualization />
               </motion.div>
            </div>
         </div>
      </section>

      {/* --- IMPACT AREAS (The 6 Cards) --- */}
      <section className="py-24 bg-[#231854]/20 border-y border-white/5">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-16 text-center text-3xl font-bold text-white">Where We're Making a Difference</h2>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
               
               <motion.div variants={fadeInUp} className="h-full">
                 <SpotlightCard className="p-8 h-full bg-[#1C1246] border-[#DA8CA0]/10">
                    <div className="mb-6 flex justify-between items-start">
                       <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                          <Globe className="h-6 w-6" />
                       </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">Health Equity</h3>
                    <p className="text-[#CCCCD9] text-sm leading-relaxed">
                       Bridging the knowledge gap for girls in underserved communities. Reliable health info should be a right, not a privilege.
                    </p>
                 </SpotlightCard>
               </motion.div>

               <motion.div variants={fadeInUp} className="h-full">
                 <SpotlightCard className="p-8 h-full bg-[#1C1246] border-[#DA8CA0]/10">
                    <div className="mb-6 flex justify-between items-start">
                       <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400">
                          <Sparkles className="h-6 w-6" />
                       </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">Destigmatizing Periods</h3>
                    <p className="text-[#CCCCD9] text-sm leading-relaxed">
                       Changing the narrative from shame to strength. We teach girls that menstruation is a superpower, not a secret to be hidden.
                    </p>
                 </SpotlightCard>
               </motion.div>

               <motion.div variants={fadeInUp} className="h-full">
                 <SpotlightCard className="p-8 h-full bg-[#1C1246] border-[#DA8CA0]/10">
                    <div className="mb-6 flex justify-between items-start">
                       <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
                          <Leaf className="h-6 w-6" />
                       </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">Rural Access</h3>
                    <p className="text-[#CCCCD9] text-sm leading-relaxed">
                       For girls in villages far from clinics, Heal Her acts as a first point of contact, answering questions that might otherwise go unasked.
                    </p>
                 </SpotlightCard>
               </motion.div>

               <motion.div variants={fadeInUp} className="h-full">
                 <SpotlightCard className="p-8 h-full bg-[#1C1246] border-[#DA8CA0]/10">
                    <div className="mb-6 flex justify-between items-start">
                       <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400">
                          <Lightbulb className="h-6 w-6" />
                       </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">Sex Education</h3>
                    <p className="text-[#CCCCD9] text-sm leading-relaxed">
                       Filling the gap where schools or families might fall short. We provide factual, non-judgmental information about reproduction.
                    </p>
                 </SpotlightCard>
               </motion.div>

               <motion.div variants={fadeInUp} className="h-full">
                 <SpotlightCard className="p-8 h-full bg-[#1C1246] border-[#DA8CA0]/10">
                    <div className="mb-6 flex justify-between items-start">
                       <div className="p-3 bg-rose-500/10 rounded-lg text-rose-400">
                          <Target className="h-6 w-6" />
                       </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">Prevention First</h3>
                    <p className="text-[#CCCCD9] text-sm leading-relaxed">
                       Early education prevents future issues. By teaching hygiene and body awareness now, we help girls avoid health complications later.
                    </p>
                 </SpotlightCard>
               </motion.div>

               <motion.div variants={fadeInUp} className="h-full">
                 <SpotlightCard className="p-8 h-full bg-[#1C1246] border-[#DA8CA0]/10">
                    <div className="mb-6 flex justify-between items-start">
                       <div className="p-3 bg-sky-500/10 rounded-lg text-sky-400">
                          <TrendingUp className="h-6 w-6" />
                       </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">Mental Resilience</h3>
                    <p className="text-[#CCCCD9] text-sm leading-relaxed">
                       Equipping girls with tools to handle anxiety, peer pressure, and body image issues helps build a generation of confident women.
                    </p>
                 </SpotlightCard>
               </motion.div>

            </motion.div>
         </div>
      </section>

      {/* --- HUMANITARIAN FOCUS & PARTNERSHIPS --- */}
      <section className="py-24">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
               <motion.div 
                 initial={{ opacity: 0, x: -30 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.8 }}
                 className="space-y-8"
               >
                  <h2 className="text-3xl font-bold text-white">We Cannot Do This Alone</h2>
                  <p className="text-lg text-[#CCCCD9]">
                     Heal Her is a community effort. We partner with organizations to reach the girls who need us most.
                  </p>
                  
                  <div className="space-y-6">
                     <div className="flex gap-4">
                        <div className="mt-1 h-2 w-2 rounded-full bg-rose-500 shrink-0" />
                        <div>
                           <h4 className="text-white font-bold">Schools & Educators</h4>
                           <p className="text-[#CCCCD9] text-sm">We provide digital resources to supplement health classes in secondary schools across Nigeria.</p>
                        </div>
                     </div>
                     <div className="flex gap-4">
                        <div className="mt-1 h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                        <div>
                           <h4 className="text-white font-bold">NGOs & Clinics</h4>
                           <p className="text-[#CCCCD9] text-sm">Partnering with rural clinics to offer Heal Her as a take-home resource for patients.</p>
                        </div>
                     </div>
                     <div className="flex gap-4">
                        <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                        <div>
                           <h4 className="text-white font-bold">Community Leaders</h4>
                           <p className="text-[#CCCCD9] text-sm">Working with local leaders to ensure our content is culturally respectful and widely accepted.</p>
                        </div>
                     </div>
                  </div>
               </motion.div>

               <motion.div 
                 initial={{ opacity: 0, x: 30 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.8 }}
               >
                 <SpotlightCard className="p-8 bg-[#1C1246] border-[#DA8CA0]/20">
                    <div className="flex items-center gap-3 mb-6">
                       <Network className="h-6 w-6 text-[#DA8CA0]" />
                       <h3 className="text-xl font-bold text-white">Partnership Opportunities</h3>
                    </div>
                    <p className="text-[#CCCCD9] text-sm mb-6">
                       We are actively seeking integration with organizations serving young women. If you represent:
                    </p>
                    <ul className="space-y-3 text-[#CCCCD9] text-sm">
                       <li className="flex items-center gap-2">• Secondary Schools & Universities</li>
                       <li className="flex items-center gap-2">• Women's Health NGOs</li>
                       <li className="flex items-center gap-2">• Youth Ministries</li>
                       <li className="flex items-center gap-2">• Educational Tech Initiatives</li>
                    </ul>
                    <div className="mt-8 pt-6 border-t border-white/10">
                       <p className="text-xs text-[#CCCCD9] font-mono">
                          Collaborate with us: <span className="text-[#DA8CA0]">partners@healher.ai</span>
                       </p>
                    </div>
                 </SpotlightCard>
               </motion.div>
            </div>
         </div>
      </section>

      {/* --- SDG ALIGNMENT --- */}
      <section className="py-20 border-y border-white/5 bg-[#231854]/30">
         <div className="mx-auto max-w-5xl px-4 flex flex-col md:flex-row items-center gap-12">
            <div className="w-32 h-32 md:w-48 md:h-48 bg-emerald-600 rounded-xl flex flex-col items-center justify-center text-white shrink-0 shadow-2xl shadow-emerald-900/20">
               <div className="text-5xl md:text-7xl font-bold">5</div>
               <div className="text-[10px] md:text-xs font-bold text-center mt-2 px-2 uppercase">Gender<br/>Equality</div>
            </div>
            <div>
               <h2 className="text-2xl font-bold text-white mb-4">Aligned with UN Sustainable Development Goals</h2>
               <p className="text-[#CCCCD9] text-lg leading-relaxed">
                  Heal Her is committed to <strong>SDG Goal 5</strong>: Achieve gender equality and empower all women and girls. By providing access to sexual and reproductive health information, we are giving girls autonomy over their futures.
               </p>
            </div>
         </div>
      </section>

      {/* --- SUPPORT & DONATIONS (DETAILED) --- */}
      <section className="py-24 relative" id="donate">
         <div className="absolute inset-0 bg-[#1C1246]" />
         <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#DA8CA0]/50 to-transparent" />
         
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-12 gap-16 items-center">
               
               {/* Left: The "Investor Pitch" */}
               <motion.div 
                 initial={{ opacity: 0, x: -30 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.8 }}
                 className="lg:col-span-7 space-y-10"
               >
                  <div>
                     <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DA8CA0]/10 border border-[#DA8CA0]/20 text-[#DA8CA0] text-xs font-bold uppercase mb-4">
                        <HandHeart className="h-3 w-3" /> Support the Mission
                     </div>
                     <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                        Help us keep Heal Her <br/> <span className="text-[#DA8CA0]">Free for Every Girl.</span>
                     </h2>
                     <p className="text-lg text-[#CCCCD9] leading-relaxed">
                        Artificial Intelligence is expensive, but health education should be free. Your generosity ensures that no girl is ever locked out of the advice she needs because she can't afford a subscription.
                     </p>
                  </div>
                  
                  {/* Detailed Breakdown (Custom Accordion) */}
                  <div className="border-t border-[#DA8CA0]/20 pt-6">
                     <h4 className="text-white font-bold text-sm uppercase tracking-wide opacity-80 mb-4">Transparency: Where Your Money Goes</h4>
                     
                     <div className="w-full space-y-2">
                        <TransparencyItem 
                           icon={Server} 
                           title="65% - AI & Server Costs" 
                           colorClass="text-blue-500"
                        >
                           Running a smart AI requires powerful servers. Your donation pays for the computing power that allows Heal Her to answer questions instantly, 24/7.
                        </TransparencyItem>

                        <TransparencyItem 
                           icon={Code2} 
                           title="25% - Developing New Features" 
                           colorClass="text-purple-500"
                        >
                           We are building voice chat for girls who can't type well, and expanding our language support to include more local dialects.
                        </TransparencyItem>

                        <TransparencyItem 
                           icon={Users} 
                           title="10% - School Outreach" 
                           colorClass="text-emerald-500"
                        >
                           We print physical guides and stickers for schools in rural areas where internet access is limited, ensuring no girl is left behind.
                        </TransparencyItem>
                     </div>
                  </div>

                  {/* The Emotional "Why" */}
                  <div className="bg-[#231854] border border-[#DA8CA0]/20 p-6 rounded-xl relative">
                     <div className="absolute -left-1 top-6 h-12 w-1 bg-[#DA8CA0] rounded-r-full" />
                     <p className="text-[#CCCCD9] italic text-sm leading-relaxed">
                        "Every donation is a message to a girl somewhere that she matters. That her health matters. That her questions deserve answers. You aren't just funding an app; you are funding confidence."
                     </p>
                     
                     <div className="mt-4 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[#1C1246] flex items-center justify-center border border-[#DA8CA0]/20">
                           <User className="h-4 w-4 text-[#DA8CA0]" />
                        </div>
                        <div>
                           <p className="text-white text-xs font-bold">Nwaka Amos Chika</p>
                           <p className="text-[#CCCCD9] text-[10px] uppercase tracking-wider">Founder, Heal Her</p>
                        </div>
                     </div>
                  </div>
               </motion.div>

               {/* Right: The Bank Widget */}
               <motion.div 
                 initial={{ opacity: 0, x: 30 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.8 }}
                 className="lg:col-span-5 h-full"
               >
                  <BankTransferWidget />
               </motion.div>

            </div>
         </div>
      </section>

      {/* --- LONG TERM VISION --- */}
      <section className="py-24 border-t border-white/5 bg-[#231854]/20">
         <div className="mx-auto max-w-3xl px-4 text-center">
            <motion.div 
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="mb-6 inline-flex items-center justify-center h-12 w-12 rounded-full bg-[#1C1246] border border-[#DA8CA0]/20"
            >
               <HandHeart className="h-5 w-5 text-[#DA8CA0]" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-6">The Future We Are Building</h2>
            <div className="space-y-4 text-lg leading-relaxed text-[#CCCCD9]">
               <p>
                  We envision a world where every girl, regardless of where she lives, grows up understanding and loving her body. A world where shame is replaced by knowledge, and fear is replaced by support.
               </p>
               <p>
                  Heal Her is just the beginning. Through continuous innovation and community partnerships, we are building a digital sisterhood that spans the globe.
               </p>
               <p className="font-medium text-[#DA8CA0] pt-4">
                  Every girl empowered. Every question answered. That is our promise.
               </p>
            </div>
         </div>
      </section>

      <Footer />
    </div>
  )
}