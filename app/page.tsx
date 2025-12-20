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
  Globe,
  MessageSquare,
  Activity,
  ArrowRight,
  Lock,
  Sparkles,
  Mic,
  Home,
  Star,
  Quote,
  Briefcase,
  Baby,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Battery,
  Wifi,
  Signal,
  CheckCircle,
  Send,
  Heart,
  Users
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
    <div className="absolute top-[0%] left-[0%] h-[100%] w-[100%] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-slate-950" />
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light" />
  </div>
)

const GlowingBadge = ({ children, icon: Icon }: { children: React.ReactNode; icon?: any }) => (
  <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-400 backdrop-blur-md transition-all hover:bg-blue-500/20 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]">
    {Icon && <Icon className="h-3.5 w-3.5 animate-pulse" />}
    {children}
  </div>
)

// --- CHAT SIMULATION COMPONENT (FIXED) ---
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
        setStep(2) // AI Thinking
        await new Promise(r => setTimeout(r, 2000)) 
        if(!mounted) break;
        setStep(3) // AI Response
        await new Promise(r => setTimeout(r, 1000))
        if(!mounted) break;
        setStep(4) // AI Thinking again
        await new Promise(r => setTimeout(r, 1500))
        if(!mounted) break;
        setStep(5) // AI Action Card
        await new Promise(r => setTimeout(r, 8000)) 
      }
    }
    sequence()
    return () => { mounted = false }
  }, [])

  return (
    <div className="flex-1 flex flex-col relative px-5 pt-4 pb-8 h-full">
      {/* App Header */}
      <div className="flex items-center gap-3 mb-6 pl-1 border-b border-white/5 pb-4">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/50">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-sm font-bold text-white">MedGuard AI</div>
          <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/> 
            Online
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
              <div className="bg-blue-600 text-white text-sm p-4 rounded-2xl rounded-tr-sm max-w-[85%] shadow-md">
                <p>I feel dizzy... vision is blurry.</p>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="chat-thinking-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="flex justify-start"
            >
              <div className="bg-slate-800 text-slate-400 text-xs p-3 rounded-2xl rounded-tl-sm shadow-sm flex gap-1">
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-100" />
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-200" />
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
              <div className="bg-[#1e293b] text-slate-200 text-sm p-4 rounded-2xl rounded-tl-sm max-w-[90%] border border-slate-800 shadow-sm">
                <p>Please sit or lie down immediately to prevent falling. Are you currently in a hot environment or have you skipped meals?</p>
              </div>
            </motion.div>
          )}

          {step === 4 && (
             <motion.div 
             key="chat-thinking-2"
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
             className="flex justify-start"
           >
             <div className="bg-slate-800 text-slate-400 text-xs p-3 rounded-2xl rounded-tl-sm shadow-sm flex gap-1">
               <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" />
               <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-100" />
               <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-200" />
             </div>
           </motion.div>
          )}

          {step >= 5 && (
            <motion.div 
              key="chat-action-card"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="mt-4 p-4 bg-[#0f172a] border border-blue-500/30 rounded-xl flex gap-3 items-start relative overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
              <div className="mt-0.5">
                <CheckCircle className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h4 className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">Safety Protocol</h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Loosen tight clothing. Sip water slowly if conscious. Do not stand up quickly.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area (Visual Only) */}
      <div className="mt-4 flex gap-2 items-center opacity-50">
         <div className="h-10 flex-1 bg-slate-900 rounded-full border border-slate-800 px-4 flex items-center text-xs text-slate-500">
            Type a message...
         </div>
         <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
            <Send className="w-4 h-4 text-white" />
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
      name: "Chidinma Okafor",
      role: "Medical Student, UniJos",
      content: "The calm voice feature is a lifesaver. My roommate had a panic attack during exams, and this helped us calm down. But honestly, typing the URL every time is stress. We really need a mobile app.",
      rating: 4,
      initials: "CO",
      color: "bg-pink-500/20 text-pink-400",
      icon: <GraduationCap className="w-3 h-3" />,
      badge: "Waiting for App"
    },
    {
      name: "Mrs. Ngozi Adeleke",
      role: "Mother of 3, Lagos",
      content: "My baby had a high fever at 2 AM. I was shaking. MedGuard just told me exactly how to cool him down before we got to the hospital. Every mum needs this.",
      rating: 5,
      initials: "NA",
      color: "bg-orange-500/20 text-orange-400",
      icon: <Baby className="w-3 h-3" />,
      badge: "Verified Parent"
    },
    {
      name: "Ibrahim Sani",
      role: "Computer Science, ABU Zaria",
      content: "The AI is very fast and the instructions are clear. It doesn't confuse you with big medical grammar. It just tells you what to do instantly.",
      rating: 5,
      initials: "IS",
      color: "bg-emerald-500/20 text-emerald-400",
      icon: <GraduationCap className="w-3 h-3" />
    },
    {
      name: "Mr. Johnson Kalu",
      role: "HR Manager, Zenith Tech",
      content: "We deployed this to our staff internal portal. It makes the office feel safer knowing we have a 'digital medic' on standby for emergencies.",
      rating: 5,
      initials: "JK",
      color: "bg-slate-500/20 text-slate-400",
      icon: <Briefcase className="w-3 h-3" />
    },
    {
      name: "David Etim",
      role: "Law Student, UniJos",
      content: "I love the platform, seriously. But opening my browser when I'm in a rush is annoying. Please, I'm begging you guys, launch the app version. The browser process is too long.",
      rating: 4,
      initials: "DE",
      color: "bg-blue-500/20 text-blue-400",
      icon: <GraduationCap className="w-3 h-3" />,
      badge: "Feature Request"
    },
      {
      name: "Sarah Musa",
      role: "Teacher, Abuja",
      content: "A student fell on the playground. I used MedGuard to check for concussion signs while waiting for the nurse. It gave me so much confidence.",
      rating: 5,
      initials: "SM",
      color: "bg-teal-500/20 text-teal-400",
      icon: <Briefcase className="w-3 h-3" />
    },
    {
      name: "Tolu Adebayo",
      role: "Student, UNILAG",
      content: "I didn't believe an AI could sound this human. It felt like talking to a big sister who knows exactly what to do. 10/10 recommended.",
      rating: 5,
      initials: "TA",
      color: "bg-purple-500/20 text-purple-400",
      icon: <GraduationCap className="w-3 h-3" />
    },
    {
      name: "Emeka O.",
      role: "Banker, Lagos",
      content: "Great tool, but sometimes the network in my office is bad and the site loads slow. An offline app would be perfect.",
      rating: 4,
      initials: "EO",
      color: "bg-indigo-500/20 text-indigo-400",
      icon: <Briefcase className="w-3 h-3" />,
      badge: "Waiting for App"
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
    <div className="relative min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30 selection:text-blue-200">
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
                <GlowingBadge icon={Sparkles}>Your Digital Companion</GlowingBadge>
              </motion.div>
              
              <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-slate-400">
                A Calm Voice in <br />
                <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">The Chaos.</span>
              </h1>
              
              <p className="mt-8 text-lg sm:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Medical emergencies are terrifying. MedGuard AI is your steady anchor.
                <span className="text-white font-medium"> We provide a sense of home, </span> 
                translating panic into clear, gentle guidance—in any language.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" className="h-14 rounded-full bg-blue-600 px-8 text-base font-semibold text-white shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] hover:bg-blue-500 hover:shadow-[0_0_60px_-10px_rgba(37,99,235,0.6)] hover:scale-105 transition-all duration-300">
                  {/* UPDATED: Internal Link to /launch */}
                  <Link href="/launch" className="flex items-center gap-2">
                    Start MedGuard <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {/* Stats Strip */}
              <div className="mt-16 border-t border-white/5 pt-8 flex flex-wrap justify-center lg:justify-start gap-12 pb-10 lg:pb-32">
                {[
                  { label: "Language Support", value: "50+" },
                  { label: "Guidance", value: "Real-time" },
                  { label: "Availability", value: "24/7" },
                ].map((stat, i) => (
                  <div key={i}>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-slate-500 font-medium tracking-wide uppercase">{stat.label}</div>
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
                    className="relative w-[360px] h-[720px] bg-black rounded-[55px] border-[8px] border-[#2a2a2a] shadow-[0_0_0_4px_#1a1a1a,0_20px_50px_-12px_rgba(0,0,0,0.8)] overflow-hidden ring-1 ring-white/10"
                  >
                    {/* Physical Buttons (Side) */}
                    <div className="absolute top-28 -left-[12px] w-[4px] h-8 bg-[#1a1a1a] rounded-l-md" /> {/* Silent Switch */}
                    <div className="absolute top-44 -left-[12px] w-[4px] h-16 bg-[#1a1a1a] rounded-l-md" /> {/* Vol Up */}
                    <div className="absolute top-64 -left-[12px] w-[4px] h-16 bg-[#1a1a1a] rounded-l-md" /> {/* Vol Down */}
                    <div className="absolute top-52 -right-[12px] w-[4px] h-24 bg-[#1a1a1a] rounded-r-md" /> {/* Power */}

                    {/* Screen Bezel (Inner Black Border) */}
                    <div className="absolute inset-0 border-[10px] border-black rounded-[48px] z-20 pointer-events-none" />

                    {/* Dynamic Island */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-32 h-9 bg-black rounded-full z-30 flex items-center justify-center gap-3">
                       <div className="w-2 h-2 rounded-full bg-[#1a1a1a]/80" /> {/* Camera Lens */}
                    </div>

                    {/* Screen Content */}
                    <div className="relative w-full h-full bg-slate-950 overflow-hidden flex flex-col">
                        
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

      {/* --- THE CRISIS --- */}
      <section className="relative py-32 bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="order-2 lg:order-1"
              >
                 <SpotlightCard className="p-8 h-full bg-slate-900/50 backdrop-blur-sm border-slate-800">
                    <div className="flex items-center gap-4 mb-6">
                       <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400">
                          <Activity className="w-8 h-8" />
                       </div>
                       <h3 className="text-2xl font-bold text-white">The Clarity Gap</h3>
                    </div>
                    <div className="space-y-6">
                       <div className="flex gap-4 items-start">
                          <span className="text-5xl font-bold text-slate-800">01</span>
                          <p className="text-slate-400 mt-2">Panic freezes the brain. Even improved speakers struggle to communicate in a second language during emergencies.</p>
                       </div>
                       <div className="flex gap-4 items-start">
                          <span className="text-5xl font-bold text-slate-800">02</span>
                          <p className="text-slate-400 mt-2">Standard emergency services can feel cold and robotic. We provide the warmth of a human connection with the speed of AI.</p>
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
                   Seconds feel like <br />
                   <span className="text-blue-500">Hours.</span>
                 </h2>
                 <p className="text-lg text-slate-400 mb-8">
                   When fear takes over, you don't need a complex tool. You need a calm, steady voice that knows exactly what to do, step by gentle step.
                 </p>
                 <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-transparent rounded-full" />
              </motion.div>
          </div>
        </div>
      </section>

      {/* --- FEATURES --- */}
      <section className="relative py-32 bg-slate-950">
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
         
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-20">
               <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl mb-6">
                  Engineered for <span className="text-blue-500">Comfort</span>
               </h2>
               <p className="text-lg text-slate-400">
                  We stripped away the noise. MedGuard AI is a precision instrument designed to ground you when you feel untethered.
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-6 auto-rows-[300px]">
               <SpotlightCard className="md:col-span-4 row-span-2 p-10 flex flex-col justify-between overflow-hidden group">
                  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-all duration-700" />
                  
                  <div className="relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6">
                         <MessageSquare className="w-6 h-6 text-blue-400" />
                      </div>
                      <h3 className="text-3xl font-bold text-white mb-4">We Listen. We Guide.</h3>
                      <p className="text-slate-400 text-lg max-w-md">
                         Don't worry about perfect grammar or English. Just speak. Our AI understands panic and responds with simple, calming instructions.
                      </p>
                  </div>
                  
                  <div className="relative w-full h-48 mt-8">
                      <div className="absolute bottom-0 left-0 right-0 space-y-3 opacity-50">
                         <div className="bg-slate-800 p-3 rounded-lg w-3/4">My dad... he's clutching his chest!</div>
                         <div className="bg-blue-900/50 p-3 rounded-lg w-3/4 ml-auto border border-blue-500/30">I understand. Stay close to him. Let's help him sit down.</div>
                      </div>
                  </div>
               </SpotlightCard>

               <SpotlightCard className="md:col-span-2 row-span-2 p-8 bg-gradient-to-b from-slate-900 to-slate-900/50">
                  <div className="h-full flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-6 ring-1 ring-green-500/30">
                         <Shield className="w-8 h-8 text-green-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">Private & Safe</h3>
                      <p className="text-slate-400 text-sm leading-relaxed mb-8">
                        Your vulnerability is protected. No data leaves your device without encryption.
                      </p>
                      
                      <div className="mt-auto w-full bg-slate-800/50 rounded-xl p-4 border border-white/5">
                         <div className="flex items-center gap-3 mb-2">
                            <Lock className="w-4 h-4 text-green-400" />
                            <span className="text-xs text-white font-mono">End-to-End Encrypted</span>
                         </div>
                         <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full w-full bg-green-500 animate-pulse" />
                         </div>
                      </div>
                  </div>
               </SpotlightCard>

               <SpotlightCard className="md:col-span-3 p-8 flex items-center gap-6">
                  <div className="flex-shrink-0 w-14 h-14 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                     <Home className="w-7 h-7 text-orange-400" />
                  </div>
                  <div>
                      <h3 className="text-xl font-bold text-white">A Sense of Home</h3>
                      <p className="text-slate-400 text-sm mt-1">
                        A reassuring interface that feels safe and familiar, grounded in stability when your world feels chaotic.
                      </p>
                  </div>
               </SpotlightCard>

               <SpotlightCard className="md:col-span-3 p-8 flex items-center gap-6">
                  <div className="flex-shrink-0 w-14 h-14 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                     <Globe className="w-7 h-7 text-purple-400" />
                  </div>
                  <div>
                      <h3 className="text-xl font-bold text-white">Universal Language</h3>
                      <p className="text-slate-400 text-sm mt-1">
                        We speak your language. Real-time translation so you can think and speak naturally.
                      </p>
                  </div>
               </SpotlightCard>
            </div>
         </div>
      </section>

      {/* --- TESTIMONIALS SECTION --- */}
      <section className="py-24 bg-slate-950 relative overflow-hidden">
        <div className="relative z-10 mb-12 text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">Voices from the Community</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Trusted by mothers, students, and professionals across Nigeria.
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
                  <SpotlightCard className="bg-slate-900/60 backdrop-blur-md border border-white/10 p-8 md:p-10 rounded-3xl shadow-xl">
                    <div className="flex flex-col items-center text-center">
                      <Quote className="w-10 h-10 text-slate-700 opacity-25 mb-5" />

                      <p className="text-lg md:text-xl text-slate-200 leading-relaxed font-light italic mb-8">
                        "{item.content}"
                      </p>

                      <div className="flex flex-col items-center">
                        <div className={cn("w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg shadow-lg mb-3", item.color)}>
                          {item.initials}
                        </div>
                        
                        <h4 className="text-lg font-semibold text-white">{item.name}</h4>
                        <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
                          {item.icon}
                          <span>{item.role}</span>
                        </p>

                        <div className="flex gap-1 mt-3">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={cn(
                                "w-4.5 h-4.5",
                                star <= item.rating ? "fill-yellow-500 text-yellow-500" : "fill-slate-700 text-slate-700"
                              )}
                            />
                          ))}
                        </div>

                        {item.badge && (
                          <div className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-500/10 text-xs text-blue-300 font-medium border border-blue-500/20">
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
                  i === index ? "bg-blue-500 w-8" : "bg-slate-600"
                )}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* --- ETHICS --- */}
      <section className="py-24 bg-slate-950 border-t border-white/5">
         <div className="mx-auto max-w-7xl px-4 text-center">
            <h2 className="text-sm font-semibold tracking-widest text-blue-500 uppercase mb-16">Core Promises</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
               {[
                  { icon: Heart, title: "Empathy", text: "Calm Voice Synthesis" },
                  { icon: Users, title: "Accessibility", text: "Simple Instructions" },
                  { icon: Shield, title: "Safety", text: "Verified Guidance" },
                  { icon: CheckCircle, title: "Clarity", text: "Step-by-Step Focus" },
               ].map((item, i) => (
                  <div key={i} className="group flex flex-col items-center gap-4">
                     <div className="p-4 rounded-2xl bg-slate-900 border border-white/5 group-hover:border-blue-500/30 transition-colors">
                        <item.icon className="w-6 h-6 text-slate-400 group-hover:text-blue-400 transition-colors" />
                     </div>
                     <div>
                        <h4 className="text-white font-bold">{item.title}</h4>
                        <p className="text-slate-500 text-sm mt-1">{item.text}</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* --- CTA --- */}
      <section className="relative py-32 overflow-hidden">
         <div className="absolute inset-0 bg-blue-600">
            <div className="absolute inset-0 bg-slate-950/90" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-500/30 blur-[120px] rounded-full pointer-events-none" />
         </div>

         <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
            <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-8">
               Peace of mind, <br/> in your pocket.
            </h2>
            <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
               When the unexpected happens, MedGuard AI is your voice of reason.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
               <Button className="h-16 px-10 rounded-full bg-white text-blue-900 text-lg font-bold hover:bg-blue-50 hover:scale-105 transition-all shadow-xl">
                  {/* UPDATED: Internal Link to /launch */}
                  <Link href="/launch">Launch MedGuard AI</Link>
               </Button>
               <span className="text-blue-200 text-sm">Always free for families</span>
            </div>
         </div>
      </section>

      <Footer />
    </div>
  )
}