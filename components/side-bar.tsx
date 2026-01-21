"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation" 
import { SquarePen, Settings, User, Search, LogOut, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { FloatingCells } from "@/components/ui/floating-cells" 
import { ProfileSettingsModal } from "@/components/modals/profile-settings-modal"

interface SidebarProps {
  className?: string
  onClose?: () => void
}

export function Sidebar({ className, onClose }: SidebarProps) {
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const [userData, setUserData] = useState({
    name: "Heal User",
    email: "",
    phone: "",
    avatar: ""
  })

  // --- FETCH USER DETAILS ---
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("sb-access-token")
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch("http://127.0.0.1:8000/profile/me", {
          headers: { "Authorization": `Bearer ${token}` }
        })
        
        if (response.ok) {
          const data = await response.json()
          
          setUserData({
            name: data.full_name || "Heal User", 
            email: data.email || "",
            phone: data.phone || "",
            avatar: data.avatar_url || "" 
          })
        }
      } catch (error) {
        console.error("Failed to load profile:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

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
               <button onClick={() => window.location.reload()} className="p-2 text-[#CCCCD9] hover:text-[#DA8CA0] hover:bg-white/5 rounded-lg transition-all">
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

          {/* CHAT HISTORY AREA */}
          <div className="flex-1 overflow-y-auto mt-4 flex flex-col items-center justify-center text-center opacity-40">
             <p className="text-xs text-[#CCCCD9]">No previous chats</p>
          </div>

          {/* FOOTER - USER PROFILE AREA */}
          <div className="mt-auto pt-4 border-t border-white/5">
            <div className="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-white/5 transition-colors group">
              
              <div 
                className="flex items-center gap-3 overflow-hidden cursor-pointer"
                onClick={() => setShowProfileModal(true)}
              >
                {/* IMPROVED AVATAR CONTAINER */}
                <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-[#DA8CA0]/20 shadow-sm relative overflow-hidden group-hover:border-[#DA8CA0]/50 transition-colors">
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#DA8CA0]" />
                  ) : userData.avatar ? (
                    <Image 
                      src={userData.avatar} 
                      alt="Avatar" 
                      fill 
                      unoptimized // Use this if your Supabase domain isn't in next.config.js
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