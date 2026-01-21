"use client"

import React, { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { 
  X, Camera, User, Mail, Phone, Lock, Loader2, 
  Info, CheckCircle2, Trash2, CheckCircle, AlertTriangle 
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useRouter } from "next/navigation"
import imageCompression from "browser-image-compression"

// --- 1. SUCCESS TOAST COMPONENT ---
function SuccessToast({ message }: { message: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed top-10 left-1/2 -translate-x-1/2 z-[10001] bg-[#059669] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-white/10"
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
    <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm bg-[#1C1246] border border-red-500/30 rounded-2xl p-6 text-center"
      >
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Are you sure?</h3>
        <p className="text-sm text-[#CCCCD9]/70 mb-6">This is permanent. Your data will be wiped forever.</p>
        <div className="flex flex-col gap-3">
          <button onClick={onConfirm} disabled={isLoading} className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl flex items-center justify-center gap-2">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Yes, Delete Account"}
          </button>
          <button onClick={onClose} disabled={isLoading} className="w-full py-3 bg-white/5 text-white rounded-xl">Cancel</button>
        </div>
      </motion.div>
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
      const token = localStorage.getItem("sb-access-token")
      const response = await fetch("http://127.0.0.1:8000/profile/delete-account", {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (response.ok) {
        localStorage.clear()
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

      const response = await fetch("http://127.0.0.1:8000/profile/update", {
        method: "PUT",
        headers: { "Authorization": `Bearer ${localStorage.getItem("sb-access-token")}` },
        body: data,
      })

      if (response.ok) {
        setShowToast(true)
        setTimeout(() => {
          window.location.reload()
          onClose()
        }, 1500)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen || !mounted) return null

  return createPortal(
    <>
      <AnimatePresence>
        {showToast && <SuccessToast message="Profile updated successfully!" />}
      </AnimatePresence>

      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          onClick={(e) => e.stopPropagation()} 
          className="relative w-full max-w-md bg-[#1C1246] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
            <h2 className="text-lg font-semibold text-white italic">Profile Settings</h2>
            <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex flex-col items-center">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-24 h-24 rounded-full border-2 border-[#DA8CA0] overflow-hidden bg-white/5 flex items-center justify-center relative">
                  {imagePreview && imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#1C1246] z-20">
                      <Loader2 className="w-6 h-6 animate-spin text-[#DA8CA0]" />
                    </div>
                  )}
                  {imagePreview ? (
                    <Image 
                      src={imagePreview} alt="Profile" fill className="object-cover"
                      onLoadingComplete={() => setImageLoading(false)}
                      onError={() => setImageLoading(false)} 
                    />
                  ) : (
                    <User className="w-10 h-10 text-white/30" />
                  )}
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-[10px] text-[#CCCCD9]/50 mt-2 font-bold uppercase tracking-widest">Change Photo</p>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#CCCCD9]/50 ml-1 uppercase">Full Name</label>
                <div className="flex items-center gap-3 px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl focus-within:border-[#DA8CA0]/50 transition-colors">
                  <User className="w-4 h-4 text-[#DA8CA0]" />
                  <input type="text" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="bg-transparent w-full text-sm text-white outline-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#CCCCD9]/50 ml-1 uppercase">Email Address</label>
                <div className="flex items-center gap-3 px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl focus-within:border-[#DA8CA0]/50 transition-colors">
                  <Mail className="w-4 h-4 text-[#DA8CA0]" />
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="bg-transparent w-full text-sm text-white outline-none" />
                </div>
              </div>

              <div className="space-y-1 relative">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-[#CCCCD9]/50 ml-1 uppercase">WhatsApp Number</label>
                  <button onClick={() => setShowCommunityInfo(!showCommunityInfo)} className="mr-1 text-[#DA8CA0] transition-colors">
                    <Info className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex items-center gap-3 px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl focus-within:border-[#DA8CA0]/50 transition-colors">
                  <Phone className="w-4 h-4 text-[#DA8CA0]" />
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="bg-transparent w-full text-sm text-white outline-none" />
                </div>
                {showCommunityInfo && <div className="absolute bottom-full mb-2 right-0 w-64 p-3 bg-[#2D2455] border border-[#DA8CA0]/30 rounded-xl text-[10px] text-white z-50">By adding your number, you'll join our safe-space community.</div>}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#CCCCD9]/50 ml-1 uppercase">Update Password</label>
                <div className="flex items-center gap-3 px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl focus-within:border-[#DA8CA0]/50 transition-colors">
                  <Lock className="w-4 h-4 text-[#DA8CA0]" />
                  <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="bg-transparent w-full text-sm text-white outline-none" placeholder="New Password" />
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button onClick={handleSave} disabled={isSaving || isDeleting} className="w-full py-3 bg-[#DA8CA0] hover:bg-[#c76b85] text-[#1C1246] font-bold rounded-xl transition-all shadow-lg flex items-center justify-center">
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
              </button>
              <button onClick={() => setShowDeleteConfirm(true)} disabled={isSaving || isDeleting} className="w-full py-2.5 bg-transparent border border-red-500/30 text-red-500 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all">
                <Trash2 className="w-3.5 h-3.5" /> Delete Account
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <DeleteConfirmation 
        isOpen={showDeleteConfirm} 
        onClose={() => setShowDeleteConfirm(false)} 
        onConfirm={handleDeleteAccount} 
        isLoading={isDeleting} 
      />
    </>,
    document.body
  )
}