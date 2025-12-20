"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, useMotionTemplate, useMotionValue, Variants, AnimatePresence } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
// Import React Markdown
import ReactMarkdown from 'react-markdown'
import {
  Zap,
  Globe,
  Shield,
  Server,
  Activity,
  Check,
  AlertOctagon,
  Command,
  Play,
  PhoneCall,
  MapPin,
  Loader2,
  Terminal as TerminalIcon,
  Cpu,
  Wifi,
  AlertCircle,
  Trash2 // <--- Added Icon for Clear
} from "lucide-react"
import Link from "next/link"

// --- PRO COMPONENTS ---

const GrainOverlay = () => (
  <div 
    className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
    }}
  />
)

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

// --- SYSTEM CHECK COMPONENT ---
function SystemReadyCheck() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev < 3 ? prev + 1 : prev))
    }, 600)
    return () => clearInterval(interval)
  }, [])

  const items = [
    { label: "Core Neural Engine", icon: Server },
    { label: "Global Node Network", icon: Globe },
    { label: "Secure Uplink", icon: Shield },
  ]

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center text-xs font-mono text-slate-500 mb-8">
      {items.map((item, i) => (
        <div key={i} className={cn("flex items-center gap-2 transition-opacity duration-500", step >= i + 1 ? "opacity-100" : "opacity-30")}>
           <div className={cn("h-4 w-4 rounded-full flex items-center justify-center border", step >= i + 1 ? "border-emerald-500 bg-emerald-500/10 text-emerald-500" : "border-slate-700")}>
             {step >= i + 1 && <Check className="h-2 w-2" />}
           </div>
           <span>{item.label}</span>
        </div>
      ))}
    </div>
  )
}

// --- LIVE TERMINAL COMPONENT ---
function LiveTerminal() {
  const [input, setInput] = useState("")
  const [history, setHistory] = useState<{ type: 'user' | 'system' | 'ai' | 'error', content: string }[]>([])
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isBooted, setIsBooted] = useState(false)

  // Boot Effect
  useEffect(() => {
    const bootSequence = async () => {
      const msgs = [
        "initializing medguard_kernel_v2.4...",
        "establishing secure handshake...",
        "connecting to neural_core @ onrender...",
        "system_ready. awaiting input."
      ]
      
      for (const msg of msgs) {
        await new Promise(r => setTimeout(r, 600))
        setHistory(prev => [...prev, { type: 'system', content: msg }])
      }
      setIsBooted(true)
    }
    bootSequence()
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [history, loading])

  // --- NEW: CLEAR CHAT FUNCTION ---
  const handleClear = () => {
    // Keep only the "System Ready" message to maintain context, remove conversation
    setHistory([{ type: 'system', content: 'system_ready. memory flushed. awaiting new input.' }])
  }

  const handleSend = async () => {
    if (!input.trim() || !isBooted) return

    const userMsg = input
    setInput("")
    setHistory(prev => [...prev, { type: 'user', content: userMsg }])
    setLoading(true)

    try {
      console.log("Sending Request to API...");
      
      const res = await fetch("https://medguard-back-end.onrender.com/ask", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json" 
        },
        body: JSON.stringify({ prompt: userMsg }),
      })

      if (!res.ok) {
        const errText = await res.text().catch(() => res.statusText);
        throw new Error(`Server Error (${res.status}): ${errText}`);
      }

      const data = await res.json()
      const aiResponse = data.response || data.message || data.reply || JSON.stringify(data)

      setHistory(prev => [...prev, { type: 'ai', content: aiResponse }])

    } catch (error: any) {
      console.error("Fetch Error:", error);
      let errorMessage = "Connection Failed";
      
      if (error.name === "TypeError" && error.message === "Failed to fetch") {
        errorMessage = "Network Error: Could not connect to MedGuard server. Check your connection.";
      } else {
        errorMessage = error.message || "Unknown Error";
      }

      setHistory(prev => [...prev, { type: 'error', content: `CRITICAL ERROR: ${errorMessage}` }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleSend()
    }
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0a0a0a] overflow-hidden shadow-2xl font-mono text-sm relative group">
      {/* Decorative Glow */}
      <div className="absolute inset-0 bg-blue-500/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      {/* Terminal Header */}
      <div className="bg-[#111] px-4 py-3 border-b border-slate-800 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
          </div>
          <div className="text-[10px] text-slate-500 font-bold tracking-widest hidden sm:block">
            MEDGUARD_LIVE_KERNEL // SSH_SECURE
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-4">
           {/* Clear Button */}
           <button 
             onClick={handleClear}
             className="text-slate-600 hover:text-red-400 transition-colors flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider"
             title="Clear Terminal"
           >
             <Trash2 className="h-3 w-3" /> Clear
           </button>
           
           <Wifi className={cn("h-3 w-3", isBooted ? "text-emerald-500" : "text-slate-600")} />
        </div>
      </div>

      {/* Terminal Body */}
      <div 
        ref={scrollRef}
        className="p-6 h-[320px] overflow-y-auto space-y-4 font-mono relative z-10 scroll-smooth"
      >
        {history.map((msg, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              "leading-relaxed break-words",
              msg.type === 'system' && "text-slate-500 text-xs italic",
              msg.type === 'user' && "text-blue-400 font-bold mt-6 border-l-2 border-blue-500/50 pl-3",
              msg.type === 'ai' && "text-emerald-400 border-l-2 border-emerald-500/50 pl-3",
              msg.type === 'error' && "text-red-400 bg-red-950/20 p-2 rounded border border-red-900/50 flex gap-2 items-start mt-2"
            )}
          >
            {msg.type === 'system' && <span className="text-slate-700 mr-2">$</span>}
            
            {msg.type === 'user' && (
              <span className="text-blue-600 mr-2 text-[10px] uppercase tracking-wider block mb-1">
                User Input
              </span>
            )}
            
            {msg.type === 'ai' && (
              <span className="text-emerald-600 mr-2 text-[10px] uppercase tracking-wider block mb-1">
                MedGuard Diagnostics
              </span>
            )}

            {msg.type === 'error' && <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />}
            
            {/* RENDER CONTENT */}
            {msg.type === 'ai' ? (
              <div className="prose prose-invert prose-sm max-w-none text-emerald-400">
                <ReactMarkdown
                  components={{
                    p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                    li: ({node, ...props}) => <li className="pl-1" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-bold text-emerald-300" {...props} />,
                    a: ({node, ...props}) => <a className="underline decoration-emerald-500/50 hover:text-emerald-300" {...props} />,
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            ) : (
              msg.content
            )}
          </motion.div>
        ))}
        
        {loading && (
          <div className="flex items-center gap-2 text-slate-500 mt-4 animate-pulse">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>processing_triage_algorithms...</span>
          </div>
        )}
        
        {/* Blinking Cursor at bottom */}
        {!loading && isBooted && (
           <div className="h-4 w-2 bg-slate-500 animate-pulse mt-2" />
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-800 bg-[#0f0f0f] flex gap-4 relative z-10">
        <div className="flex-1 relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading || !isBooted}
            placeholder={isBooted ? "Enter symptoms (e.g., 'Severe headache and fever')" : "Booting..."}
            className="w-full bg-transparent border-none text-white focus:ring-0 placeholder:text-slate-700 font-mono text-sm h-full"
            autoFocus
          />
        </div>
        <Button 
          onClick={handleSend} 
          disabled={loading || !isBooted}
          size="sm"
          className="bg-blue-600 hover:bg-blue-500 text-white font-mono min-w-[80px]"
        >
          {loading ? "..." : "RUN"} <Play className="h-3 w-3 ml-2 fill-current" />
        </Button>
      </div>
    </div>
  )
}

// --- SMART EMERGENCY BUTTON ---
function SmartEmergencyButton() {
  const [location, setLocation] = useState("Detecting Region...")
  const [number, setNumber] = useState("...")
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const timer = setTimeout(() => {
      if (timeZone.includes("Lagos") || timeZone.includes("Africa")) {
        setLocation("NIGERIA DETECTED")
        setNumber("112")
      } else {
        setLocation("GLOBAL GSM DETECTED")
        setNumber("112") 
      }
      setIsReady(true)
    }, 1500) 

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="w-full flex flex-col items-center">
      <Button 
        asChild
        variant="destructive" 
        size="lg" 
        className={cn(
          "h-24 px-8 text-lg font-bold rounded-2xl shadow-[0_0_30px_rgba(225,29,72,0.4)] w-full sm:w-auto transition-all duration-500",
          isReady ? "animate-pulse" : "opacity-80 cursor-wait"
        )}
      >
         <a href={`tel:${number}`}>
           <div className="flex flex-col items-center justify-center gap-1">
              <div className="flex items-center gap-2">
                 <PhoneCall className="h-6 w-6" />
                 {isReady ? (
                   <span>DIAL {number} NOW</span>
                 ) : (
                   <span className="flex items-center gap-2">
                     CONNECTING <Loader2 className="h-4 w-4 animate-spin" />
                   </span>
                 )}
              </div>
              
              <div className="text-[10px] opacity-80 font-mono font-normal flex items-center gap-2 mt-1">
                 {isReady ? (
                   <>
                     <MapPin className="h-3 w-3" /> {location}
                   </>
                 ) : (
                   <>
                     <Globe className="h-3 w-3 animate-pulse" /> TRIANGULATING LOCATION...
                   </>
                 )}
              </div>
           </div>
         </a>
      </Button>
      
      <p className="mt-4 text-xs text-slate-500 font-mono">
        {isReady && number === "112" ? "Routing via NCC Emergency Gateway" : "Secure Emergency Line"}
      </p>
    </div>
  )
}

// --- PAGE COMPONENT ---

export default function LaunchPage() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30 selection:text-blue-200">
      <GrainOverlay />
      <Navigation />

      {/* --- HERO: INITIALIZE --- */}
      <section className="relative pt-32 pb-20 overflow-hidden min-h-[85vh] flex flex-col justify-center items-center">
        {/* Background pulses */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
        
        <div className="relative z-10 text-center px-4 w-full max-w-5xl">
           <SystemReadyCheck />

           <motion.div
             initial={{ scale: 0.9, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ duration: 0.8 }}
           >
             <TextReveal 
               text="Initialize MedGuard." 
               className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-8"
             />
           </motion.div>

           <motion.p 
             initial={{ y: 20, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ delay: 0.5 }}
             className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto"
           >
             Emergency protocols loaded. Standby for input. Select your interface to begin.
           </motion.p>

           {/* THE BIG BUTTON */}
           <motion.div
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ delay: 0.8, type: "spring" }}
             className="relative group inline-block"
           >
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />
              <Button asChild size="lg" className="relative h-24 px-12 rounded-full bg-white text-slate-950 text-2xl font-bold hover:bg-blue-50 hover:scale-105 transition-all shadow-2xl flex items-center gap-4 cursor-pointer">
                 {/* UPDATED LINK */}
                 <Link href="https://med-guard-ai.vercel.app">
                    <Zap className="h-8 w-8 text-blue-600 fill-blue-600" />
                    LAUNCH WEB APP
                 </Link>
              </Button>
           </motion.div>
           
           <p className="mt-8 text-sm text-slate-500 font-mono">
              v2.4.0 (Stable) • No Install Required • Global Access
           </p>
        </div>
      </section>

      {/* --- LIVE SIMULATION TERMINAL --- */}
      <section className="py-24 border-t border-white/5 bg-slate-900/20">
         <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                     <TerminalIcon className="h-6 w-6 text-blue-500" /> Live Diagnostics Kernel
                  </h2>
                  <p className="text-slate-400 text-sm">Direct connection to MedGuard Neural Core.</p>
               </div>
               <div className="flex items-center gap-2 px-3 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono animate-pulse">
                  <Activity className="h-3 w-3" /> API: ONLINE
               </div>
            </div>

            {/* THE NEW LIVE TERMINAL */}
            <LiveTerminal />
            
         </div>
      </section>

      {/* --- SAFETY OVERRIDE --- */}
      <section className="pb-24 pt-12">
         <div className="mx-auto max-w-3xl px-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded bg-rose-950/30 border border-rose-900/50 text-rose-400 mb-6">
               <AlertOctagon className="h-5 w-5" />
               <span className="font-bold tracking-wide uppercase text-sm">Critical Override</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Is this a life-threatening emergency?</h3>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto">
               If the patient is not breathing, has no pulse, or is bleeding heavily, use the emergency line.
            </p>
            
            <SmartEmergencyButton />
            
         </div>
      </section>

      <Footer />
    </div>
  )
}