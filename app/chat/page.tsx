"use client"

import React, { useState, useEffect, useMemo, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation" 
import { ChatInput } from "@/components/chat-input"
import { ChatMessage } from "@/components/chat-message" 
import { Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { createPortal } from "react-dom" // ADDED: Required for Modal

// 1. IMPORT PROXY 
import { api } from "@/lib/proxy" 
import { useChatContext } from "@/components/context/chat-context"

// 2. IMPORT THE MODAL (This was missing)
import { ComingSoonModal } from "@/components/modals/coming-soon-modal"

// --- STRICT INTERFACE ---
interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]) 
  const [isGenerating, setIsGenerating] = useState(false)
  
  const [userName, setUserName] = useState("") 
  const [userId, setUserId] = useState<string>("") 
  
  // 3. ADD MODAL STATE (This was missing)
  const [showComingSoon, setShowComingSoon] = useState(false)
  const [mounted, setMounted] = useState(false)

  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isDataLoading, setIsDataLoading] = useState(true)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const urlSessionId = searchParams.get("session_id")
  
  const { refreshSessions } = useChatContext()

  // 4. HANDLE HYDRATION
  useEffect(() => {
    setMounted(true)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isGenerating])

  // --- FETCH USER DATA & HISTORY (SECURED & SYNCED) ---
  useEffect(() => {
    let isMounted = true 

    const initData = async () => {
      const token = sessionStorage.getItem("sb-access-token")
      
      // 1. Immediate Cache Check
      const cachedUserId = sessionStorage.getItem("user-id")
      if (cachedUserId && isMounted) {
        setUserId(cachedUserId)
      }

      if (!token) {
        if (isMounted) setIsDataLoading(false)
        return
      }

      try {
        let activeUserId = cachedUserId 

        // 2. ALWAYS Fetch Profile (Ensures we have the Name + Validates Token)
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

        // 3. Handle Session Logic (The Fix)
        if (activeUserId) {
          if (urlSessionId) {
            // CASE A: User clicked a chat in Sidebar (URL has ID)
            if (urlSessionId !== sessionId) {
              if (isMounted) setSessionId(urlSessionId)
              await fetchHistory(urlSessionId, activeUserId, isMounted)
            }
          } else {
            // CASE B: User clicked "New Chat" or "Delete" (URL is empty)
            // FIX: We forcefully wipe the screen if there's an ID set OR if messages exist
            if (sessionId !== null || messages.length > 0) {
              if (isMounted) {
                setSessionId(null)
                setMessages([]) // <--- This forces the Typewriter view
              }
            }
          }
        } else {
            console.error("❌ Critical: No User ID available.")
        }

      } catch (error) {
        console.error("Failed to load data:", error)
      } finally {
        if (isMounted) {
          setTimeout(() => setIsDataLoading(false), 500)
        }
      }
    }

    initData()

    return () => { isMounted = false }
  }, [urlSessionId]) // Dependency on URL ensures this runs immediately on delete/redirect


  // --- FETCH HISTORY ---
  const fetchHistory = async (sessId: string, uid: string, isMounted: boolean) => {
    try {
      if (isMounted) setIsDataLoading(true) 
      
      const response = await api.get(`/history/${sessId}`, {
        params: { user_id: uid }
      })
      
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
    // Only run typewriter if we have NO messages
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


  // --- SEND MESSAGE ---
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isGenerating) return
    
    if (!userId) {
      console.error("❌ User ID is missing! Cannot send message.")
      return 
    }

    const userMsg: Message = { 
      id: Date.now().toString(), 
      role: "user", 
      content,
      createdAt: new Date().toISOString()
    }
    
    setMessages(prev => [...prev, userMsg])
    setIsGenerating(true)

    try {
      const payload = {
        user_id: userId,
        message: content,
        session_id: sessionId 
      }

      const response = await api.post("/chat", payload)
      const data = response.data 

      if (!sessionId && data.session_id) {
        setSessionId(data.session_id)
        window.history.pushState(null, '', `?session_id=${data.session_id}`)
        await refreshSessions() 
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        createdAt: new Date().toISOString()
      }

      setMessages(prev => [...prev, aiMsg])

    } catch (error) {
      console.error("Chat Error:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleStopGeneration = () => {
    setIsGenerating(false)
  }

  const handleDeleteMessage = (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id))
  }

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
                  <motion.div 
                    key="loader"
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-3"
                  >
                    <Loader2 className="w-8 h-8 animate-spin text-[#DA8CA0]/40" />
                    <p className="text-xs text-[#CCCCD9]/40 italic font-serif tracking-[0.2em] uppercase">
                      Loading conversation...
                    </p>
                  </motion.div>
                ) : (
                  <motion.h1 
                    key="content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-4xl md:text-5xl font-serif italic font-medium tracking-wide text-white leading-tight drop-shadow-sm"
                  >
                    <span>{text}</span>
                    <span className="ml-1 animate-pulse font-light text-[#DA8CA0]">|</span>
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
                // 5. PASS THE MODAL OPENER HERE (This makes the buttons work)
                onFeatureNotAvailable={() => setShowComingSoon(true)}
              />
            ))}
            
            {isGenerating && (
              <ChatMessage 
                message={{ 
                  id: "thinking", 
                  role: "assistant", 
                  content: "", 
                  createdAt: "" 
                }} 
                isThinking={true} 
              />
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

      {/* 6. RENDER THE MODAL HERE (Using Portal) */}
      {mounted && showComingSoon && createPortal(
        <div 
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowComingSoon(false)
          }}
        >
          <ComingSoonModal 
            isOpen={true} 
            onClose={() => setShowComingSoon(false)} 
          />
        </div>,
        document.body
      )}

    </div>
  )
}