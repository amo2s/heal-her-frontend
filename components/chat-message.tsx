import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
// @ts-ignore - react-speech-kit lacks types, this ignores the warning
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
  
  // --- LIBRARY INTEGRATION ---
  const { speak, cancel, speaking } = useSpeechSynthesis()
  const [isThisMessageTalking, setIsThisMessageTalking] = useState(false)

  // Reset local speaking state if the global speech stops
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
      // Flex-row-reverse makes the user items align right automatically
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      
      {/* --- AVATAR & SPINNER AREA (AI ONLY) --- */}
      {!isUser && (
        <div className="flex-shrink-0 flex flex-col relative mt-1">
          <div className="relative w-9 h-9 md:w-11 md:h-11 flex items-center justify-center">
            
            {/* Gradient Spinner */}
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
            
            {/* Logo */}
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
          "prose prose-invert max-w-none text-base md:text-[17px] leading-relaxed font-light tracking-wide text-white/90",
          isUser 
            ? "text-left bg-white/5 backdrop-blur-sm p-3.5 px-5 rounded-2xl rounded-tr-sm border border-white/5" // User: Glass bubble
            : "px-0 py-1" // AI: Plain text, no background
        )}>
           {message.content}
        </div>

        {/* --- ACTION TOOLBAR --- */}
        {!isThinking && (
          <div className={cn(
            "flex items-center gap-1 transition-all duration-300",
            // VISIBILITY: Always visible on mobile, hover on desktop
            "opacity-100 md:opacity-0 md:group-hover:opacity-100", 
            // Reverses icon order for user so they stay near the edge
            isUser ? "flex-row-reverse pr-1" : "flex-row pl-1"
          )}>
            
            {/* Copy (Both) */}
            <ActionButton 
              onClick={handleCopy} 
              icon={isCopied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              label="Copy"
            />

            {/* Delete (Both) */}
            <ActionButton 
              onClick={() => onDelete?.(message.id)} 
              icon={<Trash2 className="w-3.5 h-3.5" />}
              hoverColor="hover:text-red-400 hover:bg-red-400/10"
              label="Delete"
            />

            {/* AI Only Icons */}
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