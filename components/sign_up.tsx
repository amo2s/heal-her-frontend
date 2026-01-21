"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// --- PROPS INTERFACE ---
// This allows the component to talk to the parent page
interface SignUpProps {
  onSwitchToLogin?: () => void;
}

// --- 1. THE CUSTOM "TOAST" CARD ---
const StatusMessage = ({ status, message, onClose }: { status: 'success' | 'error', message: string, onClose: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className={cn(
        "flex items-center gap-3 p-4 rounded-xl border backdrop-blur-md shadow-xl mb-6",
        status === 'success' 
          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-200" 
          : "bg-red-500/10 border-red-500/20 text-red-200"
      )}
    >
      <div className={cn(
        "p-2 rounded-full",
        status === 'success' ? "bg-emerald-500/20" : "bg-red-500/20"
      )}>
        {status === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
      </div>
      
      <div className="flex-1">
        <h4 className="text-sm font-semibold">
          {status === 'success' ? "Success" : "Error"}
        </h4>
        <p className="text-xs opacity-90">{message}</p>
      </div>

      <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
        <span className="sr-only">Close</span>
        ×
      </button>
    </motion.div>
  )
}

// --- HELPER COMPONENT ---
const InputField = ({ label, icon: Icon, type, placeholder, value, onChange }: any) => {
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const inputType = type === "password" ? (showPassword ? "text" : "password") : type

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-[#CCCCD9]/70 ml-1 uppercase tracking-wider">{label}</label>
      <div className={cn(
        "relative group transition-all duration-300 rounded-xl border bg-[#160d33]/50",
        isFocused ? "border-[#DA8CA0] shadow-[0_0_15px_rgba(218,140,160,0.1)]" : "border-white/10 hover:border-white/20"
      )}>
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#CCCCD9]/50 group-focus-within:text-[#DA8CA0] transition-colors">
          <Icon className="h-5 w-5" />
        </div>
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full bg-transparent text-white placeholder:text-white/20 px-12 py-3.5 rounded-xl outline-none text-sm font-medium"
        />
        {type === "password" && (
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#CCCCD9]/30 hover:text-white">
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  )
}

// --- MAIN SIGNUP COMPONENT ---
// Updated to accept the 'onSwitchToLogin' prop
export default function SignUp({ onSwitchToLogin }: SignUpProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  // 2. STATE FOR THE STATUS CARD
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: ""
  })

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    // Clear error when user starts typing again
    if (status?.type === 'error') setStatus(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setStatus(null) // Clear previous messages

    try {
      const response = await fetch("http://127.0.0.1:8000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: formData.fullName,
          email: formData.email,
          password: formData.password
        }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.detail || "Signup failed")

      // --- 3. SHOW SUCCESS CARD ---
      setStatus({ 
        type: 'success', 
        message: "Account created! Switching to Login..." 
      })
      
      // Clear form
      setFormData({ fullName: "", email: "", password: "" })

      // --- 4. TRIGGER PARENT SWITCH ---
      // This activates the spinning loader in your main page
      if (onSwitchToLogin) {
        onSwitchToLogin()
      }

    } catch (error: any) {
      // --- 5. SHOW ERROR CARD ---
      setStatus({ 
        type: 'error', 
        message: error.message || "Something went wrong." 
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative">
      {/* Animation Wrapper for the Card */}
      <AnimatePresence mode="wait">
        {status && (
          <StatusMessage 
            key="status-message"
            status={status.type} 
            message={status.message} 
            onClose={() => setStatus(null)}
          />
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-5">
        <InputField 
          label="Full Name" 
          icon={User} 
          type="text" 
          placeholder="Jane Doe" 
          value={formData.fullName}
          onChange={handleChange("fullName")}
        />
        
        <InputField 
          label="Email Address" 
          icon={Mail} 
          type="email" 
          placeholder="you@example.com" 
          value={formData.email}
          onChange={handleChange("email")}
        />
        
        <InputField 
          label="Password" 
          icon={Lock} 
          type="password" 
          placeholder="••••••••" 
          value={formData.password}
          onChange={handleChange("password")}
        />

        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full h-12 bg-[#DA8CA0] hover:bg-[#c76b85] text-[#1C1246] font-bold text-base rounded-xl transition-all shadow-[0_4px_20px_rgba(218,140,160,0.25)] hover:shadow-[0_4px_25px_rgba(218,140,160,0.4)] hover:scale-[1.02] active:scale-[0.98]"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <span className="flex items-center gap-2">
              Sign Up <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </form>
    </div>
  )
}