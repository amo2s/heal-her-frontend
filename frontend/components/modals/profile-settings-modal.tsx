"use client"

import React, { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { 
  Camera, User, Mail, Phone, Lock, Loader2, 
  Info, CheckCircle, AlertTriangle, ChevronLeft, Trash2
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useRouter } from "next/navigation"
import imageCompression from "browser-image-compression"

// --- 1. SUCCESS TOAST ---
function SuccessToast({ message }: { message: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed top-10 left-1/2 -translate-x-1/2 z-[10005] bg-[#059669] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-white/10 backdrop-blur-md"
    >
      <CheckCircle className="w-5 h-5 text-white" />
      <span className="text-sm font-bold tracking-tight">{message}</span>
    </motion.div>
  )
}

// --- 2. DELETE CONFIRMATION SUB-MODAL ---
function DeleteConfirmation({ 
  isOpen, onClose, onConfirm, isLoading 
}: { 
  isOpen: boolean, onClose: () => void, onConfirm: () => void, isLoading: boolean 
}) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-[10006] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-sm bg-[#150E32] border border-red-500/20 rounded-2xl p-6 text-center shadow-2xl animate-in zoom-in-95"
      >
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/10">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Delete Account?</h3>
        <p className="text-sm text-[#CCCCD9]/70 mb-6 leading-relaxed">
          This action is permanent and cannot be undone. All your data and chat history will be erased.
        </p>
        <div className="flex flex-col gap-3">
          <button 
            onClick={onConfirm} 
            disabled={isLoading} 
            className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-red-500/20"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Yes, Delete Everything"}
          </button>
          <button 
            onClick={onClose} 
            disabled={isLoading} 
            className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// --- 3. MAIN MODAL COMPONENT ---
interface ProfileSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  userEmail?: string
  userName?: string
  userPhone?: string
  userAvatar?: string
}

export function ProfileSettingsModal({ 
  isOpen, onClose, userEmail, userName, userPhone, userAvatar 
}: ProfileSettingsModalProps) {
  const router = useRouter()
  
  const [domContainer, setDomContainer] = useState<HTMLElement | null>(null)
  
  const [mounted, setMounted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showCommunityInfo, setShowCommunityInfo] = useState(false)
  const [imageLoading, setImageLoading] = useState(true) 
  
  const [imagePreview, setImagePreview] = useState<string | null>(userAvatar || null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    fullName: userName || "",
    email: userEmail || "",
    phone: userPhone || "",
    password: "", 
  })

  useEffect(() => {
    setMounted(true)
    setDomContainer(document.body)
    
    if (isOpen) {
      setFormData({
        fullName: userName || "",
        email: userEmail || "",
        phone: userPhone || "",
        password: "",
      })
      if (userAvatar) {
        setImagePreview(userAvatar)
        setImageLoading(true)
      } else {
        setImageLoading(false)
      }
    }
  }, [isOpen, userName, userEmail, userPhone, userAvatar])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setImagePreview(URL.createObjectURL(file))
      setImageLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      const token = sessionStorage.getItem("sb-access-token")
      const response = await fetch("https://sliverboy-heal-her-backend.hf.space/profile/delete-account", {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (response.ok) {
        sessionStorage.clear()
        router.push("/login")
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const data = new FormData()
      data.append("full_name", formData.fullName)
      data.append("email", formData.email)
      data.append("phone", formData.phone)
      if (formData.password) data.append("password", formData.password)
      
      if (selectedFile) {
        const options = { maxSizeMB: 1, maxWidthOrHeight: 800, useWebWorker: true, fileType: "image/webp" }
        const compressedBlob = await imageCompression(selectedFile, options)
        data.append("file", new File([compressedBlob], "p.webp", { type: "image/webp" }))
      }

      const response = await fetch(" https://sliverboy-heal-her-backend.hf.space /profile/update", {
        method: "PUT",
        headers: { "Authorization": `Bearer ${sessionStorage.getItem("sb-access-token")}` },
        body: data,
      })

      if (response.ok) {
        setShowToast(true)
        setTimeout(() => {
          setShowToast(false)
          onClose()
        }, 1500)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen || !mounted || !domContainer) return null

  return createPortal(
    <>
      <AnimatePresence>
        {showToast && <SuccessToast message="Profile updated successfully!" />}
      </AnimatePresence>

      <div 
        className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-[#0A051E]/70 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      >
        {/* SHAPE MATCHING: max-w-2xl, max-h-[600px], h-fit, zoom-in-95 */}
        <div 
          onClick={(e) => e.stopPropagation()} 
          className="w-full max-w-2xl bg-[#150E32] border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col h-fit max-h-[600px] animate-in zoom-in-95 duration-200 my-auto"
        >
          {/* --- Header --- */}
          <div className="flex items-center gap-4 px-8 py-5 border-b border-white/5 bg-[#150E32] shrink-0">
            <button 
              onClick={onClose} 
              className="p-2 -ml-2 text-[#CCCCD9]/70 hover:text-white hover:bg-white/5 rounded-full transition-colors group"
            >
              <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <h2 className="text-lg font-bold text-white tracking-tight">Edit Profile</h2>
          </div>

          {/* --- Scrollable Body with CUSTOM SCROLLBAR --- */}
          <div className="flex-1 overflow-y-auto p-8
            [&::-webkit-scrollbar]:w-1.5
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:bg-white/10
            [&::-webkit-scrollbar-thumb]:rounded-full
            hover:[&::-webkit-scrollbar-thumb]:bg-white/20"
          >
            
            <div className="flex flex-col gap-8">
              
              {/* Avatar Section */}
              <div className="flex flex-col items-center">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-28 h-28 rounded-full border-4 border-[#150E32] outline outline-2 outline-[#DA8CA0]/30 overflow-hidden bg-white/5 flex items-center justify-center relative shadow-xl">
                    {imagePreview && imageLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#1C1246] z-20">
                        <Loader2 className="w-6 h-6 animate-spin text-[#DA8CA0]" />
                      </div>
                    )}
                    {imagePreview ? (
                      <Image 
                        src={imagePreview} alt="Profile" fill className="object-cover transition-transform group-hover:scale-105"
                        onLoadingComplete={() => setImageLoading(false)}
                        onError={() => setImageLoading(false)} 
                      />
                    ) : (
                      <User className="w-10 h-10 text-white/30" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-[1px] z-30">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                </div>
                <p className="text-[10px] text-[#DA8CA0] mt-3 font-bold uppercase tracking-widest cursor-pointer hover:underline" onClick={() => fileInputRef.current?.click()}>
                  Tap to change photo
                </p>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
              </div>

              {/* Form Fields - Grid Layout for wider shape */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#CCCCD9]/50 ml-1 uppercase tracking-wider">Full Name</label>
                  <div className="group flex items-center gap-3 px-4 py-3 bg-[#0A051E]/30 border border-white/10 rounded-xl focus-within:border-[#DA8CA0]/50 focus-within:bg-[#0A051E]/50 transition-all">
                    <User className="w-4 h-4 text-[#CCCCD9]/50 group-focus-within:text-[#DA8CA0]" />
                    <input 
                      type="text" 
                      value={formData.fullName} 
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
                      className="bg-transparent w-full text-sm text-white outline-none placeholder:text-[#CCCCD9]/20"
                      placeholder="Enter your name"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#CCCCD9]/50 ml-1 uppercase tracking-wider">Email Address</label>
                  <div className="group flex items-center gap-3 px-4 py-3 bg-[#0A051E]/30 border border-white/10 rounded-xl focus-within:border-[#DA8CA0]/50 focus-within:bg-[#0A051E]/50 transition-all">
                    <Mail className="w-4 h-4 text-[#CCCCD9]/50 group-focus-within:text-[#DA8CA0]" />
                    <input 
                      type="email" 
                      value={formData.email} 
                      onChange={(e) => setFormData({...formData, email: e.target.value})} 
                      className="bg-transparent w-full text-sm text-white outline-none placeholder:text-[#CCCCD9]/20"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="space-y-1.5 relative">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-[#CCCCD9]/50 ml-1 uppercase tracking-wider">WhatsApp Number</label>
                    <button 
                        onClick={() => setShowCommunityInfo(!showCommunityInfo)} 
                        className="text-[#DA8CA0] hover:text-white transition-colors"
                        type="button"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  <div className="group flex items-center gap-3 px-4 py-3 bg-[#0A051E]/30 border border-white/10 rounded-xl focus-within:border-[#DA8CA0]/50 focus-within:bg-[#0A051E]/50 transition-all">
                    <Phone className="w-4 h-4 text-[#CCCCD9]/50 group-focus-within:text-[#DA8CA0]" />
                    <input 
                      type="tel" 
                      value={formData.phone} 
                      onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                      className="bg-transparent w-full text-sm text-white outline-none placeholder:text-[#CCCCD9]/20"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  
                  <AnimatePresence>
                    {showCommunityInfo && (
                        <motion.div 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute bottom-full mb-2 right-0 w-64 p-3 bg-[#2D2455] border border-[#DA8CA0]/30 rounded-xl text-[11px] text-[#CCCCD9] z-50 shadow-xl"
                        >
                            <span className="text-[#DA8CA0] font-bold block mb-1">Why ask?</span>
                            By adding your number, you'll join our safe-space community for direct updates and support.
                        </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#CCCCD9]/50 ml-1 uppercase tracking-wider">Update Password</label>
                  <div className="group flex items-center gap-3 px-4 py-3 bg-[#0A051E]/30 border border-white/10 rounded-xl focus-within:border-[#DA8CA0]/50 focus-within:bg-[#0A051E]/50 transition-all">
                    <Lock className="w-4 h-4 text-[#CCCCD9]/50 group-focus-within:text-[#DA8CA0]" />
                    <input 
                      type="password" 
                      value={formData.password} 
                      onChange={(e) => setFormData({...formData, password: e.target.value})} 
                      className="bg-transparent w-full text-sm text-white outline-none placeholder:text-[#CCCCD9]/20" 
                      placeholder="Leave blank to keep" 
                    />
                  </div>
                </div>

              </div>

              <div className="h-px bg-white/5 my-2" />

              {/* Actions */}
              <div className="space-y-4">
                <button 
                  onClick={handleSave} 
                  disabled={isSaving || isDeleting} 
                  className="w-full py-3.5 bg-[#DA8CA0] hover:bg-[#c76b85] text-[#1C1246] font-bold rounded-xl transition-all shadow-lg shadow-[#DA8CA0]/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
                </button>
                
                <button 
                  onClick={() => setShowDeleteConfirm(true)} 
                  disabled={isSaving || isDeleting} 
                  className="w-full py-2 bg-transparent text-red-400/70 hover:text-red-400 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all hover:bg-red-500/5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> 
                  Delete Account permanently
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      <DeleteConfirmation 
        isOpen={showDeleteConfirm} 
        onClose={() => setShowDeleteConfirm(false)} 
        onConfirm={handleDeleteAccount} 
        isLoading={isDeleting} 
      />
    </>,
    domContainer
  )
}