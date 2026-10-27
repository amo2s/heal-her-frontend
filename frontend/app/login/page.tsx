"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Loader2 } from "lucide-react" 
import Link from "next/link"
import { cn } from "@/lib/utils"

// --- YOUR COMPONENTS ---
import Login from "@/components/login"
import SignUp from "@/components/signup"
import ForgotPassword from "@/components/forgot-password" // We will build this next!

// --- CSS HACK: DARK MODE AUTOFILL ---
const autofillStyles = `
  input:-webkit-autofill,
  input:-webkit-autofill:hover, 
  input:-webkit-autofill:focus, 
  input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px #231854 inset !important;
    -webkit-text-fill-color: white !important;
    transition: background-color 5000s ease-in-out 0s;
  }
`

// --- COMPONENT: GRAIN OVERLAY ---
const GrainOverlay = () => (
  <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.03] grain-overlay-bg" />
)

// --- COMPONENT: TRANSITION LOADER ---
const SwitchingLoader = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#1C1246]/80 backdrop-blur-sm rounded-[28px]"
  >
    <div className="bg-[#231854] p-4 rounded-full border border-white/10 shadow-xl">
        <Loader2 className="h-8 w-8 text-[#DA8CA0] animate-spin" />
    </div>
    <p className="mt-4 text-sm font-medium text-[#CCCCD9] animate-pulse">
        Securing your space...
    </p>
  </motion.div>
)

export default function LoginPage() {
  // 1. Tri-State Architecture replaces the boolean toggle
  type ViewState = "login" | "signup" | "forgot"
  const [viewState, setViewState] = useState<ViewState>("login")
  const [isSwitching, setIsSwitching] = useState(false)

  const handleAutoSwitch = (targetState: ViewState) => {
    setIsSwitching(true)
    setTimeout(() => {
        setViewState(targetState)
        setIsSwitching(false)
    }, 1500) // Reduced to 1.5s for a snappier premium feel
  }

  // Configuration for dynamic header content
  const headerContent = {
    login: { title: "Welcome Back, Sis", subtitle: "Enter your details to access your dashboard." },
    signup: { title: "Join Your Safe Space", subtitle: "Create an account to start your learning journey." },
    forgot: { title: "Recover Your Account", subtitle: "Enter your email to securely reset your password." }
  }

  return (
    // 2. 100dvh prevents mobile URL bar scrolling issues
    <div className="relative min-h-[100dvh] bg-[#1C1246] text-[#FAFAFA] overflow-hidden flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-[#DA8CA0]/30 selection:text-[#DA8CA0]">
      <style>{autofillStyles}</style>
      <GrainOverlay />
      
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#DA8CA0]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      {/* 3. Smart Back Button Routing */}
      <div className="absolute top-6 left-6 z-50">
        {viewState === "forgot" ? (
          <button 
            onClick={() => setViewState("login")}
            className="flex items-center gap-2 text-[#CCCCD9]/60 hover:text-white transition-colors text-sm font-mono group"
          >
            <div className="p-2 rounded-full border border-white/5 bg-white/5 group-hover:bg-white/10 transition-all">
              <ArrowLeft className="h-4 w-4" />
            </div>
            <span>Back to Login</span>
          </button>
        ) : (
          <Link href="/" className="flex items-center gap-2 text-[#CCCCD9]/60 hover:text-white transition-colors text-sm font-mono group">
            <div className="p-2 rounded-full border border-white/5 bg-white/5 group-hover:bg-white/10 transition-all">
              <ArrowLeft className="h-4 w-4" />
            </div>
            <span>Back to Home</span>
          </Link>
        )}
      </div>

      {/* --- MAIN CARD --- */}
      <motion.div 
        layout
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10 flex flex-col justify-center"
      >
        <motion.div 
          layout
          className="relative bg-[#231854]/40 backdrop-blur-xl border border-white/10 rounded-[32px] shadow-2xl overflow-hidden p-1"
        >
          {/* Mobile-optimized padding to save vertical space */}
          <motion.div 
            layout
            className="relative bg-[#1C1246]/80 rounded-[28px] p-6 sm:p-8 border border-white/5 flex flex-col"
          >
            <AnimatePresence>
                {isSwitching && <SwitchingLoader />}
            </AnimatePresence>

            {/* Header - Compacted for zero-scroll */}
            <motion.div layout className="text-center mb-5">
              <div className="inline-block relative group mb-3">
                <div className="absolute -inset-4 bg-[#DA8CA0]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <img src="/heal-logo.png" alt="Heal Her" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-[#DA8CA0]/30 shadow-lg relative z-10 mx-auto" />
              </div>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={viewState}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <h1 className="text-lg sm:text-xl font-bold text-white mb-1">
                    {headerContent[viewState].title}
                  </h1>
                  <p className="text-[#CCCCD9]/70 text-xs">
                    {headerContent[viewState].subtitle}
                  </p>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* 4. Conditional Toggle Switch (Hides smoothly on "forgot" state) */}
            <AnimatePresence mode="wait">
              {viewState !== "forgot" && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-[#160d33] p-1 rounded-2xl flex relative border border-white/5 overflow-hidden"
                >
                  <motion.div 
                    className="absolute top-1 bottom-1 rounded-xl bg-[#2A1F5E] shadow-sm"
                    initial={false}
                    animate={{ 
                      left: viewState === "login" ? "4px" : "50%", 
                      width: "calc(50% - 4px)" 
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                  <button onClick={() => setViewState("login")} className={cn("flex-1 py-2 text-xs font-semibold rounded-xl relative z-10 transition-colors", viewState === "login" ? "text-white" : "text-[#CCCCD9]/50")}>Sign In</button>
                  <button onClick={() => setViewState("signup")} className={cn("flex-1 py-2 text-xs font-semibold rounded-xl relative z-10 transition-colors", viewState === "signup" ? "text-white" : "text-[#CCCCD9]/50")}>Create Account</button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Component Injection Pipeline */}
            <motion.div layout className="flex-1 relative">
              <AnimatePresence mode="wait">
                {viewState === "login" && (
                  <motion.div
                    key="login-form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <Login 
                      onSwitchToForgot={() => setViewState("forgot")} 
                    />
                  </motion.div>
                )}

                {viewState === "signup" && (
                  <motion.div
                    key="signup-form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <SignUp 
                      onSwitchToLogin={() => handleAutoSwitch("login")} 
                    />
                  </motion.div>
                )}

                {viewState === "forgot" && (
                  <motion.div
                    key="forgot-form"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <ForgotPassword 
                      onSuccess={() => handleAutoSwitch("login")} 
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}