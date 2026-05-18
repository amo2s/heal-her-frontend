"use client"

import React from "react"
import Link from "next/link"
import { motion, useMotionTemplate, useMotionValue, Variants } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { cn } from "@/lib/utils"
import { 
  Heart, 
  Sparkles, 
  Shield, 
  Globe, 
  Lock, 
  Activity,
  CheckCircle2,
  ArrowRight,
  Target
} from "lucide-react"

// --- ULTRA-SMOOTH SPRING ANIMATIONS ---

const premiumSpring: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 80, damping: 20, mass: 1 } 
  }
}

const slideInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { type: "spring", stiffness: 70, damping: 20 } 
  }
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1
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
        "group relative border border-white/10 bg-[#231854]/50 overflow-hidden rounded-3xl transition-all duration-700 hover:border-[#DA8CA0]/40 hover:shadow-[0_0_40px_rgba(218,140,160,0.1)]",
        className
      )}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-700 group-hover:opacity-100"
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

// Apple-Style Glossy Pink Button
const GlossyPinkButton = ({ children, href, className = "" }: { children: React.ReactNode, href: string, className?: string }) => (
  <Link href={href} className="w-full sm:w-auto">
    <div className={cn(
      "group relative flex items-center justify-center gap-2 overflow-hidden rounded-full bg-[#DA8CA0] px-8 py-4 text-[#1C1246] font-bold shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),_0_8px_20px_rgba(218,140,160,0.4)] transition-all duration-500 hover:bg-[#E8B4C1] hover:scale-[1.02] hover:shadow-[inset_0_2px_6px_rgba(255,255,255,0.9),_0_12px_30px_rgba(218,140,160,0.6)] active:scale-95 border border-white/20",
      className
    )}>
      <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/40 to-transparent pointer-events-none opacity-50" />
      <span className="relative z-10 flex items-center gap-2 drop-shadow-sm">{children}</span>
    </div>
  </Link>
)

// Apple-Style Transparent Glass Button
const TransparentGlassButton = ({ children, href, className = "" }: { children: React.ReactNode, href: string, className?: string }) => (
  <Link href={href} className="w-full sm:w-auto">
    <div className={cn(
      "group relative flex items-center justify-center gap-2 overflow-hidden rounded-full bg-white/5 border border-[#DA8CA0]/40 px-8 py-4 text-white font-bold backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),_0_8px_20px_rgba(0,0,0,0.2)] transition-all duration-500 hover:bg-white/10 hover:border-[#DA8CA0]/60 hover:scale-[1.02] active:scale-95",
      className
    )}>
      <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
      <span className="relative z-10 flex items-center gap-2 drop-shadow-md">{children}</span>
    </div>
  </Link>
)

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-[#1C1246] text-[#FAFAFA] selection:bg-[#DA8CA0]/30 selection:text-[#DA8CA0] overflow-hidden">
      <Navigation />
      
      {/* --- HERO SECTION (Background Image + Centered Text) --- */}
      <section className="relative min-h-[95vh] flex items-center justify-center pt-24 pb-20 overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/thirteen-hero.png" 
            alt="Heal Her Platform" 
            className="w-full h-full object-cover object-center scale-105 animate-pulse-slow" 
          />
          {/* Deep gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#1C1246]/95 via-[#1C1246]/80 to-[#1C1246]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light" />
        </div>

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10 text-center flex flex-col items-center mt-12 lg:mt-0">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex flex-col items-center"
          >
            <motion.div variants={premiumSpring}>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#DA8CA0]/40 bg-[#DA8CA0]/10 px-5 py-2 text-sm font-semibold text-[#DA8CA0] mb-8 backdrop-blur-md shadow-lg shadow-[#DA8CA0]/5">
                <Sparkles className="h-4 w-4" />
                <span>The Future of Women's Health Education</span>
              </div>
            </motion.div>
            
            <motion.h1 variants={premiumSpring} className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white mb-6 leading-[1.1] drop-shadow-2xl">
              Empowering the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DA8CA0] to-[#E8B4C1]">
                Next Generation.
              </span>
            </motion.h1>
            
            <motion.p variants={premiumSpring} className="max-w-2xl text-lg md:text-xl text-[#CCCCD9] leading-relaxed mb-10 drop-shadow-lg font-medium">
              We are building a scalable, deeply empathetic digital sanctuary. Heal Her merges cutting-edge technology with medically backed guidance to eradicate health illiteracy.
            </motion.p>

            <motion.div variants={premiumSpring} className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto">
              <GlossyPinkButton href="/contact">
                Partner With Us
              </GlossyPinkButton>
              
              <TransparentGlassButton href="/login">
                Explore Our Solution
              </TransparentGlassButton>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- MISSION & VISION --- */}
      <section className="py-24 bg-[#1C1246] border-t border-white/5 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid gap-8 lg:grid-cols-2"
          >
            <motion.div variants={premiumSpring}>
              <SpotlightCard className="p-10 md:p-12 h-full bg-[#231854]/80 border-[#DA8CA0]/20">
                <div className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#DA8CA0]/10 border border-[#DA8CA0]/20 text-[#DA8CA0]">
                  <Target className="h-8 w-8" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Our Mission</h2>
                <p className="text-[#CCCCD9] leading-relaxed text-lg mb-8">
                  To democratize access to vital health education, dismantling systemic stigmas. We provide institutions and individuals with a secure, judgment-free platform where every young woman can understand her body with absolute medical clarity.
                </p>
                <div className="mt-auto pt-8 border-t border-white/10 flex items-center gap-4">
                   <div className="h-1 flex-1 bg-[#1C1246] rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-[#DA8CA0]" />
                   </div>
                   <span className="text-xs font-mono text-[#DA8CA0] uppercase tracking-wider">Education_First</span>
                </div>
              </SpotlightCard>
            </motion.div>

            <motion.div variants={premiumSpring}>
              <SpotlightCard className="p-10 md:p-12 h-full bg-gradient-to-br from-[#231854] to-[#1C1246]">
                <div className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <Globe className="h-8 w-8" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Our Vision</h2>
                <p className="text-[#CCCCD9] leading-relaxed text-lg mb-8">
                  A future where women's health is universally recognized as a foundation of societal well-being. We envision a world where scalable technology ensures no girl is left vulnerable to misinformation or fear.
                </p>
                <div className="mt-auto pt-8 border-t border-white/10 flex items-center gap-4">
                   <div className="h-1 flex-1 bg-[#1C1246] rounded-full overflow-hidden">
                      <div className="h-full w-1/2 bg-purple-500" />
                   </div>
                   <span className="text-xs font-mono text-purple-400 uppercase tracking-wider">Global_Confidence</span>
                </div>
              </SpotlightCard>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- THE IMPACT HORIZON --- */}
      <section className="py-24 relative bg-[#231854]/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl font-bold text-white mb-6"
            >
              The Impact Horizon
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-[#CCCCD9]"
            >
              We are not just building an app; we are solving a systemic crisis in women's health education. Here is why institutions are partnering with us.
            </motion.p>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid md:grid-cols-3 gap-6"
          >
             {[
               { icon: Activity, title: "The Misinformation Crisis", desc: "Over 70% of young women rely on unverified online forums for health queries. We replace noise with medically backed facts." },
               { icon: Lock, title: "The Privacy Deficit", desc: "Heal Her provides a zero-tracking, localized AI environment where anonymity is mathematically guaranteed for every user." },
               { icon: Heart, title: "The Empathy Gap", desc: "Clinical resources are often cold. Our conversational engine is designed to respond with the warmth of an older sister." }
             ].map((item, i) => (
                <motion.div key={i} variants={premiumSpring}>
                  <SpotlightCard className="p-8 h-full bg-[#1C1246]">
                    <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#DA8CA0]/10 text-[#DA8CA0]">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                    <p className="text-[#CCCCD9] leading-relaxed">{item.desc}</p>
                  </SpotlightCard>
                </motion.div>
             ))}
          </motion.div>
        </div>
      </section>

      {/* --- LEADERSHIP (Founders) --- */}
      <section className="py-24 bg-[#231854]/30 border-y border-[#DA8CA0]/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 px-4">
            <h2 className="text-4xl font-bold text-white mb-4">The Minds Behind the Mission</h2>
            <p className="text-lg text-[#CCCCD9]">A dedicated team combining deep technological expertise with a relentless passion for social impact.</p>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto"
          >
            {/* Nwaka Amos Chika - Founder (Moved to First) */}
            <motion.div variants={premiumSpring} className="group relative rounded-[2rem] overflow-hidden bg-[#1C1246] border border-white/10 p-4 transition-all duration-500 hover:border-purple-500/50 hover:shadow-2xl">
              <div className="aspect-[4/5] sm:aspect-square rounded-[1.5rem] overflow-hidden mb-6 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-[#1C1246] via-[#1C1246]/30 to-transparent z-10 opacity-90" />
                <img 
                  src="/sliver.png" 
                  alt="Nwaka Amos Chika - Founder" 
                  className="object-cover object-top w-full h-full transform transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute bottom-6 left-6 z-20">
                  <h3 className="text-3xl font-bold text-white mb-1">Nwaka Amos Chika <span className="text-xl font-normal text-white/70">(Sliver)</span></h3>
                  <p className="text-purple-400 font-medium flex items-center gap-2 text-lg">
                    Founder & Technical Lead
                  </p>
                </div>
              </div>
              <div className="px-4 pb-6">
                <p className="text-[#CCCCD9] leading-relaxed text-base">
                  Architecting the secure, AI-driven engine powering Heal Her. As Founder and Technical Lead, Sliver leverages his deep backend expertise in Go and modern front-end frameworks to build a highly scalable, robust infrastructure. His rigorous architectural decisions ensure the platform maintains uncompromising standards for user privacy and data security, allowing the technology to grow seamlessly alongside our global mission.
                </p>
              </div>
            </motion.div>

            {/* Khadija Musa - Co-Founder */}
            <motion.div variants={slideInRight} className="group relative rounded-[2rem] overflow-hidden bg-[#1C1246] border border-white/10 p-4 transition-all duration-500 hover:border-[#DA8CA0]/50 hover:shadow-2xl">
              <div className="aspect-[4/5] sm:aspect-square rounded-[1.5rem] overflow-hidden mb-6 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-[#1C1246] via-[#1C1246]/30 to-transparent z-10 opacity-90" />
                <img 
                  src="/khadija.jpg" 
                  alt="Khadija Musa - Co-Founder" 
                  className="object-cover object-top w-full h-full transform transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute bottom-6 left-6 z-20">
                  <h3 className="text-3xl font-bold text-white mb-1">Khadija Musa</h3>
                  <p className="text-[#DA8CA0] font-medium flex items-center gap-2 text-lg">
                    Co-Founder
                  </p>
                </div>
              </div>
              <div className="px-4 pb-6">
                <p className="text-[#CCCCD9] leading-relaxed text-base">
                  Driving the strategic vision and emotional core of Heal Her. As Co-Founder, Khadija provides critical operational oversight and meticulously curates our empathetic, medically accurate health content. She is a dedicated community leader, actively managing and nurturing our thriving Girls Lounge—a safe space supporting over 200 young women, ensuring every user feels heard, protected, and empowered.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- THE STORY SO FAR --- */}
      <section className="py-24">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20 px-4">
               <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Our Growth Trajectory</h2>
               <p className="text-[#CCCCD9] max-w-2xl mx-auto">From an identified necessity to a scalable, transformative digital health solution.</p>
            </div>

            <div className="relative border-l-2 border-[#DA8CA0]/20 ml-4 md:ml-1/2 space-y-16 max-w-5xl mx-auto">
               {[
                  { year: "2024", title: "Identifying the Gap", desc: "We identified systemic health misinformation among students, forming the blueprint for a tech-driven, empathetic solution." },
                  { year: "Early 2025", title: "Architecting the Core", desc: "Development commenced on a proprietary engine designed strictly around localized privacy protocols." },
                  { year: "Late 2025", title: "Successful Beta Deployment", desc: "Heal Her launched to a pilot group, yielding overwhelming user retention and community growth in the Girls Lounge." },
                  { year: "The Horizon", title: "National Institutional Rollout", desc: "We are currently scaling infrastructure to deploy Heal Her across educational institutions nationwide." }
               ].map((item, i) => (
                  <motion.div 
                     key={i}
                     initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                     whileInView={{ opacity: 1, x: 0 }}
                     transition={{ type: "spring", stiffness: 70, damping: 20 }}
                     viewport={{ once: true, margin: "-50px" }}
                     className="relative pl-8 md:pl-0"
                  >
                     <div className="absolute left-[-9px] md:left-[calc(50%-9px)] top-2 h-4 w-4 rounded-full bg-[#DA8CA0] border-4 border-[#1C1246] shadow-[0_0_15px_rgba(218,140,160,0.6)] z-10" />
                     
                     <div className="md:grid md:grid-cols-2 md:gap-16 items-start">
                        <div className={`md:text-right pt-1 ${i % 2 === 0 ? 'md:order-1' : 'md:order-2 md:text-left'}`}>
                           <span className="inline-block text-sm font-bold px-4 py-1.5 rounded-full border bg-[#DA8CA0]/10 text-[#DA8CA0] border-[#DA8CA0]/30 backdrop-blur-sm">
                              {item.year}
                           </span>
                        </div>
                        <div className={`${i % 2 === 0 ? 'md:order-2' : 'md:order-1 md:text-right'} mt-4 md:mt-0 bg-[#231854]/40 hover:bg-[#231854]/60 transition-colors p-8 rounded-3xl border border-white/5`}>
                           <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                           <p className="text-base text-[#CCCCD9] leading-relaxed">{item.desc}</p>
                        </div>
                     </div>
                  </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* --- CTA SECTION (Single Liquid Glass Button) --- */}
      <section className="py-32 relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-b from-[#1C1246] via-[#231854]/40 to-[#1C1246] -z-10" />
         
         <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10">
           <motion.div 
             initial={{ opacity: 0, y: 40, scale: 0.95 }}
             whileInView={{ opacity: 1, y: 0, scale: 1 }}
             transition={{ type: "spring", stiffness: 70, damping: 20 }}
             viewport={{ once: true }}
             className="relative rounded-[3rem] overflow-hidden p-1 px-4 sm:px-0"
           >
             <div className="absolute inset-0 bg-gradient-to-r from-[#DA8CA0] via-purple-500 to-[#DA8CA0] opacity-20 animate-spin-slow rounded-[3rem]" style={{ animationDuration: '10s' }} />
             
             <div className="relative bg-[#1C1246]/80 backdrop-blur-2xl rounded-[2.9rem] p-10 md:p-20 text-center border border-white/10 shadow-2xl flex flex-col items-center">
               <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">Partner in Our Mission</h2>
               <p className="text-lg md:text-xl text-[#CCCCD9] max-w-2xl mx-auto mb-12 leading-relaxed">
                 Whether you are an educational institution looking to integrate safe health tech, or an investor scaling impact—your partnership can help us protect and educate millions of girls.
               </p>
               
               <GlossyPinkButton href="/contact" className="px-12 py-5 text-lg">
                 Contact Us <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
               </GlossyPinkButton>

               <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-[#CCCCD9]/70 font-medium">
                 <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-[#DA8CA0]" /> B2B Integration Ready</span>
                 <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-[#DA8CA0]" /> Scalable Infrastructure</span>
               </div>
             </div>
           </motion.div>
         </div>
      </section>

      <Footer />
    </div>
  )
}