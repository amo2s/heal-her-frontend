"use client"

import React, { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Mail, Lock, Eye, EyeOff, ArrowRight, 
  Loader2, CheckCircle2, AlertCircle, ShieldCheck, LucideIcon 
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"

// --- TYPES ---
type StatusType = {
  type: 'success' | 'error';
  message: string;
} | null;

interface InputFieldProps {
  label: string;
  icon: LucideIcon;
  type: "text" | "email" | "password";
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
}

// --- SUB-COMPONENTS ---

const StatusMessage = ({ status, message, onClose }: { 
  status: 'success' | 'error', 
  message: string, 
  onClose: () => void 
}) => (
  <motion.div
    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
    animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
    className={cn(
      "overflow-hidden flex items-center gap-3 p-4 rounded-xl border backdrop-blur-md shadow-lg",
      status === 'success' 
        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-200" 
        : "bg-red-500/10 border-red-500/20 text-red-200"
    )}
  >
    <div className={cn(
      "p-2 rounded-full shrink-0",
      status === 'success' ? "bg-emerald-500/20" : "bg-red-500/20"
    )}>
      {status === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
    </div>
    <div className="flex-1">
      <p className="text-xs font-medium leading-relaxed">{message}</p>
    </div>
    <button type="button" onClick={onClose} className="text-white/40 hover:text-white transition-colors p-1">
      <span className="text-lg leading-none">×</span>
    </button>
  </motion.div>
)

const InputField: React.FC<InputFieldProps> = ({ 
  label, 
  icon: Icon, 
  type, 
  placeholder, 
  value, 
  onChange, 
  name 
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === "password"
  const inputType = isPassword ? (showPassword ? "text" : "password") : type

  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">
        {label}
      </label>
      <div className={cn(
        "relative group transition-all duration-500 rounded-xl border bg-black/20 backdrop-blur-sm",
        isFocused 
          ? "border-[#DA8CA0] shadow-[0_0_20px_rgba(218,140,160,0.15)] ring-1 ring-[#DA8CA0]/20" 
          : "border-white/5 hover:border-white/10"
      )}>
        <div className={cn(
          "absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300",
          isFocused ? "text-[#DA8CA0]" : "text-white/20"
        )}>
          <Icon className="h-4 w-4" />
        </div>
        <input
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full bg-transparent text-white placeholder:text-white/10 px-12 py-3.5 rounded-xl outline-none text-sm font-medium"
        />
        {isPassword && (
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)} 
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  )
}

// --- MAIN COMPONENT ---

export default function AdminLogin() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<StatusType>(null)
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    website: "" // Honeypot
  })

  const isFormValid = useMemo(() => (
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && 
    formData.password.length >= 8
  ), [formData.email, formData.password])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (status?.type === 'error') setStatus(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Security: Honeypot check for bots
    if (formData.website) return;

    if (!isFormValid) {
      setStatus({ type: 'error', message: "Please provide valid administrative credentials." })
      return
    }

    setIsLoading(true)
    setStatus(null)

    try {
      // Pointing to your edge route handler
      const response = await fetch("/api/auth/management/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email.toLowerCase().trim(),
          password: formData.password
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.detail || "Access denied.")
      }

      // Success state - The proxy will handle setting the HttpOnly cookies
      setStatus({ type: 'success', message: "Authorized. Redirecting to Management Dashboard..." })
      
      // Delay for UX, then route directly to the Management Domain
      setTimeout(() => {
        router.push("/management/dashboard")
      }, 1500)

    } catch (error: unknown) {
      console.error("[LOGIN ERROR]:", error);
      setStatus({ 
        type: 'error', 
        message: error instanceof Error ? error.message : "Invalid credentials or network error." 
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-8 text-center">
        <div className="inline-flex p-3 rounded-2xl bg-[#DA8CA0]/10 mb-4 border border-[#DA8CA0]/20">
          <ShieldCheck className="h-6 w-6 text-[#DA8CA0]" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Admin Portal</h2>
        <p className="text-sm text-white/40 mt-1">Management Team Authentication</p>
      </div>

      <AnimatePresence mode="wait">
        {status && (
          <StatusMessage 
            key="status"
            status={status.type} 
            message={status.message} 
            onClose={() => setStatus(null)}
          />
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Honeypot Field */}
        <div className="hidden" aria-hidden="true">
          <input 
            type="text" 
            name="website" 
            value={formData.website} 
            onChange={handleChange} 
            tabIndex={-1} 
            autoComplete="off" 
          />
        </div>

        <InputField 
          label="Admin Email" 
          name="email"
          icon={Mail} 
          type="email" 
          placeholder="admin@sliververse.com" 
          value={formData.email}
          onChange={handleChange}
        />
        
        <div className="space-y-2">
          <InputField 
            label="Password" 
            name="password"
            icon={Lock} 
            type="password" 
            placeholder="••••••••" 
            value={formData.password}
            onChange={handleChange}
          />
          <div className="flex justify-end px-1">
            <Link 
              href="/forgot-password" 
              className="text-[10px] uppercase tracking-widest text-[#DA8CA0] hover:text-[#f0abc0] transition-colors font-bold"
            >
              Reset Credentials
            </Link>
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={isLoading || !isFormValid}
          className={cn(
            "w-full h-12 font-bold text-sm rounded-xl transition-all uppercase tracking-[0.2em]",
            isFormValid 
              ? "bg-[#DA8CA0] hover:bg-[#c76b85] text-[#1C1246] shadow-[0_8px_30px_rgb(218,140,160,0.2)]" 
              : "bg-white/5 text-white/20 cursor-not-allowed border border-white/5 hover:bg-white/5"
          )}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin mx-auto text-[#1C1246]" />
          ) : (
            <span className="flex items-center justify-center gap-2">
              Secure Login <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </form>
    </div>
  )
}