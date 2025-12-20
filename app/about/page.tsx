"use client"

import React from "react"
import { motion, useMotionTemplate, useMotionValue } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { cn } from "@/lib/utils"
import { 
  Heart, 
  Target, 
  Eye, 
  Shield, 
  Users, 
  Globe, 
  Sparkles, 
  Fingerprint, 
  Scale, 
  Lightbulb
} from "lucide-react"

// --- REUSED COMPONENTS (For consistency) ---

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

const AuroraBackground = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden bg-slate-950">
    <div className="absolute top-[-50%] left-[-50%] h-[200%] w-[200%] animate-spin-slow rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,#1e293b_120deg,transparent_180deg)] opacity-30 blur-3xl" />
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light" />
  </div>
)

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30 selection:text-blue-200">
      <Navigation />
      
      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <AuroraBackground />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-400 mb-8 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Our DNA</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
              Our code is Digital. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                Our heart is Human.
              </span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-lg text-slate-400 leading-relaxed">
              We are building the future of accessible, responsible emergency medical assistance through ethical AI innovation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- MISSION & VISION (Split Cards) --- */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            
            {/* Mission */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true }}
            >
              <SpotlightCard className="p-10 h-full bg-slate-900/80">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <Target className="h-7 w-7" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">The Mission</h2>
                <p className="text-slate-400 leading-relaxed text-lg">
                  To democratize access to life-saving emergency guidance. We ensure that everyone, regardless of location or language, has immediate access to critical first aid information when they need it most.
                </p>
                <div className="mt-8 pt-8 border-t border-white/5 flex items-center gap-4">
                   <div className="h-1 flex-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-blue-500" />
                   </div>
                   <span className="text-xs font-mono text-blue-400">EXECUTION_MODE</span>
                </div>
              </SpotlightCard>
            </motion.div>

            {/* Vision */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true }}
            >
              <SpotlightCard className="p-10 h-full bg-gradient-to-br from-indigo-900/20 to-slate-900/80">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <Eye className="h-7 w-7" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">The Vision</h2>
                <p className="text-slate-400 leading-relaxed text-lg">
                  A world where no one faces a medical emergency alone. Where technology serves humanity with compassion, bridging the gap between panic and professional care with unwavering calm.
                </p>
                <div className="mt-8 pt-8 border-t border-white/5 flex items-center gap-4">
                   <div className="h-1 flex-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full w-1/2 bg-purple-500" />
                   </div>
                   <span className="text-xs font-mono text-purple-400">TARGET_FUTURE</span>
                </div>
              </SpotlightCard>
            </motion.div>

          </div>
        </div>
      </section>

      {/* --- WHY WE EXIST (The "Stats" Section) --- */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-blue-900/5 -skew-y-3 z-0 transform origin-top-left" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white mb-6">Why MedGuard Exists</h2>
            <p className="text-lg text-slate-400">
              Medical emergencies don't wait for expertise. We bridge the critical gap between an event and the arrival of professional help.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
             {[
               { 
                 icon: Globe, 
                 color: "text-emerald-400", 
                 bg: "bg-emerald-500/10",
                 title: "Universal Access", 
                 desc: "Millions lack immediate medical access. We turn every smartphone into a life-saving tool." 
               },
               { 
                 icon: Users, 
                 color: "text-amber-400", 
                 bg: "bg-amber-500/10",
                 title: "Human Centered", 
                 desc: "Designed for real humans in panic, not for textbooks. Empathy is our primary algorithm." 
               },
               { 
                 icon: Shield, 
                 color: "text-rose-400", 
                 bg: "bg-rose-500/10",
                 title: "Ethical Foundation", 
                 desc: "Safety is our north star. Every response is verified, responsible, and privacy-first." 
               },
             ].map((item, i) => (
                <SpotlightCard key={i} className="p-8">
                   <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${item.bg} ${item.color}`}>
                      <item.icon className="h-6 w-6" />
                   </div>
                   <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                   <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </SpotlightCard>
             ))}
          </div>
        </div>
      </section>

      {/* --- PHILOSOPHY (The Directive Grid) --- */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
           <div className="grid lg:grid-cols-12 gap-12 items-start">
              
              {/* Left Title Area */}
              <div className="lg:col-span-4 sticky top-24">
                 <h2 className="text-4xl font-bold text-white mb-6">Operating<br/>Philosophy</h2>
                 <p className="text-slate-400 mb-8">
                    We don't just build features. We adhere to a strict code of conduct that prioritizes human life above innovation.
                 </p>
                 <div className="h-1 w-20 bg-blue-600 rounded-full" />
              </div>

              {/* Right List Area */}
              <div className="lg:col-span-8 space-y-6">
                 {[
                    {
                       title: "AI as a Bridge, Not a Replacement",
                       desc: "MedGuard is designed to connect people in crisis with guidance until professionals arrive. We are the bridge, not the destination.",
                       icon: Fingerprint
                    },
                    {
                       title: "Responsibility Over Features",
                       desc: "We resist the urge to 'ship fast'. If a feature creates risk, it does not launch. Safety is the only metric that matters.",
                       icon: Scale
                    },
                    {
                       title: "Transparency Builds Trust",
                       desc: "We clearly state what our AI can and cannot do. We never make false promises about medical outcomes.",
                       icon: Lightbulb
                    },
                    {
                       title: "Accessibility is a Right",
                       desc: "Emergency guidance shouldn't be a privilege. We are committed to free access for families, regardless of economic status.",
                       icon: Globe
                    },
                 ].map((item, i) => (
                    <motion.div 
                       key={i}
                       initial={{ opacity: 0, y: 20 }}
                       whileInView={{ opacity: 1, y: 0 }}
                       viewport={{ once: true }}
                       transition={{ delay: i * 0.1 }}
                    >
                       <SpotlightCard className="p-8 flex gap-6 items-start">
                          <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-400 font-mono text-sm">
                             0{i + 1}
                          </div>
                          <div>
                             <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
                                {item.title}
                             </h3>
                             <p className="text-slate-400 leading-relaxed">
                                {item.desc}
                             </p>
                          </div>
                       </SpotlightCard>
                    </motion.div>
                 ))}
              </div>

           </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}