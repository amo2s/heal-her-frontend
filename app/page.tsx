"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useMotionTemplate, useMotionValue } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import Testimonial from "@/components/modals/testimonial"
import HeroCard from "@/components/hero-card"
import { cn } from "@/lib/utils"
import {
  Shield,
  Heart,
  ArrowRight,
  Lock,
  Sparkles,
  BookOpen,
  Baby,
  GraduationCap,
  CheckCircle,
  Stethoscope,
  Smile,
} from "lucide-react"

// ============================================================================
// UI COMPONENTS
// ============================================================================

const GlowingBadge = ({ children, icon: Icon }: { children: React.ReactNode; icon?: any }) => (
  <div className="inline-flex items-center gap-2 rounded-full border border-white/20 border-t-[#DA8CA0]/60 bg-gradient-to-r from-[#DA8CA0]/10 to-transparent px-4 py-1.5 text-sm font-medium text-[#DA8CA0] backdrop-blur-md transition-all hover:bg-[#DA8CA0]/20 hover:shadow-[0_0_20px_rgba(218,140,160,0.3)] shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)]">
    {Icon && <Icon className="h-3.5 w-3.5 animate-pulse" />}
    {children}
  </div>
)

// Premium Liquid Card Component for the Ecosystem Section
function PremiumEcosystemCard({
  icon: Icon,
  title,
  age,
  description,
  features,
  delay = 0
}: {
  icon: any
  title: string
  age: string
  description: string
  features: string[]
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className="group relative h-full flex flex-col"
    >
      {/* Outer Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#DA8CA0]/15 to-transparent rounded-[2rem] opacity-0 group-hover:opacity-100 blur-xl transition-all duration-700" />
      
      {/* Liquid Glass Card Body */}
      <div className="relative h-full p-8 md:p-10 border border-white/10 border-t-white/20 rounded-[2rem] bg-gradient-to-b from-[#231854]/70 to-[#1C1246]/90 backdrop-blur-2xl transition-all duration-500 flex flex-col z-10 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_15px_30px_-10px_rgba(28,18,70,0.8)] group-hover:border-[#DA8CA0]/40 group-hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.2),0_20px_40px_-10px_rgba(218,140,160,0.2)]">
        
        {/* Top Edge Highlight */}
        <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-[#DA8CA0]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        <div className="flex justify-between items-start mb-8">
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#DA8CA0]/20 to-transparent border border-white/20 border-t-white/40 flex items-center justify-center group-hover:scale-110 group-hover:shadow-[inset_0_1px_4px_rgba(255,255,255,0.4),0_0_30px_rgba(218,140,160,0.4)] transition-all duration-500 overflow-hidden">
             {/* Icon Liquid Sweep */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
            <Icon className="w-8 h-8 text-[#DA8CA0] relative z-10 drop-shadow-md" />
          </div>
          <span className="px-3 py-1 bg-black/20 border border-white/10 border-t-white/20 rounded-full text-xs font-bold tracking-widest text-[#DA8CA0] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] uppercase">
            {age}
          </span>
        </div>

        <h3 className="text-2xl font-bold text-white mb-4 drop-shadow-md">{title}</h3>
        <p className="text-[#CCCCD9] text-base leading-relaxed mb-8 flex-grow">
          {description}
        </p>

        <div className="space-y-4 mb-8">
          {features.map((feature, i) => (
            <div key={i} className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-[#DA8CA0] flex-shrink-0 drop-shadow-sm" />
              <span className="text-sm font-medium text-[#CCCCD9]">{feature}</span>
            </div>
          ))}
        </div>

        <div className="mt-auto pt-6 border-t border-white/5">
          {/* Transparent Liquid Button -> Glossy Pink on Hover */}
          <Button asChild className="group/btn relative overflow-hidden w-full bg-white/5 backdrop-blur-xl text-white border border-white/20 border-t-white/40 shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)] hover:bg-gradient-to-b hover:from-[#f3cbd4] hover:to-[#DA8CA0] hover:text-[#1C1246] hover:border-[#DA8CA0] hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_10px_20px_-5px_rgba(218,140,160,0.5)] rounded-xl h-14 transition-all duration-500"><Link href="/login" className="relative z-10 flex items-center justify-center gap-2 w-full h-full font-bold">
               {/* Light Sweep Animation */}
              <div className="absolute top-0 left-[-100%] w-[150%] h-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover/btn:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
              Explore Path <ArrowRight className="w-5 h-5 relative z-10" />
            </Link></Button>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function HomePage() {
  // Enhanced, ultra-smooth cubic-bezier easing for premium transitions
  const smoothEase: [number, number, number, number] = [0.22, 1, 0.36, 1]

  return (
    <div className="relative min-h-screen bg-[#1C1246] text-[#FAFAFA] selection:bg-[#DA8CA0]/30 selection:text-[#DA8CA0]">
      <Navigation />
      
      {/* ========== HERO SECTION (2-COLUMN GRID) ========== */}
      <section className="relative pt-32 pb-24 overflow-hidden min-h-screen flex items-center">
        
        {/* LIQUID BACKGROUND LAYER */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/hero.png"
            alt="Premium Liquid Background"
            fill
            className="object-cover opacity-30 blur-[8px] scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1C1246]/80 via-[#1C1246]/50 to-[#1C1246]" />
        </div>
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Text Content */}
            <motion.div 
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2, ease: smoothEase }}
              className="text-left"
            >
              <GlowingBadge icon={Sparkles}>Your Private Health Companion</GlowingBadge>
              
              <h1 className="mt-8 text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-[#FAFAFA] via-[#FAFAFA] to-[#CCCCD9] leading-[1.1]">
                Grow With Confidence <br />
                <span className="bg-gradient-to-r from-[#DA8CA0] to-[#E8B4C1] bg-clip-text text-transparent drop-shadow-lg">At Every Stage</span>
              </h1>
              
              <p className="mt-6 text-lg sm:text-xl text-[#CCCCD9] leading-relaxed max-w-lg font-light">
                A safe place to learn about your body, ask questions, and grow with confidence. Built for girls of all ages.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                
                {/* Glossy Shiny Primary Button */}
                <Button asChild size="lg" className="group relative overflow-hidden h-16 rounded-full bg-gradient-to-b from-[#f3cbd4] to-[#DA8CA0] px-10 text-lg font-bold text-[#1C1246] border border-[#DA8CA0]/50 border-t-white/80 shadow-[inset_0_2px_5px_rgba(255,255,255,0.9),0_10px_30px_-10px_rgba(218,140,160,0.6)] hover:from-[#fae0e6] hover:to-[#e19eb0] hover:scale-105 hover:shadow-[inset_0_2px_5px_rgba(255,255,255,1),0_15px_40px_-10px_rgba(218,140,160,0.8)] transition-all duration-500"><Link href="/login" className="flex items-center gap-3">
                    {/* Glossy Light Sweep */}
                    <div className="absolute top-0 left-[-100%] w-[150%] h-full bg-gradient-to-r from-transparent via-white/50 to-transparent group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
                    <span className="relative z-10">Start Your Journey</span> 
                    <ArrowRight className="h-5 w-5 relative z-10" />
                  </Link></Button>
                
                <div className="flex items-center gap-3 text-sm font-medium text-[#CCCCD9]">
                  <Shield className="w-5 h-5 text-[#DA8CA0]" />
                  <span>100% Private & Secure</span>
                </div>
              </div>

              {/* Trust Stats */}
              <div className="mt-16 pt-8 border-t border-white/10 flex items-center gap-12">
                <div>
                  <div className="text-3xl font-black text-white drop-shadow-md">24/7</div>
                  <div className="text-xs text-[#DA8CA0] font-bold tracking-widest uppercase mt-1">Guidance</div>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div>
                  <div className="text-3xl font-black text-white drop-shadow-md">100%</div>
                  <div className="text-xs text-[#DA8CA0] font-bold tracking-widest uppercase mt-1">Judgment Free</div>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Hero Card Image */}
            <div className="w-full flex justify-center lg:justify-end">
              <HeroCard />
            </div>
          </div>
        </div>
      </section>

      {/* ========== ECOSYSTEM SECTION (PREMIUM HORIZONTAL GRID) ========== */}
      <section className="relative py-32 bg-[#1C1246] border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: smoothEase }}
            className="text-center mb-20"
          >
            <h2 className="text-sm font-bold tracking-widest text-[#DA8CA0] uppercase mb-4">The Ecosystem</h2>
            <h3 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Built For Every Chapter</h3>
            <p className="text-xl text-[#CCCCD9] max-w-2xl mx-auto font-light">
              Because a 10-year-old needs different advice than an 18-year-old. Heal Her adapts to give exactly the right support at exactly the right time.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            <PremiumEcosystemCard
              icon={Baby}
              title="Heal Her: Kids"
              age="Ages 0 - 11"
              description="We teach girls about hygiene, body changes, and how to stay safe around strangers using gentle videos and simple words."
              features={[
                "Child-safe AI Big Sister",
                "Stranger safety lessons",
                "Hygiene & body basics videos"
              ]}
              delay={0.1}
            />

            <PremiumEcosystemCard
              icon={GraduationCap}
              title="Heal Her: Teens"
              age="Ages 12 - 17"
              description="Real answers for real life. Get advice on dating, periods, and growing up from an AI that understands your vibe."
              features={[
                "Teen-vibe AI chat support",
                "Interactive dating & life scenarios",
                "Advanced body & health videos"
              ]}
              delay={0.3}
            />

            <PremiumEcosystemCard
              icon={Heart}
              title="Heal Her: Adults"
              age="Ages 18+"
              description="Take full control of your life. Master your personal boundaries, understand your legal rights, and track your health privately."
              features={[
                "Advanced period & symptom tracking",
                "Boundaries & legal rights guide",
                "Private medical health vault"
              ]}
              delay={0.5}
            />
          </div>
        </div>
      </section>

      {/* ========== OUR MISSION SECTION ========== */}
      <section className="relative py-32 bg-[#1C1246] overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Side: The Story */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: smoothEase }}
            >
              <h2 className="text-sm font-bold tracking-widest text-[#DA8CA0] uppercase mb-4">Our Mission</h2>
              <h3 className="text-4xl md:text-5xl font-extrabold text-white mb-8 leading-tight">
                Growing up shouldn't be confusing.
              </h3>
              
              <div className="space-y-6 text-[#CCCCD9] text-lg font-light leading-relaxed">
                <p>
                  Asking adults about body changes or periods can feel awkward. But searching the internet is worse—it’s full of scary rumors and bad advice.
                </p>
                <p>
                  We built <strong className="text-white font-semibold">Heal Her</strong> to be the digital big sister every girl deserves. It is a 100% private space where you can ask anything without feeling silly. 
                </p>
                <p>
                  We replace worries with doctor-approved facts. This way, you can focus on being a happy, confident girl while we handle the hard questions.
                </p>
              </div>

              <div className="mt-10">
                <div className="h-1.5 w-24 bg-gradient-to-r from-[#DA8CA0] to-transparent rounded-full" />
              </div>
            </motion.div>

            {/* Right Side: Core Pillars */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: smoothEase }}
              className="space-y-6 bg-gradient-to-b from-[#231854]/60 to-[#1C1246]/80 p-8 md:p-12 rounded-[2.5rem] border border-white/10 border-t-white/20 backdrop-blur-2xl shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_20px_40px_-10px_rgba(28,18,70,0.8)]"
            >
              {[
                {
                  icon: Lock,
                  title: "Private & Secret",
                  desc: "Your questions stay between you and the AI. We never share your data, and there are no ads tracking you."
                },
                {
                  icon: Stethoscope,
                  title: "Reliable Facts",
                  desc: "All our health info comes from real medical science, written in simple words that make sense."
                },
                {
                  icon: Smile,
                  title: "Gently Spoken",
                  desc: "Our AI is always kind. You can ask the same question as many times as you like, and it will always answer nicely."
                }
              ].map((pillar, idx) => (
                <div key={idx} className="flex gap-6 items-start group">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#DA8CA0]/20 to-transparent border border-white/10 border-t-white/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(218,140,160,0.3)] transition-all duration-500 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)]">
                    <pillar.icon className="w-6 h-6 text-[#DA8CA0] drop-shadow-md" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-2">{pillar.title}</h4>
                    <p className="text-[#CCCCD9] leading-relaxed text-base font-medium">
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== TESTIMONIALS SECTION ========== */}
      <Testimonial />

      {/* ========== ETHICS SECTION ========== */}
      <section className="py-24 bg-[#1C1246] border-t border-white/5 relative z-10">
         <div className="mx-auto max-w-7xl px-4 text-center">
            <h2 className="text-sm font-bold tracking-widest text-[#DA8CA0] uppercase mb-16">Our Core Values</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
               {[
                  { icon: Heart, title: "Empathy", text: "Always Kind" },
                  { icon: BookOpen, title: "Education", text: "Fact-Based" },
                  { icon: Shield, title: "Safety", text: "Private & Secure" },
                  { icon: CheckCircle, title: "Clarity", text: "Easy to Read" },
               ].map((item, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15, duration: 1, ease: smoothEase }}
                    key={i} 
                    className="group flex flex-col items-center gap-5"
                  >
                     <div className="p-5 rounded-2xl bg-gradient-to-b from-[#231854] to-[#1C1246] border border-white/10 border-t-white/20 group-hover:border-[#DA8CA0]/50 transition-all duration-500 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_10px_20px_-5px_rgba(28,18,70,0.5)] group-hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.2),0_0_30px_rgba(218,140,160,0.2)] group-hover:-translate-y-2">
                        <item.icon className="w-8 h-8 text-[#CCCCD9] group-hover:text-[#DA8CA0] transition-colors duration-300 drop-shadow-md" />
                     </div>
                     <div>
                        <h4 className="text-xl text-white font-bold mb-1">{item.title}</h4>
                        <p className="text-[#CCCCD9] text-base font-medium">{item.text}</p>
                     </div>
                  </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* ========== CTA SECTION ========== */}
      <section className="relative py-32 overflow-hidden border-t border-[#DA8CA0]/10">
         <div className="absolute inset-0 bg-[#1C1246]">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-[#DA8CA0]/10 blur-[150px] rounded-full pointer-events-none" />
         </div>

         <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: smoothEase }}
            className="relative z-10 mx-auto max-w-4xl px-4 text-center"
         >
            <h2 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-8 drop-shadow-lg">
               Start your journey.
            </h2>
            <p className="text-xl text-[#CCCCD9] mb-12 max-w-2xl mx-auto font-light leading-relaxed">
               Create your safe space today and get the answers you deserve.
            </p>
            <div className="flex justify-center">
               {/* Glossy Shiny Primary Button */}
               <Button asChild className="group relative overflow-hidden h-16 rounded-full bg-gradient-to-b from-[#f3cbd4] to-[#DA8CA0] px-12 text-xl font-bold text-[#1C1246] border border-[#DA8CA0]/50 border-t-white/80 shadow-[inset_0_2px_5px_rgba(255,255,255,0.9),0_10px_30px_-10px_rgba(218,140,160,0.6)] hover:from-[#fae0e6] hover:to-[#e19eb0] hover:scale-105 hover:shadow-[inset_0_2px_5px_rgba(255,255,255,1),0_15px_40px_-10px_rgba(218,140,160,0.8)] transition-all duration-500"><Link href="/login">
                    {/* Glossy Light Sweep */}
                    <div className="absolute top-0 left-[-100%] w-[150%] h-full bg-gradient-to-r from-transparent via-white/50 to-transparent group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
                    <span className="relative z-10">Create Account</span>
                  </Link></Button>
            </div>
         </motion.div>
      </section>

      <Footer />
    </div>
  )
}