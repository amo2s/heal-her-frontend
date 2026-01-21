"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Chrome, Github, Loader2 } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

// --- YOUR COMPONENTS ---
import Login from "@/components/login"
import SignUp from "@/components/sign_up"

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
// This appears when switching from Signup -> Login
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
        Setting up your space...
    </p>
  </motion.div>
)

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [isSwitching, setIsSwitching] = useState(false)

  // --- THE LOGIC: HANDLE SUCCESSFUL SIGNUP ---
  // Pass this function to your SignUp component!
  const handleAutoSwitch = () => {
    setIsSwitching(true) // 1. Show Loader
    
    setTimeout(() => {
        setIsLogin(true)     // 2. Switch Tab
        setIsSwitching(false) // 3. Hide Loader
    }, 2000) // 2 second delay for the user to see "Success"
  }

  return (
    <div className="relative min-h-screen bg-[#1C1246] text-[#FAFAFA] overflow-hidden flex flex-col items-center justify-center p-4 selection:bg-[#DA8CA0]/30 selection:text-[#DA8CA0]">
      <style>{autofillStyles}</style>
      <GrainOverlay />
      
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#DA8CA0]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Back Button */}
      <div className="absolute top-8 left-8 z-50">
        <Link href="/" className="flex items-center gap-2 text-[#CCCCD9]/60 hover:text-white transition-colors text-sm font-mono group">
          <div className="p-2 rounded-full border border-white/5 bg-white/5 group-hover:bg-white/10 transition-all">
            <ArrowLeft className="h-4 w-4" />
          </div>
          <span>Back to Home</span>
        </Link>
      </div>

      {/* --- MAIN CARD --- */}
      <motion.div 
        layout
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="relative bg-[#231854]/40 backdrop-blur-xl border border-white/10 rounded-[32px] shadow-2xl overflow-hidden p-1">
          
          <div className="relative bg-[#1C1246]/80 rounded-[28px] p-6 sm:p-10 border border-white/5 min-h-[600px] flex flex-col">
            
            {/* 1. LOADING OVERLAY (Shows when switching) */}
            <AnimatePresence>
                {isSwitching && <SwitchingLoader />}
            </AnimatePresence>

            {/* Header */}
            <div className="text-center mb-8">
              <Link href="/" className="inline-block relative group mb-6">
                <div className="absolute -inset-4 bg-[#DA8CA0]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <img src="/heal-logo.png" alt="Heal Her" className="w-16 h-16 rounded-full border-2 border-[#DA8CA0]/30 shadow-lg relative z-10" />
              </Link>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={isLogin ? "login-title" : "signup-title"}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <h1 className="text-2xl font-bold text-white mb-2">
                    {isLogin ? "Welcome Back, Sis" : "Join Your Safe Space"}
                  </h1>
                  <p className="text-[#CCCCD9]/70 text-sm">
                    {isLogin ? "Enter your details to access your sanctuary." : "Create an account to start your healing journey."}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Toggle Switch */}
            <div className="bg-[#160d33] p-1.5 rounded-2xl flex relative mb-8 border border-white/5">
              <motion.div 
                className="absolute top-1.5 bottom-1.5 rounded-xl bg-[#2A1F5E] shadow-sm"
                initial={false}
                animate={{ left: isLogin ? "6px" : "50%", width: "calc(50% - 6px)" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
              <button onClick={() => setIsLogin(true)} className={cn("flex-1 py-2.5 text-sm font-semibold rounded-xl relative z-10 transition-colors", isLogin ? "text-white" : "text-[#CCCCD9]/50")}>Sign In</button>
              <button onClick={() => setIsLogin(false)} className={cn("flex-1 py-2.5 text-sm font-semibold rounded-xl relative z-10 transition-colors", !isLogin ? "text-white" : "text-[#CCCCD9]/50")}>Create Account</button>
            </div>

            {/* Component Injection */}
            <div className="flex-1 relative">
              <AnimatePresence mode="wait">
                {isLogin ? (
                  <motion.div
                    key="login-form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Render Login Component */}
                    <Login />
                  </motion.div>
                ) : (
                  <motion.div
                    key="signup-form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Render SignUp Component with the Switch Handler */}
                    <SignUp onSwitchToLogin={handleAutoSwitch} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Social Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#1D1342] px-3 text-[#CCCCD9]/40 font-mono tracking-widest">Or continue with</span>
              </div>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button type="button" className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all text-sm font-medium text-white group">
                <Chrome className="h-4 w-4 text-white/70 group-hover:text-white transition-colors" /> <span>Google</span>
              </button>
              <button type="button" className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all text-sm font-medium text-white group">
                <Github className="h-4 w-4 text-white/70 group-hover:text-white transition-colors" /> <span>GitHub</span>
              </button>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  )
}