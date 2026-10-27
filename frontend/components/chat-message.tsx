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
import rehypeSanitize from "rehype-sanitize"

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
  // ADDED: Re-introduced the prop for the Modal
  onFeatureNotAvailable?: () => void
}

// --- HELPER: ULTIMATE TEXT CLEANER ---
const cleanTextForSpeech = (text: string) => {
  let clean = text
  // 1. Remove Emojis
  clean = clean.replace(/[\u{1F600}-\u{1F6FF}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
  // 2. Remove Horizontal Rules
  clean = clean.replace(/[-*_]{3,}/g, '') 
  // 3. Remove Markdown Bold/Italic
  clean = clean.replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1') 
  // 4. Remove Code Blocks
  clean = clean.replace(/```[\s\S]*?```/g, 'Code block omitted.')
  // 5. Remove Inline Code
  clean = clean.replace(/`([^`]+)`/g, '$1')
  // 6. Remove Links
  clean = clean.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
  // 7. Remove Headings (#)
  clean = clean.replace(/#{1,6}\s?/g, '')
  // 8. Remove repeated punctuation
  clean = clean.replace(/[.\-=_]{2,}/g, '')

  return clean
}

export function ChatMessage({ message, isThinking, onDelete, onFeatureNotAvailable }: ChatMessageProps) {
  const isUser = message.role === "user"
  const [isCopied, setIsCopied] = useState(false)
  
  const { speak, cancel, speaking } = useSpeechSynthesis()
  const [isThisMessageTalking, setIsThisMessageTalking] = useState(false)

  // FIX 1: Cleanup Speech on Unmount
  useEffect(() => {
    return () => {
      cancel()
    }
  }, [])

  // FIX 2: Watch global speaking state to sync UI
  useEffect(() => {
    if (!speaking) {
      setIsThisMessageTalking(false)
    }
  }, [speaking])

  const handleSpeak = () => {
    if (isThisMessageTalking) {
      // STOP
      cancel()
      setIsThisMessageTalking(false)
    } else {
      // PLAY (Cancel others first)
      cancel()
      const spokenText = cleanTextForSpeech(message.content)
      
      speak({ 
        text: spokenText,
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
      
      {/* --- AVATAR --- */}
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
                  <circle cx="50" cy="50" r="48" fill="none" stroke="url(#spinner-gradient)" strokeWidth="4" strokeLinecap="round" className="opacity-90"/>
                </svg>
              </motion.div>
            )}
            <div className={cn(
              "relative z-10 w-full h-full rounded-full overflow-hidden border border-white/10 shadow-lg",
              isThinking ? "shadow-[#DA8CA0]/20" : "bg-black/20"
            )}>
              <Image src="/heal-logo.png" alt="Heal AI" fill className="object-cover p-1.5" />
            </div>
          </div>
        </div>
      )}

      {/* --- CONTENT --- */}
      <div className={cn(
        "flex flex-col gap-1 min-w-0 max-w-[85%] md:max-w-[70%]",
        isUser ? "items-end" : "items-start"
      )}>
        
        <div className={cn(
          "text-base md:text-[17px] leading-relaxed font-light tracking-wide text-white/90 overflow-hidden",
          isUser 
            ? "text-left bg-white/5 backdrop-blur-sm p-3.5 px-5 rounded-2xl rounded-tr-sm border border-white/5" 
            : "px-0 py-1 w-full"
        )}>
           
           <div className="prose prose-invert max-w-none break-words whitespace-pre-wrap">
             <ReactMarkdown 
               remarkPlugins={[remarkGfm]}
               rehypePlugins={[rehypeSanitize]}
               components={{
                 p: ({children}) => <p className="mb-3 last:mb-0 leading-7">{children}</p>,
                 ul: ({children}) => <ul className="list-disc pl-6 mb-3 space-y-1 marker:text-[#DA8CA0]">{children}</ul>,
                 ol: ({children}) => <ol className="list-decimal pl-6 mb-3 space-y-1 marker:text-[#DA8CA0]">{children}</ol>,
                 li: ({children}) => <li className="pl-1 leading-7">{children}</li>,
                 hr: () => <hr className="my-4 border-white/10" />,
                 strong: ({children}) => <span className="font-semibold text-white">{children}</span>,
                 em: ({children}) => <span className="italic text-white/80">{children}</span>,
                 blockquote: ({children}) => (
                    <blockquote className="border-l-2 border-[#DA8CA0] pl-4 italic text-white/60 my-2 bg-white/5 p-2 rounded-r-md">
                        {children}
                    </blockquote>
                 ),
                 a: ({children, href}) => (
                   <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#DA8CA0] hover:underline break-all">
                     {children}
                   </a>
                 ),
                 code: ({className, children}) => {
                    const isInline = !className
                    return isInline ? (
                       <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono text-[#DA8CA0] break-words whitespace-normal border border-white/5">
                         {children}
                       </code>
                    ) : (
                       <pre className="bg-[#0f0821] p-3 rounded-lg overflow-x-auto my-3 border border-white/10 shadow-inner">
                         <code className={cn("text-sm font-mono text-gray-200", className)}>
                           {children}
                         </code>
                       </pre>
                    )
                 },
                 table: ({children}) => <div className="overflow-x-auto my-4 rounded-lg border border-white/10"><table className="min-w-full divide-y divide-white/10">{children}</table></div>,
                 th: ({children}) => <th className="bg-white/5 px-3 py-2 text-left text-sm font-semibold text-white">{children}</th>,
                 td: ({children}) => <td className="px-3 py-2 text-sm text-white/70 border-t border-white/5">{children}</td>
               }}
             >
               {message.content}
             </ReactMarkdown>
           </div>
        </div>

        {!isThinking && (
          <div className={cn(
            "flex items-center gap-1 transition-all duration-300 ease-in-out",
            "opacity-100 md:opacity-0 md:group-hover:opacity-100", 
            isUser ? "flex-row-reverse pr-1" : "flex-row pl-1"
          )}>
            
            {/* 1. UTILITIES: Copy, Delete */}
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

            {/* SEPARATOR 1: Separates Utility from Speech */}
            {!isUser && <div className="w-px h-3 bg-white/10 mx-1" />}

            {/* 2. SPEECH: Read Aloud */}
            {!isUser && (
              <ActionButton 
                onClick={handleSpeak} 
                icon={isThisMessageTalking ? <StopCircle className="w-3.5 h-3.5 text-[#DA8CA0]" /> : <Volume2 className="w-3.5 h-3.5" />}
                label={isThisMessageTalking ? "Stop" : "Read Aloud"}
                active={isThisMessageTalking}
              />
            )}

            {/* SEPARATOR 2: Separates Speech from Social (This is the requested vertical line placement) */}
            {!isUser && <div className="w-px h-3 bg-white/10 mx-1" />}

            {/* 3. SOCIAL: Thumbs, Share - TRIGGER MODAL */}
            {!isUser && (
              <>
                <ActionButton 
                    onClick={onFeatureNotAvailable} 
                    icon={<ThumbsUp className="w-3.5 h-3.5" />} 
                    label="Helpful" 
                />
                <ActionButton 
                    onClick={onFeatureNotAvailable} 
                    icon={<ThumbsDown className="w-3.5 h-3.5" />} 
                    label="Not Helpful" 
                />
                <ActionButton 
                    onClick={onFeatureNotAvailable} 
                    icon={<Share2 className="w-3.5 h-3.5" />} 
                    label="Share" 
                />
              </>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

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