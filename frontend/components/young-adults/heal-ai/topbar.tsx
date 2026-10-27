"use client"

import React, { useState, useRef, useEffect, Suspense } from "react"
import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation" 
import { createPortal } from "react-dom"
import { 
  MoreVertical, 
  Archive, 
  Trash2, 
  Flag,
  Menu,
  Loader2,
  Sparkles,
  ShieldCheck
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { ComingSoonModal } from "@/components/modals/coming-soon-modal"
import { cn } from "@/lib/utils"
import { useAudio } from "@/components/context/audio-manager"

interface HeaderProps {
  onMenuAction?: (action: string) => void
  onSidebarToggle?: () => void
}

function HeaderContent({ onMenuAction, onSidebarToggle }: HeaderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSessionId = searchParams.get("session_id")
  const { playSfx } = useAudio()

  const [showMenu, setShowMenu] = useState(false)
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
      // Redirecting to the main AI portal for young adults
      router.push("/dashboard/young-adults/heal-ai") 
      setShowDeleteModal(false)
    } catch (e) { 
      console.error("[HEADER ERROR] Deletion failed:", e) 
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
            ? "bg-background/80 backdrop-blur-2xl border-b border-white/10 shadow-xl" 
            : "bg-transparent border-transparent"
        )}
      >
        {/* LEFT: Sidebar Toggle */}
        <div className="flex items-center">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => { playSfx('click'); onSidebarToggle?.(); }}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-primary transition-colors md:hidden"
          >
            <Menu className="w-5 h-5" />
          </motion.button>
        </div>

        {/* CENTER: Premium Branding */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="flex items-center gap-3">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative h-9 w-9 p-1.5 bg-white/5 rounded-xl border border-white/10 shadow-2xl backdrop-blur-md"
            >
               <Image 
                 src="/heal-logo.png" 
                 alt="Logo" 
                 fill
                 className="object-contain p-1.5"
               />
            </motion.div>
            
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg md:text-xl font-bold tracking-tight text-white leading-none">
                  Heal <span className="text-primary">AI</span>
                </h1>
                <ShieldCheck className="w-3.5 h-3.5 text-primary/80" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 leading-none mt-1">
                Secure Support
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT: Action Menu */}
        <div className="flex items-center" ref={menuRef}>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { playSfx('click'); setShowMenu(!showMenu); }}
            className={cn(
              "p-2.5 rounded-xl transition-all duration-300 border",
              showMenu 
                ? "bg-primary/20 border-primary/40 text-primary" 
                : "bg-white/5 border-white/10 text-white/50"
            )}
          >
            <MoreVertical className="w-5 h-5" /> 
          </motion.button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-4 top-20 w-48 overflow-hidden rounded-2xl bg-background border border-white/10 shadow-2xl z-[60]"
              >
                <div className="py-2">
                  <MenuItem icon={Archive} label="Archive Session" onClick={() => handleAction("archive")} />
                  <MenuItem icon={Flag} label="Report Issue" onClick={() => handleAction("report")} />
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
        "w-full px-5 py-3 flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest transition-all",
        disabled ? "opacity-30 cursor-not-allowed" : "hover:bg-white/5",
        danger ? "text-red-400" : "text-white/60"
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
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={onClose}>
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm bg-background border border-white/10 rounded-3xl p-8 text-center"
      >
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Confirm Deletion</h3>
        <p className="text-xs text-white/50 mb-8 uppercase tracking-widest font-bold">
          This session will be purged permanently.
        </p>
        <div className="flex flex-col gap-3">
          <button 
            onClick={onConfirm} 
            disabled={isLoading} 
            className="w-full py-4 bg-red-500 rounded-xl text-white font-bold uppercase text-[11px] tracking-widest shadow-lg transition-all hover:bg-red-600"
          >
            {isLoading ? "Purging..." : "Delete Permanently"}
          </button>
          <button 
            onClick={onClose} 
            disabled={isLoading} 
            className="w-full py-4 bg-white/5 rounded-xl text-white font-bold text-[11px] uppercase tracking-widest transition-all hover:bg-white/10"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  )
}

// --- MAIN EXPORT WITH SUSPENSE WRAPPER ---
export function Header(props: HeaderProps) {
  return (
    <Suspense fallback={<div className="h-20 w-full" />}>
      <HeaderContent {...props} />
    </Suspense>
  )
}