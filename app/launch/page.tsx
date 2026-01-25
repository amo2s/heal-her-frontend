"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, useMotionTemplate, useMotionValue, Variants, AnimatePresence } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import ReactMarkdown from 'react-markdown'
import { useRouter } from "next/navigation"
import {
  Zap, Globe, Shield, Activity, Check, AlertOctagon,
  PhoneCall, MapPin, Loader2, Terminal as TerminalIcon,
  Wifi, AlertCircle, Trash2, Heart, MessageCircle,
  Lock, Sparkles, ArrowUp, Plus, Mic, Image as ImageIcon,
  FileText, X, LogIn
} from "lucide-react"
import Link from "next/link"

// --- UTILS & VISUALS ---

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

// --- MODALS ---

// 1. COMING SOON MODAL (For Plus Menu)
function ComingSoonModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#160d33]/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-sm bg-[#231854] border border-[#DA8CA0]/30 rounded-3xl p-6 shadow-2xl overflow-hidden"
          >
             <button onClick={onClose} className="absolute top-4 right-4 text-[#CCCCD9] hover:text-white"><X className="h-5 w-5" /></button>
             <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#DA8CA0]/10 border border-[#DA8CA0]/30 flex items-center justify-center mb-2">
                   <Sparkles className="h-8 w-8 text-[#DA8CA0] animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-white">Upgrade Incoming</h3>
                <p className="text-[#CCCCD9] text-sm leading-relaxed">This feature is in development. <br/>Stay tuned for <span className="text-[#DA8CA0] font-bold">Heal Her v2.0</span>.</p>
                <Button onClick={onClose} className="w-full bg-white/10 hover:bg-white/20 text-white mt-4 border border-white/5">Got it</Button>
             </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// 2. LIMIT REACHED MODAL (For The 3 Message Limit)
function LimitModal({ isOpen }: { isOpen: boolean }) {
    const router = useRouter()
    const [isRedirecting, setIsRedirecting] = useState(false)

    const handleLoginRedirect = async () => {
        setIsRedirecting(true)
        // Simulate a small delay for effect
        await new Promise(resolve => setTimeout(resolve, 1000))
        router.push("/login")
    }

    return (
      <AnimatePresence>
        {isOpen && (
          <div className="absolute inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0A051E]/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-[#1C1246] border border-[#DA8CA0]/50 rounded-3xl p-8 shadow-2xl overflow-hidden text-center"
            >
               <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-[#DA8CA0]/10 rounded-full flex items-center justify-center animate-bounce">
                      <Lock className="w-8 h-8 text-[#DA8CA0]" />
                  </div>
                  
                  <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Daily Limit Reached</h3>
                      <p className="text-[#CCCCD9]/80 text-sm leading-relaxed">
                          You've used your 3 free guest messages. <br/>
                          To continue your healing journey unlimited, please access your safe space.
                      </p>
                  </div>

                  <Button 
                    onClick={handleLoginRedirect}
                    disabled={isRedirecting}
                    className="w-full h-12 mt-2 bg-[#DA8CA0] hover:bg-[#c76b85] text-[#1C1246] font-bold text-base rounded-xl transition-all shadow-[0_4px_20px_rgba(218,140,160,0.25)] hover:scale-[1.02]"
                  >
                    {isRedirecting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            Redirecting...
                        </>
                    ) : (
                        "Login for Unlimited Chat"
                    )}
                  </Button>
                  
                  <p className="text-[10px] text-[#CCCCD9]/40 uppercase tracking-widest mt-2">Free Forever • Secure • Anonymous</p>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    )
}

// --- LIVE TERMINAL COMPONENT ---

function LiveTerminal() {
  const [input, setInput] = useState("")
  const [history, setHistory] = useState<{ type: 'user' | 'system' | 'ai' | 'error', content: string }[]>([])
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isBooted, setIsBooted] = useState(false)
  
  // STATE FOR FEATURES & LIMITS
  const [showPlusMenu, setShowPlusMenu] = useState(false)
  const [showComingSoon, setShowComingSoon] = useState(false)
  const [showLimitModal, setShowLimitModal] = useState(false)
  
  // FINGERPRINTING STATE
  const [fingerprint, setFingerprint] = useState("")
  // We keep a local count just for UI "msgs left" visual, but Backend enforces the real block.
  const [localUiCount, setLocalUiCount] = useState(0)

  useEffect(() => {
    // 1. BOOT
    const timer = setTimeout(() => {
      setIsBooted(true)
    }, 800)
    
    // 2. FINGERPRINT SETUP (Secure ID generation)
    // We only use localStorage to store the ID (Key), not the Logic.
    let storedId = localStorage.getItem("heal_her_device_id")
    if (!storedId) {
        storedId = crypto.randomUUID()
        localStorage.setItem("heal_her_device_id", storedId)
    }
    setFingerprint(storedId)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [history, loading])

  const handleClear = () => setHistory([])

  const handleFeatureClick = () => {
    setShowPlusMenu(false)
    setShowComingSoon(true)
  }

  const handleSend = async () => {
    if (!input.trim() || !isBooted) return

    const userMsg = input
    setInput("")
    setHistory(prev => [...prev, { type: 'user', content: userMsg }])
    setLoading(true)

    try {
      // --- SECURE BACKEND CALL ---
      // We send the fingerprint. The Backend checks the DB.
      const res = await fetch("http://127.0.0.1:8000/guest-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ 
            fingerprint: fingerprint,
            message: userMsg 
        }),
      })

      // --- THE GATEKEEPER CHECK ---
      if (res.status === 403) {
          setShowLimitModal(true)
          setLocalUiCount(3) // Force UI to show 0 left
          setLoading(false)
          return
      }

      if (!res.ok) throw new Error(`Server Error (${res.status})`);

      const data = await res.json()
      const aiResponse = data.response 

      setHistory(prev => [...prev, { type: 'ai', content: aiResponse }])
      setLocalUiCount(prev => prev + 1)

    } catch (error: any) {
      console.error(error)
      setHistory(prev => [...prev, { type: 'error', content: "Connection failed. Please check your internet." }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !loading) {
        e.preventDefault()
        handleSend()
    }
  }

  return (
    <>
      <style jsx global>{`
        .custom-scroll::-webkit-scrollbar { width: 5px; }
        .custom-scroll::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.01); }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(218, 140, 160, 0.2); border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: rgba(218, 140, 160, 0.4); }
      `}</style>

      <div className="rounded-3xl border border-[#DA8CA0]/20 bg-[#160d33]/80 backdrop-blur-xl overflow-hidden shadow-2xl relative group h-[600px] flex flex-col">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#DA8CA0]/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px] pointer-events-none" />

        {/* MODALS INSIDE THE CARD CONTEXT */}
        <ComingSoonModal isOpen={showComingSoon} onClose={() => setShowComingSoon(false)} />
        <LimitModal isOpen={showLimitModal} />

        {/* --- HEADER --- */}
        <div className="bg-[#1C1246]/50 px-6 py-4 border-b border-white/5 flex items-center justify-between relative z-10 backdrop-blur-md">
          <div className="flex items-center gap-4">
             <div className="flex gap-1.5">
               <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
               <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
               <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
             </div>
             <div className="flex flex-col">
                <span className="text-sm text-white font-bold tracking-wide flex items-center gap-2">
                  Heal Her <span className="text-[10px] bg-[#DA8CA0]/20 text-[#DA8CA0] px-1.5 rounded uppercase tracking-wider">v1.0</span>
                </span>
                <span className="text-[10px] text-[#CCCCD9] opacity-60">Secure End-to-End Encryption</span>
             </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="text-[10px] font-mono text-[#DA8CA0] bg-[#DA8CA0]/10 px-2 py-1 rounded border border-[#DA8CA0]/20">
                {/* Visual indicator only, actual block is backend */}
                {Math.max(0, 3 - localUiCount)} msgs left
             </div>
             <button onClick={handleClear} className="p-2 hover:bg-white/5 rounded-full transition-colors text-[#CCCCD9] hover:text-white" title="Clear Chat">
               <Trash2 className="h-4 w-4" />
             </button>
             <div className="h-4 w-[1px] bg-white/10" />
             <Wifi className={cn("h-4 w-4", isBooted ? "text-emerald-500" : "text-slate-600")} />
          </div>
        </div>

        {/* --- CHAT AREA --- */}
        <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto custom-scroll space-y-6 relative z-10">
          {history.length === 0 && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center text-center gap-6 select-none">
                <div className="relative">
                   <div className="absolute inset-0 bg-[#DA8CA0]/20 blur-[40px] rounded-full animate-pulse" />
                   <img src="/heal-logo.png" alt="Heal Her Logo" className="w-20 h-20 rounded-full object-cover border-2 border-white/10 shadow-[0_0_30px_rgba(218,140,160,0.3)] relative z-10"/>
                </div>
                <div className="space-y-2 max-w-xs mx-auto">
                   <h3 className="text-xl font-bold text-white tracking-tight">I'm here for you, sis. 🌸</h3>
                   <p className="text-sm text-[#CCCCD9]/80 font-mono leading-relaxed">This is a safe, judgment-free space to vent, cry, or just chat. <br/><span className="text-[#DA8CA0]">How are you feeling today? 💖</span></p>
                </div>
             </motion.div>
          )}

          <AnimatePresence>
            {history.map((msg, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={cn("flex w-full", msg.type === 'user' ? "justify-end" : "justify-start")}
              >
                <div className={cn("flex gap-3 max-w-[85%] items-start", msg.type === 'user' ? "flex-row-reverse" : "flex-row")}>
                  {msg.type !== 'user' && (
                    <div className="shrink-0 mt-1 relative group">
                       {msg.type === 'ai' || msg.type === 'system' ? (
                         <img src="/heal-logo.png" alt="Heal Her" className="w-9 h-9 rounded-full object-cover border border-white/10 shadow-[0_0_15px_rgba(218,140,160,0.2)]"/>
                       ) : (
                         <div className="w-9 h-9 rounded-full bg-red-900/20 border border-red-500/20 flex items-center justify-center"><AlertCircle className="h-4 w-4 text-red-400" /></div>
                       )}
                    </div>
                  )}
                  <div className={cn("text-sm leading-relaxed", msg.type === 'user' ? "bg-[#2A1F5E] border border-white/10 text-gray-100 font-medium rounded-2xl rounded-tr-sm p-3.5 backdrop-blur-sm shadow-md" : msg.type === 'error' ? "bg-red-950/50 border border-red-500/20 text-red-200 rounded-2xl p-3.5" : "bg-transparent text-[#FAFAFA] px-1 py-1.5" )}>
                      {msg.type === 'ai' ? (
                        <div className="prose prose-invert prose-sm max-w-none">
                          <ReactMarkdown components={{ p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />, a: ({node, ...props}) => <a className="text-[#DA8CA0] hover:underline" {...props} /> }}>{msg.content}</ReactMarkdown>
                        </div>
                      ) : ( msg.content )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start w-full mt-2">
               <div className="flex gap-3 items-center">
                   <div className="relative">
                      <div className="absolute -inset-1 rounded-full border-2 border-transparent border-t-[#DA8CA0] border-r-[#DA8CA0]/50 animate-spin" />
                      <img src="/heal-logo.png" alt="Heal Her" className="w-9 h-9 rounded-full object-cover border border-white/10 relative z-10" />
                   </div>
                   <span className="text-xs text-[#CCCCD9]/50 animate-pulse font-mono tracking-widest">THINKING...</span>
               </div>
            </motion.div>
          )}
        </div>

        {/* --- INPUT AREA --- */}
        <div className="p-4 relative z-20">
           <AnimatePresence>
             {showPlusMenu && (
               <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute bottom-20 left-6 bg-[#1C1246]/95 border border-[#DA8CA0]/20 backdrop-blur-xl rounded-2xl p-2 shadow-2xl flex flex-col gap-1 w-48 z-50">
                 <button onClick={handleFeatureClick} className="flex items-center gap-3 w-full p-2 hover:bg-white/10 rounded-xl text-left text-sm text-[#CCCCD9] hover:text-white transition-colors">
                    <div className="p-1.5 bg-[#DA8CA0]/20 rounded-lg text-[#DA8CA0]"><ImageIcon className="h-4 w-4"/></div> Upload Images
                 </button>
                 <button onClick={handleFeatureClick} className="flex items-center gap-3 w-full p-2 hover:bg-white/10 rounded-xl text-left text-sm text-[#CCCCD9] hover:text-white transition-colors">
                    <div className="p-1.5 bg-purple-500/20 rounded-lg text-purple-300"><FileText className="h-4 w-4"/></div> Add Files
                 </button>
               </motion.div>
             )}
           </AnimatePresence>

          <div className="relative flex items-end gap-2 bg-[#1C1246] border border-[#DA8CA0]/20 rounded-3xl p-2 shadow-xl transition-all duration-300 focus-within:border-[#DA8CA0]/50 focus-within:shadow-[0_0_20px_rgba(218,140,160,0.1)]">
              <button onClick={() => setShowPlusMenu(!showPlusMenu)} className={cn("h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-white/10 shrink-0", showPlusMenu ? "bg-white/10 rotate-45 text-white" : "text-[#CCCCD9]")}>
                <Plus className="h-5 w-5" />
              </button>
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading || !isBooted} 
                placeholder={isBooted ? "Type your message here..." : "Initializing..."}
                className="flex-1 bg-transparent border-none text-white focus:ring-0 placeholder:text-gray-500 text-sm py-3 min-h-[44px] max-h-[120px] resize-none outline-none custom-scroll"
                rows={1}
              />
              <div className="flex items-center gap-1 pb-1">
                 <button onClick={handleFeatureClick} className="h-8 w-8 rounded-full flex items-center justify-center text-[#CCCCD9] hover:text-white hover:bg-white/10 transition-colors"><Mic className="h-4 w-4" /></button>
                 <Button onClick={handleSend} disabled={loading || !isBooted || !input.trim()} size="icon" className={cn("rounded-full h-9 w-9 transition-all duration-300", input.trim() ? "bg-[#DA8CA0] hover:bg-[#c76b85] text-[#1C1246]" : "bg-[#2A1F5E] text-gray-500")}>
                   {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-5 w-5" />}
                 </Button>
              </div>
          </div>
          <div className="text-center mt-2 flex justify-center gap-4">
              <span className="text-[10px] text-[#CCCCD9]/40 font-mono">Press Enter to send</span>
          </div>
        </div>
      </div>
    </>
  )
}

// --- SYSTEM READY & EMERGENCY COMPS (UNCHANGED) ---
function SystemReadyCheck() {
  const [step, setStep] = useState(0)
  useEffect(() => { const interval = setInterval(() => setStep((prev) => (prev < 3 ? prev + 1 : prev)), 600); return () => clearInterval(interval) }, [])
  const items = [{ label: "Empathy Engine", icon: Heart }, { label: "Privacy Core", icon: Lock }, { label: "Knowledge Base", icon: Globe }]
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center text-xs font-mono text-[#CCCCD9] mb-8">
      {items.map((item, i) => (
        <div key={i} className={cn("flex items-center gap-2 transition-opacity duration-500", step >= i + 1 ? "opacity-100" : "opacity-30")}>
           <div className={cn("h-4 w-4 rounded-full flex items-center justify-center border", step >= i + 1 ? "border-emerald-500 bg-emerald-500/10 text-emerald-500" : "border-slate-700")}>{step >= i + 1 && <Check className="h-2 w-2" />}</div>
           <span>{item.label}</span>
        </div>
      ))}
    </div>
  )
}

function SmartEmergencyButton() {
  const [location, setLocation] = useState("Detecting Region...")
  const [number, setNumber] = useState("...")
  const [isReady, setIsReady] = useState(false)
  useEffect(() => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const timer = setTimeout(() => {
      if (timeZone.includes("Lagos") || timeZone.includes("Africa")) { setLocation("NIGERIA DETECTED"); setNumber("112") } else { setLocation("GLOBAL GSM DETECTED"); setNumber("112") }
      setIsReady(true)
    }, 1500) 
    return () => clearTimeout(timer)
  }, [])
  return (
    <div className="w-full flex flex-col items-center">
      <Button asChild variant="destructive" size="lg" className={cn("h-24 px-8 text-lg font-bold rounded-2xl shadow-[0_0_30px_rgba(225,29,72,0.4)] w-full sm:w-auto transition-all duration-500", isReady ? "animate-pulse" : "opacity-80 cursor-wait")}>
          <a href={`tel:${number}`}>
            <div className="flex flex-col items-center justify-center gap-1">
              <div className="flex items-center gap-2"><PhoneCall className="h-6 w-6" />{isReady ? <span>DIAL {number} NOW</span> : <span className="flex items-center gap-2">CONNECTING <Loader2 className="h-4 w-4 animate-spin" /></span>}</div>
              <div className="text-[10px] opacity-80 font-mono font-normal flex items-center gap-2 mt-1">{isReady ? <><MapPin className="h-3 w-3" /> {location}</> : <><Globe className="h-3 w-3 animate-pulse" /> TRIANGULATING LOCATION...</>}</div>
            </div>
          </a>
      </Button>
      <p className="mt-4 text-xs text-[#CCCCD9] font-mono">{isReady && number === "112" ? "Routing via NCC Emergency Gateway" : "Secure Emergency Line"}</p>
    </div>
  )
}

// --- PAGE COMPONENT ---

export default function LaunchPage() {
  return (
    <div className="relative min-h-screen bg-[#1C1246] text-[#FAFAFA] selection:bg-[#DA8CA0]/30 selection:text-[#DA8CA0]">
      <GrainOverlay />
      <Navigation />

      {/* --- HERO: INITIALIZE --- */}
      <section className="relative pt-32 pb-20 overflow-hidden min-h-[85vh] flex flex-col justify-center items-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#DA8CA0]/10 rounded-full blur-3xl animate-pulse" />
        <div className="relative z-10 text-center px-4 w-full max-w-5xl">
           <SystemReadyCheck />
           <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8 }}>
             <TextReveal text="Start Healing." className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-8"/>
           </motion.div>
           <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="text-xl text-[#CCCCD9] mb-12 max-w-2xl mx-auto">
             You are safe here. No judgment, just support. Click below to begin your chat with Heal Her.
           </motion.p>
           
           {/* REDUCED SIZE HERO BUTTON */}
           <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.8, type: "spring" }} className="relative group inline-block">
             <div className="absolute -inset-1 bg-gradient-to-r from-[#DA8CA0] to-purple-500 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />
             <Button asChild size="lg" className="relative h-14 px-8 rounded-full bg-white text-[#1C1246] text-lg font-bold hover:bg-[#DA8CA0] hover:text-white transition-all shadow-xl flex items-center gap-3 cursor-pointer">
                 <Link href="/login"><LogIn className="h-5 w-5" /> Launch Full Chat</Link>
             </Button>
           </motion.div>

           <p className="mt-8 text-sm text-[#CCCCD9] font-mono">v1.0 (Beta) • Free Forever • Anonymous</p>
        </div>
      </section>

      {/* --- LIVE SIMULATION TERMINAL --- */}
      <section className="py-24 border-t border-[#DA8CA0]/10 bg-[#231854]/30">
         <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2"><TerminalIcon className="h-6 w-6 text-[#DA8CA0]" /> Live Preview</h2>
                  <p className="text-[#CCCCD9] text-sm">Test the AI right here before launching the full app.</p>
               </div>
               <div className="flex items-center gap-2 px-3 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono animate-pulse">
                  <Activity className="h-3 w-3" /> ONLINE
               </div>
            </div>
            <LiveTerminal />
         </div>
      </section>

      {/* --- YOUR SAFE SPACE --- */}
      <section className="py-24 border-t border-[#DA8CA0]/10 bg-[#1C1246]">
         <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-8">Your Safe Space</h2>
            <div className="grid md:grid-cols-3 gap-8">
               <SpotlightCard className="p-6 bg-[#231854] border-[#DA8CA0]/10">
                  <Lock className="h-8 w-8 text-[#DA8CA0] mb-4 mx-auto" />
                  <h3 className="text-lg font-bold text-white mb-2">Encrypted</h3>
                  <p className="text-[#CCCCD9] text-sm">Your words are locked away. Only you see them.</p>
               </SpotlightCard>
               <SpotlightCard className="p-6 bg-[#231854] border-[#DA8CA0]/10">
                  <Sparkles className="h-8 w-8 text-purple-400 mb-4 mx-auto" />
                  <h3 className="text-lg font-bold text-white mb-2">Judgment Free</h3>
                  <p className="text-[#CCCCD9] text-sm">Ask anything. We are here to help, not to judge.</p>
               </SpotlightCard>
               <SpotlightCard className="p-6 bg-[#231854] border-[#DA8CA0]/10">
                  <Heart className="h-8 w-8 text-rose-400 mb-4 mx-auto" />
                  <h3 className="text-lg font-bold text-white mb-2">Always Here</h3>
                  <p className="text-[#CCCCD9] text-sm">24/7 support whenever you need a friend.</p>
               </SpotlightCard>
            </div>
         </div>
      </section>

      {/* --- SAFETY OVERRIDE --- */}
      <section className="pb-24 pt-12 border-t border-[#DA8CA0]/10">
         <div className="mx-auto max-w-3xl px-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded bg-rose-950/30 border border-rose-900/50 text-rose-400 mb-6">
               <AlertOctagon className="h-5 w-5" /><span className="font-bold tracking-wide uppercase text-sm">Emergency Mode</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Are you in immediate danger?</h3>
            <p className="text-[#CCCCD9] mb-8 max-w-lg mx-auto">If you or someone else is being hurt, or if you feel unsafe right now, please use this button to call for help.</p>
            <SmartEmergencyButton />
         </div>
      </section>

      <Footer />
    </div>
  )
}