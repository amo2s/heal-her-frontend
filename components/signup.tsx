"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2, AlertCircle, Circle, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// --- PROPS INTERFACE ---
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

// --- PASSWORD REQUIREMENT ITEM ---
const Requirement = ({ met, label }: { met: boolean, label: string }) => (
  <div className={cn(
    "flex items-center gap-2 text-[10px] uppercase tracking-widest transition-colors duration-300",
    met ? "text-[#DA8CA0]" : "text-[#CCCCD9]/30"
  )}>
    {met ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
    <span>{label}</span>
  </div>
)

// --- HELPER COMPONENT ---
const InputField = ({ label, icon: Icon, type, placeholder, value, onChange, min, max, children }: any) => {
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
          min={min}
          max={max}
          className="w-full bg-transparent text-white placeholder:text-white/20 px-12 py-3.5 rounded-xl outline-none text-sm font-medium"
        />
        {type === "password" && (
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#CCCCD9]/30 hover:text-white">
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

// --- MAIN SIGNUP COMPONENT ---
export default function SignUp({ onSwitchToLogin }: SignUpProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    age: "",
    password: ""
  })

  // Password Validation State
  const [checks, setChecks] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false
  })

  useEffect(() => {
    const pw = formData.password
    setChecks({
      length: pw.length >= 8,
      upper: /[A-Z]/.test(pw),
      lower: /[a-z]/.test(pw),
      number: /[0-9]/.test(pw),
      special: /[@$!%*?&_]/.test(pw)
    })
  }, [formData.password])

  const isPasswordValid = Object.values(checks).every(Boolean)
  
  // Age Validation Logic (Aligns with Backend: 5 to 120)
  const parsedAge = parseInt(formData.age, 10)
  const isAgeValid = !isNaN(parsedAge) && parsedAge >= 5 && parsedAge <= 120

  const isFormValid = isPasswordValid && isAgeValid && formData.fullName.trim() !== "" && formData.email.trim() !== ""

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    if (status?.type === 'error') setStatus(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return
    
    setIsLoading(true)
    setStatus(null)

    try {
      // 1. SECURE UNIVERSAL PROXY CALL
      // Routes through app/api/proxy/[...slug]/route.ts
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: formData.fullName,
          email: formData.email,
          age: parsedAge,
          password: formData.password
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || "Signup failed")

      setStatus({ 
        type: 'success', 
        message: "Account created! Switching to Login..." 
      })
      
      setFormData({ fullName: "", email: "", age: "", password: "" })
      if (onSwitchToLogin) onSwitchToLogin()

    } catch (error: any) {
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
          label="Age" 
          icon={Calendar} 
          type="number" 
          placeholder="Enter your age" 
          value={formData.age}
          onChange={handleChange("age")}
          min="5"
          max="120"
        />
        
        <InputField 
          label="Password" 
          icon={Lock} 
          type="password" 
          placeholder="••••••••" 
          value={formData.password}
          onChange={handleChange("password")}
        >
          {/* Password Guide Grid */}
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 pt-2 px-1">
             <Requirement met={checks.length} label="8+ Characters" />
             <Requirement met={checks.upper} label="Uppercase" />
             <Requirement met={checks.lower} label="Lowercase" />
             <Requirement met={checks.number} label="Number" />
             <Requirement met={checks.special} label="Special Character" />
          </div>
        </InputField>

        <Button 
          type="submit" 
          disabled={isLoading || !isFormValid}
          className={cn(
            "w-full h-12 font-bold text-base rounded-xl transition-all shadow-[0_4px_20px_rgba(218,140,160,0.25)]",
            isFormValid 
              ? "bg-[#DA8CA0] hover:bg-[#c76b85] text-[#1C1246] hover:scale-[1.02] active:scale-[0.98]" 
              : "bg-[#DA8CA0]/20 text-[#DA8CA0]/40 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin mx-auto" />
          ) : (
            <span className="flex items-center justify-center gap-2">
              Sign Up <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </form>
    </div>
  )
}