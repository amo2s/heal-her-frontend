"use client"

import React, { useState, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation" 
import { 
  Settings as SettingsIcon, User, Search, Loader2, 
  MoreVertical, Pencil, Share2, Trash2, Sparkles, 
  MessageCircleHeart, Wand2 
} from "lucide-react"
import { cn } from "@/lib/utils"
import { FloatingCells } from "@/components/ui/floating-cells" 
import { Settings } from "@/components/settings"
import { ComingSoonModal } from "@/components/modals/coming-soon-modal"
import { motion, AnimatePresence } from "framer-motion"
import { useAudio } from "@/components/context/audio-manager"

// --- TYPES ---
interface SessionType {
  id: string;
  title: string;
  updatedAt: string;
}

interface SidebarProps {
  className?: string
  onClose?: () => void
}

export function Sidebar({ className, onClose }: SidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSessionId = searchParams.get("session_id")
  const { playSfx } = useAudio()

  // STATE
  const [sessions, setSessions] = useState<SessionType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  
  const [showSettings, setShowSettings] = useState(false)
  const [showComingSoon, setShowComingSoon] = useState(false)
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false) 
  
  const [userData] = useState({ id: "guest", name: "Heal User", email: "", phone: "", avatar: "" })

  // --- 1. GRAPHQL DATA FETCHING ---
  const fetchSessions = useCallback(async () => {
    setIsLoading(true)
    const authToken = sessionStorage.getItem("auth-token") || ""
    
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
      // UPDATED PATH: Correctly targets the kids graphql management endpoint
      const response = await fetch("/api/proxy/kids/ai-buddy/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({ query }),
      })
      
      const { data, errors } = await response.json()
      
      if (errors) throw new Error(errors[0].message)
      if (data?.getActiveSessions) {
        setSessions(data.getActiveSessions)
      }
    } catch (err) {
      console.error("GraphQL Fetch Error:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  // Click Outside Handler for the Portal Menu
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

  // --- HANDLERS ---
  const handleSessionClick = (sessionId: string) => {
    playSfx('click')
    router.push(`/dashboard/kids/ai-buddy?session_id=${sessionId}`)
    if (onClose) onClose()
  }

  const handleNewChat = () => {
    playSfx('yay')
    router.push("/dashboard/kids/ai-buddy") 
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

  // --- 2. OPTIMISTIC GRAPHQL MUTATION (DELETE) ---
  const executeDelete = async () => {
    if (!sessionToDelete) return
    setIsDeleting(true)
    const authToken = sessionStorage.getItem("auth-token") || ""
    const targetSessionId = sessionToDelete // Snapshot the ID before clearing state

    const mutation = `
      mutation DeleteSession($sessionId: String!) {
        deleteChatSession(sessionId: $sessionId) {
          success
        }
      }
    `
    try {
      // 1. Optimistically hide it from the UI instantly
      setSessions(prev => prev.filter(s => s.id !== targetSessionId))
      setSessionToDelete(null)
      
      if (currentSessionId === targetSessionId) {
        router.push("/dashboard/kids/ai-buddy")
      }

      // 2. Perform the actual backend deletion in the background
      await fetch("/api/proxy/kids/ai-buddy/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          query: mutation,
          variables: { sessionId: targetSessionId }
        }),
      })
    } catch (e) { 
      console.error("Delete failed", e) 
      // If it fails, you could technically refetch here to restore the item
    } finally { 
      setIsDeleting(false) 
    }
  }

  // Filter sessions based on sleek search bar
  const filteredSessions = sessions.filter(s => 
    (s.title || "").toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      <div className={cn(
        "relative flex flex-col h-full w-full overflow-hidden bg-[#130C2E] backdrop-blur-3xl border-r border-[#DA8CA0]/30 shadow-[4px_0_24px_rgba(218,140,160,0.15)] rounded-r-[2rem] md:rounded-none", 
        className
      )}>
        <FloatingCells />

        <div className="relative z-10 flex flex-col h-full p-5 gap-6">
          
          {/* TOP SECTION: Logo & Action */}
          <div className="flex flex-col gap-5 mt-2">
            <div className="flex items-center justify-between">
               <motion.div 
                 whileHover={{ scale: 1.1, rotate: [-5, 5, -5, 0] }}
                 transition={{ type: "spring", bounce: 0.6 }}
                 className="relative h-14 w-14 bg-gradient-to-br from-white/10 to-white/5 rounded-3xl border border-white/20 p-2 shadow-[0_0_20px_rgba(218,140,160,0.4)] cursor-pointer"
               >
                 <Image src="/heal-logo.png" alt="Logo" fill className="object-contain p-2 drop-shadow-md" priority />
               </motion.div>
               
               <motion.button 
                whileHover={{ scale: 1.05, boxShadow: "0 8px 25px rgba(218,140,160,0.5)" }}
                whileTap={{ scale: 0.9 }}
                onClick={handleNewChat} 
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#DA8CA0] to-purple-400 text-white rounded-2xl shadow-lg transition-all font-black uppercase text-[11px] tracking-[0.15em]"
               >
                 <Wand2 className="w-4 h-4" />
                 <span>New Talk</span>
               </motion.button>
            </div>
            
            {/* Search: Playful Pill Shape */}
            <motion.div whileFocus={{ scale: 1.02 }} className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#CCCCD9]/50 group-focus-within:text-[#DA8CA0] transition-colors" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find a memory..." 
                className="w-full bg-[#1C1246] border-2 border-white/10 rounded-full py-3.5 pl-11 pr-4 text-xs text-white placeholder:text-[#CCCCD9]/40 focus:outline-none focus:border-[#DA8CA0]/60 focus:bg-[#1C1246]/80 transition-all font-medium uppercase tracking-widest shadow-inner"
              />
            </motion.div>
          </div>

          {/* CHAT LIST: Memory Cards */}
          <div className="flex-1 overflow-y-auto mt-2 pr-1 scrollbar-none">
            <div className="flex items-center gap-2 mb-4 px-1">
              <Sparkles className="w-4 h-4 text-[#DA8CA0] animate-pulse" />
              <p className="text-[11px] font-black text-[#DA8CA0] uppercase tracking-[0.2em]">Past Sessions</p>
            </div>
            
            {isLoading ? (
               <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#DA8CA0]" /></div>
            ) : filteredSessions.length === 0 ? (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center text-center opacity-50 mt-12">
                  <MessageCircleHeart className="w-12 h-12 mb-4 text-[#DA8CA0]" />
                  <p className="text-[11px] uppercase font-black text-[#CCCCD9] tracking-widest">No Memories Yet!</p>
               </motion.div>
            ) : (
              <div className="flex flex-col gap-3">
                <AnimatePresence initial={false}>
                  {filteredSessions.map((session) => {
                    const isActive = currentSessionId === session.id;
                    return (
                      <motion.div 
                        key={session.id}
                        layout
                        initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 0.8, filter: "blur(5px)" }}
                        transition={{ type: "spring", bounce: 0.4 }}
                        onClick={() => handleSessionClick(session.id)}
                        className={cn(
                          "group relative flex items-center p-4 rounded-[1.5rem] cursor-pointer transition-all border-2",
                          isActive 
                            ? "bg-gradient-to-r from-[#DA8CA0]/20 to-transparent border-[#DA8CA0]/50 shadow-[0_4px_20px_rgba(218,140,160,0.2)]" 
                            : "bg-[#1C1246]/50 border-white/5 hover:border-white/10 hover:bg-[#1C1246]"
                        )}
                      >
                        <div className="flex-1 min-w-0 pr-6">
                          <p className={cn(
                            "text-[13px] truncate tracking-wider",
                            isActive ? "text-white font-black" : "text-[#CCCCD9] font-bold"
                          )}>
                            {session.title || "Buddy Talk ✨"}
                          </p>
                        </div>

                        <button 
                          data-menu-trigger
                          onClick={(e) => handleMenuOpen(e, session.id)}
                          className="absolute right-3 p-2 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all active:scale-95"
                        >
                          <MoreVertical className="w-4 h-4 text-white" />
                        </button>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* FOOTER: User Card (Bouncy) */}
          <div className="mt-auto pt-4 border-t border-white/10 pb-2">
            <motion.div 
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-between p-3.5 rounded-[1.5rem] bg-gradient-to-br from-white/10 to-transparent border border-white/10 cursor-pointer group shadow-lg"
              onClick={() => { playSfx('click'); setShowSettings(true); }}
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#DA8CA0] to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(218,140,160,0.4)]">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[12px] font-black text-white uppercase tracking-wider">{userData.name}</span>
                  <span className="text-[9px] font-bold text-[#DA8CA0] uppercase tracking-widest opacity-90">My Settings</span>
                </div>
              </div>
              <SettingsIcon className="w-5 h-5 text-white/50 group-hover:text-white group-hover:rotate-180 transition-all duration-500" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* PORTAL MENU: Soft Bubble Design */}
      <PortalMenu isOpen={!!activeMenuId} position={menuPosition} onClose={() => setActiveMenuId(null)}>
        <div className="p-2 flex flex-col gap-1">
          <MenuItem icon={Pencil} label="Rename" onClick={() => handleMenuAction('rename', activeMenuId!)} />
          <MenuItem icon={Share2} label="Share" onClick={() => handleMenuAction('share', activeMenuId!)} />
          <div className="h-px bg-white/10 my-1 mx-2" />
          <MenuItem icon={Trash2} label="Delete" isDestructive onClick={() => handleMenuAction('delete', activeMenuId!)} />
        </div>
      </PortalMenu>

      <Settings isOpen={showSettings} onClose={() => setShowSettings(false)} initialData={userData} />
      
      {showComingSoon && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowComingSoon(false)}>
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

// --- SUB-COMPONENTS ---

function PortalMenu({ isOpen, position, children }: any) {
  if (!isOpen) return null
  return createPortal(
    <motion.div 
      data-portal-menu
      initial={{ opacity: 0, scale: 0.8, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", bounce: 0.5 }}
      style={{ top: position.top, left: position.left }}
      className="fixed z-[100] w-44 bg-[#1C1246]/95 backdrop-blur-2xl border-2 border-white/10 rounded-[1.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.6)] overflow-hidden"
    >
      {children}
    </motion.div>,
    document.body
  )
}

function MenuItem({ icon: Icon, label, onClick, isDestructive = false }: any) {
  return (
    <button onClick={onClick} className={cn(
      "flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase tracking-widest rounded-[1rem] transition-all",
      isDestructive ? "text-rose-400 hover:bg-rose-500/15" : "text-white/70 hover:bg-white/10 hover:text-white"
    )}>
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  )
}

function DeleteConfirmationModal({ isOpen, isLoading, onClose, onConfirm }: any) {
  if (!isOpen) return null
  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={onClose}>
      <motion.div 
        initial={{ scale: 0.8, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        transition={{ type: "spring", bounce: 0.6 }}
        className="w-full max-w-sm bg-[#1C1246] border-4 border-[#DA8CA0]/30 rounded-[2.5rem] p-8 text-center shadow-[0_20px_50px_rgba(218,140,160,0.2)]"
      >
        <div className="w-16 h-16 mx-auto mb-4 bg-rose-500/20 rounded-full flex items-center justify-center">
          <Trash2 className="w-8 h-8 text-rose-400" />
        </div>
        <h3 className="text-2xl font-black text-white mb-2">Delete Memory?</h3>
        <p className="text-xs text-[#CCCCD9]/80 mb-8 uppercase tracking-widest font-bold">This buddy talk will disappear forever!</p>
        
        <div className="flex flex-col gap-3">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={onConfirm} 
            disabled={isLoading} 
            className="w-full py-4 bg-gradient-to-r from-rose-500 to-red-600 rounded-2xl text-white font-black uppercase text-[12px] tracking-widest shadow-[0_5px_15px_rgba(244,63,94,0.4)]"
          >
            {isLoading ? "Poof!..." : "Yes, Delete It!"}
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose} 
            disabled={isLoading} 
            className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-white font-black text-[12px] uppercase tracking-widest transition-all"
          >
            No, Keep It
          </motion.button>
        </div>
      </motion.div>
    </div>,
    document.body
  )
}