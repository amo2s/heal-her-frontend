"use client"

import React, { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2, AlertCircle, Circle, Calendar, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// --- PROPS INTERFACE ---
interface SignUpProps {
  onSwitchToLogin?: () => void;
}

// --- 1. ERROR MESSAGE (Soft & Empowering) ---
const ErrorMessage = ({ message, onClose }: { message: string, onClose: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      exit={{ opacity: 0, y: -10, height: 0 }}
      className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-200 shadow-xl mb-6 overflow-hidden"
    >
      <div className="p-2 rounded-full bg-rose-500/20">
        <AlertCircle className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <p className="text-xs font-medium opacity-90">{message}</p>
      </div>
      <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">×</button>
    </motion.div>
  )
}

// --- 2. PASSWORD REQUIREMENT INDICATOR ---
const Requirement = ({ met, label }: { met: boolean, label: string }) => (
  <div className={cn(
    "flex items-center gap-2 text-[10px] uppercase tracking-widest transition-all duration-500",
    met ? "text-[#DA8CA0] font-bold" : "text-[#CCCCD9]/40 font-medium"
  )}>
    {met ? (
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }}>
        <CheckCircle2 className="h-3.5 w-3.5" />
      </motion.div>
    ) : (
      <Circle className="h-3 w-3" />
    )}
    <span>{label}</span>
  </div>
)

// --- 3. PREMIUM INPUT COMPONENT ---
const InputField = ({ label, icon: Icon, type, placeholder, value, onChange, min, max, children, hasError }: any) => {
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const inputType = type === "password" ? (showPassword ? "text" : "password") : type

  return (
    <div className="space-y-2">
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
          min={min}
          max={max}
          className="w-full bg-transparent text-white placeholder:text-white/20 px-12 py-4 rounded-xl outline-none text-sm font-medium transition-all"
        />
        {type === "password" && (
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#CCCCD9]/30 hover:text-white transition-colors">
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

// --- 4. MAIN SIGNUP COMPONENT ---
export default function SignUp({ onSwitchToLogin }: SignUpProps) {
  // State Management
  const [isLoading, setIsLoading] = useState(false)
  const [isSignedUp, setIsSignedUp] = useState(false) // Triggers the Success Transition
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [shake, setShake] = useState(false)

  const [loadingTextIndex, setLoadingTextIndex] = useState(0)
  
  // Wrapped in useMemo to prevent unnecessary re-renders
  const loadingPhrases = useMemo(() => [
    "Creating your account...",
    "Preparing your safe space...",
    "Wrapping things up..."
  ], [])

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

  // Real-time Password Checking
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
  
  // Age Validation Logic
  const parsedAge = parseInt(formData.age, 10)
  const isAgeValid = !isNaN(parsedAge) && parsedAge >= 5 && parsedAge <= 120

  const isFormValid = isPasswordValid && isAgeValid && formData.fullName.trim() !== "" && formData.email.trim() !== ""

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    if (errorMsg) setErrorMsg(null)
  }

  const triggerError = (message: string) => {
    setErrorMsg(message)
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) {
      triggerError("Please complete all fields correctly before continuing.")
      return
    }
    
    setIsLoading(true)
    setErrorMsg(null)

    try {
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
      if (!response.ok) throw new Error(data.detail || "Something went wrong creating your account.")

      // Trigger the beautiful success view
      setIsSignedUp(true)
      
      // Delay switching to login to let the animation play
      setTimeout(() => {
        if (onSwitchToLogin) onSwitchToLogin()
      }, 2800)

    } catch (error: any) {
      triggerError(error.message || "Hmm, something didn't quite work. Let's try that again.")
    } finally {
      if (!isSignedUp) setIsLoading(false)
    }
  }

  return (
    <div className="relative w-full">
      <AnimatePresence mode="wait">
        
        {/* --- STAGE A: THE SIGNUP FORM --- */}
        {!isSignedUp ? (
          <motion.div
            key="signup-form"
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
                  label="Full Name" 
                  icon={User} 
                  type="text" 
                  placeholder="Jane Doe" 
                  value={formData.fullName}
                  onChange={handleChange("fullName")}
                  hasError={!!errorMsg}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputField 
                    label="Email Address" 
                    icon={Mail} 
                    type="email" 
                    placeholder="you@example.com" 
                    value={formData.email}
                    onChange={handleChange("email")}
                    hasError={!!errorMsg}
                  />

                  <InputField 
                    label="Age" 
                    icon={Calendar} 
                    type="number" 
                    placeholder="e.g. 21" 
                    value={formData.age}
                    onChange={handleChange("age")}
                    min="5"
                    max="120"
                    hasError={!!errorMsg && (!isAgeValid && formData.age !== "")}
                  />
                </div>
                
                <InputField 
                  label="Create a Password" 
                  icon={Lock} 
                  type="password" 
                  placeholder="••••••••" 
                  value={formData.password}
                  onChange={handleChange("password")}
                  hasError={!!errorMsg}
                >
                  {/* Dynamic Password Guide */}
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 pt-3 px-1">
                     <Requirement met={checks.length} label="8+ Characters" />
                     <Requirement met={checks.upper} label="Uppercase" />
                     <Requirement met={checks.lower} label="Lowercase" />
                     <Requirement met={checks.number} label="Number" />
                     <Requirement met={checks.special} label="Special Character" />
                  </div>
                </InputField>
              </motion.div>

              <Button 
                type="submit" 
                disabled={isLoading || !isFormValid}
                className={cn(
                  "w-full h-[52px] font-bold text-sm tracking-wide rounded-xl transition-all duration-300",
                  isFormValid 
                    ? "bg-gradient-to-r from-[#DA8CA0] to-[#c76b85] hover:from-[#c76b85] hover:to-[#b35a73] text-[#1C1246] shadow-[0_8px_25px_rgba(218,140,160,0.2)] hover:shadow-[0_8px_30px_rgba(218,140,160,0.35)] hover:scale-[1.02] active:scale-[0.98]" 
                    : "bg-[#DA8CA0]/10 text-[#DA8CA0]/40 border border-[#DA8CA0]/20 cursor-not-allowed"
                )}
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
                      className="flex items-center justify-center gap-2"
                    >
                      Create Account <ArrowRight className="h-4 w-4" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </form>
          </motion.div>

        ) : (
          
          /* --- STAGE B: THE WELCOME VIEW (SUCCESS TRANSITION) --- */
          <motion.div
            key="success-view"
            initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="w-full py-12 flex flex-col items-center justify-center text-center space-y-6"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.6, delay: 0.4, type: "spring" }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-[#DA8CA0]/20 to-purple-500/20 border border-[#DA8CA0]/30 flex items-center justify-center shadow-[0_0_40px_rgba(218,140,160,0.3)] relative"
            >
              <div className="absolute inset-0 rounded-full bg-[#DA8CA0]/10 animate-ping" />
              <Sparkles className="w-8 h-8 text-[#DA8CA0]" />
            </motion.div>
            
            <div className="space-y-3">
              <motion.h3 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-2xl font-bold text-white tracking-tight"
              >
                Welcome to our community!
              </motion.h3>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-sm text-[#CCCCD9]/70 font-medium"
              >
                Your account is ready. Taking you to log in...
              </motion.p>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}