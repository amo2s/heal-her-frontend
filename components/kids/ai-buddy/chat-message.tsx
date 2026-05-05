"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Trash2, 
  Volume2, // Used for standard, peaking, and stop functions
  ThumbsUp, 
  ThumbsDown, 
  Share2,
  Clock // ADVANCED: Added for timestamp visualization
} from "lucide-react"
import Image from "next/image"

// Import the Elite Markdown Bridge
import { MarkdownRenderer } from "@/lib/kids/markdown"
// Assuming audioService exposes 'speak' and 'stop' methods
import { audioService } from "@/lib/kids/audio"

// --- TYPES ---
export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: string
}

interface ChatMessageProps {
  message: Message
  isThinking?: boolean
  onDelete?: (id: string) => void
  onFeatureNotAvailable?: () => void
}

/**
 * ChatMessage - Professional & Advanced kid-friendly message bubble.
 * Features:
 * 1. Restyled layout for superior professional look.
 * 2. Standard Volume2 icon acts as Speak/Stop toggle.
 * 3. Standard Volume2 icon animates ("peaking") when speaking.
 */
export function ChatMessage({ message, isThinking, onDelete, onFeatureNotAvailable }: ChatMessageProps) {
  const isUser = message.role === "user"

  // [DOCUMENT CHANGE: State management for local audio control]
  // We track if this specific message is currently being read aloud locally.
  const [isSpeakingLocal, setIsSpeakingLocal] = useState(false)

  // [DOCUMENT CHANGE: Lifecycle management for audio]
  // Advanced safety: Ensure audio stops if the user navigates away or the component unmounts.
  useEffect(() => {
    return () => {
      // Clean up audio globally if this specific message bubble unmounts
      if (isSpeakingLocal) {
        audioService.stop() 
      }
    }
  }, [isSpeakingLocal])

  /**
   * handleSpeakToggle - The standard function for the speaker icon.
   * [DOCUMENT CHANGE: Start/Stop logic implemented on existing icon]
   */
  const handleSpeakToggle = () => {
    if (isThinking || !message.content) return

    if (isSpeakingLocal) {
      // 1. If currently speaking, stop the voice immediately.
      audioService.stop()
      // 2. Revert icon to standard state immediately.
      setIsSpeakingLocal(false)
    } else {
      // 1. ADVANCED: Stop any other audio that might be playing first.
      audioService.stop()
      
      // 2. Start speaking. We pass a callback to reset the icon when finished naturally.
      // Assuming audioService accepts a callback or returns a promise for when it ends.
      audioService.speak(message.content, "neutral", true, () => {
        // [DOCUMENT CHANGE: Natural end callback to reset icon]
        setIsSpeakingLocal(false);
      })
      
      // 3. Set standard icon to animated "peaking" state.
      setIsSpeakingLocal(true)
    }
  }

  // Define spring animation for kid-friendly bouncy entrance
  const bubbleTransition = { type: "spring", stiffness: 300, damping: 25 };

  // ADVANCED: Icon animation variants using only Framer Motion on the Volume2 component.
  // [DOCUMENT CHANGE: Peaking animation defined for standard icon]
  const speakerIconVariants = {
    idle: { 
      scale: 1, 
      rotate: 0, 
      opacity: 0.4, // Style constraint met: Standard function looks normal
      transition: { duration: 0.3 }
    },
    speaking: { 
      // Style constraint met: Peaking shown via rapid scale pulsing and slight rotation tilt
      scale: [1, 1.2, 1, 1.2, 1],
      rotate: [0, 5, 0, -5, 0],
      opacity: 1, // Full color when active
      transition: { 
        duration: 1.2, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={bubbleTransition}
      // Layout improvement: Tightened vertical spacing and removed bouncy scale for professional look
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"} mb-5 group`}
    >
      <div className={`flex gap-3.5 ${isUser ? "flex-row-reverse" : "flex-row"} max-w-[80%]`}>
        
        {/* --- ADVANCED AI AVATAR DISPLAY --- */}
        {!isUser && (
          <div className="flex-shrink-0 mt-auto mb-5 relative">
            <motion.div 
              // professional slight lift on hover
              whileHover={{ y: -3 }}
              className="relative w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-[0_5px_15px_rgba(218,140,160,0.3)] border-2 border-[#DA8CA0]/60 overflow-hidden z-10 p-0.5"
            >
              <Image 
                src="/heal-logo.png" 
                alt="Buddy" 
                fill 
                className="object-contain" 
              />
            </motion.div>
            {/* Professional avatar glow accent */}
            <div className="absolute inset-0 bg-[#DA8CA0]/20 blur-xl rounded-full scale-125 z-0" />
          </div>
        )}

        {/* --- ADVANCED BUBBLE CONTAINER --- */}
        <div className={`flex flex-col relative ${isUser ? "items-end" : "items-start"}`}>
          
          <motion.div
            // Reduced hover scale for a tighter professional feel
            whileHover={!isThinking ? { scale: 1.005, y: -1 } : {}}
            className={`px-5 py-4 relative backdrop-blur-lg transition-transform ${
              isUser
                ? "bg-gradient-to-br from-white/15 to-white/5 border border-white/20 text-white rounded-[24px] rounded-br-sm shadow-xl"
                : "bg-[#1C1246] border border-[#DA8CA0]/40 text-[#CCCCD9] rounded-[24px] rounded-bl-sm shadow-[0_10px_25px_rgba(0,0,0,0.25)]"
            }`}
          >
            {isThinking ? (
              // Buddy is typing animation (Heal Her accent colors)
              <div className="flex items-center gap-1.5 h-6 px-1">
                {[0, 0.15, 0.3].map((delay, index) => (
                  <motion.div 
                    key={index}
                    animate={{ y: [0, -7, 0], opacity: [0.6, 1, 0.6] }} 
                    transition={{ repeat: Infinity, duration: 0.8, delay, ease: "easeInOut" }} 
                    className={`w-2.5 h-2.5 rounded-full ${index === 0 ? 'bg-[#DA8CA0]' : index === 1 ? 'bg-[#DA8CA0]/80' : 'bg-[#DA8CA0]/60'}`} 
                  />
                ))}
              </div>
            ) : (
              // The Actual Message Content
              <div className="w-full prose-sm prose-invert leading-relaxed">
                {isUser ? (
                  // Tightened typography for user message
                  <p className="text-[14.5px] leading-relaxed font-medium antialiased">{message.content}</p>
                ) : (
                  // MarkdownRenderer integration
                  <MarkdownRenderer content={message.content} />
                )}
              </div>
            )}
          </motion.div>

          {/* --- ADVANCED ACTION BAR (Tightly refined) --- */}
          {!isThinking && (
            <div 
              // Style change: Action bar is subltle on mobile, fully visible on hover on desktop
              className={`flex items-center gap-4 mt-2 transition-all duration-300
                opacity-60 md:opacity-0 md:group-hover:opacity-100 
                ${isUser ? "justify-end mr-3" : "justify-start ml-3"}
              `}
            >
              {/* ADVANCED TIMESTAMP VISUALIZATION */}
              <div className="flex items-center gap-1 text-white/25 antialiased font-bold tracking-tight text-[10px] uppercase">
                <Clock className="w-3 h-3" />
                {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              
              {/* INTERACTIVE ICONS */}
              <div className="flex items-center gap-2.5">
                {/* AI-Only Icons */}
                {!isUser && (
                  <div className="flex items-center gap-2.5">
                    
                    {/* [DOCUMENT CHANGE: THE STANDARD TOGGLE BUTTON] */}
                    <button 
                      onClick={handleSpeakToggle} 
                      className="transition-colors rounded-md p-1"
                      // title change based on dynamic state
                      title={isSpeakingLocal ? "Stop Reading" : "Read Aloud"}
                    >
                      {/* [DOCUMENT CHANGE: Framer motion pulse on standard icon] */}
                      <motion.div
                        animate={isSpeakingLocal ? "speaking" : "idle"}
                        variants={speakerIconVariants}
                        // Advanced styling: Rose accent when active
                        className={isSpeakingLocal ? "text-[#FFB6C1]" : "text-white/40 hover:text-white transition-colors"}
                      >
                        <Volume2 className="w-4 h-4" />
                      </motion.div>
                    </button>

                    <button onClick={onFeatureNotAvailable} className="text-white/40 hover:text-emerald-400 transition-colors p-1" title="Like">
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <button onClick={onFeatureNotAvailable} className="text-white/40 hover:text-rose-400 transition-colors p-1" title="Dislike">
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                    <button onClick={onFeatureNotAvailable} className="text-white/40 hover:text-blue-400 transition-colors p-1" title="Share">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* User-Only Icons (Delete) */}
                {isUser && onDelete && (
                  <button onClick={() => onDelete(message.id)} className="text-white/40 hover:text-rose-400 transition-colors mr-1 p-1" title="Delete Message">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </motion.div>
  )
}