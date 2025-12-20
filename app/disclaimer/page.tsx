"use client"

import React from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { motion, useMotionTemplate, useMotionValue } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  AlertTriangle,
  ShieldAlert,
  FileText,
  CheckCircle2,
  XCircle,
  Siren,
  Globe,
  Scale,
  Lock,
  Activity,
  AlertOctagon,
  Info
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

// --- DOCUMENT METADATA COMPONENT ---
function DocMetadata() {
  return (
    <div className="w-full max-w-4xl mx-auto mb-12 border-y border-white/10 py-4 flex flex-wrap gap-6 justify-between items-center text-xs font-mono text-slate-500 uppercase tracking-wider">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4" />
        <span>Doc_ID: MG-LEGAL-001</span>
      </div>
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4" />
        <span>Revision: 2025.04.12</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-emerald-500">Status: ACTIVE_ENFORCEMENT</span>
      </div>
    </div>
  )
}

export default function DisclaimerPage() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30 selection:text-blue-200">
      <GrainOverlay />
      <Navigation />

      {/* --- PAGE HEADER --- */}
      <section className="pt-32 pb-12 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-400 text-xs font-mono uppercase mb-8">
            <Scale className="h-3 w-3" /> Legal & Operational Protocol
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Medical Disclaimer</h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
             Defining the operational boundaries, liability limitations, and safety protocols of the MedGuard AI system.
          </p>
        </div>
      </section>

      <DocMetadata />

      {/* --- CRITICAL WARNING BANNER --- */}
      <section className="pb-16 px-4">
        <div className="mx-auto max-w-4xl">
           <div className="relative overflow-hidden rounded-3xl border border-rose-500/30 bg-rose-950/10 p-1">
              <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(244,63,94,0.05)_10px,rgba(244,63,94,0.05)_20px)]" />
              <div className="relative bg-slate-950/80 rounded-[22px] p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start">
                 <div className="shrink-0">
                    <div className="h-14 w-14 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                       <Siren className="h-7 w-7 animate-pulse" />
                    </div>
                 </div>
                 <div>
                    <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                       Critical Safety Mandate
                    </h2>
                    <p className="text-slate-300 leading-relaxed text-sm md:text-base">
                       MedGuard AI is <span className="text-rose-400 font-bold">NOT</span> a substitute for professional medical advice, diagnosis, or treatment. 
                       In life-threatening emergencies (chest pain, severe bleeding, loss of consciousness), do not use this app.
                    </p>
                    <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-rose-900/20">
                       <AlertOctagon className="h-4 w-4" />
                       CONTACT EMERGENCY SERVICES IMMEDIATELY (112 / 911 / 999)
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* --- SCOPE OF PRACTICE MATRIX --- */}
      <section className="py-12 px-4">
        <div className="mx-auto max-w-6xl">
           <div className="grid md:grid-cols-2 gap-8">
              
              {/* WHAT WE ARE (Green Zone) */}
              <SpotlightCard className="p-8 border-emerald-500/20">
                 <div className="flex items-center gap-3 mb-6">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                    <h2 className="text-2xl font-bold text-white">System Capabilities</h2>
                 </div>
                 <ul className="space-y-4">
                    {[
                       "Provide evidence-based first aid instructions",
                       "Triage symptoms based on algorithmic logic",
                       "Offer guidance for minor injuries and bridging care",
                       "Translate medical instructions into local languages",
                       "Help users remain calm during high-stress events"
                    ].map((item, i) => (
                       <li key={i} className="flex gap-3 text-slate-300 text-sm">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                          {item}
                       </li>
                    ))}
                 </ul>
              </SpotlightCard>

              {/* WHAT WE ARE NOT (Red Zone) */}
              <SpotlightCard className="p-8 border-rose-500/20">
                 <div className="flex items-center gap-3 mb-6">
                    <XCircle className="h-6 w-6 text-rose-500" />
                    <h2 className="text-2xl font-bold text-white">System Limitations</h2>
                 </div>
                 <ul className="space-y-4">
                    {[
                       "We DO NOT provide official medical diagnoses",
                       "We DO NOT prescribe medications or dosages",
                       "We DO NOT replace doctors, nurses, or paramedics",
                       "We DO NOT guarantee survival or health outcomes",
                       "We DO NOT manage chronic long-term diseases"
                    ].map((item, i) => (
                       <li key={i} className="flex gap-3 text-slate-300 text-sm">
                          <div className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                          {item}
                       </li>
                    ))}
                 </ul>
              </SpotlightCard>

           </div>
        </div>
      </section>

      {/* --- DETAILED LEGAL TEXT --- */}
      <section className="py-12 px-4">
        <div className="mx-auto max-w-4xl space-y-12">
           
           {/* Section 1 */}
           <div className="group">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 group-hover:text-blue-400 transition-colors">
                 <ShieldAlert className="h-5 w-5 text-slate-500 group-hover:text-blue-400" />
                 1. No Doctor-Patient Relationship
              </h3>
              <div className="pl-7 border-l border-slate-800 text-slate-400 leading-relaxed space-y-4">
                 <p>
                    Use of MedGuard AI does not create a doctor-patient relationship between you and MedGuard AI, its creators, medical advisors, or any healthcare provider. The service provides general information and algorithmic guidance, not personalized medical advice based on your complete medical history.
                 </p>
              </div>
           </div>

           {/* Section 2 */}
           <div className="group">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 group-hover:text-blue-400 transition-colors">
                 <Activity className="h-5 w-5 text-slate-500 group-hover:text-blue-400" />
                 2. Accuracy & Algorithmic Liability
              </h3>
              <div className="pl-7 border-l border-slate-800 text-slate-400 leading-relaxed space-y-4">
                 <p>
                    While we strive to align our AI with current medical protocols (AHA, Red Cross, NCC), MedGuard AI:
                 </p>
                 <ul className="list-disc pl-5 space-y-2">
                    <li>May not reflect the most recent research published within the last 30 days.</li>
                    <li>Cannot visually inspect injuries or account for invisible internal bleeding.</li>
                    <li>Is subject to "hallucinations" or errors inherent in Large Language Models (LLMs).</li>
                 </ul>
                 <p>
                    <strong className="text-slate-200">Assumption of Risk:</strong> By using this platform, you acknowledge that you are using an automated tool and agree to hold MedGuard AI harmless for any outcomes.
                 </p>
              </div>
           </div>

           {/* Section 3 */}
           <div className="group">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 group-hover:text-blue-400 transition-colors">
                 <Globe className="h-5 w-5 text-slate-500 group-hover:text-blue-400" />
                 3. Global Usage & Jurisdictions
              </h3>
              <div className="pl-7 border-l border-slate-800 text-slate-400 leading-relaxed space-y-4">
                 <p>
                    MedGuard AI operates globally but adheres to general international first aid standards. 
                 </p>
                 <p>
                    <strong>For Users in Nigeria:</strong> Emergency services should be contacted via <span className="text-white font-mono">112</span>. While we optimize for local network conditions, we cannot guarantee app uptime during ISP outages.
                 </p>
                 <p>
                    <strong>International Users:</strong> Please utilize your local equivalent (911 in US, 999 in UK, 000 in Australia).
                 </p>
              </div>
           </div>

           {/* Section 4 */}
           <div className="group">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 group-hover:text-blue-400 transition-colors">
                 <Lock className="h-5 w-5 text-slate-500 group-hover:text-blue-400" />
                 4. Data Privacy & Processing
              </h3>
              <div className="pl-7 border-l border-slate-800 text-slate-400 leading-relaxed space-y-4">
                 <p>
                    We process medical queries to provide answers. However, we <strong className="text-white">DO NOT</strong> sell your health data to advertisers.
                 </p>
                 <p>
                    Conversations may be anonymized and used to train our safety algorithms to prevent future errors. Identifiable information is encrypted at rest and in transit.
                 </p>
              </div>
           </div>

        </div>
      </section>

      {/* --- FOOTER CTA --- */}
      <section className="py-20 border-t border-white/5">
         <div className="mx-auto max-w-3xl text-center px-4">
            <div className="bg-slate-900/50 rounded-2xl p-8 border border-slate-800">
               <Info className="h-8 w-8 text-blue-500 mx-auto mb-4" />
               <h3 className="text-xl font-bold text-white mb-2">Questions regarding compliance?</h3>
               <p className="text-slate-400 mb-6">
                  Our legal and medical board is available for transparency inquiries.
               </p>
               <a href="mailto:medguardai@gmail.com" className="text-blue-400 hover:text-blue-300 font-mono text-sm border-b border-blue-400/30 hover:border-blue-300 pb-0.5 transition-all">
                  medguardai@gmail.com
               </a>
            </div>
         </div>
      </section>

      <Footer />
    </div>
  )
}