"use client"

import React, { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation" 
import { createPortal } from "react-dom"
import { 
  Info, 
  MoreVertical, 
  Archive, 
  Trash2, 
  Flag,
  Menu,
  Loader2,
  Sparkles
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { ComingSoonModal } from "@/components/modals/coming-soon-modal"
import { cn } from "@/lib/utils"
import { useAudio } from "@/components/context/audio-manager"

interface HeaderProps {
  onMenuAction?: (action: string) => void
  onSidebarToggle?: () => void
}

export function Header({ onMenuAction, onSidebarToggle }: HeaderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSessionId = searchParams.get("session_id")
  const { playSfx, speak } = useAudio()

  const [showMenu, setShowMenu] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [showComingSoon, setShowComingSoon] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mainContainer = document.querySelector("main")
    const handleScroll = () => {
      if (mainContainer) setIsScrolled(mainContainer.scrollTop > 20)
    }
    if (mainContainer) mainContainer.addEventListener("scroll", handleScroll)
    return () => mainContainer?.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleAction = (action: string) => {
    playSfx('click')
    setShowMenu(false)
    
    if (action === "delete") {
      if (currentSessionId) setShowDeleteModal(true)
    } else if (action === "archive" || action === "report") {
      setShowComingSoon(true)
    } else if (onMenuAction) {
      onMenuAction(action)
    }
  }

  const executeDelete = async () => {
    if (!currentSessionId) return
    setIsDeleting(true)
    try {
      router.push("/chat") 
      setShowDeleteModal(false)
    } catch (e) { 
      console.error(e) 
    } finally { 
      setIsDeleting(false) 
    }
  }

  return (
    <>
      <header 
        className={cn(
          "fixed top-0 left-0 right-0 h-20 px-4 md:px-8 flex items-center justify-between z-50 transition-all duration-500",
          isScrolled 
            ? "bg-white/5 backdrop-blur-2xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]" 
            : "bg-transparent border-transparent"
        )}
      >
        {/* LEFT: Sidebar Toggle with Premium Glass Effect */}
        <div className="flex items-center">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => { playSfx('click'); onSidebarToggle?.(); }}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[#CCCCD9] hover:text-[#DA8CA0] transition-colors md:hidden"
          >
            <Menu className="w-5 h-5" />
          </motion.button>
        </div>

        {/* CENTER: Organic Branding */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="flex items-center gap-3">
            <motion.div 
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative h-10 w-10 p-1.5 bg-gradient-to-br from-white/20 to-white/5 rounded-2xl border border-white/20 shadow-xl backdrop-blur-md"
            >
               <Image 
                 src="/heal-logo.png" 
                 alt="Logo" 
                 fill
                 className="object-contain p-1.5 drop-shadow-md"
               />
            </motion.div>
            
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-1">
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-white leading-none">
                  Heal <span className="text-[#DA8CA0]">Her</span>
                </h1>
                <button
                  onMouseEnter={() => setShowInfo(true)}
                  onMouseLeave={() => setShowInfo(false)}
                  className="p-1 text-[#DA8CA0]/60"
                >
                  <Sparkles className="w-3 h-3 animate-pulse" />
                </button>
              </div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#CCCCD9]/60 leading-none mt-1">
                Safe Support
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT: Sophisticated Menu */}
        <div className="flex items-center" ref={menuRef}>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => { playSfx('click'); setShowMenu(!showMenu); }}
            className={cn(
              "p-2.5 rounded-xl transition-all duration-300 border",
              showMenu 
                ? "bg-[#DA8CA0]/20 border-[#DA8CA0]/40 text-[#DA8CA0]" 
                : "bg-white/5 border-white/10 text-[#CCCCD9]"
            )}
          >
            <MoreVertical className="w-5 h-5" /> 
          </motion.button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className="absolute right-4 top-20 w-52 overflow-hidden rounded-[2rem] bg-[#1C1246]/90 backdrop-blur-2xl border border-white/10 shadow-2xl z-[60]"
              >
                <div className="py-2">
                  <MenuItem icon={Archive} label="Archive" onClick={() => handleAction("archive")} />
                  <MenuItem icon={Flag} label="Report" onClick={() => handleAction("report")} />
                  <div className="my-1 mx-4 h-px bg-white/5" />
                  <MenuItem 
                     icon={Trash2} 
                     label="Delete Chat" 
                     onClick={() => handleAction("delete")} 
                     danger 
                     disabled={!currentSessionId}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <ComingSoonModal isOpen={showComingSoon} onClose={() => setShowComingSoon(false)} />
      
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        isLoading={isDeleting}
        onClose={() => !isDeleting && setShowDeleteModal(false)}
        onConfirm={executeDelete}
      />
    </>
  )
}

function MenuItem({ icon: Icon, label, onClick, danger = false, disabled = false }: any) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full px-5 py-3 flex items-center gap-3 text-xs font-bold uppercase tracking-widest transition-all",
        disabled ? "opacity-30 cursor-not-allowed" : "hover:bg-white/5",
        danger ? "text-red-400" : "text-[#CCCCD9]"
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  )
}

function DeleteConfirmationModal({ isOpen, isLoading, onClose, onConfirm }: any) {
  if (!isOpen) return null
  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in" onClick={onClose}>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-xs bg-[#1C1246] border border-white/10 rounded-[2.5rem] p-8 text-center"
      >
        <h3 className="text-xl font-black text-white mb-2">Delete?</h3>
        <p className="text-xs text-[#CCCCD9]/60 mb-6 uppercase tracking-wider leading-relaxed">
          This will remove your chat forever.
        </p>
        <div className="flex flex-col gap-2">
          <button onClick={onConfirm} disabled={isLoading} className="w-full py-4 bg-red-500 rounded-2xl text-white font-black uppercase text-xs tracking-widest shadow-lg shadow-red-500/20">
            {isLoading ? "Deleting..." : "Yes, Delete"}
          </button>
          <button onClick={onClose} disabled={isLoading} className="w-full py-4 bg-white/5 rounded-2xl text-white font-bold text-xs uppercase tracking-widest">
            Cancel
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  )
}