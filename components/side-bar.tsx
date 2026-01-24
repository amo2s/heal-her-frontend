"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation" 
import { SquarePen, Settings, User, Search, LogOut, Loader2, MessageSquare, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { FloatingCells } from "@/components/ui/floating-cells" 
import { ProfileSettingsModal } from "@/components/modals/profile-settings-modal"
import { motion, AnimatePresence } from "framer-motion"

// 1. IMPORT THE SHARED BRAIN (CONTEXT)
import { useChatContext } from "@/components/context/chat-context"

interface SidebarProps {
  className?: string
  onClose?: () => void
}

export function Sidebar({ className, onClose }: SidebarProps) {
  const [showProfileModal, setShowProfileModal] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSessionId = searchParams.get("session_id")

  // 2. GET DATA FROM CONTEXT (This makes it "Smart" and automatic)
  const { sessions, isLoading: sessionsLoading, refreshSessions } = useChatContext()

  // Local state for User Profile (Avatar/Name)
  const [userData, setUserData] = useState({
    id: "",
    name: "Heal User",
    email: "",
    phone: "",
    avatar: ""
  })
  const [userLoading, setUserLoading] = useState(true)

  // --- FETCH USER PROFILE ---
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("sb-access-token")
      if (!token) {
        setUserLoading(false)
        return
      }

      try {
        const response = await fetch("http://127.0.0.1:8000/auth/me", {
          headers: { "Authorization": `Bearer ${token}` }
        })
        
        if (response.ok) {
          const data = await response.json()
          setUserData({
            id: data.id,
            name: data.full_name || data.name || "Heal User", 
            email: data.email || "",
            phone: data.phone || "",
            avatar: data.avatar_url || "" 
          })
        }
      } catch (error) {
        console.error("Failed to load profile:", error)
      } finally {
        setUserLoading(false)
      }
    }
    
    fetchProfile()
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

  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation() // Stop the click from opening the chat
    if (!confirm("Are you sure you want to delete this conversation?")) return

    try {
      await fetch(`http://127.0.0.1:8000/sessions/${sessionId}?user_id=${userData.id}`, {
        method: "DELETE"
      })
      
      // 3. TELL CONTEXT TO REFRESH THE LIST INSTANTLY
      await refreshSessions()
      
      // If we deleted the chat we are currently looking at, go to new chat
      if (currentSessionId === sessionId) {
        router.push("/chat")
      }
    } catch (error) {
      console.error("Failed to delete session", error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("sb-access-token") 
    localStorage.removeItem("user-id")
    router.push("/login")
  }

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
               
               {/* NEW CHAT BUTTON */}
               <button 
                onClick={handleNewChat} 
                className="p-2 text-[#CCCCD9] hover:text-[#DA8CA0] hover:bg-white/5 rounded-lg transition-all tooltip"
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

          {/* CHAT HISTORY LIST (FROM CONTEXT) */}
          <div className="flex-1 overflow-y-auto mt-2 -mr-2 pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            
            {sessionsLoading ? (
               <div className="flex justify-center py-10">
                 <Loader2 className="w-6 h-6 animate-spin text-[#DA8CA0]/50" />
               </div>
            ) : sessions.length === 0 ? (
               <div className="flex flex-col items-center justify-center text-center opacity-40 mt-10">
                  <MessageSquare className="w-8 h-8 mb-2" />
                  <p className="text-xs text-[#CCCCD9]">No previous chats</p>
               </div>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-bold text-[#CCCCD9]/30 uppercase tracking-widest pl-2 mb-1">Recent</p>
                <AnimatePresence initial={false}>
                  {sessions.map((session) => (
                    <motion.div 
                      key={session.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      onClick={() => handleSessionClick(session.id)}
                      className={cn(
                        "group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border border-transparent",
                        currentSessionId === session.id 
                          ? "bg-[#DA8CA0]/10 border-[#DA8CA0]/20" 
                          : "hover:bg-white/5 hover:border-white/5"
                      )}
                    >
                      <MessageSquare className={cn(
                        "w-4 h-4 shrink-0 transition-colors",
                        currentSessionId === session.id ? "text-[#DA8CA0]" : "text-[#CCCCD9]/40 group-hover:text-[#CCCCD9]"
                      )} />
                      
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm truncate transition-colors",
                          currentSessionId === session.id ? "text-white font-medium" : "text-[#CCCCD9]/80 group-hover:text-white"
                        )}>
                          {session.title || "New Conversation"}
                        </p>
                        {/* Optional Date Display */}
                        {/* <p className="text-[10px] text-[#CCCCD9]/30 truncate">
                          {new Date(session.created_at).toLocaleDateString()}
                        </p> */}
                      </div>

                      {/* DELETE BUTTON */}
                      <button 
                        onClick={(e) => handleDeleteSession(e, session.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 hover:text-red-400 rounded-md transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* FOOTER - USER PROFILE AREA */}
          <div className="mt-auto pt-4 border-t border-white/5">
            <div className="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-white/5 transition-colors group">
              
              <div 
                className="flex items-center gap-3 overflow-hidden cursor-pointer"
                onClick={() => setShowProfileModal(true)}
              >
                {/* AVATAR */}
                <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-[#DA8CA0]/20 shadow-sm relative overflow-hidden group-hover:border-[#DA8CA0]/50 transition-colors">
                  {userLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#DA8CA0]" />
                  ) : userData.avatar ? (
                    <Image 
                      src={userData.avatar} 
                      alt="Avatar" 
                      fill 
                      className="object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-[#DA8CA0] to-[#1C1246] flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-white truncate leading-tight">
                    {userData.name}
                  </span>
                  <span className="text-[10px] text-[#CCCCD9]/50 truncate">
                    View Profile
                  </span>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex items-center gap-0.5">
                <button 
                  onClick={() => setShowProfileModal(true)} 
                  className="p-2 text-[#CCCCD9]/40 hover:text-[#DA8CA0] hover:bg-white/5 rounded-lg transition-all"
                >
                  <Settings className="w-4 h-4" />
                </button>

                <button 
                  onClick={handleLogout}
                  className="p-2 text-[#CCCCD9]/40 hover:text-red-400 hover:bg-red-400/5 rounded-lg transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      <ProfileSettingsModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)}
        userName={userData.name}
        userEmail={userData.email}
        userPhone={userData.phone}
        userAvatar={userData.avatar}
      />
    </>
  )
}