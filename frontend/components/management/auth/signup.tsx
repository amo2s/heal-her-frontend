"use client"

import React, { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Mail, Lock, User, Eye, EyeOff, ArrowRight, 
  Loader2, CheckCircle2, AlertCircle, Circle,
  ShieldCheck
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SignUpProps {
  onSwitchToLogin?: () => void;
}

type StatusType = {
  type: 'success' | 'error';
  message: string;
} | null;

// --- STATUS MESSAGE (TIGHTER) ---
const StatusMessage = ({ status, message, onClose }: { 
  status: 'success' | 'error', 
  message: string, 
  onClose: () => void 
}) => (
  <motion.div
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: "auto" }}
    exit={{ opacity: 0, height: 0 }}
    className={cn(
      "overflow-hidden flex items-center gap-2 p-3 rounded-xl border mb-4",
      status === 'success' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-200" : "bg-red-500/10 border-red-500/20 text-red-200"
    )}
  >
    <div className="flex-1 text-[11px] font-medium">{message}</div>
    <button type="button" onClick={onClose} className="text-white/40 hover:text-white p-1">×</button>
  </motion.div>
)

// --- REQUIREMENTS (TIGHTER) ---
const Requirement = ({ met, label }: { met: boolean, label: string }) => (
  <div className={cn(
    "flex items-center gap-1.5 text-[9px] uppercase tracking-wider transition-all",
    met ? "text-emerald-400" : "text-white/20"
  )}>
    {met ? <CheckCircle2 className="h-2.5 w-2.5" /> : <Circle className="h-2.5 w-2.5" />}
    <span>{label}</span>
  </div>
)

// --- INPUT FIELD (TIGHTER) ---
const InputField = ({ label, icon: Icon, type, placeholder, value, onChange, name, children }: any) => {
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const inputType = type === "password" ? (showPassword ? "text" : "password") : type

  return (
    <div className="space-y-1">
      <label className="text-[9px] font-bold text-white/30 uppercase tracking-widest ml-1">{label}</label>
      <div className={cn(
        "relative rounded-lg border bg-black/20 transition-all",
        isFocused ? "border-[#DA8CA0] ring-1 ring-[#DA8CA0]/20" : "border-white/5"
      )}>
        <Icon className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5", isFocused ? "text-[#DA8CA0]" : "text-white/20")} />
        <input
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full bg-transparent text-white placeholder:text-white/5 px-10 py-2.5 outline-none text-xs"
          autoComplete="off"
        />
        {type === "password" && (
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20">
            {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

export default function SignUp({ onSwitchToLogin }: SignUpProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<StatusType>(null)
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    website: "" // The Honeypot
  })

  const checks = useMemo(() => ({
    length: formData.password.length >= 8,
    upper: /[A-Z]/.test(formData.password),
    lower: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[@$!%*?&_]/.test(formData.password)
  }), [formData.password])

  const isFormValid = useMemo(() => (
    Object.values(checks).every(Boolean) && 
    formData.fullName.trim().length >= 2 && 
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
  ), [checks, formData.fullName, formData.email])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (status?.type === 'error') setStatus(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // BOT TRAP: If the invisible website field is filled, silently ignore it
    if (formData.website || !isFormValid) return
    
    setIsLoading(true)
    setStatus(null)

    try {
      // THE NETWORK CALL: Firing payload to the Proxy Route
      const response = await fetch("/api/auth/management/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          website: formData.website,
        }),
      });

      const data = await response.json();

      // Ensure we catch HTTP errors (like 400 or 500)
      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to create account.");
      }

      setStatus({ type: 'success', message: "Account created! Please await admin approval." })
      setFormData({ fullName: "", email: "", password: "", website: "" })
      
    } catch (error: any) {
      console.error("[SIGNUP ERROR]:", error);
      setStatus({ 
        type: 'error', 
        message: error instanceof Error ? error.message : "Network error. Please try again." 
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="mb-4 text-center">
        <div className="inline-flex p-2 rounded-xl bg-[#DA8CA0]/10 mb-2 border border-[#DA8CA0]/20">
          <ShieldCheck className="h-5 w-5 text-[#DA8CA0]" />
        </div>
        <h2 className="text-xl font-bold text-white">Admin Signup</h2>
      </div>

      <AnimatePresence>
        {status && <StatusMessage status={status.type} message={status.message} onClose={() => setStatus(null)} />}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        <div className="hidden">
          <input name="website" value={formData.website} onChange={handleChange} tabIndex={-1} aria-hidden="true" />
        </div>

        <InputField label="Name" name="fullName" icon={User} type="text" placeholder="Your name" value={formData.fullName} onChange={handleChange} />
        <InputField label="Email" name="email" icon={Mail} type="email" placeholder="mgt@email.com" value={formData.email} onChange={handleChange} />
        
        <InputField label="Password" name="password" icon={Lock} type="password" placeholder="••••••••" value={formData.password} onChange={handleChange}>
          <div className="grid grid-cols-2 gap-1 pt-1">
             <Requirement met={checks.length} label="8+ Chars" />
             <Requirement met={checks.upper} label="Uppercase" />
             <Requirement met={checks.lower} label="Lowercase" />
             <Requirement met={checks.number} label="Number" />
             <Requirement met={checks.special} label="Special" />
          </div>
        </InputField>

        <Button 
          type="submit" 
          disabled={isLoading || !isFormValid}
          className={cn(
            "w-full h-10 font-bold text-xs rounded-lg transition-all uppercase tracking-widest mt-2",
            isFormValid ? "bg-[#DA8CA0] hover:bg-[#c97b8f] text-[#1C1246]" : "bg-white/5 text-white/20"
          )}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Create Account"}
        </Button>
      </form>
    </div>
  )
}