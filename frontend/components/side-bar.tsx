"use client"

import React, { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation" 
import { 
  SquarePen, Settings as SettingsIcon, User, Search, Loader2, 
  MoreVertical, Pencil, Share2, Pin, Trash2 
} from "lucide-react"
import { cn } from "@/lib/utils"
import { FloatingCells } from "@/components/ui/floating-cells" 
import { Settings } from "@/components/settings"
import { ComingSoonModal } from "@/components/modals/coming-soon-modal"
import { motion, AnimatePresence } from "framer-motion"

interface SidebarProps {
  className?: string
  onClose?: () => void
}

export function Sidebar({ className, onClose }: SidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSessionId = searchParams.get("session_id")

  // --- STATE ---
  const [showSettings, setShowSettings] = useState(false)
  const [showComingSoon, setShowComingSoon] = useState(false)
  
  // Menu State
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  
  // Delete State
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false) 

  // User Profile State
  const [userData] = useState({
    id: "", name: "Heal User", email: "", phone: "", avatar: ""
  })
  const [userLoading] = useState(false)

  // --- CLICK OUTSIDE HANDLER (For Menu) ---
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement
      if (!target.closest('[data-portal-menu]') && !target.closest('[data-menu-trigger]')) {
        setActiveMenuId(null)
      }
    }
    window.addEventListener("click", handleClickOutside)
    window.addEventListener("resize", () => setActiveMenuId(null))
    return () => {
      window.removeEventListener("click", handleClickOutside)
      window.removeEventListener("resize", () => setActiveMenuId(null))
    }
  }, [])

  // --- HANDLERS ---
  const handleSessionClick = (sessionId: string) => {
    router.push(`/chat?session_id=${sessionId}`)
    if (onClose) onClose()
  }

  const handleNewChat = () => {
    router.push("/chat")
    if (onClose) onClose()
  }

  const handleMenuOpen = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation()
    e.preventDefault()

    const rect = e.currentTarget.getBoundingClientRect()
    setMenuPosition({
      top: rect.top,
      left: rect.right + 5 
    })
    
    setActiveMenuId(activeMenuId === sessionId ? null : sessionId)
  }

  const handleMenuAction = (action: 'rename' | 'share' | 'pin' | 'delete', sessionId: string) => {
    setActiveMenuId(null)
    if (action === 'delete') {
      setSessionToDelete(sessionId)
    } else {
      setShowComingSoon(true)
    }
  }

  const executeDelete = async () => {
    // Placeholder for delete logic - URL and Context removed
    setIsDeleting(true)
    setTimeout(() => {
      setIsDeleting(false)
      setSessionToDelete(null)
      setShowComingSoon(true)
    }, 500)
  }

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <>
      <div className={cn("relative flex flex-col h-full w-full overflow-hidden bg-[#1C1246]/30 backdrop-blur-xl border-r border-white/5", className)}>
        <FloatingCells />

        <div className="relative z-10 flex flex-col h-full p-4 gap-4">
          
          {/* HEADER */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
               <button onClick={onClose} className="relative h-10 w-10 hover:scale-105 transition-transform">
                 <Image src="/heal-logo.png" alt="Logo" fill className="object-contain" priority />
               </button>
               
               <button 
                onClick={handleNewChat} 
                className="p-2 text-[#CCCCD9] hover:text-[#DA8CA0] bg-transparent hover:bg-white/5 hover:backdrop-blur-md rounded-lg transition-all tooltip"
                title="New Chat"
               >
                 <SquarePen className="w-5 h-5" />
               </button>
            </div>
            
            <div className="relative group mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#CCCCD9]/40 group-focus-within:text-[#DA8CA0] transition-colors" />
              <input 
                type="text" 
                placeholder="Search chats..." 
                className="w-full bg-white/5 border border-white/5 rounded-xl py-2 pl-9 pr-3 text-sm text-white placeholder:text-[#CCCCD9]/30 focus:outline-none focus:border-[#DA8CA0]/30 transition-all hover:bg-white/10"
              />
            </div>
          </div>

          {/* CHAT LIST */}
          <div className="flex-1 overflow-y-auto mt-2 -mr-2 pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
             <div className="flex flex-col items-center justify-center text-center opacity-40 mt-10">
                <p className="text-xs text-[#CCCCD9]">No previous chats</p>
             </div>
          </div>

          {/* FOOTER */}
          <div className="mt-auto pt-4 border-t border-white/5">
            <div 
              className="flex items-center justify-between gap-2 p-2 rounded-xl bg-transparent hover:bg-white/5 hover:backdrop-blur-md transition-all group cursor-pointer"
              onClick={() => setShowSettings(true)}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-[#DA8CA0]/20 shadow-sm relative overflow-hidden group-hover:border-[#DA8CA0]/50 transition-colors">
                  {userLoading ? <Loader2 className="w-4 h-4 animate-spin text-[#DA8CA0]" /> : 
                   userData.avatar ? <Image src={userData.avatar} alt="Avatar" fill className="object-cover" /> :
                   <div className="w-full h-full bg-gradient-to-tr from-[#DA8CA0] to-[#1C1246] flex items-center justify-center"><User className="w-4 h-4 text-white" /></div>
                  }
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-white truncate leading-tight">{userData.name}</span>
                  <span className="text-[10px] text-[#CCCCD9]/50 truncate group-hover:text-[#DA8CA0]/70 transition-colors">Settings & Account</span>
                </div>
              </div>
              
              <div className="p-2 text-[#DA8CA0] bg-white/5 rounded-lg border border-white/5 shadow-sm">
                <SettingsIcon className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PORTAL MENU */}
      <PortalMenu 
        isOpen={!!activeMenuId} 
        position={menuPosition} 
        onClose={() => setActiveMenuId(null)}
      >
        <div className="p-1 flex flex-col gap-0.5">
          <MenuItem icon={Pencil} label="Rename" onClick={() => handleMenuAction('rename', activeMenuId!)} />
          <MenuItem icon={Share2} label="Share" onClick={() => handleMenuAction('share', activeMenuId!)} />
          <MenuItem icon={Pin} label="Pin Chat" onClick={() => handleMenuAction('pin', activeMenuId!)} />
          <div className="h-px bg-white/5 my-1" />
          <MenuItem icon={Trash2} label="Delete" isDestructive onClick={() => handleMenuAction('delete', activeMenuId!)} />
        </div>
      </PortalMenu>

      {/* SETTINGS MODAL */}
      <Settings 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)}
        initialData={userData}
      />

      {mounted && showComingSoon && createPortal(
        <div 
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowComingSoon(false)
          }}
        >
          <ComingSoonModal 
            isOpen={true} 
            onClose={() => setShowComingSoon(false)} 
          />
        </div>,
        document.body
      )}

      {/* Local Delete Modal */}
      <DeleteConfirmationModal
        isOpen={!!sessionToDelete}
        isLoading={isDeleting}
        onClose={() => {
            if(!isDeleting) setSessionToDelete(null)
        }}
        onConfirm={executeDelete}
      />
    </>
  )
}

// --- PORTAL MENU ---
function PortalMenu({ isOpen, position, onClose, children }: { isOpen: boolean, position: { top: number, left: number }, onClose: () => void, children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted || !isOpen) return null

  return createPortal(
    <div 
      data-portal-menu
      style={{ top: position.top, left: position.left }}
      className="fixed z-[9999] w-48 bg-[#1C1246]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 origin-top-left"
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>,
    document.body
  )
}

// --- HELPERS ---
function MenuItem({ icon: Icon, label, onClick, isDestructive = false }: { icon: any, label: string, onClick: (e: React.MouseEvent) => void, isDestructive?: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors w-full text-left",
        isDestructive 
          ? "text-red-400 hover:bg-red-500/10 hover:text-red-300" 
          : "text-[#CCCCD9] hover:bg-white/5 hover:text-white"
      )}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  )
}

// --- LOCAL DELETE MODAL ---
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