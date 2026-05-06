"use client"

import React, { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Loader2 } from "lucide-react" 
import Link from "next/link"
import { cn } from "@/lib/utils"

// --- COMPONENTS ---
import Login from "@/components/management/auth/login"
import SignUp from "@/components/management/auth/signup"

const autofillStyles = `
  input:-webkit-autofill,
  input:-webkit-autofill:hover, 
  input:-webkit-autofill:focus, 
  input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px #1C1246 inset !important;
    -webkit-text-fill-color: white !important;
    transition: background-color 5000s ease-in-out 0s;
  }
`

const GrainOverlay = () => (
  <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.02] grain-overlay-bg" />
)

const SwitchingLoader = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-[#1C1246]/95 backdrop-blur-md rounded-2xl"
  >
    <Loader2 className="h-6 w-6 text-[#DA8CA0] animate-spin" />
  </motion.div>
)

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [isSwitching, setIsSwitching] = useState(false)

  const handleAutoSwitch = useCallback(() => {
    setIsSwitching(true)
    setTimeout(() => {
        setIsLogin(true)
        setIsSwitching(false)
    }, 1200)
  }, [])

  return (
    <div className="relative min-h-screen bg-[#0D0821] text-[#FAFAFA] overflow-hidden flex flex-col items-center justify-center p-4 sm:p-6">
      <style>{autofillStyles}</style>
      <GrainOverlay />
      
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[400px] h-[400px] bg-[#DA8CA0]/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[100px]" />
      </div>

      {/* Exit Button */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-8 z-50">
        <Link href="/" className="flex items-center gap-2 text-white/20 hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest group">
          <ArrowLeft className="h-3 w-3" />
          <span>Exit</span>
        </Link>
      </div>

      {/* --- MAIN CARD --- */}
      <motion.div 
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[420px] relative z-10"
      >
        <div className="bg-white/[0.02] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
          <div className="bg-[#1C1246]/60 p-5 sm:p-8 relative">
            
            <AnimatePresence>
                {isSwitching && <SwitchingLoader />}
            </AnimatePresence>

            {/* Header */}
            <div className="text-center mb-4">
              <img 
                src="/heal-logo.png" 
                alt="Logo" 
                className="w-10 h-10 mx-auto rounded-xl mb-3" 
              />
              <h1 className="text-xl font-bold text-white tracking-tight">
                {isLogin ? "Sign In" : "Sign Up"}
              </h1>
            </div>

            {/* Switcher */}
            <div className="bg-black/30 p-1 rounded-xl flex relative mb-6 border border-white/5">
              <motion.div 
                className="absolute top-1 bottom-1 rounded-lg bg-[#DA8CA0]/10 border border-[#DA8CA0]/20 shadow-sm"
                initial={false}
                animate={{ left: isLogin ? "4px" : "50%", width: "calc(50% - 4px)" }}
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
              />
              <button 
                onClick={() => setIsLogin(true)} 
                className={cn(
                  "flex-1 py-2 text-[10px] uppercase tracking-widest font-bold relative z-10 transition-colors", 
                  isLogin ? "text-[#DA8CA0]" : "text-white/20"
                )}
              >
                Login
              </button>
              <button 
                onClick={() => setIsLogin(false)} 
                className={cn(
                  "flex-1 py-2 text-[10px] uppercase tracking-widest font-bold relative z-10 transition-colors", 
                  !isLogin ? "text-[#DA8CA0]" : "text-white/20"
                )}
              >
                Signup
              </button>
            </div>

            {/* Content Area */}
            <div className="relative min-h-fit">
              <AnimatePresence mode="wait">
                <motion.div
                  key={isLogin ? "login" : "signup"}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  {isLogin ? <Login /> : <SignUp onSwitchToLogin={handleAutoSwitch} />}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-white/5 flex justify-center">
                <span className="text-[8px] uppercase tracking-[0.4em] text-white/5 font-bold">
                    Secure Access Only
                </span>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  )
}