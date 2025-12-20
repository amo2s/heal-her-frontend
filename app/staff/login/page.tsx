"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Zap, 
  AlertCircle, 
  Lock, 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck
} from "lucide-react"

// --- INTERNAL LOGIC (Replaces @/lib/auth for standalone functionality) ---
const validateCredentials = (email: string, pass: string) => {
  // Hardcoded check to ensure you can login
  if ((email === "admin@medguard.ai" || email === "sarah@medguard.ai") && pass === "demo123") {
    return { name: "Staff Member", email, role: "admin" };
  }
  return null;
}

const GrainOverlay = () => (
  <div 
    className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
    }}
  />
)

const GridBackground = () => (
  <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-slate-950/50" />
  </div>
)

export default function StaffLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Simulate API delay for realism
    await new Promise((resolve) => setTimeout(resolve, 800))

    const user = validateCredentials(email, password)

    if (user) {
      // Logic to handle session setting would go here
      router.push("/staff/dashboard")
    } else {
      setError("Access Denied: Invalid credentials provided.")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden text-slate-200 selection:bg-blue-500/30 selection:text-blue-200">
      <GrainOverlay />
      <GridBackground />

      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* --- BRAND HEADER --- */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 shadow-2xl shadow-blue-500/20 mb-6 group"
          >
            <Zap className="w-8 h-8 text-blue-500 group-hover:text-white transition-colors duration-300" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">MedGuard Staff Portal</h1>
          <div className="flex items-center justify-center gap-2 text-xs font-mono text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 py-1 px-3 rounded-full w-fit mx-auto">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            SYSTEM SECURE & ENCRYPTED
          </div>
        </div>

        {/* --- MAIN CARD --- */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Top Line Accent */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 opacity-50" />

          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-400 text-xs uppercase tracking-wider font-bold ml-1">
                Authorized Email
              </Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@medguard.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-12 bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-blue-500/20 h-12 rounded-xl transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-slate-400 text-xs uppercase tracking-wider font-bold ml-1">
                  Secure Key
                </Label>
                <a href="#" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Forgot key?</a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-12 bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-blue-500/20 h-12 rounded-xl transition-all"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
              >
                <Alert variant="destructive" className="bg-rose-950/30 border-rose-900/50 text-rose-300">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all group"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying Identity...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Access Dashboard <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          {/* Trust Footer inside card */}
          <div className="mt-8 pt-6 border-t border-white/5 flex justify-center items-center gap-6 text-[10px] text-slate-500 font-mono">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3 w-3 text-emerald-500" /> 256-BIT SSL
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" /> HIPAA COMPLIANT
            </span>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-8">
          &copy; 2026 MedGuard AI Security. Unauthorized access is prohibited.
        </p>
      </motion.div>
    </div>
  )
}