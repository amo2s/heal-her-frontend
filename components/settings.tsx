"use client"

import React, { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import { 
  User, LogOut, ChevronRight, X, 
  Crown, Palette, Globe, HelpCircle, FileKey, Loader2 
} from "lucide-react"
import { cn } from "@/lib/utils"

// Import your existing modals
import { ProfileSettingsModal } from "@/components/modals/profile-settings-modal"
import { ComingSoonModal } from "@/components/modals/coming-soon-modal"

interface SettingsProps {
  isOpen: boolean
  onClose: () => void
  initialData?: {
    name: string
    email: string
    phone: string
    avatar: string
  }
}

export function Settings({ isOpen, onClose, initialData }: SettingsProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  
  // Logic for sub-modals
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showComingSoon, setShowComingSoon] = useState(false)
  
  // Logout Logic
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (isOpen) {
        setShowLogoutConfirm(false)
        setShowProfileModal(false)
        setShowComingSoon(false)
    }
  }, [isOpen])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    // Realistic delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    sessionStorage.removeItem("sb-access-token") 
    sessionStorage.removeItem("user-id")
    router.push("/login")
  }

  const handleAccountClick = () => setShowProfileModal(true)
  const handleFeatureClick = () => setShowComingSoon(true)

  if (!mounted || !isOpen) return null

  return createPortal(
    <div 
      className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-[#0A051E]/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !showLogoutConfirm && !showProfileModal && !showComingSoon) onClose()
      }}
    >
      {/* UPDATED CARD DIMENSIONS:
         - max-w-2xl (Wider)
         - max-h-[600px] (Restricted height to float in middle)
         - h-fit (Won't stretch if content is small)
      */}
      <div className="w-full max-w-2xl bg-[#150E32] border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col h-fit max-h-[600px] animate-in zoom-in-95 duration-200 my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-white/5 bg-[#150E32] shrink-0">
            <h2 className="text-lg font-bold text-white tracking-tight">Settings</h2>
            <button 
                onClick={onClose}
                className="p-2 -mr-2 text-[#CCCCD9]/50 hover:text-white hover:bg-white/5 rounded-full transition-colors"
            >
                <X className="w-5 h-5" />
            </button>
        </div>

        {/* Body with FORCED CUSTOM SCROLLBAR 
           Using arbitrary Tailwind values to ensure it takes effect 
        */}
        <div className="flex-1 overflow-y-auto p-6 
            [&::-webkit-scrollbar]:w-1.5
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:bg-white/10
            [&::-webkit-scrollbar-thumb]:rounded-full
            hover:[&::-webkit-scrollbar-thumb]:bg-white/20"
        >
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* COLUMN 1 */}
            <div className="flex flex-col gap-6">
                {/* Account */}
                <div className="flex flex-col gap-2">
                    <SectionLabel>Account</SectionLabel>
                    <SettingsItem 
                        icon={User} 
                        label="Account Center" 
                        description="Profile details & security"
                        onClick={handleAccountClick} 
                    />
                </div>

                {/* General */}
                <div className="flex flex-col gap-2">
                    <SectionLabel>General</SectionLabel>
                    <SettingsItem 
                        icon={Palette} 
                        label="Personalization" 
                        description="Theme & appearance"
                        onClick={handleFeatureClick} 
                    />
                    <SettingsItem 
                        icon={Globe} 
                        label="Language" 
                        description="English (Default)"
                        onClick={handleFeatureClick} 
                    />
                </div>
            </div>

            {/* COLUMN 2 */}
            <div className="flex flex-col gap-6">
                {/* Subscription */}
                <div className="flex flex-col gap-2">
                    <SectionLabel>Subscription</SectionLabel>
                    <SettingsItem 
                        icon={Crown} 
                        label="Upgrade Plan" 
                        description="Unlock premium features"
                        onClick={handleFeatureClick} 
                        highlight
                    />
                </div>

                {/* Support */}
                <div className="flex flex-col gap-2">
                    <SectionLabel>Support</SectionLabel>
                    <SettingsItem 
                        icon={HelpCircle} 
                        label="Help & Support" 
                        onClick={handleFeatureClick} 
                    />
                     <SettingsItem 
                        icon={FileKey} 
                        label="Data & Privacy" 
                        onClick={handleFeatureClick} 
                    />
                </div>
            </div>

          </div>

          <div className="h-px bg-white/5 my-6" />

          {/* Logout Button */}
          <button 
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-red-500/5 border border-transparent hover:border-red-500/10 text-red-400 hover:text-red-300 transition-all w-full text-left group"
          >
              <div className="p-2.5 rounded-xl bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
                <LogOut className="w-5 h-5" />
              </div>
              <div className="flex-1">
                  <span className="block text-sm font-medium">Log out</span>
                  <span className="text-xs opacity-50">End current session</span>
              </div>
          </button>
          
          <p className="text-center text-[10px] text-[#CCCCD9]/20 pt-4">
              Heal App v1.2.0
          </p>

        </div>
      </div>

      {/* --- SUB MODALS --- */}

      {/* 1. Account Center (Existing Profile Modal) */}
      <ProfileSettingsModal 
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        userName={initialData?.name || ""}
        userEmail={initialData?.email || ""}
        userPhone={initialData?.phone || ""}
        userAvatar={initialData?.avatar || ""}
      />

      {/* 2. Coming Soon Modal */}
      {showComingSoon && (
        <div 
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]"
            onClick={(e) => {
                if(e.target === e.currentTarget) setShowComingSoon(false)
            }}
        >
            <ComingSoonModal 
                isOpen={true} 
                onClose={() => setShowComingSoon(false)} 
            />
        </div>
      )}

      {/* 3. Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="absolute inset-0 z-[10000] flex items-center justify-center bg-[#0A051E]/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
            <div 
                className="w-full max-w-sm bg-[#1C1246] border border-white/10 rounded-2xl shadow-2xl p-6 relative overflow-hidden animate-in zoom-in-95"
                onClick={(e) => e.stopPropagation()} 
            >
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
                        <LogOut className="w-6 h-6 text-red-500" />
                    </div>
                    
                    <div>
                        <h3 className="text-lg font-bold text-white">Log out?</h3>
                        <p className="text-xs text-[#CCCCD9]/60 mt-2">
                            Are you sure you want to end your current session?
                        </p>
                    </div>

                    <div className="flex items-center gap-3 w-full mt-2">
                        <button 
                            onClick={() => setShowLogoutConfirm(false)}
                            disabled={isLoggingOut}
                            className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors border border-white/5"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                        >
                            {isLoggingOut ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Logging out...</span>
                                </>
                            ) : (
                                "Yes, Log out"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>,
    document.body
  )
}

// --- HELPER COMPONENTS ---

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <h4 className="px-1 text-[10px] font-bold text-[#CCCCD9]/40 uppercase tracking-widest mb-1">
            {children}
        </h4>
    )
}

interface SettingsItemProps {
  icon: any
  label: string
  description?: string
  onClick: () => void
  highlight?: boolean
}

function SettingsItem({ icon: Icon, label, description, onClick, highlight }: SettingsItemProps) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-3.5 p-3 rounded-xl transition-all w-full text-left group border",
        highlight 
            ? "bg-[#DA8CA0]/5 border-[#DA8CA0]/20 hover:bg-[#DA8CA0]/10" 
            : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 active:scale-[0.99]"
      )}
    >
      <div className={cn(
          "p-2.5 rounded-lg transition-colors shrink-0",
          highlight ? "bg-[#DA8CA0]/20 text-[#DA8CA0]" : "bg-[#0A051E]/40 text-[#CCCCD9] group-hover:text-white"
      )}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 text-left min-w-0">
        <h3 className={cn("text-sm font-semibold transition-colors truncate", highlight ? "text-white" : "text-white")}>
            {label}
        </h3>
        {description && (
          <p className="text-xs text-[#CCCCD9]/50 truncate mt-0.5">{description}</p>
        )}
      </div>
      <ChevronRight className={cn(
          "w-4 h-4 transition-colors shrink-0",
          highlight ? "text-[#DA8CA0]" : "text-[#CCCCD9]/20 group-hover:text-[#DA8CA0]"
      )} />
    </button>
  )
}