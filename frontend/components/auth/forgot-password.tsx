"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, KeyRound, CheckCircle2, ShieldAlert } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// --- 1. STRICT TYPESCRIPT INTERFACES ---
interface ErrorMessageProps {
  message: string;
  onClose: () => void;
}

interface InputFieldProps {
  label: string;
  icon: React.ElementType;
  type: "text" | "email" | "password";
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  hasError?: boolean;
  maxLength?: number;
  disabled?: boolean;
}

interface ForgotPasswordProps {
  onSuccess: () => void;
}

type Step = "email" | "otp" | "reset" | "success"

const LOADING_PHRASES: Record<Step, string[]> = {
  email: ["Locating your account...", "Securing connection...", "Dispatching secure code..."],
  otp: ["Verifying handshake...", "Checking authorization...", "Decrypting token..."],
  reset: ["Encrypting new key...", "Locking the ledger...", "Securing your account..."],
  success: ["Done"]
}

// --- 2. ERROR MESSAGE COMPONENT ---
const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onClose }) => {
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

// --- 3. PREMIUM INPUT COMPONENT ---
const InputField: React.FC<InputFieldProps> = ({ label, icon: Icon, type, placeholder, value, onChange, hasError, maxLength, disabled }) => {
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const inputType = type === "password" ? (showPassword ? "text" : "password") : type

  return (
    <div className="space-y-2 w-full">
      <label className="text-[10px] font-bold text-[#CCCCD9]/70 ml-1 uppercase tracking-widest">{label}</label>
      <div className={cn(
        "relative group transition-all duration-500 rounded-xl border bg-[#160d33]/50 backdrop-blur-sm overflow-hidden",
        isFocused ? "border-[#DA8CA0] shadow-[0_0_20px_rgba(218,140,160,0.15)] bg-[#160d33]/80" : "border-white/10 hover:border-white/20 hover:bg-[#160d33]/60",
        hasError && "border-rose-400/50 bg-rose-500/5 shadow-[0_0_15px_rgba(244,63,94,0.1)]",
        disabled && "opacity-50 cursor-not-allowed bg-black/40 border-white/5"
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
          maxLength={maxLength}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            "w-full bg-transparent text-white placeholder:text-white/20 px-12 py-4 rounded-xl outline-none text-sm font-medium transition-all",
            disabled && "cursor-not-allowed text-white/40"
          )}
        />
        {type === "password" && !disabled && (
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#CCCCD9]/30 hover:text-white transition-colors">
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  )
}

// --- 4. MAIN RECOVERY WIZARD COMPONENT ---
export default function ForgotPassword({ onSuccess }: ForgotPasswordProps) {
  // --- STATE MATRIX ---
  const [step, setStep] = useState<Step>("email")
  
  const [email, setEmail] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [resetToken, setResetToken] = useState("") 
  const [passwords, setPasswords] = useState({ new: "", confirm: "" })
  
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isLockedOut, setIsLockedOut] = useState(false)
  
  // Ghost Protocol server message display
  const [serverSuccessMsg, setServerSuccessMsg] = useState<string | null>(null)
  const [shake, setShake] = useState(false)

  // --- INTELLIGENT LOADING CYCLER ---
  const [loadingTextIndex, setLoadingTextIndex] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isLoading && step !== "success") {
      interval = setInterval(() => {
        setLoadingTextIndex((prev) => (prev + 1) % LOADING_PHRASES[step].length)
      }, 1500)
    } else {
      setLoadingTextIndex(0)
    }
    return () => clearInterval(interval)
  }, [isLoading, step])

  // --- ZERO-LEAK VOLATILE STATE DESTRUCTION ---
  const nukeVolatileState = () => {
    setEmail("")
    setOtpCode("")
    setResetToken("")
    setPasswords({ new: "", confirm: "" })
    setErrorMsg(null)
  }

  // Destruction on unmount: wipe sensitive variables from closure/RAM
  useEffect(() => {
    return () => {
      nukeVolatileState()
    }
  }, [])

  // --- UNIVERSAL ERROR TRIGGER ---
  const triggerError = (message: string) => {
    setErrorMsg(message)
    setShake(true)
    setTimeout(() => setShake(false), 500)
    
    // Auto-clear sensitive fields strictly based on current view
    if (step === "otp") setOtpCode("")
    if (step === "reset") setPasswords({ new: "", confirm: "" })
  }

  // --- PHASE 1: DISPATCH OTP (REST) ---
  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!email || !email.includes("@")) return triggerError("Please enter a valid email address.")
    
    setIsLoading(true)
    setErrorMsg(null)

    try {
      const response = await fetch("/api/v1/auth/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      const data = await response.json()

      if (!response.ok) {
        triggerError(data.message || "Failed to request reset code.")
        return
      }

      // On success, Rust guarantees a 200 OK with the Ghost Protocol message
      setServerSuccessMsg(data.message || "If the provided credentials match an active account, a secure authorization code has been dispatched.")
      setStep("otp")
    } catch (error) {
      console.error("[UI SHIELD] Network error during Phase 1:", error)
      triggerError("Network error. Please check your connection.")
    } finally {
      setIsLoading(false)
    }
  }

  // --- PHASE 2: VERIFY OTP (REST) & HTTP 429 LOCKOUT ---
  const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isLockedOut) {
      triggerError("Too many failed attempts. You are locked out for 15 minutes.")
      return
    }
    if (otpCode.length !== 6) return triggerError("Authorization code must be exactly 6 digits.")
    
    setIsLoading(true)
    setErrorMsg(null)

    try {
      const response = await fetch("/api/v1/auth/password-reset/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otpCode }),
      })
      const data = await response.json()

      if (response.status === 429) {
        // The Rust backend 3-strike brute-force defender has triggered
        setIsLockedOut(true)
        triggerError("Too many failed attempts. You are locked out for 15 minutes.")
        return
      }

      if (!response.ok) {
        triggerError(data.message || "Invalid or expired authorization code.")
        return
      }

      // Atomic transition: capture the 32-byte token and move to Phase 3
      setResetToken(data.resetToken)
      setStep("reset")
    } catch (error) {
      console.error("[UI SHIELD] Network error during Phase 2:", error)
      triggerError("Network error. Please check your connection.")
    } finally {
      setIsLoading(false)
    }
  }

  // --- PHASE 3: CONFIRM RESET (REST) ---
  const handleResetSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (passwords.new.length < 8) return triggerError("Password must be at least 8 characters.")
    if (passwords.new !== passwords.confirm) {
      triggerError("Passwords do not match.")
      return
    }
    
    setIsLoading(true)
    setErrorMsg(null)

    try {
      const response = await fetch("/api/v1/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          resetToken, 
          newPassword: passwords.new, 
          confirmPassword: passwords.confirm 
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        triggerError(data.message || "Failed to securely update password.")
        return
      }

      // Nuclear Success: Wipe all state and transition to the success animation
      nukeVolatileState()
      setStep("success")
      
      setTimeout(() => {
        onSuccess()
      }, 2500)

    } catch (error) {
      console.error("[UI SHIELD] Network error during Phase 3:", error)
      triggerError("Network error. Please check your connection.")
    } finally {
      setIsLoading(false)
    }
  }

  // --- INPUT FORMATTERS ---
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLockedOut) return
    const cleanNumeric = e.target.value.replace(/\D/g, '')
    setOtpCode(cleanNumeric)
    if (errorMsg) setErrorMsg(null)
  }

  return (
    <div className="relative w-full">
      <AnimatePresence mode="wait">
        
        {/* --- PHASE 1 VIEW: EMAIL REQUEST --- */}
        {step === "email" && (
          <motion.div
            key="step-email"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20, filter: "blur(4px)" }}
            transition={{ duration: 0.3 }}
          >
            <AnimatePresence>{errorMsg && <ErrorMessage message={errorMsg} onClose={() => setErrorMsg(null)} />}</AnimatePresence>
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <motion.div animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}} transition={{ duration: 0.4 }}>
                <InputField 
                  label="Registered Email" 
                  icon={Mail} 
                  type="email" 
                  placeholder="you@example.com" 
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrorMsg(null); }}
                  hasError={!!errorMsg}
                />
              </motion.div>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-[52px] bg-gradient-to-r from-[#DA8CA0] to-[#c76b85] hover:from-[#c76b85] hover:to-[#b35a73] text-[#1C1246] font-bold text-sm tracking-wide rounded-xl transition-all shadow-[0_8px_25px_rgba(218,140,160,0.2)] hover:shadow-[0_8px_30px_rgba(218,140,160,0.35)] hover:scale-[1.02]"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /><span>{LOADING_PHRASES.email[loadingTextIndex]}</span></div>
                ) : (
                  <div className="flex items-center gap-2">Send Secure Code <ArrowRight className="h-4 w-4" /></div>
                )}
              </Button>
            </form>
          </motion.div>
        )}

        {/* --- PHASE 2 VIEW: OTP VERIFICATION --- */}
        {step === "otp" && (
          <motion.div
            key="step-otp"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20, filter: "blur(4px)" }}
            transition={{ duration: 0.3 }}
          >
            <AnimatePresence>{errorMsg && <ErrorMessage message={errorMsg} onClose={() => setErrorMsg(null)} />}</AnimatePresence>
            
            {/* Ghost Protocol / Backend Message */}
            <div className="bg-[#DA8CA0]/10 border border-[#DA8CA0]/20 rounded-xl p-4 mb-6">
              <p className="text-xs text-[#CCCCD9] leading-relaxed text-center">
                {serverSuccessMsg || "If the provided credentials match an active account, a secure authorization code has been dispatched."}
              </p>
            </div>

            {/* Lockout Notice Banner */}
            {isLockedOut && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2.5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-semibold mb-6 shadow-lg"
              >
                <ShieldAlert className="h-4 w-4 shrink-0 text-amber-400" />
                <span>Brute Force Lockout: Maximum attempts exceeded. Verification locked for 15 minutes.</span>
              </motion.div>
            )}

            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <motion.div animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}} transition={{ duration: 0.4 }}>
                <InputField 
                  label="Authorization Code" 
                  icon={KeyRound} 
                  type="text" 
                  maxLength={6}
                  placeholder="000000" 
                  value={otpCode}
                  onChange={handleOtpChange}
                  hasError={!!errorMsg}
                  disabled={isLockedOut}
                />
              </motion.div>
              <Button 
                type="submit" 
                disabled={isLoading || otpCode.length !== 6 || isLockedOut}
                className="w-full h-[52px] bg-gradient-to-r from-[#DA8CA0] to-[#c76b85] disabled:opacity-50 text-[#1C1246] font-bold text-sm rounded-xl transition-all shadow-[0_8px_25px_rgba(218,140,160,0.2)]"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /><span>{LOADING_PHRASES.otp[loadingTextIndex]}</span></div>
                ) : isLockedOut ? (
                  <div className="flex items-center gap-2">Verification Locked <ShieldAlert className="h-4 w-4" /></div>
                ) : (
                  <div className="flex items-center gap-2">Verify Authorization <ArrowRight className="h-4 w-4" /></div>
                )}
              </Button>
            </form>
          </motion.div>
        )}

        {/* --- PHASE 3 VIEW: NEW PASSWORD --- */}
        {step === "reset" && (
          <motion.div
            key="step-reset"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            transition={{ duration: 0.3 }}
          >
            <AnimatePresence>{errorMsg && <ErrorMessage message={errorMsg} onClose={() => setErrorMsg(null)} />}</AnimatePresence>
            <form onSubmit={handleResetSubmit} className="space-y-6">
              <motion.div animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}} transition={{ duration: 0.4 }} className="space-y-5">
                <InputField 
                  label="New Password" 
                  icon={Lock} 
                  type="password" 
                  placeholder="••••••••" 
                  value={passwords.new}
                  onChange={(e) => { setPasswords(prev => ({ ...prev, new: e.target.value })); setErrorMsg(null); }}
                  hasError={!!errorMsg}
                />
                <InputField 
                  label="Confirm Password" 
                  icon={Lock} 
                  type="password" 
                  placeholder="••••••••" 
                  value={passwords.confirm}
                  onChange={(e) => { setPasswords(prev => ({ ...prev, confirm: e.target.value })); setErrorMsg(null); }}
                  hasError={passwords.confirm.length > 0 && passwords.new !== passwords.confirm}
                />
              </motion.div>
              <Button 
                type="submit" 
                disabled={isLoading || passwords.new !== passwords.confirm || passwords.new.length < 8}
                className="w-full h-[52px] bg-gradient-to-r from-[#DA8CA0] to-[#c76b85] disabled:opacity-50 text-[#1C1246] font-bold text-sm rounded-xl transition-all shadow-[0_8px_25px_rgba(218,140,160,0.2)]"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /><span>{LOADING_PHRASES.reset[loadingTextIndex]}</span></div>
                ) : (
                  <div className="flex items-center gap-2">Secure My Vault <ArrowRight className="h-4 w-4" /></div>
                )}
              </Button>
            </form>
          </motion.div>
        )}

        {/* --- PHASE 4: SUCCESS SPLASH --- */}
        {step === "success" && (
          <motion.div
            key="step-success"
            initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            className="w-full py-10 flex flex-col items-center justify-center text-center space-y-6"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
              className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.2)] relative"
            >
              <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping" />
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </motion.div>
            
            <div className="space-y-2">
              <motion.h3 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="text-2xl font-bold text-white tracking-tight"
              >
                Vault Secured.
              </motion.h3>
              <motion.p 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                className="text-sm text-[#CCCCD9]/70 font-medium"
              >
                Returning you to the login gateway...
              </motion.p>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
