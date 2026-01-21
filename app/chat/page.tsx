"use client"

import React, { useState, useEffect, useMemo } from "react"
import { ChatInput } from "@/components/chat-input"
import { Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion" // Added this import

export default function ChatPage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [userName, setUserName] = useState("") 
  const [isDataLoading, setIsDataLoading] = useState(true)

  // --- 1. FETCH USER NAME ---
  useEffect(() => {
    const fetchUserName = async () => {
      const token = localStorage.getItem("sb-access-token") 
      
      if (!token) {
        setIsDataLoading(false)
        return
      }

      try {
        const response = await fetch("http://127.0.0.1:8000/auth/me", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          const name = data.full_name || data.name
          if (name) {
            setUserName(name)
          }
        }
      } catch (error) {
        console.error("Failed to fetch user name:", error)
      } finally {
        // Subtle delay for visual smoothness
        setTimeout(() => setIsDataLoading(false), 800)
      }
    }

    fetchUserName()
  }, [])

  // --- 2. SMART TYPEWRITER STATE ---
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
    if (isDataLoading) return 

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

        if (text === fullText) {
          setTimeout(() => setIsDeleting(true), 2000)
        }
      } else {
        setText(fullText.substring(0, text.length - 1))
        setTypingSpeed(40) 

        if (text.length <= deleteStopPoint) {
          setIsDeleting(false)
          setLoopNum(loopNum + 1)
          
          if (deleteStopPoint === 6) {
             setText("Let's ")
          }
        }
      }
    }

    const timer = setTimeout(handleTyping, typingSpeed)
    return () => clearTimeout(timer)
  }, [text, isDeleting, loopNum, phrases, typingSpeed, isDataLoading])

  // --- 3. MESSAGE HANDLERS ---
  const handleSendMessage = (message: string) => {
    setIsGenerating(true)
    setTimeout(() => setIsGenerating(false), 3000)
  }

  const handleStopGeneration = () => {
    setIsGenerating(false)
  }

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto">
      
      {/* CHAT FEED AREA */}
      <div className="flex-1 overflow-y-auto w-full p-4 md:p-6 scrollbar-none">
        
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
                    Creating your safe space...
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