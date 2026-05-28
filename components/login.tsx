"use client"

import React, { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Sparkles, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

// --- 1. ERROR MESSAGE (Soft & Simple) ---
const ErrorMessage = ({ message, onClose }: { message: string, onClose: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      exit={{ opacity: 0, y: -10, height: 0 }}
      className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-200 shadow-xl mb-6 overflow-hidden"
    >
      <div className="p-2 rounded-full bg-rose-500/20 flex-shrink-0">
        <AlertCircle className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <p className="text-xs font-medium opacity-90">{message}</p>
      </div>
      <button onClick={onClose} type="button" className="text-white/40 hover:text-white transition-colors flex-shrink-0">×</button>
    </motion.div>
  )
}

// --- 2. PREMIUM INPUT COMPONENT ---
interface InputFieldProps {
  label: string;
  icon: React.ElementType;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  hasError?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ label, icon: Icon, type, placeholder, value, onChange, hasError }) => {
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const inputType = type === "password" ? (showPassword ? "text" : "password") : type

  return (
    <div className="space-y-2 w-full">
      <label className="text-[10px] font-bold text-[#CCCCD9]/70 ml-1 uppercase tracking-widest">{label}</label>
      <div className={cn(
        "relative group transition-all duration-500 rounded-xl border bg-[#160d33]/50 backdrop-blur-sm overflow-hidden",
        isFocused ? "border-[#DA8CA0] shadow-[0_0_20px_rgba(218,140,160,0.15)] bg-[#160d33]/80" : "border-white/10 hover:border-white/20 hover:bg-[#160d33]/60",
        hasError && "border-rose-400/50 bg-rose-500/5 shadow-[0_0_15px_rgba(244,63,94,0.1)]"
      )}>
        <div className={cn(
          "absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300",
          isFocused ? "text-[#DA8CA0]" : "text-[#CCCCD9]/40",
          hasError && "text-rose-400/70"
        )}>
          <Icon className="h-4 w-4" />
        </div>
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full bg-transparent text-white placeholder:text-white/20 px-12 py-4 rounded-xl outline-none text-sm font-medium transition-all"
        />
        {type === "password" && (
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#CCCCD9]/30 hover:text-white transition-colors">
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  )
}

// --- 3. MAIN LOGIN COMPONENT ---
interface LoginProps {
  onSwitchToForgot?: () => void;
}

export default function Login({ onSwitchToForgot }: LoginProps) {
  const router = useRouter()
  
  // State Management
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false) 
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [shake, setShake] = useState(false) 
  
  const [loadingTextIndex, setLoadingTextIndex] = useState(0)
  const loadingPhrases = useMemo(() => [
    "Setting things up for you...",
    "Verifying your access...",
    "Preparing your safe space..."
  ], [])

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  // Cycle loading text (UPDATED: Stops at the last phrase)
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingTextIndex((prev) => Math.min(prev + 1, loadingPhrases.length - 1))
      }, 1500)
    } else {
      setLoadingTextIndex(0)
    }
    return () => clearInterval(interval)
  }, [isLoading, loadingPhrases.length])

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    if (errorMsg) setErrorMsg(null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      triggerError("Please fill in both your email and password.")
      return
    }

    setIsLoading(true)
    setErrorMsg(null)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.detail || "Hmm, those details didn't quite match.")

      sessionStorage.setItem("user-data", JSON.stringify(data.user))

      const rawSegment = data.user.dashboard || "young_adult"
      const targetRoute = rawSegment === "young_adult" ? "young-adults" : rawSegment

      setIsAuthorized(true)
      
      setTimeout(() => {
        router.push(`/dashboard/${targetRoute}`)
      }, 2500)

    } catch (error: any) {
      triggerError(error.message || "Hmm, those details didn't quite match. Let's try again.")
    } finally {
      if (!isAuthorized) setIsLoading(false)
    }
  }

  // Intelligent Error Handling
  const triggerError = (message: string) => {
    setErrorMsg(message)
    setFormData({ email: "", password: "" })
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  return (
    <div className="relative w-full">
      <AnimatePresence mode="wait">
        
        {/* --- STAGE A: THE IDENTIFICATION FORM --- */}
        {!isAuthorized ? (
          <motion.div
            key="login-form"
            initial={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(8px)", y: -20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="w-full"
          >
            <AnimatePresence>
              {errorMsg && (
                <ErrorMessage message={errorMsg} onClose={() => setErrorMsg(null)} />
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div 
                animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}} 
                transition={{ duration: 0.4 }}
                className="space-y-5"
              >
                <InputField 
                  label="Email Address" 
                  icon={Mail} 
                  type="email" 
                  placeholder="you@example.com" 
                  value={formData.email}
                  onChange={handleChange("email")}
                  hasError={!!errorMsg}
                />
                
                <div className="space-y-1.5">
                  <InputField 
                    label="Password" 
                    icon={Lock} 
                    type="password" 
                    placeholder="••••••••" 
                    value={formData.password}
                    onChange={handleChange("password")}
                    hasError={!!errorMsg}
                  />
                  <div className="flex justify-end pt-1">
                    {/* The Native Button masquerading as a premium text link */}
                    <button 
                      type="button"
                      onClick={onSwitchToForgot} 
                      className="text-[11px] font-semibold tracking-wide text-[#DA8CA0] hover:text-[#f0abc0] hover:underline underline-offset-4 decoration-[#DA8CA0]/30 transition-all cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </div>
              </motion.div>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-[52px] bg-gradient-to-r from-[#DA8CA0] to-[#c76b85] hover:from-[#c76b85] hover:to-[#b35a73] text-[#1C1246] font-bold text-sm tracking-wide rounded-xl transition-all duration-300 shadow-[0_8px_25px_rgba(218,140,160,0.2)] hover:shadow-[0_8px_30px_rgba(218,140,160,0.35)] hover:scale-[1.02] active:scale-[0.98]"
              >
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-3"
                    >
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{loadingPhrases[loadingTextIndex]}</span>
                    </motion.div>
                  ) : (
                    <motion.span 
                      key="default"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      Log In <ArrowRight className="h-4 w-4" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </form>
          </motion.div>

        ) : (
          
          /* --- STAGE B: THE VAULT UNLOCK (SUCCESS VIEW) --- */
          <motion.div
            key="success-vault"
            initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="w-full py-10 flex flex-col items-center justify-center text-center space-y-6"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4, type: "spring", stiffness: 200, damping: 15 }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-[#DA8CA0]/20 to-purple-500/20 border border-[#DA8CA0]/30 flex items-center justify-center shadow-[0_0_40px_rgba(218,140,160,0.3)] relative"
            >
              <div className="absolute inset-0 rounded-full bg-[#DA8CA0]/10 animate-ping" />
              <Sparkles className="w-8 h-8 text-[#DA8CA0]" />
            </motion.div>
            
            <div className="space-y-2">
              <motion.h3 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-2xl font-bold text-white tracking-tight"
              >
                Welcome in.
              </motion.h3>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-sm text-[#CCCCD9]/70 font-medium"
              >
                Opening your safe space...
              </motion.p>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}