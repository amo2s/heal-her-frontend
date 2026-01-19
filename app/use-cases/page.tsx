"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence, useMotionTemplate, useMotionValue, Variants } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { 
  School, 
  MapPin, 
  Users, 
  Heart, 
  Activity, 
  Zap, 
  ArrowRight,
  ShieldAlert,
  GraduationCap,
  WifiOff,      
  Smartphone,   
  Signal,       
  Sun,
  Moon,
  BookOpen,
  Smile,
  Lock,
  MessageCircle,
  Battery,
  Wifi,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import React from "react"
import { cn } from "@/lib/utils"

// --- UTILS & ANIMATION VARIANTS ---

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2
    }
  }
}

const chatBubbleVariants: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 20 } }
}

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

// --- ULTRA REALISTIC IPHONE COMPONENT ---
const IPhoneSimulation = () => {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const sequence = async () => {
      while (true) {
        setStep(0); await new Promise(r => setTimeout(r, 1000));
        setStep(1); await new Promise(r => setTimeout(r, 1500)); // Typing
        setStep(2); await new Promise(r => setTimeout(r, 1000)); // User msg
        setStep(3); await new Promise(r => setTimeout(r, 1500)); // AI Typing
        setStep(4); await new Promise(r => setTimeout(r, 2000)); // AI Response 1
        setStep(5); await new Promise(r => setTimeout(r, 1500)); // AI Response 2
        await new Promise(r => setTimeout(r, 6000)); // Pause before loop
      }
    }
    sequence()
  }, [])

  return (
    <div className="relative mx-auto w-[340px] h-[680px]">
      {/* Outer Frame (Titanium Finish) */}
      <div className="absolute inset-0 bg-[#2a2a2a] rounded-[55px] shadow-[0_0_0_4px_#4a4a4a,0_0_50px_-10px_rgba(0,0,0,0.5)] z-0" />
      
      {/* Inner Bezel (Black) */}
      <div className="absolute inset-[4px] bg-black rounded-[51px] z-10 overflow-hidden border-[6px] border-black">
        
        {/* Dynamic Island */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[100px] h-[28px] bg-black rounded-full z-50 flex items-center justify-center gap-2 transition-all duration-300">
           <div className="w-2 h-2 rounded-full bg-[#1a1a1a]" /> {/* FaceID sensor */}
           <div className="w-1.5 h-1.5 rounded-full bg-[#0f3618]" /> {/* Camera privacy dot */}
        </div>

        {/* Screen Content */}
        <div className="w-full h-full bg-[#1C1246] flex flex-col font-sans relative">
           
           {/* Status Bar */}
           <div className="pt-3 px-6 flex justify-between items-center text-white text-[10px] font-medium z-40">
              <span>9:41</span>
              <div className="flex gap-1.5 items-center">
                 <Signal className="w-3 h-3" />
                 <Wifi className="w-3 h-3" />
                 <Battery className="w-4 h-4" />
              </div>
           </div>

           {/* App Header */}
           <div className="mt-6 px-4 pb-4 border-b border-white/5 flex items-center gap-3 z-30 bg-[#1C1246]/80 backdrop-blur-md sticky top-0">
              <div className="w-8 h-8 rounded-full bg-[#DA8CA0] flex items-center justify-center shadow-lg shadow-[#DA8CA0]/20">
                 <Heart className="w-4 h-4 text-[#1C1246] fill-[#1C1246]" />
              </div>
              <div>
                 <div className="text-xs font-bold text-white">Heal Her</div>
                 <div className="text-[9px] text-[#CCCCD9] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/> Secure Connection
                 </div>
              </div>
           </div>

           {/* Chat Area */}
           <div className="flex-1 p-4 space-y-4 overflow-hidden relative">
              <AnimatePresence>
                 {step >= 1 && step < 2 && (
                    <motion.div 
                        key="typing-1"
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0 }} 
                        className="flex justify-end text-[10px] text-[#CCCCD9]"
                    >
                       Typing...
                    </motion.div>
                 )}

                 {step >= 2 && (
                    <motion.div 
                        key="user-msg"
                        variants={chatBubbleVariants} 
                        initial="hidden" 
                        animate="visible" 
                        className="flex justify-end"
                    >
                       <div className="bg-[#2a2259] text-white text-xs p-3 rounded-2xl rounded-tr-sm max-w-[85%] border border-white/10 shadow-sm">
                          My period came early at school and I don&apos;t have a pad! I&apos;m panicking.
                       </div>
                    </motion.div>
                 )}

                 {step >= 3 && step < 4 && (
                    <motion.div 
                        key="typing-2"
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        className="flex justify-start"
                    >
                       <div className="bg-[#DA8CA0]/10 p-2 rounded-xl rounded-tl-sm flex gap-1">
                          <span className="w-1.5 h-1.5 bg-[#DA8CA0] rounded-full animate-bounce"/>
                          <span className="w-1.5 h-1.5 bg-[#DA8CA0] rounded-full animate-bounce delay-75"/>
                          <span className="w-1.5 h-1.5 bg-[#DA8CA0] rounded-full animate-bounce delay-150"/>
                       </div>
                    </motion.div>
                 )}

                 {step >= 4 && (
                    <motion.div 
                        key="ai-msg-1"
                        variants={chatBubbleVariants} 
                        initial="hidden" 
                        animate="visible" 
                        className="flex justify-start"
                    >
                       <div className="bg-[#DA8CA0] text-[#1C1246] text-xs p-3 rounded-2xl rounded-tl-sm max-w-[90%] shadow-lg font-medium">
                          Deep breath, sis. We got this. ❤️ First, ask a trusted female teacher or the nurse.
                       </div>
                    </motion.div>
                 )}

                 {step >= 5 && (
                    <motion.div 
                        key="ai-msg-2"
                        variants={chatBubbleVariants} 
                        initial="hidden" 
                        animate="visible" 
                        className="flex justify-start"
                    >
                       <div className="bg-[#DA8CA0] text-[#1C1246] text-xs p-3 rounded-2xl rounded-tl-sm max-w-[90%] shadow-lg font-medium">
                          If not, head to the bathroom. You can fold toilet paper generously to make a temporary pad. It will hold!
                       </div>
                    </motion.div>
                 )}
              </AnimatePresence>
           </div>

           {/* Input Area */}
           <div className="p-4 bg-[#1C1246]">
              <div className="h-10 bg-[#231854] rounded-full border border-white/10 flex items-center px-4 text-xs text-[#CCCCD9] justify-between">
                 <span>Type a message...</span>
                 <div className="w-6 h-6 rounded-full bg-[#DA8CA0] flex items-center justify-center">
                    <ArrowRight className="w-3 h-3 text-[#1C1246]" />
                 </div>
              </div>
              {/* Home Indicator */}
              <div className="w-32 h-1 bg-white/20 rounded-full mx-auto mt-4" />
           </div>

        </div>
      </div>

      {/* Buttons */}
      <div className="absolute top-24 -left-[2px] w-[3px] h-8 bg-[#3a3a3a] rounded-l-sm" /> {/* Silent */}
      <div className="absolute top-36 -left-[2px] w-[3px] h-12 bg-[#3a3a3a] rounded-l-sm" /> {/* Vol Up */}
      <div className="absolute top-52 -left-[2px] w-[3px] h-12 bg-[#3a3a3a] rounded-l-sm" /> {/* Vol Down */}
      <div className="absolute top-40 -right-[2px] w-[3px] h-20 bg-[#3a3a3a] rounded-r-sm" /> {/* Power */}

      {/* Reflection Gradient */}
      <div className="absolute inset-[4px] rounded-[51px] bg-gradient-to-tr from-white/5 to-transparent pointer-events-none z-50 opacity-40" />
    </div>
  )
}

export default function UseCasesPage() {
  const [activeTab, setActiveTab] = useState("body")

  // --- 5 TABS CONFIGURATION ---
  const categories = {
    body: {
      label: "Body & Cycle",
      icon: Heart,
      description: "Navigating physical changes, periods, and hygiene with confidence.",
      scenarios: [
        { title: "Period Surprise", icon: Activity, context: "Got your period at school without supplies?", ai_action: "Guides on makeshift pads using tissue and calming anxiety." },
        { title: "Severe Cramps", icon: Zap, context: "Pain making it hard to study or walk?", ai_action: "Suggests heat therapy, hydration, and safe stretches." },
        { title: "Acne Stress", icon: Sun, context: "Feeling insecure about a sudden breakout?", ai_action: "Explains hormonal causes and gentle hygiene routines." },
        { title: "Body Changes", icon: Users, context: "Noticing changes and feeling confused?", ai_action: "Provides age-appropriate facts to normalize growth." }
      ]
    },
    mind: {
      label: "Mind & Feelings",
      icon: Moon,
      description: "Support for anxiety, loneliness, and emotional well-being.",
      scenarios: [
        { title: "Exam Panic", icon: Activity, context: "Heart racing before a big test?", ai_action: "Guides 4-7-8 breathing and grounding techniques." },
        { title: "Feeling Ugly", icon: Smile, context: "Struggling with self-image and comparison?", ai_action: "Offers body-positivity affirmations and perspective." },
        { title: "Loneliness", icon: Users, context: "Feeling isolated or left out by friends?", ai_action: "Listens with empathy and suggests ways to connect." },
        { title: "Mood Swings", icon: Zap, context: "Feeling angry or sad without a reason?", ai_action: "Explains PMS/hormonal links to validate feelings." }
      ]
    },
    school: {
      label: "School Life",
      icon: School,
      description: "Managing academic pressure and social dynamics.",
      scenarios: [
        { title: "Bullying", icon: ShieldAlert, context: "Being targeted or teased by classmates?", ai_action: "Advice on setting boundaries and reporting safely." },
        { title: "Focus Issues", icon: BookOpen, context: "Can't concentrate on homework?", ai_action: "Pomodoro technique tips and distraction management." },
        { title: "Peer Pressure", icon: Users, context: "Pressured to do something uncomfortable?", ai_action: "Scripts for saying 'No' confidently and safely." },
        { title: "Public Speaking", icon: GraduationCap, context: "Terrified of a class presentation?", ai_action: "Visualization exercises to boost confidence." }
      ]
    },
    safety: {
      label: "Safety & Privacy",
      icon: Lock,
      description: "Staying safe online, at home, and on the move.",
      scenarios: [
        { title: "Unsafe Travel", icon: MapPin, context: "Feeling uneasy in a taxi or bus?", ai_action: "Location sharing reminders and vigilance tips." },
        { title: "Online Creeps", icon: WifiOff, context: "Stranger messaging inappropriately online?", ai_action: "Block/Report guides and digital safety settings." },
        { title: "Harassment", icon: ShieldAlert, context: "Being followed or catcalled?", ai_action: "De-escalation tips and finding safe public spaces." },
        { title: "Domestic Fear", icon: Lock, context: "Arguments at home making you scared?", ai_action: "Helpline numbers and safe-room identification." }
      ]
    }
  }

  return (
    <div className="relative min-h-screen bg-[#1C1246] text-[#FAFAFA] selection:bg-[#DA8CA0]/30 selection:text-[#DA8CA0] font-sans overflow-hidden">
      <GrainOverlay />
      <Navigation />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-24 border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#DA8CA0]/20 via-[#1C1246]/50 to-[#1C1246]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DA8CA0]/10 border border-[#DA8CA0]/20 text-[#DA8CA0] text-xs font-mono uppercase tracking-wider mb-6">
              <Sparkles className="h-4 w-4" /> Real Life Support
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6">
              Support for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DA8CA0] to-[#E8B4C1]">Every Moment</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-[#CCCCD9] leading-relaxed">
              Growing up doesn't happen in a textbook. From school stress to body changes, Heal Her adapts to the real situations you face every day.
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- SIMULATION DEMO --- */}
      <section className="py-24 bg-[#231854]/30 border-b border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left: Explanation */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold text-white mb-6">How It Helps You</h2>
              <p className="text-[#CCCCD9] mb-8 leading-relaxed">
                When you're confused or worried, you don't need a lecture. Heal Her cuts through the noise. It listens to your situation and gives <strong>kind, practical advice</strong> instantly.
              </p>
              
              <div className="space-y-6">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex gap-4"
                >
                  <div className="h-10 w-10 rounded-full bg-[#DA8CA0]/10 flex items-center justify-center border border-[#DA8CA0]/20 shrink-0">
                     <MessageCircle className="h-5 w-5 text-[#DA8CA0]" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">Safe Answers</h4>
                    <p className="text-sm text-[#CCCCD9]">No judgment. Just clear facts about your body and feelings.</p>
                  </div>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex gap-4"
                >
                  <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shrink-0">
                    <Heart className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">Emotional Support</h4>
                    <p className="text-sm text-[#CCCCD9]">Feeling down? We offer listening and coping strategies.</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Right: Phone Simulation */}
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
               <IPhoneSimulation />
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- DYNAMIC USE CASES (TABS) --- */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
             <h2 className="text-3xl font-bold text-white mb-4">We cover it all</h2>
             <p className="text-[#CCCCD9]">Select a category to see how Heal Her helps.</p>
          </motion.div>

          <motion.div 
            className="flex flex-wrap justify-center gap-4 mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {(Object.keys(categories) as Array<keyof typeof categories>).map((key) => {
              const CategoryIcon = categories[key].icon
              const isActive = activeTab === key
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 border ${
                    isActive 
                      ? "bg-[#DA8CA0] border-[#DA8CA0] text-[#1C1246] shadow-lg shadow-[#DA8CA0]/25 scale-105" 
                      : "bg-[#231854] border-[#2a2259] text-[#CCCCD9] hover:border-[#DA8CA0]/50 hover:text-white"
                  }`}
                >
                  <CategoryIcon className="h-4 w-4" />
                  {categories[key].label}
                </button>
              )
            })}
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(10px)" }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-center mb-10">
                <p className="text-[#CCCCD9] text-lg">
                  {categories[activeTab as keyof typeof categories].description}
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {categories[activeTab as keyof typeof categories].scenarios.map((scenario, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <SpotlightCard className="bg-[#231854] border border-white/5 p-6 hover:border-[#DA8CA0]/30 transition-colors group">
                      <div className="h-10 w-10 rounded-xl bg-[#1C1246] border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <scenario.icon className="h-5 w-5 text-[#DA8CA0]" />
                      </div>
                      <h3 className="text-base font-bold text-white mb-2">{scenario.title}</h3>
                      <p className="text-[#CCCCD9] text-xs mb-3 leading-relaxed min-h-[40px]">{scenario.context}</p>
                      
                      <div className="pt-3 border-t border-white/10">
                        <p className="text-[10px] text-[#DA8CA0] uppercase tracking-widest font-bold mb-1">AI Advice</p>
                        <p className="text-white text-xs leading-relaxed">{scenario.ai_action}</p>
                      </div>
                    </SpotlightCard>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

        </div>
      </section>

      {/* --- NEW SECTION 2: UNIVERSAL ACCESS (FIXED SIMULATION) --- */}
      <section className="py-24 border-t border-white/5 bg-[#231854]/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
           <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DA8CA0]/10 border border-[#DA8CA0]/20 text-[#DA8CA0] text-xs font-mono uppercase tracking-wider mb-6">
                    <Signal className="h-4 w-4" /> Built for Nigeria
                 </div>
                 <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">No Data? No Problem.</h2>
                 <p className="text-lg text-[#CCCCD9] mb-6 leading-relaxed">
                    We know data is expensive and networks can be slow. Heal Her is built to be extremely lightweight, so you can get answers when you need them.
                 </p>

                 <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                       <WifiOff className="h-5 w-5 text-[#CCCCD9] mt-1" />
                       <div>
                          <strong className="text-white block">Offline First</strong>
                          <span className="text-sm text-[#CCCCD9]">Core guides load instantly even on 2G/Edge networks.</span>
                       </div>
                    </li>
                    <li className="flex items-start gap-3">
                       <Smartphone className="h-5 w-5 text-[#CCCCD9] mt-1" />
                       <div>
                          <strong className="text-white block">Works on Any Phone</strong>
                          <span className="text-sm text-[#CCCCD9]">Optimized for older Android phones common in hostels.</span>
                       </div>
                    </li>
                 </ul>
              </motion.div>
              
              {/* FIXED LOW DATA SIMULATION */}
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                 <div className="absolute -inset-2 bg-[#DA8CA0]/20 rounded-2xl blur-xl" />
                 <div className="relative bg-black border-4 border-[#2a2259] p-6 rounded-xl font-mono shadow-2xl">
                    {/* Retro Phone Header */}
                    <div className="flex items-center justify-between border-b border-gray-800 pb-2 mb-4 text-[#DA8CA0] text-xs">
                       <span>HEAL HER LITE v1.0</span>
                       <div className="flex items-center gap-1">
                          <span>E</span>
                          <div className="flex gap-0.5 items-end h-3">
                             <div className="w-1 h-1 bg-[#DA8CA0]"/>
                             <div className="w-1 h-2 bg-[#DA8CA0]"/>
                             <div className="w-1 h-3 bg-gray-800"/>
                             <div className="w-1 h-4 bg-gray-800"/>
                          </div>
                       </div>
                    </div>
                    
                    {/* Screen Content */}
                    <div className="space-y-4 text-sm">
                       <div className="text-gray-400">&gt; Loading: CRAMP_RELIEF...</div>
                       
                       {/* Animated Loading Bar */}
                       <div className="w-full h-4 border border-[#DA8CA0]/50 p-0.5 rounded">
                          <motion.div 
                            className="h-full bg-[#DA8CA0]"
                            initial={{ width: "0%" }}
                            whileInView={{ width: "100%" }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                          />
                       </div>

                       <div className="text-white">
                          <span className="text-[#DA8CA0]">[1]</span> Heat pad (15m)<br/>
                          <span className="text-[#DA8CA0]">[2]</span> Drink warm water<br/>
                          <span className="text-[#DA8CA0]">[3]</span> Child&apos;s Pose stretch<br/>
                       </div>

                       <div className="text-gray-400 text-xs mt-4 border-t border-gray-800 pt-2">
                          Press * for Menu <span className="animate-pulse">_</span>
                       </div>
                    </div>
                 </div>
              </motion.div>
           </div>
        </div>
      </section>

      {/* --- CTA --- */}
      <section className="py-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-4xl px-4 text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-6">Start Your Journey Today</h2>
          <p className="text-lg text-[#CCCCD9] mb-8">
            Empower yourself with knowledge. It&apos;s better to know your body and not worry, than worry and not know.
          </p>
          <Button asChild size="lg" className="bg-[#DA8CA0] hover:bg-[#E8B4C1] text-[#1C1246] rounded-full px-8 h-12 text-sm font-bold tracking-wide shadow-lg shadow-[#DA8CA0]/20">
            <Link href="/chat">
              Chat with Heal Her <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </section>

      <Footer />
    </div>
  )
}