"use client"

import React from "react"
import { motion, useMotionTemplate, useMotionValue } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { cn } from "@/lib/utils"
import {
  Lock,
  Shield,
  Eye,
  Database,
  UserX,
  FileText,
  Server,
  Key,
  Trash2,
  CheckCircle2,
  XCircle,
  Globe
} from "lucide-react"

// --- PRO COMPONENTS ---

const GrainOverlay = () => (
  <div 
    className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
    }}
  />
)

function SpotlightCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  return (
    <div
      className={cn(
        "group relative border border-white/10 bg-slate-900/50 overflow-hidden rounded-3xl",
        className
      )}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(59, 130, 246, 0.15),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  )
}

// --- PAGE COMPONENT ---

export default function PrivacyPage() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30 selection:text-blue-200">
      <GrainOverlay />
      <Navigation />

      {/* --- HERO: THE VAULT --- */}
      <section className="relative pt-32 pb-12 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-950 to-slate-950 -z-10" />
        
        <div className="mx-auto max-w-4xl text-center">
           <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl shadow-emerald-500/10 mb-8"
           >
              <Lock className="h-10 w-10 text-emerald-500" />
           </motion.div>

           <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
             Your secrets stay <br />
             <span className="text-emerald-500">yours.</span>
           </h1>
           
           <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
             Medical emergencies are deeply personal. We utilize military-grade encryption and ephemeral data practices to ensure your health information never leaves your control.
           </p>
        </div>
      </section>

      {/* --- COMPLIANCE STRIP --- */}
      <section className="py-10 border-y border-white/5 bg-slate-900/30">
         <div className="mx-auto max-w-7xl px-4 text-center">
            <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-6">Built on Global Standards</p>
            <div className="flex flex-wrap justify-center gap-4 md:gap-12">
               {["HIPAA Ready", "GDPR Compliant", "NDPR Aligned", "SOC 2 Type II", "AES-256 Encryption"].map((badge, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-300 font-semibold">
                     <Shield className="h-4 w-4 text-emerald-500" />
                     {badge}
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* --- CORE PILLARS --- */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-7xl">
           <div className="grid md:grid-cols-3 gap-8">
              <SpotlightCard className="p-8 bg-slate-900/50">
                 <div className="mb-6 h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <Key className="h-6 w-6 text-emerald-400" />
                 </div>
                 <h3 className="text-xl font-bold text-white mb-3">End-to-End Encryption</h3>
                 <p className="text-slate-400 text-sm leading-relaxed">
                    Data is encrypted the moment it leaves your device. We use TLS 1.3 for transit and AES-256 for storage. Even our engineers cannot read your private medical chats.
                 </p>
              </SpotlightCard>

              <SpotlightCard className="p-8 bg-slate-900/50">
                 <div className="mb-6 h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <Trash2 className="h-6 w-6 text-blue-400" />
                 </div>
                 <h3 className="text-xl font-bold text-white mb-3">Ephemeral by Design</h3>
                 <p className="text-slate-400 text-sm leading-relaxed">
                    We practice "Data Minimization." Emergency sessions are temporary. Once a session is closed, the identifying transcript is purged from our hot storage.
                 </p>
              </SpotlightCard>

              <SpotlightCard className="p-8 bg-slate-900/50">
                 <div className="mb-6 h-12 w-12 rounded-lg bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                    <UserX className="h-6 w-6 text-rose-400" />
                 </div>
                 <h3 className="text-xl font-bold text-white mb-3">Zero Data Selling</h3>
                 <p className="text-slate-400 text-sm leading-relaxed">
                    Your health is not a product. We will never sell, rent, or trade your personal information or medical history to advertisers or third parties. Ever.
                 </p>
              </SpotlightCard>
           </div>
        </div>
      </section>

      {/* --- DATA TRANSPARENCY MATRIX --- */}
      <section className="py-20 bg-slate-900/20 border-t border-white/5">
         <div className="mx-auto max-w-5xl px-4">
            <h2 className="text-3xl font-bold text-white text-center mb-16">Data Collection Matrix</h2>
            
            <div className="grid md:grid-cols-2 gap-12">
               
               {/* What We Collect */}
               <div>
                  <div className="flex items-center gap-3 mb-6">
                     <div className="h-2 w-2 rounded-full bg-emerald-500" />
                     <h3 className="text-xl font-bold text-white">Operational Data</h3>
                     <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20">NECESSARY</span>
                  </div>
                  <div className="space-y-4">
                     {[
                        "Symptom descriptions (to generate response)",
                        "Technical device logs (for app stability)",
                        "General region (for 112/911 routing logic)",
                        "User feedback ratings"
                     ].map((item, i) => (
                        <div key={i} className="flex gap-3 p-4 rounded-xl bg-slate-900 border border-white/5">
                           <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                           <span className="text-sm text-slate-300">{item}</span>
                        </div>
                     ))}
                  </div>
               </div>

               {/* What We DO NOT Collect */}
               <div>
                  <div className="flex items-center gap-3 mb-6">
                     <div className="h-2 w-2 rounded-full bg-rose-500" />
                     <h3 className="text-xl font-bold text-white">Excluded Data</h3>
                     <span className="text-xs bg-rose-500/10 text-rose-400 px-2 py-1 rounded border border-rose-500/20">STRICTLY PROHIBITED</span>
                  </div>
                  <div className="space-y-4">
                     {[
                        "Precise GPS location (without consent)",
                        "Personal contacts or photos",
                        "Advertising ID / Tracking pixels",
                        "Background audio recording"
                     ].map((item, i) => (
                        <div key={i} className="flex gap-3 p-4 rounded-xl bg-slate-900 border border-white/5 opacity-75">
                           <XCircle className="h-5 w-5 text-rose-500 shrink-0" />
                           <span className="text-sm text-slate-400">{item}</span>
                        </div>
                     ))}
                  </div>
               </div>

            </div>
         </div>
      </section>

      {/* --- TECHNICAL ARCHITECTURE --- */}
      <section className="py-20 px-4">
         <div className="mx-auto max-w-4xl">
            <div className="text-center mb-12">
               <h2 className="text-3xl font-bold text-white mb-4">Security Architecture</h2>
               <p className="text-slate-400">How your data moves through our system.</p>
            </div>

            <div className="relative">
               {/* Connecting Line */}
               <div className="absolute left-[20px] top-0 bottom-0 w-[2px] bg-slate-800 md:left-1/2 md:-ml-[1px]" />

               <div className="space-y-12">
                  {/* Step 1 */}
                  <div className="relative flex flex-col md:flex-row items-center gap-8">
                     <div className="absolute left-0 md:left-1/2 md:-ml-3 h-6 w-6 rounded-full bg-slate-900 border-4 border-blue-500 z-10" />
                     <div className="md:w-1/2 md:text-right md:pr-12 pl-12 md:pl-0">
                        <h4 className="text-lg font-bold text-white">1. Input Encryption</h4>
                        <p className="text-sm text-slate-400 mt-2">When you type or speak, data is encrypted on your device using TLS 1.3 before it ever touches the internet.</p>
                     </div>
                     <div className="md:w-1/2 pl-12 md:pl-12">
                        <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5 inline-block">
                           <Lock className="h-6 w-6 text-blue-500" />
                        </div>
                     </div>
                  </div>

                  {/* Step 2 */}
                  <div className="relative flex flex-col md:flex-row-reverse items-center gap-8">
                     <div className="absolute left-0 md:left-1/2 md:-ml-3 h-6 w-6 rounded-full bg-slate-900 border-4 border-purple-500 z-10" />
                     <div className="md:w-1/2 md:text-left md:pl-12 pl-12">
                        <h4 className="text-lg font-bold text-white">2. Secure Processing</h4>
                        <p className="text-sm text-slate-400 mt-2">The request enters our secure enclave. The AI processes the medical logic without storing personal identifiers.</p>
                     </div>
                     <div className="md:w-1/2 md:text-right md:pr-12 pl-12">
                        <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5 inline-block">
                           <Server className="h-6 w-6 text-purple-500" />
                        </div>
                     </div>
                  </div>

                  {/* Step 3 */}
                  <div className="relative flex flex-col md:flex-row items-center gap-8">
                     <div className="absolute left-0 md:left-1/2 md:-ml-3 h-6 w-6 rounded-full bg-slate-900 border-4 border-emerald-500 z-10" />
                     <div className="md:w-1/2 md:text-right md:pr-12 pl-12 md:pl-0">
                        <h4 className="text-lg font-bold text-white">3. Auto-Deletion</h4>
                        <p className="text-sm text-slate-400 mt-2">Once the session ends, the raw data is wiped from active memory. Only anonymized metrics (e.g., "Cardiac Incident") remain.</p>
                     </div>
                     <div className="md:w-1/2 pl-12 md:pl-12">
                        <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5 inline-block">
                           <Trash2 className="h-6 w-6 text-emerald-500" />
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* --- RIGHTS & FOOTER --- */}
      <section className="py-20 bg-slate-900/30 border-t border-white/5">
         <div className="mx-auto max-w-4xl px-4 text-center">
            <h2 className="text-2xl font-bold text-white mb-8">Your Data Rights</h2>
            <div className="flex flex-wrap justify-center gap-4">
               {["Right to Access", "Right to Delete", "Right to Correction", "Right to Export"].map((right, i) => (
                  <div key={i} className="px-6 py-3 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-sm hover:border-slate-500 transition-colors cursor-default">
                     {right}
                  </div>
               ))}
            </div>
            <p className="mt-12 text-slate-500 text-sm">
               For specific privacy requests or to download your data, contact our Data Protection Officer at <a href="mailto:privacy@medguard.ai" className="text-blue-400 hover:underline">privacy@medguard.ai</a>
            </p>
         </div>
      </section>

      <Footer />
    </div>
  )
}