"use client"

import React, { useState, useEffect, useCallback, Suspense } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation" 
import { 
  Settings as SettingsIcon, User, Search, Loader2, 
  MoreVertical, Pencil, Share2, Trash2, Sparkles, 
  History 
} from "lucide-react"
import { cn } from "@/lib/utils"
import { FloatingCells } from "@/components/ui/floating-cells" 
import { Settings } from "@/components/settings"
import { ComingSoonModal } from "@/components/modals/coming-soon-modal"
import { motion, AnimatePresence } from "framer-motion"
import { useAudio } from "@/components/context/audio-manager"

interface SessionType {
  id: string;
  title: string;
  updatedAt: string;
}

interface SidebarProps {
  base?: string; // Added to resolve the DashLayout TypeScript error
  className?: string
  onClose?: () => void
}

function SidebarContent({ className, onClose }: SidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSessionId = searchParams.get("session_id")
  const { playSfx } = useAudio()

  const [sessions, setSessions] = useState<SessionType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSettings, setShowSettings] = useState(false)
  const [showComingSoon, setShowComingSoon] = useState(false)
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false) 
  
  const [userData] = useState({ id: "user", name: "User", email: "", phone: "", avatar: "" })

  const fetchSessions = useCallback(async () => {
    setIsLoading(true)
    // Updated to match the token key used in TeensChatPage
    const authToken = sessionStorage.getItem("sb-access-token") || ""
    
    const query = `
      query GetActiveSessions {
        getActiveSessions(limit: 30, offset: 0) {
          id
          title
          updatedAt
        }
      }
    `
    try {
      const response = await fetch("/api/proxy/teens/heal-ai/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({ query }),
      })
      
      const { data, errors } = await response.json()
      if (errors) throw new Error(errors[0].message)
      if (data?.getActiveSessions) setSessions(data.getActiveSessions)
    } catch (err) {
      console.error("Session Fetch Error:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetchSessions() }, [fetchSessions])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement
      if (!target.closest('[data-portal-menu]') && !target.closest('[data-menu-trigger]')) {
        setActiveMenuId(null)
      }
    }
    window.addEventListener("click", handleClickOutside)
    return () => window.removeEventListener("click", handleClickOutside)
  }, [])

  const handleSessionClick = (sessionId: string) => {
    playSfx('click')
    router.push(`/dashboard/teens/heal-ai?session_id=${sessionId}`)
    if (onClose) onClose()
  }

  const handleNewSession = () => {
    playSfx('click')
    router.push("/dashboard/teens/heal-ai") 
    if (onClose) onClose()
  }

  const handleMenuOpen = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    setMenuPosition({ top: rect.top, left: rect.right + 10 })
    setActiveMenuId(activeMenuId === sessionId ? null : sessionId)
  }

  const handleMenuAction = (action: string, sessionId: string) => {
    playSfx('click')
    setActiveMenuId(null)
    if (action === 'delete') setSessionToDelete(sessionId)
    else setShowComingSoon(true)
  }

  const executeDelete = async () => {
    if (!sessionToDelete) return
    setIsDeleting(true)
    // Updated to match the token key used in TeensChatPage
    const authToken = sessionStorage.getItem("sb-access-token") || ""
    const targetId = sessionToDelete

    const mutation = `
      mutation DeleteSession($sessionId: String!) {
        deleteChatSession(sessionId: $sessionId) {
          success
        }
      }
    `
    try {
      setSessions(prev => prev.filter(s => s.id !== targetId))
      setSessionToDelete(null)
      if (currentSessionId === targetId) router.push("/dashboard/teens/heal-ai")

      await fetch("/api/proxy/teens/heal-ai/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({ query: mutation, variables: { sessionId: targetId } }),
      })
    } catch (e) { 
      console.error("Delete failed", e) 
    } finally { 
      setIsDeleting(false) 
    }
  }

  const filteredSessions = sessions.filter(s => 
    (s.title || "").toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      <div className={cn(
        "relative flex flex-col h-full w-full overflow-hidden bg-background backdrop-blur-3xl border-r border-white/10 shadow-xl rounded-r-3xl md:rounded-none", 
        className
      )}>
        <FloatingCells />

        <div className="relative z-10 flex flex-col h-full p-6 gap-6">
          <div className="flex flex-col gap-6 mt-2">
            <div className="flex items-center justify-between">
               <motion.div 
                 whileHover={{ scale: 1.05 }}
                 className="relative h-10 w-10 bg-white/5 rounded-xl border border-white/10 p-2 shadow-2xl cursor-pointer"
               >
                 <Image src="/heal-logo.png" alt="Logo" fill className="object-contain p-2" priority />
               </motion.div>
               
               <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNewSession} 
                className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl shadow-lg transition-all font-bold uppercase text-[10px] tracking-wider"
               >
                 <Sparkles className="w-3.5 h-3.5" />
                 <span>New Session</span>
               </motion.button>
            </div>
            
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search history..." 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-primary/40 focus:bg-white/10 transition-all font-medium"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto mt-2 pr-1 scrollbar-none">
            <div className="flex items-center gap-2 mb-4 px-1 opacity-40">
              <History className="w-3.5 h-3.5" />
              <p className="text-[10px] font-bold uppercase tracking-widest">History</p>
            </div>
            
            {isLoading ? (
               <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : filteredSessions.length === 0 ? (
               <div className="flex flex-col items-center justify-center text-center opacity-30 mt-12">
                  <p className="text-[10px] uppercase font-bold tracking-widest">No sessions found</p>
               </div>
            ) : (
              <div className="flex flex-col gap-2">
                <AnimatePresence initial={false}>
                  {filteredSessions.map((session) => {
                    const isActive = currentSessionId === session.id;
                    return (
                      <motion.div 
                        key={session.id}
                        layout
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={() => handleSessionClick(session.id)}
                        className={cn(
                          "group relative flex items-center p-3.5 rounded-xl cursor-pointer transition-all border",
                          isActive 
                            ? "bg-white/10 border-white/10 shadow-sm" 
                            : "bg-transparent border-transparent hover:bg-white/5"
                        )}
                      >
                        <div className="flex-1 min-w-0 pr-6">
                          <p className={cn(
                            "text-xs truncate tracking-wide",
                            isActive ? "text-white font-bold" : "text-white/50 font-medium"
                          )}>
                            {session.title || "Untitled Session"}
                          </p>
                        </div>

                        <button 
                          data-menu-trigger
                          onClick={(e) => handleMenuOpen(e, session.id)}
                          className="absolute right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all"
                        >
                          <MoreVertical className="w-3.5 h-3.5 text-white/50" />
                        </button>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          <div className="mt-auto pt-4 border-t border-white/10 pb-2">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 cursor-pointer group transition-colors hover:bg-white/10"
              onClick={() => { playSfx('click'); setShowSettings(true); }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-white uppercase">{userData.name}</span>
                  <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Settings</span>
                </div>
              </div>
              <SettingsIcon className="w-4 h-4 text-white/30 group-hover:text-white transition-all" />
            </motion.div>
          </div>
        </div>
      </div>

      <PortalMenu isOpen={!!activeMenuId} position={menuPosition} onClose={() => setActiveMenuId(null)}>
        <div className="p-1.5 flex flex-col">
          <MenuItem icon={Pencil} label="Rename" onClick={() => handleMenuAction('rename', activeMenuId!)} />
          <MenuItem icon={Share2} label="Share" onClick={() => handleMenuAction('share', activeMenuId!)} />
          <div className="h-px bg-white/5 my-1 mx-2" />
          <MenuItem icon={Trash2} label="Delete" isDestructive onClick={() => handleMenuAction('delete', activeMenuId!)} />
        </div>
      </PortalMenu>

      <Settings isOpen={showSettings} onClose={() => setShowSettings(false)} initialData={userData} />
      
      {showComingSoon && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={() => setShowComingSoon(false)}>
          <ComingSoonModal isOpen={true} onClose={() => setShowComingSoon(false)} />
        </div>,
        document.body
      )}

      <DeleteConfirmationModal 
        isOpen={!!sessionToDelete} 
        isLoading={isDeleting} 
        onClose={() => setSessionToDelete(null)} 
        onConfirm={executeDelete} 
      />
    </>
  )
}

function PortalMenu({ isOpen, position, children }: any) {
  if (!isOpen) return null
  return createPortal(
    <motion.div 
      data-portal-menu
      initial={{ opacity: 0, scale: 0.95, y: -5 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      style={{ top: position.top, left: position.left }}
      className="fixed z-[100] w-40 bg-background border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
    >
      {children}
    </motion.div>,
    document.body
  )
}

function MenuItem({ icon: Icon, label, onClick, isDestructive = false }: any) {
  return (
    <button onClick={onClick} className={cn(
      "flex items-center gap-3 px-3 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all",
      isDestructive ? "text-red-400 hover:bg-red-500/10" : "text-white/50 hover:bg-white/5 hover:text-white"
    )}>
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </button>
  )
}

function DeleteConfirmationModal({ isOpen, isLoading, onClose, onConfirm }: any) {
  if (!isOpen) return null
  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={onClose}>
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 10 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        className="w-full max-w-sm bg-background border border-white/10 rounded-3xl p-8 text-center"
      >
        <div className="w-12 h-12 mx-auto mb-4 bg-red-500/10 rounded-full flex items-center justify-center">
          <Trash2 className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Delete Session?</h3>
        <p className="text-xs text-white/40 mb-8 uppercase tracking-widest font-bold">This action cannot be undone.</p>
        
        <div className="flex flex-col gap-3">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onConfirm} 
            disabled={isLoading} 
            className="w-full py-3.5 bg-red-500 rounded-xl text-white font-bold uppercase text-[11px] tracking-widest"
          >
            {isLoading ? "Deleting..." : "Confirm Delete"}
          </motion.button>
          
          <motion.button 
            onClick={onClose} 
            className="w-full py-3.5 bg-white/5 hover:bg-white/10 rounded-xl text-white font-bold text-[11px] uppercase tracking-widest transition-all"
          >
            Cancel
          </motion.button>
        </div>
      </motion.div>
    </div>,
    document.body
  )
}

// --- EXPORT WRAPPER WITH SUSPENSE ---
export function Sidebar(props: SidebarProps) {
  return (
    <Suspense fallback={
      <div className={cn("flex flex-col h-full w-full bg-background backdrop-blur-3xl border-r border-white/10 items-center justify-center", props.className)}>
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <SidebarContent {...props} />
    </Suspense>
  )
}