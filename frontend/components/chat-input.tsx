"use client"

import React, { useState, useRef, useLayoutEffect, useEffect } from "react"
import { 
  Plus, 
  Image as ImageIcon, 
  Paperclip, 
  Camera, 
  Mic, 
  ArrowUp, 
  Square,
  ChevronDown
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { ComingSoonModal } from "@/components/modals/coming-soon-modal"
import { cn } from "@/lib/utils"

interface ChatInputProps {
  onSendMessage: (message: string) => void
  onStopGeneration?: () => void
  isGenerating?: boolean
}

const MAX_HEIGHT = 120

export function ChatInput({ 
  onSendMessage, 
  onStopGeneration, 
  isGenerating = false 
}: ChatInputProps) {
  const [input, setInput] = useState("")
  const [showPlusMenu, setShowPlusMenu] = useState(false)
  const [showModelMenu, setShowModelMenu] = useState(false)
  const [showModal, setShowModal] = useState(false)
  
  // Renamed "Fast" to "Standard" as requested
  const [activeModel, setActiveModel] = useState<"Standard" | "Thinking" | "Pro">("Standard")
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const modelMenuRef = useRef<HTMLDivElement>(null)

  // SMART AUTO-RESIZE & SCROLL LOGIC
  useLayoutEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = "auto"
    const newHeight = Math.min(textarea.scrollHeight, MAX_HEIGHT)
    textarea.style.height = `${newHeight}px`
    textarea.style.overflowY = textarea.scrollHeight > MAX_HEIGHT ? "auto" : "hidden"
  }, [input])

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowPlusMenu(false)
      }
      if (modelMenuRef.current && !modelMenuRef.current.contains(event.target as Node)) {
        setShowModelMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSend = () => {
    if (!input.trim()) return
    onSendMessage(input.trim())
    setInput("")
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

  const handleModelSelect = (model: "Standard" | "Thinking" | "Pro") => {
    setShowModelMenu(false)
    if (model === "Standard") {
      setActiveModel("Standard")
    } else {
      // Trigger modal for Thinking and Pro
      setShowModal(true)
    }
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
                  className="absolute bottom-full left-0 mb-2 p-2 min-w-[180px] bg-[#1C1246] rounded-2xl shadow-xl overflow-hidden z-20 border border-white/5"
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
                "border-0 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none ring-0 outline-none shadow-none",
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

          {/* RIGHT: Model Selector & Actions */}
          <div className="flex items-end gap-2 pb-1.5 pr-1">
            
            {/* Model Selector (Transparent Default, Background on Hover) */}
            <div className="relative" ref={modelMenuRef}>
              <button
                onClick={() => setShowModelMenu(!showModelMenu)}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-transparent hover:bg-white/10 text-[#CCCCD9] hover:text-white transition-colors text-xs font-medium mb-1.5"
              >
                {activeModel}
                <ChevronDown className="w-3 h-3 opacity-50" />
              </button>

              <AnimatePresence>
                {showModelMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: -10 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="absolute bottom-full right-0 mb-2 p-1.5 min-w-[200px] bg-[#1C1246] rounded-xl shadow-xl z-20 border border-white/5"
                  >
                    <div className="flex flex-col gap-0.5">
                      <ModelItem 
                        label="Standard" 
                        description="Answers quickly & accurately"
                        isActive={activeModel === "Standard"} 
                        onClick={() => handleModelSelect("Standard")} 
                      />
                      <ModelItem 
                        label="Thinking" 
                        description="Great for complex logic"
                        isActive={activeModel === "Thinking"} 
                        onClick={() => handleModelSelect("Thinking")} 
                      />
                      <ModelItem 
                        label="Pro" 
                        description="Deep reasoning & creativity"
                        isActive={activeModel === "Pro"} 
                        onClick={() => handleModelSelect("Pro")} 
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Dynamic Action Button (Stop / Send / Mic) */}
            {isGenerating ? (
              <button
                onClick={onStopGeneration}
                className="p-3 rounded-full bg-white text-[#1C1246] hover:bg-red-100 transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.3)] animate-pulse"
              >
                <Square className="w-5 h-5 fill-current" />
              </button>
            ) : input.trim() ? (
              // SHOW SEND BUTTON (when typing)
              <button
                onClick={handleSend}
                className="p-3 rounded-full bg-[#DA8CA0] text-[#1C1246] hover:scale-105 hover:bg-[#ff9eb5] shadow-[0_0_15px_rgba(218,140,160,0.4)] transition-all duration-300"
              >
                <ArrowUp className="w-5 h-5" strokeWidth={3} />
              </button>
            ) : (
              // SHOW MIC BUTTON (default, opens modal)
              <button
                onClick={() => setShowModal(true)}
                className="p-2 text-[#CCCCD9] hover:text-white transition-colors mb-1 mr-1"
              >
                <Mic className="w-6 h-6" />
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

function ModelItem({ label, description, isActive, onClick }: { label: string, description: string, isActive: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col w-full px-3 py-2 rounded-lg transition-colors text-left",
        isActive ? "bg-white/10" : "hover:bg-white/5"
      )}
    >
      <span className={cn(
        "text-xs font-semibold",
        isActive ? "text-white" : "text-[#CCCCD9]"
      )}>
        {label}
      </span>
      <span className="text-[10px] text-[#CCCCD9]/60 font-medium">
        {description}
      </span>
    </button>
  )
}