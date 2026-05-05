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
  Loader2
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { ComingSoonModal } from "@/components/modals/coming-soon-modal"
import { cn } from "@/lib/utils"

// --- CONFIG ---
const API_BASE = "https://sliverboy-heal-her-backend.hf.space"

interface HeaderProps {
  onMenuAction?: (action: string) => void
  onSidebarToggle?: () => void
}

export function Header({ onMenuAction, onSidebarToggle }: HeaderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSessionId = searchParams.get("session_id")

  const [showMenu, setShowMenu] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  
  // Modals
  const [showComingSoon, setShowComingSoon] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const [isScrolled, setIsScrolled] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // --- SCROLL DETECTION ---
  useEffect(() => {
    const mainContainer = document.querySelector("main")
    const handleScroll = () => {
      if (mainContainer) {
        setIsScrolled(mainContainer.scrollTop > 20)
      }
    }
    if (mainContainer) mainContainer.addEventListener("scroll", handleScroll)
    return () => {
      if (mainContainer) mainContainer.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // --- CLICK OUTSIDE ---
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // --- ACTIONS ---
  const handleAction = (action: string) => {
    setShowMenu(false)
    
    if (action === "delete") {
      if (currentSessionId) {
        setShowDeleteModal(true)
      }
    } else if (action === "archive" || action === "report") {
      setShowComingSoon(true)
    } else if (onMenuAction) {
      onMenuAction(action)
    }
  }

  // --- DELETE LOGIC ---
  const executeDelete = async () => {
    if (!currentSessionId) return
    
    const userId = sessionStorage.getItem("user-id")
    if (!userId) {
        console.error("Cannot delete: User ID missing")
        return
    }

    setIsDeleting(true)

    try {
      await fetch(`${API_BASE}/sessions/${currentSessionId}?user_id=${userId}`, {
        method: "DELETE"
      })
      
      router.push("/chat") // Redirect to new chat
      setShowDeleteModal(false)

    } catch (e) { 
      console.error("Delete failed:", e) 
    } finally { 
      setIsDeleting(false) 
    }
  }

  return (
    <>
      <header 
        className={cn(
          "absolute top-0 left-0 right-0 h-24 px-4 md:px-8 flex items-center justify-between z-50 transition-all duration-300",
          isScrolled 
            ? "bg-[#1C1246]/60 backdrop-blur-xl border-b border-white/5 shadow-sm" 
            : "bg-transparent border-transparent backdrop-blur-none"
        )}
      >
        
        {/* LEFT: Sidebar Toggle */}
        <div className="flex items-center">
          <button
            onClick={onSidebarToggle}
            className="md:hidden p-2 -ml-2 text-[#CCCCD9] hover:text-[#DA8CA0] transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* CENTER: Branding */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center w-full max-w-md pointer-events-none">
          <div className="flex items-center gap-3 pointer-events-auto">
            <div className="relative h-10 w-10 shrink-0">
               <Image 
                 src="/heal-logo.png" 
                 alt="Heal Her logo" 
                 fill
                 className="object-contain drop-shadow-[0_0_10px_rgba(218,140,160,0.4)]"
               />
            </div>
            
            <div className="flex items-start">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white drop-shadow-lg leading-none">
                Heal <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DA8CA0] to-pink-400 font-extrabold">Her</span>
              </h1>
              
              <div className="relative group ml-0.5 -mt-1">
                <button
                  onClick={() => setShowInfo(!showInfo)}
                  onMouseEnter={() => setShowInfo(true)}
                  onMouseLeave={() => setShowInfo(false)}
                  className="p-1 text-[#DA8CA0]/70 hover:text-[#DA8CA0] transition-colors cursor-pointer"
                >
                  <Info className="w-3 h-3 md:w-3.5 md:h-3.5" strokeWidth={3} />
                </button>

                <AnimatePresence>
                  {showInfo && (
                    <motion.div
                      initial={{ opacity: 0, y: 5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.95 }}
                      className="absolute top-6 left-1/2 -translate-x-1/2 w-72 p-5 rounded-2xl bg-[#231854]/95 backdrop-blur-md border border-[#DA8CA0]/30 shadow-[0_0_30px_rgba(0,0,0,0.3)] z-50 pointer-events-none"
                    >
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#231854] border-t border-l border-[#DA8CA0]/30 rotate-45" />
                      <p className="text-xs text-[#CCCCD9] text-center leading-relaxed font-medium">
                        <span className="text-[#DA8CA0] font-bold block mb-2 uppercase tracking-wider">Important Disclaimer</span>
                        Heal Her is an AI support companion, not a licensed doctor. This is a safe space for guidance, not medical diagnosis.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-1 pointer-events-auto">
            <p className="text-[10px] text-[#CCCCD9] font-medium tracking-wider uppercase text-shadow-sm">
              Her Questions. Our Answers. Her Power.
            </p>
            <span className="text-[9px] font-mono text-[#DA8CA0]/50 border border-[#DA8CA0]/20 px-1 rounded">
              v1.0
            </span>
          </div>
        </div>

        {/* RIGHT: Actions */}
        <div className="flex items-center" ref={menuRef}>
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className={`p-2 transition-all duration-300 ${showMenu ? 'text-[#DA8CA0] rotate-90' : 'text-[#CCCCD9] hover:text-white'}`}
          >
            <MoreVertical className="w-5 h-5" /> 
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                style={{ transformOrigin: "top right" }}
                className="absolute right-4 top-16 w-56 py-2 rounded-3xl bg-[#231854] border border-white/10 shadow-2xl z-50 overflow-hidden ring-1 ring-white/5"
              >
                <div role="menu">
                  <MenuItem icon={Archive} label="Archive Chat" onClick={() => handleAction("archive")} />
                  <MenuItem icon={Flag} label="Report Issue" onClick={() => handleAction("report")} />
                  
                  <div className="my-2 mx-4 h-px bg-white/10" />
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

      {/* Coming Soon Modal */}
      <ComingSoonModal 
        isOpen={showComingSoon} 
        onClose={() => setShowComingSoon(false)} 
      />

      {/* DELETE WARNING MODAL */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        isLoading={isDeleting}
        onClose={() => !isDeleting && setShowDeleteModal(false)}
        onConfirm={executeDelete}
      />
    </>
  )
}

// --- HELPER COMPONENTS ---

function MenuItem({ icon: Icon, label, onClick, danger = false, disabled = false }: { icon: any, label: string, onClick: () => void, danger?: boolean, disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full px-5 py-3 flex items-center gap-3 text-sm font-medium transition-all duration-200 group",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        !disabled && danger ? "text-red-400 hover:bg-red-500/10 hover:text-red-300" : "",
        !disabled && !danger ? "text-[#CCCCD9] hover:bg-[#DA8CA0]/10 hover:text-[#DA8CA0]" : ""
      )}
    >
      <Icon className={cn("w-5 h-5 transition-transform", !disabled && "group-hover:scale-110", danger ? "text-red-400" : "text-[#DA8CA0]/70 group-hover:text-[#DA8CA0]")} />
      {label}
    </button>
  )
}

function DeleteConfirmationModal({ isOpen, isLoading, onClose, onConfirm }: { isOpen: boolean, isLoading: boolean, onClose: () => void, onConfirm: () => void }) {
  if (!isOpen) return null

  return createPortal(
    <div 
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose()
      }}
    >
      <div className="w-full max-w-sm bg-[#1C1246] border border-white/10 rounded-2xl shadow-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#DA8CA0]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col gap-4">
          <div className="mt-2">
            <h3 className="text-lg font-bold text-white">Delete conversation?</h3>
            <p className="text-sm text-[#CCCCD9]/70 mt-1">
              This action cannot be undone. The chat history will be permanently removed.
            </p>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <button 
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors shadow-lg shadow-red-500/20 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}