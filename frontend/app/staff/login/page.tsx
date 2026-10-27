"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Mail, Lock, KeyRound, ArrowRight, Loader2, 
  CheckCircle2, AlertCircle 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"

// --- CONFIG ---
const API_URL = "https://your-healher-backend.example.com" // ← replace with real endpoint

// --- BACKGROUND ---
const BackgroundEffects = () => (
  <div className="fixed inset-0 z-0 pointer-events-none">
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light" />
    <div className="absolute top-[15%] left-[15%] w-[600px] h-[600px] bg-[#DA8CA0]/10 rounded-full blur-[140px]" />
    <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-[#E8B4C1]/10 rounded-full blur-[120px]" />
  </div>
)

export default function StaffLoginPage() {
  const router = useRouter()

  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccessMsg("")
    setIsLoading(true)

    try {
      if (step === 1) {
        const res = await fetch(`${API_URL}/api/auth/staff-login-step1`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.detail || "Invalid credentials")
        setSuccessMsg(data.message || "Credentials verified. Check your email.")
        setStep(2)
      } else {
        const res = await fetch(`${API_URL}/api/auth/staff-verify-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp_code: otp }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.detail || "Invalid code")

        localStorage.setItem("healher_staff_token", data.access_token)
        localStorage.setItem("healher_staff_id", data.id)
        if (data.role) localStorage.setItem("healher_staff_role", data.role)

        document.cookie = `healher_staff_token=${data.access_token}; path=/; max-age=1800; SameSite=Strict; Secure`
        sessionStorage.setItem("staff_session_active", "true")

        setSuccessMsg("Access Granted. Redirecting...")
        setTimeout(() => router.push("/staff/dashboard"), 1200)
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1C1246] text-white relative overflow-hidden">
      <Navigation />
      
      <BackgroundEffects />

      <div className="flex items-center justify-center min-h-screen pt-20 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 w-full max-w-[400px]"
        >
          <div className="text-center mb-10">
            <h1 className="text-4xl font-serif font-black tracking-wide uppercase text-white drop-shadow-md">
              Staff Portal
            </h1>
            <div className="flex items-center justify-center gap-3 mt-3">
              <div className="h-[1px] w-10 bg-[#DA8CA0]/60" />
              <p className="text-xs text-[#CCCCD9] font-mono uppercase tracking-[0.25em]">
                {step === 1 ? "Authorized Access" : "Verify Email Code"}
              </p>
              <div className="h-[1px] w-10 bg-[#E8B4C1]/60" />
            </div>
          </div>

          <div className="bg-[#231854]/70 border border-[#DA8CA0]/20 backdrop-blur-xl p-8 rounded-3xl shadow-[0_0_50px_-15px_rgba(218,140,160,0.3)] relative overflow-hidden">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl bg-rose-950/30 border border-rose-800/40 flex items-center gap-3 text-rose-300 text-sm"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl bg-[#DA8CA0]/10 border border-[#DA8CA0]/30 flex items-center gap-3 text-[#E8B4C1] text-sm"
              >
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                {successMsg}
              </motion.div>
            )}

            <form className="space-y-6" onSubmit={handleLogin}>
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    className="space-y-6"
                  >
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#CCCCD9]/70 group-focus-within:text-[#DA8CA0] transition-colors">
                        <Mail className="w-5 h-5" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="staff@healher.ai"
                        className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 outline-none focus:border-[#DA8CA0]/60 focus:bg-white/10 transition-all text-sm text-white placeholder:text-[#CCCCD9]/50 font-mono"
                      />
                    </div>

                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#CCCCD9]/70 group-focus-within:text-[#DA8CA0] transition-colors">
                        <Lock className="w-5 h-5" />
                      </div>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 outline-none focus:border-[#DA8CA0]/60 focus:bg-white/10 transition-all text-sm text-white placeholder:text-[#CCCCD9]/50 font-mono"
                      />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div className="text-center text-sm text-[#CCCCD9] mb-2">
                      Enter the 6-digit code sent to your staff email.
                    </div>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#CCCCD9]/70 group-focus-within:text-[#DA8CA0] transition-colors">
                        <KeyRound className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.slice(0,6))}
                        placeholder="000000"
                        maxLength={6}
                        className="w-full h-14 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 outline-none focus:border-[#DA8CA0]/60 focus:bg-white/10 transition-all text-2xl tracking-[1em] text-center text-white placeholder:text-[#CCCCD9]/40 font-mono"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-[#FAFAFA] to-[#E8E8F0] hover:from-[#E8B4C1] hover:to-[#DA8CA0] text-[#1C1246] font-bold text-sm transition-all hover:shadow-[0_0_30px_rgba(218,140,160,0.4)] hover:scale-[1.02]"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Verifying...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    {step === 1 ? "Verify Credentials" : "Unlock Dashboard"}
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </Button>
            </form>
          </div>

          <div className="mt-10 text-center opacity-60 hover:opacity-90 transition-opacity">
            <span className="text-xs text-[#CCCCD9] font-mono uppercase tracking-widest">
              Heal Her AI • Restricted Staff Area
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}