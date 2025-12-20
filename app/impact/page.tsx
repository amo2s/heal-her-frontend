"use client"

import React, { useState } from "react"
import { motion, useMotionTemplate, useMotionValue, Variants, AnimatePresence } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { cn } from "@/lib/utils"
import { 
  Heart, Globe, Users, TrendingUp, Target, Lightbulb, Activity, 
  HandHeart, Leaf, Network, Check, Server, Code2, 
  Copy, Building2, User, ShieldCheck, ChevronRight,
  BarChart3, Scale
} from "lucide-react"
import { Button } from "@/components/ui/button"

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
        "group relative border border-white/10 bg-slate-900/50 overflow-hidden rounded-3xl",
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
              rgba(59, 130, 246, 0.15),
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
    <div className="border-b border-slate-800">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex w-full items-center justify-between py-4 text-left group"
      >
        <div className="flex items-center gap-3 text-slate-300 group-hover:text-white transition-colors">
           <Icon className={cn("h-4 w-4", colorClass)} />
           <span className="text-sm font-medium">{title}</span>
        </div>
        <ChevronRight className={cn("h-4 w-4 text-slate-500 transition-transform duration-200", isOpen && "rotate-90")} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: "auto", opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }} 
            className="overflow-hidden"
          >
            <div className="pb-4 pl-7 text-xs text-slate-400 leading-relaxed">
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
    <div className="relative h-full flex flex-col justify-center">
      <div className="p-8 bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden group">
        
        {/* Card Design Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-slate-950 to-purple-900/20 opacity-50" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full" />
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-12">
            <div>
              <h3 className="text-white font-bold text-xl mb-1">Direct Funding</h3>
              <p className="text-slate-400 text-xs">Official Project Account</p>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
               <Building2 className="h-6 w-6 text-emerald-400" />
            </div>
          </div>

          {/* Account Number Display */}
          <div className="mb-10 text-center">
            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3 block">Account Number</label>
            <div className="flex items-center justify-center gap-4">
              <span className="text-4xl sm:text-5xl font-mono font-bold text-white tracking-wider drop-shadow-lg">
                {accountDetails.accountNumber}
              </span>
            </div>
            <Button 
                onClick={handleCopy}
                variant="outline" 
                className="mt-6 h-10 border-slate-700 bg-slate-900/50 hover:bg-slate-800 hover:text-white transition-all text-xs gap-2"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {copied ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex items-center gap-2 text-emerald-500 font-bold"
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
              <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1 block">Bank Name</label>
              <div className="text-white font-medium flex items-center gap-2 text-sm">
                {accountDetails.bankName}
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1 block">Account Name</label>
              <div className="text-white font-medium flex items-center gap-2 truncate text-sm">
                <User className="h-3 w-3 text-blue-400 shrink-0" /> {accountDetails.accountName}
              </div>
            </div>
          </div>

        </div>
      </div>
      
      <div className="mt-6 flex justify-center gap-6">
         <div className="flex items-center gap-2 text-[10px] text-slate-500">
            <ShieldCheck className="h-3 w-3 text-emerald-500" /> Secure
         </div>
         <div className="flex items-center gap-2 text-[10px] text-slate-500">
            <Activity className="h-3 w-3 text-blue-500" /> Direct Impact
         </div>
         <div className="flex items-center gap-2 text-[10px] text-slate-500">
            <Heart className="h-3 w-3 text-rose-500" /> No Fees
         </div>
      </div>
    </div>
  )
}

// --- PAGE COMPONENT ---

export default function ImpactPage() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30 selection:text-blue-200">
      <GrainOverlay />
      <Navigation />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950 -z-10" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
           <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="mb-8 inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-blue-500/10"
           >
              <Heart className="h-8 w-8 text-rose-500" />
           </motion.div>

           <TextReveal 
             text="Impact & Social Good." 
             className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6"
           />

           <p className="max-w-3xl mx-auto text-lg text-slate-400 leading-relaxed">
             Technology with purpose. How MedGuard AI is working to improve public health outcomes and save lives globally.
           </p>
        </div>
      </section>

      {/* --- MISSION STATEMENT (Restored & Enhanced) --- */}
      <section className="py-20 border-y border-white/5 bg-slate-900/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mx-auto max-w-4xl text-center"
          >
            <h2 className="text-3xl font-bold text-white mb-6">Beyond Technology: A Public Health Mission</h2>
            <p className="text-xl leading-relaxed text-slate-300">
              MedGuard AI exists to address a fundamental inequality: <span className="text-white font-bold">access to life-saving emergency guidance.</span> Geography and economic status should never determine survival outcomes. Every feature, every line of code, every design decision serves our commitment to improving global health outcomes.
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- MEASURING SUCCESS (Vital Signs Dashboard) --- */}
      <section className="py-24">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-3xl font-bold text-white">How We Measure Success</h2>
               <div className="flex items-center gap-2 text-xs text-emerald-500 font-mono">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE METRICS
               </div>
            </div>

            <p className="text-slate-400 mb-12 max-w-2xl">
               Impact isn't just about technology metrics—it's about lives improved and emergencies handled effectively. Here is our scorecard.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5">
               <div className="bg-slate-950/80 p-8 flex flex-col items-center justify-center hover:bg-slate-900/80 transition-colors">
                  <div className="text-4xl font-bold text-white mb-2">24/7</div>
                  <div className="text-xs text-slate-500 uppercase tracking-widest font-mono text-center">Availability<br/>When emergencies happen</div>
               </div>
               <div className="bg-slate-950/80 p-8 flex flex-col items-center justify-center hover:bg-slate-900/80 transition-colors">
                  <div className="text-4xl font-bold text-blue-400 mb-2">12+</div>
                  <div className="text-xs text-slate-500 uppercase tracking-widest font-mono text-center">Languages<br/>For Global Access</div>
               </div>
               <div className="bg-slate-950/80 p-8 flex flex-col items-center justify-center hover:bg-slate-900/80 transition-colors">
                  <div className="text-4xl font-bold text-emerald-400 mb-2">100%</div>
                  <div className="text-xs text-slate-500 uppercase tracking-widest font-mono text-center">Evidence Based<br/>Medical Protocols</div>
               </div>
               <div className="bg-slate-950/80 p-8 flex flex-col items-center justify-center hover:bg-slate-900/80 transition-colors">
                  <div className="text-4xl font-bold text-rose-400 mb-2">∞</div>
                  <div className="text-xs text-slate-500 uppercase tracking-widest font-mono text-center">Lives Valued<br/>Continuous Improvement</div>
               </div>
            </div>
         </div>
      </section>

      {/* --- IMPACT AREAS (The 6 Cards - Restored & Detailed) --- */}
      <section className="py-24 bg-slate-900/20 border-y border-white/5">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-16 text-center text-3xl font-bold text-white">Where We're Making a Difference</h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
               
               <SpotlightCard className="p-8 h-full bg-slate-950 border-slate-800">
                  <div className="mb-6 flex justify-between items-start">
                     <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                        <Globe className="h-6 w-6" />
                     </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Global Health Equity</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                     Bridging the gap between underserved communities and emergency medical knowledge. Geography and economic status should never determine survival outcomes. We bring world-class guidance to the most remote locations.
                  </p>
               </SpotlightCard>

               <SpotlightCard className="p-8 h-full bg-slate-950 border-slate-800">
                  <div className="mb-6 flex justify-between items-start">
                     <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400">
                        <Users className="h-6 w-6" />
                     </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Caregiver Empowerment</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                     Supporting parents, teachers, childcare providers, and family caregivers with the confidence and knowledge to respond effectively in emergencies. We turn panic into action.
                  </p>
               </SpotlightCard>

               <SpotlightCard className="p-8 h-full bg-slate-950 border-slate-800">
                  <div className="mb-6 flex justify-between items-start">
                     <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
                        <Leaf className="h-6 w-6" />
                     </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Rural Healthcare Support</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                     Addressing the critical challenge of extended emergency response times in rural and remote areas. When the ambulance is hours away, MedGuard AI provides the bridge that keeps patients stable.
                  </p>
               </SpotlightCard>

               <SpotlightCard className="p-8 h-full bg-slate-950 border-slate-800">
                  <div className="mb-6 flex justify-between items-start">
                     <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400">
                        <Lightbulb className="h-6 w-6" />
                     </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Public Health Education</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                     Beyond emergencies, helping people understand health concepts, recognize warning signs (like stroke or sepsis early), and make informed decisions about when to seek care.
                  </p>
               </SpotlightCard>

               <SpotlightCard className="p-8 h-full bg-slate-950 border-slate-800">
                  <div className="mb-6 flex justify-between items-start">
                     <div className="p-3 bg-rose-500/10 rounded-lg text-rose-400">
                        <Target className="h-6 w-6" />
                     </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Healthcare Cost Reduction</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                     Helping people determine appropriate level of care can reduce unnecessary ER visits for minor issues while ensuring serious conditions get immediate attention, optimizing healthcare system resources.
                  </p>
               </SpotlightCard>

               <SpotlightCard className="p-8 h-full bg-slate-950 border-slate-800">
                  <div className="mb-6 flex justify-between items-start">
                     <div className="p-3 bg-sky-500/10 rounded-lg text-sky-400">
                        <TrendingUp className="h-6 w-6" />
                     </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Emergency Response Optimization</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                     Improving bystander response quality before EMS arrival. Correct early intervention (like proper CPR or bleeding control) significantly improves survival rates for trauma and cardiac events.
                  </p>
               </SpotlightCard>

            </div>
         </div>
      </section>

      {/* --- HUMANITARIAN FOCUS & PARTNERSHIPS --- */}
      <section className="py-24">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
               <div className="space-y-8">
                  <h2 className="text-3xl font-bold text-white">Humanitarian & Crisis Response</h2>
                  <p className="text-lg text-slate-400">
                     Our infrastructure is designed to function when traditional systems fail, serving the most vulnerable populations.
                  </p>
                  
                  <div className="space-y-6">
                     <div className="flex gap-4">
                        <div className="mt-1 h-2 w-2 rounded-full bg-rose-500 shrink-0" />
                        <div>
                           <h4 className="text-white font-bold">Disaster Zones</h4>
                           <p className="text-slate-400 text-sm">When natural disasters compromise healthcare infrastructure, MedGuard AI provides critical guidance during delays in professional care.</p>
                        </div>
                     </div>
                     <div className="flex gap-4">
                        <div className="mt-1 h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                        <div>
                           <h4 className="text-white font-bold">Refugee Communities</h4>
                           <p className="text-slate-400 text-sm">Multilingual support and offline capabilities make MedGuard AI valuable in refugee camps where access to doctors is limited.</p>
                        </div>
                     </div>
                     <div className="flex gap-4">
                        <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                        <div>
                           <h4 className="text-white font-bold">Developing Regions</h4>
                           <p className="text-slate-400 text-sm">Lightweight algorithmic payloads ensure functionality on basic smartphones with minimal connectivity in developing nations.</p>
                        </div>
                     </div>
                  </div>
               </div>

               <SpotlightCard className="p-8 bg-slate-950 border-slate-800">
                  <div className="flex items-center gap-3 mb-6">
                     <Network className="h-6 w-6 text-blue-500" />
                     <h3 className="text-xl font-bold text-white">Partnership Opportunities</h3>
                  </div>
                  <p className="text-slate-400 text-sm mb-6">
                     We are actively seeking integration with organizations serving vulnerable populations. If you represent:
                  </p>
                  <ul className="space-y-3 text-slate-300 text-sm">
                     <li className="flex items-center gap-2">• International Humanitarian NGOs</li>
                     <li className="flex items-center gap-2">• Public Health Ministries</li>
                     <li className="flex items-center gap-2">• Rural Tele-health Networks</li>
                     <li className="flex items-center gap-2">• Educational Institutions</li>
                  </ul>
                  <div className="mt-8 pt-6 border-t border-slate-800">
                     <p className="text-xs text-slate-500 font-mono">
                        Collaborate with us: <span className="text-blue-400">partners@medguard.ai</span>
                     </p>
                  </div>
               </SpotlightCard>
            </div>
         </div>
      </section>

      {/* --- SDG ALIGNMENT --- */}
      <section className="py-20 border-y border-white/5 bg-slate-900/30">
         <div className="mx-auto max-w-5xl px-4 flex flex-col md:flex-row items-center gap-12">
            <div className="w-32 h-32 md:w-48 md:h-48 bg-emerald-600 rounded-xl flex flex-col items-center justify-center text-white shrink-0 shadow-2xl shadow-emerald-900/20">
               <div className="text-5xl md:text-7xl font-bold">3</div>
               <div className="text-[10px] md:text-xs font-bold text-center mt-2 px-2 uppercase">Good Health &<br/>Well-Being</div>
            </div>
            <div>
               <h2 className="text-2xl font-bold text-white mb-4">Aligned with UN Sustainable Development Goals</h2>
               <p className="text-slate-400 text-lg leading-relaxed">
                  MedGuard AI is committed to <strong>SDG Target 3.8</strong>: Achieving universal health coverage, including access to essential health-care services. By providing free, accessible triage guidance, we are democratizing the entry point to the healthcare system.
               </p>
            </div>
         </div>
      </section>

      {/* --- SUPPORT & DONATIONS (DETAILED) --- */}
      <section className="py-24 relative" id="donate">
         {/* Decorative Background */}
         <div className="absolute inset-0 bg-slate-950" />
         <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-900/50 to-transparent" />
         
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-12 gap-16 items-center">
               
               {/* Left: The "Investor Pitch" */}
               <div className="lg:col-span-7 space-y-10">
                  <div>
                     <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase mb-4">
                        <HandHeart className="h-3 w-3" /> Support the Mission
                     </div>
                     <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                        Help us keep MedGuard <br/> <span className="text-blue-500">Free for Everyone.</span>
                     </h2>
                     <p className="text-lg text-slate-400 leading-relaxed">
                        Artificial Intelligence is expensive, but saving a life should be free. MedGuard AI operates on a <strong>"Robin Hood" model</strong>: the generosity of those who <em>can</em> give ensures that critical medical guidance remains accessible to those who <em>cannot</em>.
                     </p>
                  </div>
                  
                  {/* Detailed Breakdown (Custom Accordion) */}
                  <div className="border-t border-slate-800 pt-6">
                     <h4 className="text-white font-bold text-sm uppercase tracking-wide opacity-80 mb-4">Transparency: Where Your Money Goes</h4>
                     
                     <div className="w-full space-y-2">
                        <TransparencyItem 
                           icon={Server} 
                           title="65% - Infrastructure & AI Compute" 
                           colorClass="text-blue-500"
                        >
                           High-quality AI requires massive computing power. Your donation pays for real-time GPU inference costs (running the AI brain), secure database hosting, and high-speed CDNs to ensure the app loads fast in rural Nigeria (2G/3G networks).
                        </TransparencyItem>

                        <TransparencyItem 
                           icon={Code2} 
                           title="25% - Research & Development (R&D)" 
                           colorClass="text-purple-500"
                        >
                           We are building the future of emergency tech. Funding supports training specialized models on local Nigerian languages (Hausa, Igbo, Yorùbá, Pidgin), developing Computer Vision features for wounds, and integrating voice commands.
                        </TransparencyItem>

                        <TransparencyItem 
                           icon={Users} 
                           title="10% - Community Outreach" 
                           colorClass="text-emerald-500"
                        >
                           Technology is useless if people don't know it exists. Funds help us print educational guides for rural health centers, organize first-aid workshops in schools, and subsidize data costs for users in extreme poverty zones.
                        </TransparencyItem>
                     </div>
                  </div>

                  {/* The Emotional "Why" */}
                  <div className="bg-blue-900/10 border border-blue-500/20 p-6 rounded-xl relative">
                     <div className="absolute -left-1 top-6 h-12 w-1 bg-blue-500 rounded-r-full" />
                     <p className="text-slate-300 italic text-sm leading-relaxed">
                        "Every donation—whether ₦500 or ₦500,000—is a signal. It tells our team that you believe in a future where technology serves humanity. It fuels our late-night coding sessions and validates our mission to save lives. You aren't just donating; you are building this with us."
                     </p>
                     <div className="mt-4 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                           <User className="h-4 w-4 text-slate-400" />
                        </div>
                        <div>
                           <p className="text-white text-xs font-bold">Nwaka Amos Chika</p>
                           <p className="text-slate-500 text-[10px] uppercase tracking-wider">Founder, MedGuard AI</p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Right: The Bank Widget */}
               <div className="lg:col-span-5 h-full">
                  <BankTransferWidget />
               </div>

            </div>
         </div>
      </section>

      {/* --- LONG TERM VISION --- */}
      <section className="py-24 border-t border-white/5 bg-slate-900/20">
         <div className="mx-auto max-w-3xl px-4 text-center">
            <div className="mb-6 inline-flex items-center justify-center h-12 w-12 rounded-full bg-slate-800 border border-slate-700">
               <HandHeart className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-6">The Future We Are Building</h2>
            <div className="space-y-4 text-lg leading-relaxed text-slate-400">
               <p>
                  We envision a world where no one faces a medical emergency feeling helpless or alone. Where the gap between crisis and care is bridged by responsible, accessible technology. Where emergency medical guidance is a basic right, not a privilege.
               </p>
               <p>
                  MedGuard AI is just the beginning. Through continuous innovation, partnerships with healthcare organizations, and unwavering commitment to ethical AI, we're building a future where technology saves lives and serves humanity with compassion and responsibility.
               </p>
               <p className="font-medium text-emerald-400 pt-4">
                  Every emergency handled better. Every life given a better chance. That's the impact we're working toward every day.
               </p>
            </div>
         </div>
      </section>

      <Footer />
    </div>
  )
}