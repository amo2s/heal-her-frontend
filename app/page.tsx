"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { motion, useMotionTemplate, useMotionValue, AnimatePresence } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Shield,
  Heart, // Replaced Activity with Heart
  MessageCircle, // Replaced MessageSquare
  ArrowRight,
  Lock,
  Sparkles,
  BookOpen, // Added for education
  Star,
  Quote,
  Baby,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Battery,
  Wifi,
  Signal,
  CheckCircle,
  Send,
  Users,
  Feather // Added for softness
} from "lucide-react"

// --- UI COMPONENTS ---

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
    {/* Updated gradients to Dusty Rose (#DA8CA0) and Indigo */}
    <div className="absolute top-[-50%] left-[-50%] h-[200%] w-[200%] animate-spin-slow rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,#231854_120deg,transparent_180deg)] opacity-30 blur-3xl" />
    <div className="absolute top-[0%] left-[0%] h-[100%] w-[100%] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#DA8CA0]/20 via-[#1C1246] to-[#1C1246]" />
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light" />
  </div>
)

const GlowingBadge = ({ children, icon: Icon }: { children: React.ReactNode; icon?: any }) => (
  <div className="inline-flex items-center gap-2 rounded-full border border-[#DA8CA0]/30 bg-[#DA8CA0]/10 px-4 py-1.5 text-sm font-medium text-[#DA8CA0] backdrop-blur-md transition-all hover:bg-[#DA8CA0]/20 hover:shadow-[0_0_20px_rgba(218,140,160,0.3)]">
    {Icon && <Icon className="h-3.5 w-3.5 animate-pulse" />}
    {children}
  </div>
)

// --- CHAT SIMULATION COMPONENT (UPDATED FOR GIRLS HEALTH) ---
const PhoneScreen = () => {
  const [step, setStep] = useState(0)

  useEffect(() => {
    let mounted = true;
    const sequence = async () => {
      while (mounted) {
        setStep(0) // Reset
        await new Promise(r => setTimeout(r, 1000))
        if(!mounted) break;
        setStep(1) // User Message
        await new Promise(r => setTimeout(r, 800))
        if(!mounted) break;
        setStep(2) // Typing Dots
        await new Promise(r => setTimeout(r, 2000)) 
        if(!mounted) break;
        setStep(3) // AI Response
        await new Promise(r => setTimeout(r, 1000))
        if(!mounted) break;
        setStep(4) // Typing Dots again
        await new Promise(r => setTimeout(r, 1500))
        if(!mounted) break;
        setStep(5) // Action Card
        await new Promise(r => setTimeout(r, 8000)) 
      }
    }
    sequence()
    return () => { mounted = false }
  }, [])

  return (
    <div className="flex-1 flex flex-col relative px-5 pt-4 pb-8 h-full font-nunito">
      {/* App Header */}
      <div className="flex items-center gap-3 mb-6 pl-1 border-b border-white/5 pb-4">
        <div className="w-10 h-10 rounded-full bg-[#DA8CA0] flex items-center justify-center shadow-lg shadow-[#DA8CA0]/30">
          <Heart className="w-5 h-5 text-[#1C1246] fill-[#1C1246]" />
        </div>
        <div>
          <div className="text-sm font-bold text-white">HerHealth AI</div>
          <div className="text-[10px] text-[#CCCCD9] font-medium flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-[#DA8CA0]" />
            Private Mode
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-5 overflow-hidden relative">
        <AnimatePresence mode="popLayout">
          {step >= 1 && (
            <motion.div 
              key="chat-user-message"
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex justify-end"
            >
              {/* User Bubble: Midnight Indigo Lighter */}
              <div className="bg-[#2a2259] text-white text-sm p-4 rounded-2xl rounded-tr-sm max-w-[85%] shadow-md border border-white/5">
                <p>I&apos;ve been feeling really emotional lately and my skin is breaking out. Is something wrong with me?</p>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="chat-typing-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="flex justify-start"
            >
              <div className="bg-[#DA8CA0]/10 text-[#DA8CA0] text-xs p-3 rounded-2xl rounded-tl-sm shadow-sm flex gap-1">
                <span className="w-1.5 h-1.5 bg-[#DA8CA0] rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-[#DA8CA0] rounded-full animate-bounce delay-100" />
                <span className="w-1.5 h-1.5 bg-[#DA8CA0] rounded-full animate-bounce delay-200" />
              </div>
            </motion.div>
          )}

          {step >= 3 && (
            <motion.div 
              key="chat-ai-message-1"
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex justify-start"
            >
              {/* AI Bubble: Dusty Rose */}
              <div className="bg-[#DA8CA0] text-[#1C1246] text-sm p-4 rounded-2xl rounded-tl-sm max-w-[90%] shadow-lg">
                <p>It is completely normal! ❤️ You are likely seeing signs of puberty. Hormonal changes can affect your mood and skin. You are perfectly healthy.</p>
              </div>
            </motion.div>
          )}

          {step === 4 && (
             <motion.div 
             key="chat-typing-2"
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
             className="flex justify-start"
           >
             <div className="bg-[#DA8CA0]/10 text-[#DA8CA0] text-xs p-3 rounded-2xl rounded-tl-sm shadow-sm flex gap-1">
               <span className="w-1.5 h-1.5 bg-[#DA8CA0] rounded-full animate-bounce" />
               <span className="w-1.5 h-1.5 bg-[#DA8CA0] rounded-full animate-bounce delay-100" />
               <span className="w-1.5 h-1.5 bg-[#DA8CA0] rounded-full animate-bounce delay-200" />
             </div>
           </motion.div>
          )}

          {step >= 5 && (
            <motion.div 
              key="chat-action-card"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="mt-4 p-4 bg-[#231854] border border-[#DA8CA0]/30 rounded-xl flex gap-3 items-start relative overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#DA8CA0]" />
              <div className="mt-0.5">
                <Sparkles className="w-5 h-5 text-[#DA8CA0]" />
              </div>
              <div>
                <h4 className="text-[#DA8CA0] text-xs font-bold uppercase tracking-wider mb-1">Wellness Tip</h4>
                <p className="text-[#CCCCD9] text-xs leading-relaxed">
                  Try gentle cleansing and drinking more water. Be kind to yourself today! 🌸
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area (Visual Only) */}
      <div className="mt-4 flex gap-2 items-center opacity-70">
         <div className="h-10 flex-1 bg-[#231854] rounded-full border border-white/10 px-4 flex items-center text-xs text-[#CCCCD9]">
           Type a message...
         </div>
         <div className="h-10 w-10 bg-[#DA8CA0] rounded-full flex items-center justify-center hover:scale-105 transition-transform">
            <Send className="w-4 h-4 text-[#1C1246]" />
         </div>
      </div>

      {/* Home Indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full z-50" />
    </div>
  )
}

export default function HomePage() {
  const allTestimonials = [
    {
      name: "Amina Yusuf",
      role: "High School Student, Lagos",
      content: "I was too shy to ask my teacher about my period pain, but HerHealth explained everything without making me feel weird. It feels like a big sister.",
      rating: 5,
      initials: "AY",
      color: "bg-pink-500/20 text-pink-400",
      icon: <GraduationCap className="w-3 h-3" />,
      badge: "Verified User"
    },
    {
      name: "Mrs. Ngozi Adeleke",
      role: "Mother of 2, Abuja",
      content: "My daughter is entering puberty and has so many questions. This AI gives her accurate, safe answers when I'm not around. It's a blessing.",
      rating: 5,
      initials: "NA",
      color: "bg-orange-500/20 text-orange-400",
      icon: <Baby className="w-3 h-3" />,
      badge: "Parent"
    },
    {
      name: "Ms. Sarah Okon",
      role: "Biology Teacher, PH",
      content: "I use this to supplement my health classes. The information is accurate, age-appropriate, and very gentle. The girls love it.",
      rating: 5,
      initials: "SO",
      color: "bg-emerald-500/20 text-emerald-400",
      icon: <BookOpen className="w-3 h-3" />
    },
    {
      name: "Chidinma O.",
      role: "Student, UNILAG",
      content: "Finally, an app that doesn't sell my data. I can ask personal questions about my body and know it stays private.",
      rating: 5,
      initials: "CO",
      color: "bg-purple-500/20 text-purple-400",
      icon: <GraduationCap className="w-3 h-3" />,
      badge: "Privacy First"
    }
  ]

  // --- CAROUSEL LOGIC ---
  const [index, setIndex] = useState(0)

  // Auto-slide
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % allTestimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setIndex((prev) => (prev + 1) % allTestimonials.length)
  }

  const prevSlide = () => {
    setIndex((prev) => (prev === 0 ? allTestimonials.length - 1 : prev - 1))
  }


  return (
    <div className="relative min-h-screen bg-[#1C1246] text-[#FAFAFA] selection:bg-[#DA8CA0]/30 selection:text-[#DA8CA0]">
      <Navigation />
      
      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <AuroraBackground />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
            
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, x: -50, filter: "blur(10px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="flex-1 text-center lg:text-left pt-10"
            >
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-8 flex justify-center lg:justify-start"
              >
                <GlowingBadge icon={Sparkles}>Your Private Health Companion</GlowingBadge>
              </motion.div>
              
              <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl text-transparent bg-clip-text bg-gradient-to-b from-[#FAFAFA] via-[#FAFAFA] to-[#CCCCD9]">
                Your Body. <br />
                Your Questions. <br />
                <span className="bg-gradient-to-r from-[#DA8CA0] to-[#E8B4C1] bg-clip-text text-transparent">Your Safe Space.</span>
              </h1>
              
              <p className="mt-8 text-lg sm:text-xl text-[#CCCCD9] leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Growing up is a journey. <span className="text-[#DA8CA0] font-medium">HerHealth AI</span> is your judgment-free companion for learning about your body, health, and wellness. Accurate, private, and always here for you.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" className="h-14 rounded-full bg-[#DA8CA0] px-8 text-base font-bold text-[#1C1246] shadow-[0_0_40px_-10px_rgba(218,140,160,0.5)] hover:bg-[#E8B4C1] hover:shadow-[0_0_60px_-10px_rgba(218,140,160,0.6)] hover:scale-105 transition-all duration-300">
                  <Link href="/chat" className="flex items-center gap-2">
                    Start Chatting <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" className="h-14 rounded-full text-[#FAFAFA] hover:bg-white/5 border border-white/10">
                    <Link href="/about">For Parents & Schools</Link>
                </Button>
              </div>

              {/* Stats Strip */}
              <div className="mt-16 border-t border-[#CCCCD9]/10 pt-8 flex flex-wrap justify-center lg:justify-start gap-12 pb-10 lg:pb-32">
                {[
                  { label: "Privacy", value: "100%" },
                  { label: "Guidance", value: "Real-time" },
                  { label: "Community", value: "Safe" },
                ].map((stat, i) => (
                  <div key={i}>
                    <div className="text-2xl font-bold text-[#FAFAFA]">{stat.value}</div>
                    <div className="text-sm text-[#DA8CA0] font-medium tracking-wide uppercase">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* --- ULTRA-REALISTIC PHONE --- */}
            <div className="w-full lg:w-[420px] relative">
               <div className="relative lg:sticky lg:top-24 w-full flex items-start justify-center">
                 
                 {/* Phone Chassis */}
                 <motion.div 
                   initial={{ y: 100, opacity: 0 }}
                   animate={{ y: 0, opacity: 1 }}
                   transition={{ duration: 0.8, delay: 0.2 }}
                   className="relative w-[360px] h-[720px] bg-[#1a1a1a] rounded-[55px] border-[8px] border-[#2a2a2a] shadow-[0_0_0_4px_#1a1a1a,0_20px_50px_-12px_rgba(0,0,0,0.8)] overflow-hidden ring-1 ring-white/10"
                 >
                   {/* Physical Buttons (Side) */}
                   <div className="absolute top-28 -left-[12px] w-[4px] h-8 bg-[#1a1a1a] rounded-l-md" /> 
                   <div className="absolute top-44 -left-[12px] w-[4px] h-16 bg-[#1a1a1a] rounded-l-md" /> 
                   <div className="absolute top-64 -left-[12px] w-[4px] h-16 bg-[#1a1a1a] rounded-l-md" /> 
                   <div className="absolute top-52 -right-[12px] w-[4px] h-24 bg-[#1a1a1a] rounded-r-md" /> 

                   {/* Screen Bezel (Inner Black Border) */}
                   <div className="absolute inset-0 border-[10px] border-black rounded-[48px] z-20 pointer-events-none" />

                   {/* Dynamic Island */}
                   <div className="absolute top-3 left-1/2 -translate-x-1/2 w-32 h-9 bg-black rounded-full z-30 flex items-center justify-center gap-3">
                       <div className="w-2 h-2 rounded-full bg-[#1a1a1a]/80" /> 
                   </div>

                   {/* Screen Content */}
                   <div className="relative w-full h-full bg-[#1C1246] overflow-hidden flex flex-col">
                       
                       {/* Status Bar */}
                       <div className="h-14 px-8 flex justify-between items-center text-white/90 text-xs font-medium z-20 pt-2">
                          <span>9:41</span>
                          <div className="flex gap-1.5 items-center">
                             <Signal className="w-3.5 h-3.5" />
                             <Wifi className="w-3.5 h-3.5" />
                             <Battery className="w-4 h-4" />
                          </div>
                       </div>

                       {/* Glass Reflection Overlay */}
                       <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-50 pointer-events-none z-40" />

                       {/* RENDER THE CHAT SIMULATION */}
                       <PhoneScreen />

                   </div>
                 </motion.div>
               </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- THE GAP --- */}
      <section className="relative py-32 bg-[#1C1246]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="order-2 lg:order-1"
              >
                 <SpotlightCard className="p-8 h-full bg-[#231854] backdrop-blur-sm border-[#CCCCD9]/10">
                    <div className="flex items-center gap-4 mb-6">
                       <div className="p-3 bg-[#DA8CA0]/10 rounded-lg text-[#DA8CA0]">
                          <BookOpen className="w-8 h-8" />
                       </div>
                       <h3 className="text-2xl font-bold text-white">The Knowledge Gap</h3>
                    </div>
                    <div className="space-y-6">
                       <div className="flex gap-4 items-start">
                          <span className="text-5xl font-bold text-[#DA8CA0]/20">01</span>
                          <p className="text-[#CCCCD9] mt-2">The internet is full of misinformation. Girls often find scary or wrong advice when searching for health topics online.</p>
                       </div>
                       <div className="flex gap-4 items-start">
                          <span className="text-5xl font-bold text-[#DA8CA0]/20">02</span>
                          <p className="text-[#CCCCD9] mt-2">Asking adults can feel awkward. We bridge the gap by providing a safe, non-judgmental place to ask anything.</p>
                       </div>
                    </div>
                 </SpotlightCard>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="order-1 lg:order-2"
              >
                 <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                   Fear comes from <br />
                   <span className="text-[#DA8CA0]">Not Knowing.</span>
                 </h2>
                 <p className="text-lg text-[#CCCCD9] mb-8">
                   We replace anxiety with understanding. Whether it&apos;s puberty, mental health, or hygiene, HerHealth AI explains it all simply and gently.
                 </p>
                 <div className="h-1 w-24 bg-gradient-to-r from-[#DA8CA0] to-transparent rounded-full" />
              </motion.div>
          </div>
        </div>
      </section>

      {/* --- FEATURES --- */}
      <section className="relative py-32 bg-[#1C1246]">
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
         
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-20">
               <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl mb-6">
                  Engineered for <span className="text-[#DA8CA0]">Comfort</span>
               </h2>
               <p className="text-lg text-[#CCCCD9]">
                  We stripped away the complexity. HerHealth AI is a digital big sister designed to guide you through growing up.
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-6 auto-rows-[300px]">
               <SpotlightCard className="md:col-span-4 row-span-2 p-10 flex flex-col justify-between overflow-hidden group bg-[#231854]">
                  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#DA8CA0]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-[#DA8CA0]/20 transition-all duration-700" />
                  
                  <div className="relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-[#DA8CA0]/20 flex items-center justify-center mb-6">
                         <MessageCircle className="w-6 h-6 text-[#DA8CA0]" />
                      </div>
                      <h3 className="text-3xl font-bold text-white mb-4">No Question is "Too Weird"</h3>
                      <p className="text-[#CCCCD9] text-lg max-w-md">
                          Don&apos;t worry about grammar or phrasing. Just ask. Our AI understands your curiosity and responds with kindness, not medical jargon.
                      </p>
                  </div>
                  
                  <div className="relative w-full h-48 mt-8">
                      <div className="absolute bottom-0 left-0 right-0 space-y-3 opacity-50">
                         <div className="bg-[#2a2259] p-3 rounded-lg w-3/4 text-[#CCCCD9]">Is it normal to feel sad for no reason?</div>
                         <div className="bg-[#DA8CA0]/20 p-3 rounded-lg w-3/4 ml-auto border border-[#DA8CA0]/30 text-white">Yes! Hormones can change your mood. Let&apos;s talk about it.</div>
                      </div>
                  </div>
               </SpotlightCard>

               <SpotlightCard className="md:col-span-2 row-span-2 p-8 bg-gradient-to-b from-[#231854] to-[#1C1246]">
                  <div className="h-full flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-full bg-[#DA8CA0]/10 flex items-center justify-center mb-6 ring-1 ring-[#DA8CA0]/30">
                         <Shield className="w-8 h-8 text-[#DA8CA0]" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">Private & Safe</h3>
                      <p className="text-[#CCCCD9] text-sm leading-relaxed mb-8">
                        Your secrets are safe here. No data is shared with advertisers or third parties.
                      </p>
                      
                      <div className="mt-auto w-full bg-[#2a2259] rounded-xl p-4 border border-white/5">
                         <div className="flex items-center gap-3 mb-2">
                            <Lock className="w-4 h-4 text-[#DA8CA0]" />
                            <span className="text-xs text-white font-mono">End-to-End Encrypted</span>
                         </div>
                         <div className="h-1 w-full bg-[#1C1246] rounded-full overflow-hidden">
                            <div className="h-full w-full bg-[#DA8CA0] animate-pulse" />
                         </div>
                      </div>
                  </div>
               </SpotlightCard>

               <SpotlightCard className="md:col-span-3 p-8 flex items-center gap-6 bg-[#231854]">
                  <div className="flex-shrink-0 w-14 h-14 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                     <Feather className="w-7 h-7 text-orange-400" />
                  </div>
                  <div>
                      <h3 className="text-xl font-bold text-white">Gentle Guidance</h3>
                      <p className="text-[#CCCCD9] text-sm mt-1">
                        A reassuring interface that feels safe and familiar, grounded in kindness.
                      </p>
                  </div>
               </SpotlightCard>

               <SpotlightCard className="md:col-span-3 p-8 flex items-center gap-6 bg-[#231854]">
                  <div className="flex-shrink-0 w-14 h-14 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                     <Heart className="w-7 h-7 text-purple-400" />
                  </div>
                  <div>
                      <h3 className="text-xl font-bold text-white">Body Positivity</h3>
                      <p className="text-[#CCCCD9] text-sm mt-1">
                        We celebrate your growth and help you build confidence in your changing body.
                      </p>
                  </div>
               </SpotlightCard>
            </div>
         </div>
      </section>

      {/* --- TESTIMONIALS SECTION --- */}
      <section className="py-24 bg-[#1C1246] relative overflow-hidden">
        <div className="relative z-10 mb-12 text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">Voices from the Community</h2>
          <p className="text-[#CCCCD9] max-w-2xl mx-auto">
            Trusted by girls, mothers, and educators across the country.
          </p>
          
          <div className="flex justify-center gap-4 mt-6">
            <button 
              onClick={prevSlide}
              className="p-2 rounded-full border border-white/10 hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button 
              onClick={nextSlide}
              className="p-2 rounded-full border border-white/10 hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="w-full max-w-3xl mx-auto px-4">
          <div className="relative overflow-hidden">
            <motion.div 
              className="flex"
              animate={{ x: `-${index * 100}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {allTestimonials.map((item, idx) => (
                <div key={idx} className="w-full flex-shrink-0 px-4">
                  <SpotlightCard className="bg-[#231854]/80 backdrop-blur-md border border-white/10 p-8 md:p-10 rounded-3xl shadow-xl">
                    <div className="flex flex-col items-center text-center">
                      <Quote className="w-10 h-10 text-[#DA8CA0] opacity-25 mb-5" />

                      <p className="text-lg md:text-xl text-[#FAFAFA] leading-relaxed font-light italic mb-8">
                        "{item.content}"
                      </p>

                      <div className="flex flex-col items-center">
                        <div className={cn("w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg shadow-lg mb-3", item.color)}>
                          {item.initials}
                        </div>
                        
                        <h4 className="text-lg font-semibold text-white">{item.name}</h4>
                        <p className="text-sm text-[#CCCCD9] mt-1 flex items-center gap-2">
                          {item.icon}
                          <span>{item.role}</span>
                        </p>

                        <div className="flex gap-1 mt-3">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={cn(
                                "w-4.5 h-4.5",
                                star <= item.rating ? "fill-[#DA8CA0] text-[#DA8CA0]" : "fill-[#2a2259] text-[#2a2259]"
                              )}
                            />
                          ))}
                        </div>

                        {item.badge && (
                          <div className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#DA8CA0]/10 text-xs text-[#DA8CA0] font-medium border border-[#DA8CA0]/20">
                            {item.badge}
                          </div>
                        )}
                      </div>
                    </div>
                  </SpotlightCard>
                </div>
              ))}
            </motion.div>
          </div>

          <div className="flex justify-center gap-2 mt-8">
            {allTestimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  i === index ? "bg-[#DA8CA0] w-8" : "bg-[#2a2259]"
                )}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* --- ETHICS --- */}
      <section className="py-24 bg-[#1C1246] border-t border-white/5">
         <div className="mx-auto max-w-7xl px-4 text-center">
            <h2 className="text-sm font-semibold tracking-widest text-[#DA8CA0] uppercase mb-16">Our Core Values</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
               {[
                  { icon: Heart, title: "Empathy", text: "Always Kind" },
                  { icon: BookOpen, title: "Education", text: "Fact-Based" },
                  { icon: Shield, title: "Safety", text: "Private & Secure" },
                  { icon: CheckCircle, title: "Clarity", text: "Easy to Read" },
               ].map((item, i) => (
                  <div key={i} className="group flex flex-col items-center gap-4">
                     <div className="p-4 rounded-2xl bg-[#231854] border border-white/5 group-hover:border-[#DA8CA0]/30 transition-colors">
                        <item.icon className="w-6 h-6 text-[#CCCCD9] group-hover:text-[#DA8CA0] transition-colors" />
                     </div>
                     <div>
                        <h4 className="text-white font-bold">{item.title}</h4>
                        <p className="text-[#CCCCD9] text-sm mt-1">{item.text}</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* --- CTA --- */}
      <section className="relative py-32 overflow-hidden">
         <div className="absolute inset-0 bg-[#DA8CA0]">
            <div className="absolute inset-0 bg-[#1C1246]/90" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[#DA8CA0]/30 blur-[120px] rounded-full pointer-events-none" />
         </div>

         <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
            <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-8">
               Confidence in <br/> every question.
            </h2>
            <p className="text-xl text-[#CCCCD9] mb-12 max-w-2xl mx-auto">
               You are not alone in this journey. HerHealth AI is here to help you grow with confidence.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
               <Button className="h-16 px-10 rounded-full bg-[#DA8CA0] text-[#1C1246] text-lg font-bold hover:bg-[#E8B4C1] hover:scale-105 transition-all shadow-xl">
                  <Link href="/chat">Start Learning Now</Link>
               </Button>
               <span className="text-[#CCCCD9] text-sm">Always free for girls</span>
            </div>
         </div>
      </section>

      <Footer />
    </div>
  )
}