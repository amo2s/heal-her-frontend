"use client"

import React, { useState, useRef, useLayoutEffect, useEffect } from "react"
import { 
  Plus, 
  Image as ImageIcon, 
  Paperclip, 
  Camera, 
  Mic, 
  ArrowUp, 
  Square 
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { ComingSoonModal } from "@/components/modals/coming-soon-modal"
import { cn } from "@/lib/utils"

interface ChatInputProps {
  onSendMessage: (message: string) => void
  onStopGeneration?: () => void
  isGenerating?: boolean
}

const MAX_HEIGHT = 120 // The height limit before scrolling starts

export function ChatInput({ 
  onSendMessage, 
  onStopGeneration, 
  isGenerating = false 
}: ChatInputProps) {
  const [input, setInput] = useState("")
  const [showPlusMenu, setShowPlusMenu] = useState(false)
  const [showModal, setShowModal] = useState(false)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // SMART AUTO-RESIZE & SCROLL LOGIC
  useLayoutEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    // Reset height to calculate true scrollHeight
    textarea.style.height = "auto"

    // Calculate new height (capped at MAX_HEIGHT)
    const newHeight = Math.min(textarea.scrollHeight, MAX_HEIGHT)
    
    // Apply height
    textarea.style.height = `${newHeight}px`

    // Smart Scroll: Only show scrollbar if content exceeds MAX_HEIGHT
    if (textarea.scrollHeight > MAX_HEIGHT) {
      textarea.style.overflowY = "auto"
    } else {
      textarea.style.overflowY = "hidden"
    }
  }, [input])

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowPlusMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSend = () => {
    if (!input.trim()) return
    onSendMessage(input.trim())
    setInput("")
    
    // Reset height immediately after sending
    if (textareaRef.current) {
      textareaRef.current.style.height = "24px"
      textareaRef.current.style.overflowY = "hidden"
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFeatureClick = () => {
    setShowPlusMenu(false)
    setShowModal(true)
  }

  return (
    <>
      <div className="w-full max-w-4xl mx-auto px-4 pb-6">
        <div className="relative flex items-end gap-2 bg-[#231854] p-3 rounded-[26px] shadow-2xl">

          {/* LEFT: Plus Menu */}
          <div className="relative pb-1.5 pl-1" ref={menuRef}>
            <button
              onClick={() => setShowPlusMenu(!showPlusMenu)}
              className={cn(
                "p-2 rounded-full transition-all duration-300",
                showPlusMenu 
                  ? "bg-[#DA8CA0] text-[#1C1246] rotate-45" 
                  : "bg-white/5 text-[#CCCCD9] hover:bg-white/10 hover:text-white"
              )}
            >
              <Plus className="w-5 h-5" />
            </button>

            <AnimatePresence>
              {showPlusMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: -10 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute bottom-full left-0 mb-2 p-2 min-w-[180px] bg-[#1C1246] rounded-2xl shadow-xl overflow-hidden z-20"
                >
                  <div className="flex flex-col gap-1">
                    <MenuItem icon={ImageIcon} label="Add Image" onClick={handleFeatureClick} />
                    <MenuItem icon={Paperclip} label="Upload File" onClick={handleFeatureClick} />
                    <MenuItem icon={Camera} label="Scan Document" onClick={handleFeatureClick} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* MIDDLE: Smart Text Area */}
          <div className="flex-1 min-w-0 py-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Heal Her..."
              rows={1}
              className={cn(
                "w-full bg-transparent text-white placeholder:text-[#CCCCD9]/40",
                "text-[16px] leading-relaxed resize-none",
                // Remove all borders and outlines
                "border-0 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none ring-0 outline-none shadow-none",
                // Custom Scrollbar Styling
                "[&::-webkit-scrollbar]:w-1.5",
                "[&::-webkit-scrollbar-track]:bg-transparent",
                "[&::-webkit-scrollbar-thumb]:bg-[#DA8CA0]/40",
                "[&::-webkit-scrollbar-thumb]:rounded-full",
                "[&::-webkit-scrollbar-thumb]:hover:bg-[#DA8CA0]/70"
              )}
              style={{ 
                minHeight: "24px",
                maxHeight: `${MAX_HEIGHT}px`
              }}
            />
          </div>

          {/* RIGHT: Actions */}
          <div className="flex items-end gap-2 pb-1.5 pr-1">
            {!input && (
              <button
                onClick={() => setShowModal(true)}
                className="p-2 text-[#CCCCD9] hover:text-white transition-colors"
              >
                <Mic className="w-6 h-6" />
              </button>
            )}

            {isGenerating ? (
              <button
                onClick={onStopGeneration}
                className="p-3 rounded-full bg-white text-[#1C1246] hover:bg-red-100 transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.3)] animate-pulse"
              >
                <Square className="w-5 h-5 fill-current" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className={cn(
                  "p-3 rounded-full transition-all duration-300 shadow-lg",
                  input.trim() 
                    ? "bg-[#DA8CA0] text-[#1C1246] hover:scale-105 hover:bg-[#ff9eb5] shadow-[0_0_15px_rgba(218,140,160,0.4)]" 
                    : "bg-white/10 text-[#CCCCD9]/30 cursor-not-allowed"
                )}
              >
                <ArrowUp className="w-5 h-5" strokeWidth={3} />
              </button>
            )}
          </div>
        </div>

        <div className="text-center mt-3">
          <p className="text-[10px] text-[#CCCCD9]/40">
            Heal Her can make mistakes. Please verify important medical information.
          </p>
        </div>
      </div>

      <ComingSoonModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </>
  )
}

function MenuItem({ icon: Icon, label, onClick }: { icon: any, label: string, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-[#CCCCD9] hover:text-white hover:bg-white/5 rounded-xl transition-colors text-left"
    >
      <Icon className="w-4 h-4 text-[#DA8CA0]" />
      {label}
    </button>
  )
}