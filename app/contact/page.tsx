"use client"

import React, { useState } from "react"
import { motion, useMotionTemplate, useMotionValue, Variants } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Mail,
  MessageSquare,
  Phone,
  MapPin,
  Send,
  Globe,
  ArrowRight,
  MessageCircle,
  Building2,
  Clock,
  ShieldCheck
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

function TextReveal({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words = text.split(" ")
  const container: Variants = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({ opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.04 * i + delay } }),
  }
  const child: Variants = {
    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", damping: 12, stiffness: 100 } },
    hidden: { opacity: 0, y: 20, filter: "blur(10px)", transition: { type: "spring", damping: 12, stiffness: 100 } },
  }

  return (
    <motion.h1 className={className} variants={container} initial="hidden" whileInView="visible" viewport={{ once: true }}>
      {words.map((word, index) => (
        <motion.span variants={child} style={{ marginRight: "0.25em", display: "inline-block" }} key={index}>{word}</motion.span>
      ))}
    </motion.h1>
  )
}

// --- FORM COMPONENT (Direct to nwakaamos95@gmail.com) ---

function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // UPDATED: Correct email address implemented here
    const mailtoLink = `mailto:nwakaamos95@gmail.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(`Name: ${formData.name}\nFrom: ${formData.email}\n\nMessage:\n${formData.message}`)}`
    window.location.href = mailtoLink
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-mono text-slate-500 uppercase tracking-widest ml-1">Identity // Name</label>
          <input
            type="text"
            required
            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-700"
            placeholder="Your Name"
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-mono text-slate-500 uppercase tracking-widest ml-1">Return Signal // Email</label>
          <input
            type="email"
            required
            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-700"
            placeholder="you@example.com"
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-mono text-slate-500 uppercase tracking-widest ml-1">Context // Subject</label>
        <input
          type="text"
          required
          className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-700"
          placeholder="Medical Inquiry / Partnership / Support"
          onChange={(e) => setFormData({...formData, subject: e.target.value})}
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-mono text-slate-500 uppercase tracking-widest ml-1">Transmission // Message</label>
        <textarea
          rows={6}
          required
          className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-700 resize-none"
          placeholder="How can MedGuard AI assist you today?"
          onChange={(e) => setFormData({...formData, message: e.target.value})}
        />
      </div>

      <Button type="submit" size="lg" className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all">
        <Send className="mr-2 h-4 w-4" /> Send Securely to Admin
      </Button>
      
      <div className="flex items-center justify-center gap-2 text-[10px] text-slate-600">
        <ShieldCheck className="h-3 w-3 text-emerald-500" />
        {/* UPDATED: Correct email address displayed here */}
        <span>Response directed to <strong>nwakaamos95@gmail.com</strong></span>
      </div>
    </form>
  )
}

// --- PAGE COMPONENT ---

export default function ContactPage() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30 selection:text-blue-200">
      <GrainOverlay />
      <Navigation />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950 -z-10" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8 }}
             className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-mono uppercase mb-8"
           >
             <span className="relative flex h-2 w-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
             </span>
             Headquarters: Jos, Nigeria
           </motion.div>

           <TextReveal 
             text="Open a Channel." 
             className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6"
           />

           <p className="max-w-xl mx-auto text-lg text-slate-400 leading-relaxed">
             We are here to help. Reach out directly via WhatsApp, Phone, or visit our HQ in Plateau State.
           </p>
        </div>
      </section>

      {/* --- CONTACT GRID (Actionable Links) --- */}
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-24">
             
             {/* WhatsApp Card */}
             <SpotlightCard className="p-6 cursor-pointer group hover:border-emerald-500/30 transition-colors">
                {/* 234 is the country code for Nigeria, dropping the leading 0 */}
                <a href="https://wa.me/2349070594637" target="_blank" rel="noopener noreferrer" className="block h-full">
                   <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <MessageCircle className="h-5 w-5" />
                   </div>
                   <h3 className="font-bold text-white mb-1">WhatsApp Support</h3>
                   <div className="text-sm text-slate-400 group-hover:text-white transition-colors flex items-center gap-2">
                      0907 059 4637 <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                   </div>
                </a>
             </SpotlightCard>

             {/* Phone Card */}
             <SpotlightCard className="p-6 cursor-pointer group hover:border-blue-500/30 transition-colors">
                <a href="tel:+2349063877703" className="block h-full">
                   <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <Phone className="h-5 w-5" />
                   </div>
                   <h3 className="font-bold text-white mb-1">Emergency Hotline</h3>
                   <div className="text-sm text-slate-400 group-hover:text-white transition-colors flex items-center gap-2">
                      0906 387 7703 <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                   </div>
                </a>
             </SpotlightCard>

             {/* Email Card */}
             <SpotlightCard className="p-6 cursor-pointer group hover:border-purple-500/30 transition-colors">
                <a href="mailto:medguard@gmail.com" className="block h-full">
                   <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      <Mail className="h-5 w-5" />
                   </div>
                   <h3 className="font-bold text-white mb-1">Official Email</h3>
                   <div className="text-sm text-slate-400 group-hover:text-white transition-colors flex items-center gap-2">
                      medguard@gmail.com <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                   </div>
                </a>
             </SpotlightCard>

             {/* Partnership Card */}
             <SpotlightCard className="p-6 cursor-pointer group hover:border-rose-500/30 transition-colors">
                <a href="mailto:medguard@gmail.com?subject=Partnership Proposal" className="block h-full">
                   <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      <Globe className="h-5 w-5" />
                   </div>
                   <h3 className="font-bold text-white mb-1">Partnerships</h3>
                   <div className="text-sm text-slate-400 group-hover:text-white transition-colors flex items-center gap-2">
                      Collaborate with us <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                   </div>
                </a>
             </SpotlightCard>

          </div>

          {/* --- SPLIT LAYOUT: FORM & MAP --- */}
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-24 items-start">
              
             {/* LEFT: FORM (7 Cols) */}
             <div className="lg:col-span-7">
                <div className="mb-8">
                   <h2 className="text-3xl font-bold text-white mb-4">Send a Secure Message</h2>
                   <p className="text-slate-400">
                     Fill out the form below to initiate a direct request. This will open your email client for security verification.
                   </p>
                </div>
                <SpotlightCard className="p-8 bg-slate-900/80">
                   <ContactForm />
                </SpotlightCard>
             </div>

             {/* RIGHT: OPS INFO & MAP (5 Cols) */}
             <div className="lg:col-span-5 space-y-8 sticky top-24">
                
                {/* Location Card with Google Maps Embed */}
                <div className="rounded-3xl border border-white/5 bg-slate-900/50 relative overflow-hidden group">
                   
                   {/* Map Container */}
                   <div className="h-64 w-full bg-slate-800 relative grayscale group-hover:grayscale-0 transition-all duration-500">
                      {/* Embeds a map centered on Jos, Nigeria */}
                      <iframe 
                        width="100%" 
                        height="100%" 
                        frameBorder="0" 
                        scrolling="no" 
                        marginHeight={0} 
                        marginWidth={0} 
                        src="https://maps.google.com/maps?q=Jos%2C%20Plateau%20State%2C%20Nigeria&t=&z=13&ie=UTF8&iwloc=&output=embed"
                        className="absolute inset-0"
                      />
                   </div>
                   
                   <div className="p-8 relative z-10 bg-slate-950 border-t border-slate-800">
                      <div className="flex items-start gap-4">
                         <div className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 border border-slate-700 shrink-0">
                            <MapPin className="h-5 w-5 text-white" />
                         </div>
                         <div>
                            <h3 className="text-lg font-bold text-white mb-2">MedGuard HQ</h3>
                            <div className="text-slate-400 text-sm leading-relaxed font-mono space-y-1">
                               <p>P.M.B. 2084</p>
                               <p>Jos, Plateau State</p>
                               <p>Nigeria, 93001</p>
                            </div>
                            <a 
                              href="https://www.google.com/maps/search/?api=1&query=Jos+Plateau+State+Nigeria" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="mt-4 inline-flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wide font-bold"
                            >
                               Get Directions <ArrowRight className="h-3 w-3" />
                            </a>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Info Details */}
                <div className="grid gap-4">
                   <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                         <Building2 className="h-5 w-5 text-slate-400" />
                      </div>
                      <div>
                         <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Postal Address</p>
                         <p className="text-white text-sm">P.M.B. 2084, Jos, 93001</p>
                      </div>
                   </div>

                   <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                         <Clock className="h-5 w-5 text-slate-400" />
                      </div>
                      <div>
                         <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Response Time</p>
                         <p className="text-white text-sm">Usually within 2 hours</p>
                      </div>
                   </div>
                </div>

             </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}