"use client"

import React from "react"
import { motion, useMotionTemplate, useMotionValue, Variants } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { cn } from "@/lib/utils"
import { 
  Heart, 
  Sparkles, 
  Shield, 
  Users, 
  Globe, 
  Lock, 
  BookOpen, 
  Smile, 
  MessageCircle,
  Flower2,
  Lightbulb,
  Milestone
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

const AuroraBackground = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden bg-[#1C1246]">
    <div className="absolute top-[-50%] left-[-50%] h-[200%] w-[200%] animate-spin-slow rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,#231854_120deg,transparent_180deg)] opacity-30 blur-3xl" />
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light" />
  </div>
)

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-[#1C1246] text-[#FAFAFA] selection:bg-[#DA8CA0]/30 selection:text-[#DA8CA0]">
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
            <div className="inline-flex items-center gap-2 rounded-full border border-[#DA8CA0]/30 bg-[#DA8CA0]/10 px-4 py-1.5 text-sm font-medium text-[#DA8CA0] mb-8 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Our DNA</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
              More than Code. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DA8CA0] to-[#E8B4C1]">
                We are a Sisterhood.
              </span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-lg text-[#CCCCD9] leading-relaxed">
              We are building the future of girls' health education. A private, judgment-free space where technology meets empathy to help you grow with confidence.
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- MISSION & VISION (Split Cards) --- */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-8 lg:grid-cols-2"
          >
            
            {/* Mission */}
            <motion.div variants={fadeInUp}>
              <SpotlightCard className="p-10 h-full bg-[#231854]/80 border-[#DA8CA0]/20">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#DA8CA0]/10 border border-[#DA8CA0]/20 text-[#DA8CA0]">
                  <BookOpen className="h-7 w-7" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">The Mission</h2>
                <p className="text-[#CCCCD9] leading-relaxed text-lg">
                  To democratize health education for girls everywhere. We believe every girl deserves to understand her body without shame, fear, or confusion.
                </p>
                <div className="mt-8 pt-8 border-t border-white/5 flex items-center gap-4">
                   <div className="h-1 flex-1 bg-[#1C1246] rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-[#DA8CA0]" />
                   </div>
                   <span className="text-xs font-mono text-[#DA8CA0]">EDUCATION_FIRST</span>
                </div>
              </SpotlightCard>
            </motion.div>

            {/* Vision */}
            <motion.div variants={fadeInUp}>
              <SpotlightCard className="p-10 h-full bg-gradient-to-br from-[#231854] to-[#1C1246]">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <Heart className="h-7 w-7" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">The Vision</h2>
                <p className="text-[#CCCCD9] leading-relaxed text-lg">
                  A world where no girl has to turn to strangers or misinformation for answers. A future where confidence is built on accurate, accessible knowledge.
                </p>
                <div className="mt-8 pt-8 border-t border-white/5 flex items-center gap-4">
                   <div className="h-1 flex-1 bg-[#1C1246] rounded-full overflow-hidden">
                      <div className="h-full w-1/2 bg-purple-500" />
                   </div>
                   <span className="text-xs font-mono text-purple-400">CONFIDENCE_GOAL</span>
                </div>
              </SpotlightCard>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* --- NEW SECTION 1: THE STORY SO FAR (Timeline) --- */}
      <section className="py-24 bg-[#231854]/20 border-y border-[#DA8CA0]/10">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
               <h2 className="text-3xl font-bold text-white mb-4">The Story So Far</h2>
               <p className="text-[#CCCCD9]">From a campus idea to a digital lifeline.</p>
            </div>

            <div className="relative border-l border-[#DA8CA0]/20 ml-4 md:ml-1/2 space-y-12">
               {[
                  { year: "2024", title: "The Idea", desc: "Sliverboy and Khadija notice a gap in health education on campus. Myths about periods were rampant." },
                  { year: "Early 2025", title: "Building the Core", desc: "The team starts coding the AI engine, focusing on privacy and empathy first." },
                  { year: "Late 2025", title: "Heal Her Launch", desc: "We release the beta version to 2,000 students at Uni Jos. The feedback is overwhelming." },
                  { year: "Future", title: "Going National", desc: "Our goal is to reach every secondary school and university in Nigeria." }
               ].map((item, i) => (
                  <motion.div 
                     key={i}
                     initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                     whileInView={{ opacity: 1, x: 0 }}
                     viewport={{ once: true }}
                     className="relative pl-8 md:pl-0"
                  >
                     <div className="absolute left-[-5px] top-1 h-3 w-3 rounded-full bg-[#DA8CA0] border border-[#DA8CA0] shadow-[0_0_10px_rgba(218,140,160,0.5)] z-10" />
                     
                     <div className="md:grid md:grid-cols-2 md:gap-16 items-center">
                        <div className={`md:text-right ${i % 2 === 0 ? 'md:order-1' : 'md:order-2'}`}>
                           <span className="text-xs font-bold px-2 py-1 rounded border bg-[#DA8CA0]/10 text-[#DA8CA0] border-[#DA8CA0]/30">
                              {item.year}
                           </span>
                        </div>
                        <div className={`${i % 2 === 0 ? 'md:order-2' : 'md:order-1'} mt-2 md:mt-0 bg-[#1C1246] p-6 rounded-xl border border-white/5`}>
                           <h3 className="text-lg font-bold text-white">{item.title}</h3>
                           <p className="text-sm text-[#CCCCD9] mt-1">{item.desc}</p>
                        </div>
                     </div>
                  </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* --- NEW SECTION 2: OUR VALUES IN ACTION --- */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
           <div className="grid lg:grid-cols-12 gap-12 items-start">
             
             {/* Left Title Area */}
             <div className="lg:col-span-4 sticky top-24">
                 <h2 className="text-4xl font-bold text-white mb-6">Our Values<br/>In Action</h2>
                 <p className="text-[#CCCCD9] mb-8">
                    We don't just build features. We adhere to a strict code of conduct that prioritizes your safety and mental well-being.
                 </p>
                 <div className="h-1 w-20 bg-[#DA8CA0] rounded-full" />
             </div>

             {/* Right List Area */}
             <div className="lg:col-span-8 space-y-6">
                 {[
                    {
                       title: "Privacy is Sacred",
                       desc: "Your questions are yours alone. We do not sell data, and we do not track your personal identity.",
                       icon: Lock
                    },
                    {
                       title: "Kindness is our Code",
                       desc: "Tone matters. We resist the urge to sound robotic. If it doesn't sound supportive, it doesn't go in the AI.",
                       icon: Heart
                    },
                    {
                       title: "Facts over Fear",
                       desc: "The internet is full of scary misinformation. We provide verified, medically accurate guidance to reduce anxiety, not create it.",
                       icon: BookOpen
                    },
                    {
                       title: "For Every Girl",
                       desc: "We are committed to inclusivity. No matter your background or location, Heal Her is for you.",
                       icon: Flower2
                    },
                 ].map((item, i) => (
                    <motion.div 
                       key={i}
                       initial={{ opacity: 0, y: 20 }}
                       whileInView={{ opacity: 1, y: 0 }}
                       viewport={{ once: true }}
                       transition={{ delay: i * 0.1 }}
                    >
                       <SpotlightCard className="p-8 flex gap-6 items-start bg-[#231854]">
                          <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#DA8CA0]/20 bg-[#DA8CA0]/10 text-[#DA8CA0] font-mono text-sm">
                             0{i + 1}
                          </div>
                          <div>
                             <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
                                <item.icon className="h-5 w-5 text-[#DA8CA0] sm:hidden" />
                                {item.title}
                             </h3>
                             <p className="text-[#CCCCD9] leading-relaxed">
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

      {/* --- WHY WE EXIST (The "Stats" Section) --- */}
      <section className="py-24 relative border-t border-[#DA8CA0]/10 bg-[#231854]/10">
        <div className="absolute inset-0 bg-[#DA8CA0]/5 -skew-y-3 z-0 transform origin-top-left" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white mb-6">Why Heal Her Exists</h2>
            <p className="text-lg text-[#CCCCD9]">
              Growing up is confusing. We bridge the gap between "awkward questions" and "safe answers."
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
             {[
               { 
                 icon: Globe, 
                 color: "text-emerald-400", 
                 bg: "bg-emerald-500/10",
                 title: "Universal Access", 
                 desc: "Millions of girls lack access to sex ed. We put a personal health tutor in every pocket." 
               },
               { 
                 icon: Smile, 
                 color: "text-[#DA8CA0]", 
                 bg: "bg-[#DA8CA0]/10",
                 title: "Kindness First", 
                 desc: "Medical sites are cold. We are warm. We speak like a big sister, not a textbook." 
               },
               { 
                 icon: Shield, 
                 color: "text-purple-400", 
                 bg: "bg-purple-500/10",
                 title: "Safe Space", 
                 desc: "No judgment. No tracking. A safe environment to ask the questions you're too shy to say out loud." 
               },
             ].map((item, i) => (
                <SpotlightCard key={i} className="p-8 bg-[#231854]">
                   <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${item.bg} ${item.color}`}>
                      <item.icon className="h-6 w-6" />
                   </div>
                   <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                   <p className="text-[#CCCCD9] text-sm leading-relaxed">{item.desc}</p>
                </SpotlightCard>
             ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}