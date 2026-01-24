"use client"

import React, { useState, useEffect, useMemo, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation" 
import { ChatInput } from "@/components/chat-input"
import { ChatMessage } from "@/components/chat-message" 
import { Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// 1. IMPORT API BRIDGE
import { sendMessage, type Message } from "@/lib/chat-api" 

// 2. IMPORT CONTEXT (The "Brain" we just moved)
import { useChatContext } from "@/components/context/chat-context"

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]) 
  const [isGenerating, setIsGenerating] = useState(false)
  
  const [userName, setUserName] = useState("") 
  const [userId, setUserId] = useState<string>("") 
  const [sessionId, setSessionId] = useState<string | null>(null)

  const [isDataLoading, setIsDataLoading] = useState(true)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // --- HOOKS ---
  const searchParams = useSearchParams()
  const router = useRouter()
  const urlSessionId = searchParams.get("session_id")
  
  // Get the refresh function from our Global Brain
  const { refreshSessions } = useChatContext()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isGenerating])

  // --- 3. FETCH USER DATA & HISTORY ---
  useEffect(() => {
    const initData = async () => {
      const token = localStorage.getItem("sb-access-token") 
      
      if (!token) {
        setIsDataLoading(false)
        return
      }

      try {
        // A. Get User ID (If not already set)
        let currentUserId = userId
        
        if (!currentUserId) {
          const response = await fetch("http://127.0.0.1:8000/auth/me", {
            headers: { "Authorization": `Bearer ${token}` }
          })

          if (response.ok) {
            const data = await response.json()
            const name = data.full_name || data.name
            if (name) setUserName(name)
            
            if (data.id) {
              setUserId(data.id)
              currentUserId = data.id
            }
          }
        }

        // B. Handle Session Loading (Sidebar Click Logic)
        if (currentUserId) {
          if (urlSessionId) {
            // Case 1: URL has ID -> Fetch History
            if (urlSessionId !== sessionId) {
              setSessionId(urlSessionId)
              await fetchHistory(urlSessionId, currentUserId)
            }
          } else {
            // Case 2: No URL -> Clear Chat (New Session)
            if (sessionId !== null) {
              setSessionId(null)
              setMessages([])
            }
          }
        }

      } catch (error) {
        console.error("Failed to load data:", error)
      } finally {
        // Small delay to prevent flickering
        setTimeout(() => setIsDataLoading(false), 500)
      }
    }

    initData()
  }, [urlSessionId]) 


  // --- 4. HELPER: FETCH HISTORY ---
  const fetchHistory = async (sessId: string, uid: string) => {
    try {
      setIsDataLoading(true) 
      const res = await fetch(`http://127.0.0.1:8000/history/${sessId}?user_id=${uid}`)
      
      if (res.ok) {
        const historyData = await res.json()
        
        // Convert Backend Messages -> Frontend Message Format
        const formattedMessages: Message[] = historyData.map((msg: any) => ({
          id: msg.id || Math.random().toString(),
          role: msg.role,
          content: msg.content,
          createdAt: msg.created_at
        }))
        
        setMessages(formattedMessages)
      }
    } catch (err) {
      console.error("Failed to fetch history", err)
    } finally {
      setIsDataLoading(false)
    }
  }

  // --- TYPEWRITER LOGIC (Unchanged) ---
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
    
    const nextIndex = (loopNum + 1) % phrases.length
    const nextText = phrases[nextIndex]

    const currentStarts = fullText.startsWith("Let's")
    const nextStarts = nextText.startsWith("Let's")
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


  // --- 5. MESSAGE HANDLER (INTELLIGENT UPDATE) ---
  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return
    
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
      // Call API
      const { message: aiMsg, newSessionId } = await sendMessage(content, userId, sessionId)
      
      // --- INTELLIGENT SIDEBAR UPDATE ---
      // If we just created a NEW session (sessionId was null, but we got a new ID back)
      if (!sessionId && newSessionId) {
        setSessionId(newSessionId)
        
        // 1. Update URL silently
        window.history.pushState(null, '', `?session_id=${newSessionId}`)
        
        // 2. TELL THE SIDEBAR TO WAKE UP AND REFRESH!
        await refreshSessions() 
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
          // TYPEWRITER VIEW
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
          // ACTIVE CHAT VIEW
          <div className="flex flex-col gap-2 pb-4">
            {messages.map((msg) => (
              <ChatMessage 
                key={msg.id} 
                message={msg} 
                onDelete={handleDeleteMessage}
              />
            ))}
            
            {/* Thinking Bubble */}
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

    </div>
  )
}