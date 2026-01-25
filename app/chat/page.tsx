"use client"

import React, { useState, useEffect, useMemo, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation" 
import { ChatInput } from "@/components/chat-input"
import { ChatMessage } from "@/components/chat-message" 
import { Loader2, Lock, Sparkles, X, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { createPortal } from "react-dom" 

// 1. IMPORT PROXY 
import { api } from "@/lib/proxy" 
import { useChatContext } from "@/components/context/chat-context"

// 2. IMPORT EXISTING MODALS
import { ComingSoonModal } from "@/components/modals/coming-soon-modal"

// --- STRICT INTERFACE ---
interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: string
}

// --- NEW: PREMIUM LIMIT MODAL ---
function PremiumLimitModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0A051E]/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-[#1C1246] border border-[#DA8CA0]/50 rounded-3xl p-8 shadow-2xl overflow-hidden text-center"
          >
             {/* Decorative Background */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-[#DA8CA0]/10 rounded-full blur-[50px] pointer-events-none" />

             <button onClick={onClose} className="absolute top-4 right-4 text-[#CCCCD9] hover:text-white transition-colors">
               <X className="h-5 w-5" />
             </button>

             <div className="flex flex-col items-center gap-5 relative z-10">
                <div className="w-20 h-20 bg-gradient-to-tr from-[#DA8CA0] to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <Lock className="w-9 h-9 text-white" />
                </div>
                
                <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Daily Limit Reached 🌸</h3>
                    <p className="text-[#CCCCD9]/80 text-sm leading-relaxed">
                        You have sent <b>50 messages</b> today! To continue your healing journey without interruptions, upgrade to <b>Heal Her Premium</b>.
                    </p>
                </div>

                <div className="flex flex-col gap-3 w-full bg-[#150E32] p-4 rounded-xl border border-white/5 text-left">
                    <div className="flex items-center gap-3 text-sm text-[#CCCCD9]">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Unlimited Messages
                    </div>
                    <div className="flex items-center gap-3 text-sm text-[#CCCCD9]">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Faster AI Responses
                    </div>
                    <div className="flex items-center gap-3 text-sm text-[#CCCCD9]">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Image & Voice Analysis
                    </div>
                </div>

                <button 
                  onClick={() => window.open('/pricing', '_blank')} 
                  className="w-full h-12 bg-white hover:bg-[#DA8CA0] hover:text-white text-[#1C1246] font-bold text-base rounded-xl transition-all shadow-xl hover:shadow-2xl hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" /> Upgrade for $5/mo
                </button>
                
                <button onClick={onClose} className="text-xs text-[#CCCCD9]/50 hover:text-white hover:underline transition-colors">
                    I'll wait until tomorrow
                </button>
             </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]) 
  const [isGenerating, setIsGenerating] = useState(false)
  
  const [userName, setUserName] = useState("") 
  const [userId, setUserId] = useState<string>("") 
  
  // MODAL STATES
  const [showComingSoon, setShowComingSoon] = useState(false)
  const [showPremiumModal, setShowPremiumModal] = useState(false) // <--- NEW STATE
  const [mounted, setMounted] = useState(false)

  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isDataLoading, setIsDataLoading] = useState(true)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const urlSessionId = searchParams.get("session_id")
  
  const { refreshSessions } = useChatContext()

  // HANDLE HYDRATION
  useEffect(() => {
    setMounted(true)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isGenerating])

  // --- FETCH USER DATA & HISTORY ---
  useEffect(() => {
    let isMounted = true 

    const initData = async () => {
      const token = sessionStorage.getItem("sb-access-token")
      const cachedUserId = sessionStorage.getItem("user-id")
      
      if (cachedUserId && isMounted) setUserId(cachedUserId)

      if (!token) {
        if (isMounted) setIsDataLoading(false)
        return
      }

      try {
        let activeUserId = cachedUserId 

        try {
            const { data } = await api.get("/profile/me")
            if (isMounted && data) {
              const name = data.full_name || data.name || "Friend"
              setUserName(name)
              if (data.id) {
                setUserId(data.id)
                activeUserId = data.id
                sessionStorage.setItem("user-id", data.id)
              }
            }
        } catch (profileError) {
            console.warn("⚠️ Profile sync minor issue:", profileError)
        }

        if (activeUserId) {
          if (urlSessionId) {
            if (urlSessionId !== sessionId) {
              if (isMounted) setSessionId(urlSessionId)
              await fetchHistory(urlSessionId, activeUserId, isMounted)
            }
          } else {
            if (sessionId !== null || messages.length > 0) {
              if (isMounted) {
                setSessionId(null)
                setMessages([]) 
              }
            }
          }
        } else {
            console.error("❌ Critical: No User ID available.")
        }

      } catch (error) {
        console.error("Failed to load data:", error)
      } finally {
        if (isMounted) setTimeout(() => setIsDataLoading(false), 500)
      }
    }

    initData()
    return () => { isMounted = false }
  }, [urlSessionId]) 


  const fetchHistory = async (sessId: string, uid: string, isMounted: boolean) => {
    try {
      if (isMounted) setIsDataLoading(true) 
      const response = await api.get(`/history/${sessId}`, { params: { user_id: uid } })
      const historyData = response.data
      
      if (isMounted && Array.isArray(historyData)) {
        const validMessages: Message[] = historyData
          .filter((msg: any) => msg.role === "user" || msg.role === "assistant")
          .map((msg: any) => ({
            id: msg.id || Math.random().toString(), 
            role: msg.role as "user" | "assistant",
            content: msg.content, 
            createdAt: msg.created_at || new Date().toISOString()
          }))
        setMessages(validMessages)
      }
    } catch (err) {
      console.error("Failed to fetch history", err)
    } finally {
      if (isMounted) setIsDataLoading(false)
    }
  }

  // --- TYPEWRITER LOGIC ---
  const [text, setText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [loopNum, setLoopNum] = useState(0)
  const [typingSpeed, setTypingSpeed] = useState(100)

  const phrases = useMemo(() => [
    `Welcome ${userName ? userName : "dear"} 😊`, 
    "Let's talk about your body 🌸",
    "Let's grow together 🦋",
    "Let's ask the awkward questions 💭",
    "I am here to listen ❤️",        
    "This is your safe space ☁️",    
    "Let's break the stigma ✨",      
    "Let's prioritize you 🎀"
  ], [userName]) 

  useEffect(() => {
    if (isDataLoading || messages.length > 0) return 
    const i = loopNum % phrases.length
    const fullText = phrases[i]
    if (!fullText) return

    const currentStarts = fullText.startsWith("Let's")
    const nextIndex = (loopNum + 1) % phrases.length
    const nextText = phrases[nextIndex]
    const nextStarts = nextText?.startsWith("Let's") || false
    const deleteStopPoint = (currentStarts && nextStarts) ? 6 : 0

    const handleTyping = () => {
      if (!isDeleting) {
        setText(fullText.substring(0, text.length + 1))
        setTypingSpeed(100) 
        if (text === fullText) setTimeout(() => setIsDeleting(true), 2000)
      } else {
        setText(fullText.substring(0, text.length - 1))
        setTypingSpeed(40) 
        if (text.length <= deleteStopPoint) {
          setIsDeleting(false)
          setLoopNum(loopNum + 1)
          if (deleteStopPoint === 6) setText("Let's ")
        }
      }
    }
    const timer = setTimeout(handleTyping, typingSpeed)
    return () => clearTimeout(timer)
  }, [text, isDeleting, loopNum, phrases, typingSpeed, isDataLoading, messages.length])


  // --- SEND MESSAGE (UPDATED) ---
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isGenerating) return
    
    if (!userId) {
      console.error("❌ User ID is missing! Cannot send message.")
      return 
    }

    const userMsg: Message = { 
      id: Date.now().toString(), role: "user", content, createdAt: new Date().toISOString()
    }
    
    setMessages(prev => [...prev, userMsg])
    setIsGenerating(true)

    try {
      const payload = { user_id: userId, message: content, session_id: sessionId }
      const response = await api.post("/chat", payload)
      const data = response.data 

      if (!sessionId && data.session_id) {
        setSessionId(data.session_id)
        window.history.pushState(null, '', `?session_id=${data.session_id}`)
        await refreshSessions() 
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(), role: "assistant", content: data.response, createdAt: new Date().toISOString()
      }
      setMessages(prev => [...prev, aiMsg])

    } catch (error: any) {
      // --- 🆕 CHECK FOR 402 (DAILY LIMIT) ---
      // This catches the specific exception thrown by your backend service
      if (error.response && error.response.status === 402) {
          setShowPremiumModal(true) // Open the upsell modal
          
          // Optional: Remove the user's message since it wasn't processed
          // setMessages(prev => prev.filter(m => m.id !== userMsg.id))
      } else {
          console.error("Chat Error:", error)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handleStopGeneration = () => setIsGenerating(false)
  const handleDeleteMessage = (id: string) => setMessages(prev => prev.filter(m => m.id !== id))
  const showTypewriter = messages.length === 0

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto">
      
      {/* CHAT FEED */}
      <div className="flex-1 overflow-y-auto w-full p-4 md:p-6 scrollbar-none">
        {showTypewriter ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="max-w-4xl min-h-[120px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                {isDataLoading ? (
                  <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-[#DA8CA0]/40" />
                    <p className="text-xs text-[#CCCCD9]/40 italic font-serif tracking-[0.2em] uppercase">Loading conversation...</p>
                  </motion.div>
                ) : (
                  <motion.h1 key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl md:text-5xl font-serif italic font-medium tracking-wide text-white leading-tight drop-shadow-sm">
                    <span>{text}</span><span className="ml-1 animate-pulse font-light text-[#DA8CA0]">|</span>
                  </motion.h1>
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 pb-4">
            {messages.map((msg) => (
              <ChatMessage 
                key={msg.id} 
                message={msg} 
                onDelete={handleDeleteMessage}
                onFeatureNotAvailable={() => setShowComingSoon(true)}
              />
            ))}
            {isGenerating && (
              <ChatMessage message={{ id: "thinking", role: "assistant", content: "", createdAt: "" }} isThinking={true} />
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* INPUT AREA */}
      <div className="w-full relative z-30 pt-2 pb-4 px-4">
        <ChatInput 
          onSendMessage={handleSendMessage}
          onStopGeneration={handleStopGeneration}
          isGenerating={isGenerating}
        />
      </div>

      {/* MODALS RENDERED VIA PORTAL */}
      {mounted && createPortal(
        <>
            {/* 1. Feature Coming Soon */}
            {showComingSoon && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={(e) => { if (e.target === e.currentTarget) setShowComingSoon(false) }}>
                    <ComingSoonModal isOpen={true} onClose={() => setShowComingSoon(false)} />
                </div>
            )}

            {/* 2. Premium Limit Reached (NEW) */}
            <PremiumLimitModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} />
        </>,
        document.body
      )}

    </div>
  )
}