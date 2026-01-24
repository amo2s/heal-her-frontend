"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
// @ts-ignore - react-speech-kit lacks types
import { useSpeechSynthesis } from "react-speech-kit"
import { 
  Copy, 
  Check, 
  Trash2, 
  Volume2, 
  StopCircle, 
  ThumbsUp, 
  ThumbsDown, 
  Share2 
} from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils" 

// --- SMART TEXT IMPORTS ---
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt?: string 
}

interface ChatMessageProps {
  message: Message
  isThinking?: boolean 
  onDelete?: (id: string) => void
}

export function ChatMessage({ message, isThinking, onDelete }: ChatMessageProps) {
  const isUser = message.role === "user"
  const [isCopied, setIsCopied] = useState(false)
  
  // --- SPEECH LOGIC ---
  const { speak, cancel, speaking } = useSpeechSynthesis()
  const [isThisMessageTalking, setIsThisMessageTalking] = useState(false)

  useEffect(() => {
    if (!speaking) {
      setIsThisMessageTalking(false)
    }
  }, [speaking])

  const handleSpeak = () => {
    if (isThisMessageTalking) {
      cancel()
      setIsThisMessageTalking(false)
    } else {
      cancel() 
      speak({ 
        text: message.content,
        rate: 0.9, 
        onEnd: () => setIsThisMessageTalking(false) 
      })
      setIsThisMessageTalking(true)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text", err)
    }
  }

  return (
    <div className={cn(
      "group flex w-full gap-4 p-2 md:gap-6 md:p-4",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      
      {/* --- AVATAR AREA (AI ONLY) --- */}
      {!isUser && (
        <div className="flex-shrink-0 flex flex-col relative mt-1">
          <div className="relative w-9 h-9 md:w-11 md:h-11 flex items-center justify-center">
            
            {isThinking && (
              <motion.div
                className="absolute inset-[-6px] z-0"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <defs>
                    <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#DA8CA0" stopOpacity="0" />
                      <stop offset="50%" stopColor="#DA8CA0" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#DA8CA0" stopOpacity="1" />
                    </linearGradient>
                  </defs>
                  <circle 
                    cx="50" cy="50" r="48" 
                    fill="none" 
                    stroke="url(#spinner-gradient)" 
                    strokeWidth="4"
                    strokeLinecap="round"
                    className="opacity-90"
                  />
                </svg>
              </motion.div>
            )}
            
            <div className={cn(
              "relative z-10 w-full h-full rounded-full overflow-hidden border border-white/10 shadow-lg",
              isThinking ? "shadow-[#DA8CA0]/20" : "bg-black/20"
            )}>
              <Image 
                src="/heal-logo.png" 
                alt="Heal AI" 
                fill 
                className="object-cover p-1.5" 
              />
            </div>
          </div>
        </div>
      )}

      {/* --- MESSAGE CONTENT AREA --- */}
      <div className={cn(
        "flex flex-col gap-1 min-w-0 max-w-[85%] md:max-w-[70%]",
        isUser ? "items-end" : "items-start"
      )}>
        
        {/* TEXT BUBBLE */}
        <div className={cn(
          "text-base md:text-[17px] leading-relaxed font-light tracking-wide text-white/90 overflow-hidden",
          isUser 
            ? "text-left bg-white/5 backdrop-blur-sm p-3.5 px-5 rounded-2xl rounded-tr-sm border border-white/5" 
            : "px-0 py-1"
        )}>
           {/* FIX: We moved the 'className' from ReactMarkdown to this wrapper div.
              This applies the 'prose' styling safely without confusing TypeScript.
           */}
           <div className="prose prose-invert max-w-none break-words">
             <ReactMarkdown 
               remarkPlugins={[remarkGfm]}
               components={{
                  p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                  ul: ({children}) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                  ol: ({children}) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                  li: ({children}) => <li className="pl-1">{children}</li>,
                  strong: ({children}) => <span className="font-semibold text-white">{children}</span>,
                  a: ({children, href}) => (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#DA8CA0] hover:underline">
                      {children}
                    </a>
                  ),
                  code: ({children}) => (
                    <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono text-[#DA8CA0]">
                      {children}
                    </code>
                  ),
               }}
             >
               {message.content}
             </ReactMarkdown>
           </div>
        </div>

        {/* --- ACTION TOOLBAR --- */}
        {!isThinking && (
          <div className={cn(
            "flex items-center gap-1 transition-all duration-300",
            "opacity-100 md:opacity-0 md:group-hover:opacity-100", 
            isUser ? "flex-row-reverse pr-1" : "flex-row pl-1"
          )}>
            
            <ActionButton 
              onClick={handleCopy} 
              icon={isCopied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              label="Copy"
            />

            <ActionButton 
              onClick={() => onDelete?.(message.id)} 
              icon={<Trash2 className="w-3.5 h-3.5" />}
              hoverColor="hover:text-red-400 hover:bg-red-400/10"
              label="Delete"
            />

            {!isUser && (
              <>
                <div className="w-px h-3 bg-white/10 mx-1" /> 
                
                <ActionButton 
                  onClick={handleSpeak} 
                  icon={isThisMessageTalking ? <StopCircle className="w-3.5 h-3.5 text-[#DA8CA0]" /> : <Volume2 className="w-3.5 h-3.5" />}
                  label={isThisMessageTalking ? "Stop" : "Read Aloud"}
                  active={isThisMessageTalking}
                />
                
                <ActionButton icon={<ThumbsUp className="w-3.5 h-3.5" />} label="Helpful" />
                <ActionButton icon={<ThumbsDown className="w-3.5 h-3.5" />} label="Not Helpful" />
                <ActionButton icon={<Share2 className="w-3.5 h-3.5" />} label="Share" />
              </>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

// --- HELPER COMPONENT ---
function ActionButton({ 
  onClick, 
  icon, 
  hoverColor = "hover:text-white hover:bg-white/10", 
  label,
  active = false
}: { 
  onClick?: () => void, 
  icon: React.ReactNode, 
  hoverColor?: string,
  label?: string,
  active?: boolean
}) {
  return (
    <button 
      onClick={onClick} 
      title={label}
      className={cn(
        "p-1.5 rounded-md transition-all duration-200",
        "text-white/40", 
        active ? "text-[#DA8CA0] bg-[#DA8CA0]/10" : hoverColor
      )}
    >
      {icon}
    </button>
  )
}