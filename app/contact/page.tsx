"use client"

import React, { useState } from "react"
import { motion, useMotionTemplate, useMotionValue, Variants } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Mail,
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

// --- ANIMATION VARIANTS ---

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const scaleIn: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.5, ease: "backOut" } }
}

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
    <motion.div
      className={cn(
        "group relative border border-white/10 bg-[#231854]/50 overflow-hidden rounded-3xl",
        className
      )}
      onMouseMove={handleMouseMove}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(218, 140, 160, 0.15),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative h-full">{children}</div>
    </motion.div>
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
    <motion.h1 className={className} variants={container} initial="hidden" animate="visible">
      {words.map((word, index) => (
        <motion.span variants={child} style={{ marginRight: "0.25em", display: "inline-block" }} key={index}>{word}</motion.span>
      ))}
    </motion.h1>
  )
}

// --- FORM COMPONENT ---

function ContactForm() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const mailtoLink = `mailto:nwakaamos95@gmail.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(`Name: ${formData.name}\nFrom: ${formData.email}\n\nMessage:\n${formData.message}`)}`
    window.location.href = mailtoLink
  }

  return (
    <motion.form 
      variants={fadeInUp} 
      initial="hidden" 
      whileInView="visible" 
      viewport={{ once: true }}
      onSubmit={handleSubmit} 
      className="space-y-6 relative z-10"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-mono text-[#DA8CA0] uppercase tracking-widest ml-1">Identity // Name</label>
          <input
            type="text" required
            className="w-full bg-[#1C1246] border border-white/10 rounded-xl px-4 py-3 text-[#FAFAFA] outline-none focus:border-[#DA8CA0]/50 focus:ring-1 focus:ring-[#DA8CA0]/50 transition-all placeholder:text-slate-500"
            placeholder="Your Name"
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-mono text-[#DA8CA0] uppercase tracking-widest ml-1">Contact // Email</label>
          <input
            type="email" required
            className="w-full bg-[#1C1246] border border-white/10 rounded-xl px-4 py-3 text-[#FAFAFA] outline-none focus:border-[#DA8CA0]/50 focus:ring-1 focus:ring-[#DA8CA0]/50 transition-all placeholder:text-slate-500"
            placeholder="you@example.com"
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-mono text-[#DA8CA0] uppercase tracking-widest ml-1">Topic // Subject</label>
        <input
          type="text" required
          className="w-full bg-[#1C1246] border border-white/10 rounded-xl px-4 py-3 text-[#FAFAFA] outline-none focus:border-[#DA8CA0]/50 focus:ring-1 focus:ring-[#DA8CA0]/50 transition-all placeholder:text-slate-500"
          placeholder="Health Inquiry / Partnership / Support"
          onChange={(e) => setFormData({...formData, subject: e.target.value})}
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-mono text-[#DA8CA0] uppercase tracking-widest ml-1">Message // Thoughts</label>
        <textarea
          rows={6} required
          className="w-full bg-[#1C1246] border border-white/10 rounded-xl px-4 py-3 text-[#FAFAFA] outline-none focus:border-[#DA8CA0]/50 focus:ring-1 focus:ring-[#DA8CA0]/50 transition-all placeholder:text-slate-500 resize-none"
          placeholder="How can Heal Her assist you today?"
          onChange={(e) => setFormData({...formData, message: e.target.value})}
        />
      </div>
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button type="submit" size="lg" className="w-full h-14 bg-[#DA8CA0] hover:bg-[#E8B4C1] text-[#1C1246] font-bold rounded-xl shadow-lg shadow-[#DA8CA0]/20 transition-all">
          <Send className="mr-2 h-4 w-4" /> Send Securely to Admin
        </Button>
      </motion.div>
      <div className="flex items-center justify-center gap-2 text-[10px] text-[#CCCCD9]">
        <ShieldCheck className="h-3 w-3 text-emerald-500" />
        <span>Response directed to <strong>nwakaamos95@gmail.com</strong></span>
      </div>
    </motion.form>
  )
}

// --- PAGE COMPONENT ---

export default function ContactPage() {
  return (
    <div className="relative min-h-screen bg-[#1C1246] text-[#FAFAFA] selection:bg-[#DA8CA0]/30 selection:text-[#DA8CA0]">
      <GrainOverlay />
      <Navigation />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#DA8CA0]/20 via-[#1C1246] to-[#1C1246] -z-10" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
           <motion.div
             variants={scaleIn}
             initial="hidden"
             animate="visible"
             className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#231854] border border-[#DA8CA0]/20 text-[#DA8CA0] text-xs font-mono uppercase mb-8"
           >
             <span className="relative flex h-2 w-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DA8CA0] opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-[#DA8CA0]"></span>
             </span>
             Safe Space: Jos, Nigeria
           </motion.div>

           <TextReveal 
             text="We're Here for You." 
             className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6"
           />

           <motion.p 
             initial={{ opacity: 0, y: 20 }} 
             animate={{ opacity: 1, y: 0 }} 
             transition={{ delay: 0.6, duration: 0.8 }} 
             className="max-w-xl mx-auto text-lg text-[#CCCCD9] leading-relaxed"
           >
             Whether you have a question about your health or just need someone to talk to, our lines are open.
           </motion.p>
        </div>
      </section>

      {/* --- CONTACT GRID --- */}
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div 
            variants={staggerContainer} 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }} 
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-24"
          >
             {[
               { icon: MessageCircle, label: "WhatsApp Chat", val: "0907 059 4637", href: "https://wa.me/2349070594637", color: "text-emerald-400" },
               { icon: Phone, label: "Support Line", val: "0906 387 7703", href: "tel:+2349063877703", color: "text-purple-400" },
               { icon: Mail, label: "Email Us", val: "medguard@gmail.com", href: "mailto:medguard@gmail.com", color: "text-rose-400" },
               { icon: Globe, label: "Partnerships", val: "Collaborate now", href: "mailto:medguard@gmail.com?subject=Partnership", color: "text-blue-400" }
             ].map((item, i) => (
               <motion.div key={i} variants={fadeInUp}>
                 <SpotlightCard className="p-6 cursor-pointer group hover:border-[#DA8CA0]/30 transition-colors">
                    <a href={item.href} target={item.href.startsWith('http') ? "_blank" : "_self"} rel="noopener noreferrer" className="block h-full">
                       <div className={cn("mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border border-white/10", item.color)}>
                          <item.icon className="h-5 w-5" />
                       </div>
                       <h3 className="font-bold text-white mb-1">{item.label}</h3>
                       <div className="text-sm text-[#CCCCD9] group-hover:text-white transition-colors flex items-center gap-2">
                          {item.val} <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                       </div>
                    </a>
                 </SpotlightCard>
               </motion.div>
             ))}
          </motion.div>

          {/* --- SPLIT LAYOUT --- */}
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-24 items-start">
             
             {/* LEFT: FORM */}
             <motion.div 
               initial={{ opacity: 0, x: -30 }} 
               whileInView={{ opacity: 1, x: 0 }} 
               viewport={{ once: true }} 
               transition={{ duration: 0.8 }} 
               className="lg:col-span-7"
             >
                <div className="mb-8">
                   <h2 className="text-3xl font-bold text-white mb-4">Send a Secure Message</h2>
                   <p className="text-[#CCCCD9]">
                     Fill out the form below to reach our admin team.
                   </p>
                </div>
                <SpotlightCard className="p-8 bg-[#231854]/80 border-[#DA8CA0]/10">
                   <ContactForm />
                </SpotlightCard>
             </motion.div>

             {/* RIGHT: INFO */}
             <motion.div 
               initial={{ opacity: 0, x: 30 }} 
               whileInView={{ opacity: 1, x: 0 }} 
               viewport={{ once: true }} 
               transition={{ duration: 0.8 }} 
               className="lg:col-span-5 space-y-8 sticky top-24"
             >
                {/* Map Card */}
                <div className="rounded-3xl border border-white/5 bg-[#231854]/50 relative overflow-hidden group">
                   <div className="h-64 w-full bg-[#1C1246] relative grayscale group-hover:grayscale-0 transition-all duration-500">
                      <iframe 
                        width="100%" height="100%" frameBorder="0" scrolling="no" marginHeight={0} marginWidth={0} 
                        src="https://maps.google.com/maps?q=Jos%2C%20Plateau%20State%2C%20Nigeria&t=&z=13&ie=UTF8&iwloc=&output=embed" 
                        className="absolute inset-0" 
                      />
                   </div>
                   <div className="p-8 relative z-10 bg-[#1C1246] border-t border-white/5">
                      <div className="flex items-start gap-4">
                         <div className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#231854] border border-[#DA8CA0]/20 shrink-0">
                            <MapPin className="h-5 w-5 text-[#DA8CA0]" />
                         </div>
                         <div>
                            <h3 className="text-lg font-bold text-white mb-2">Heal Her HQ</h3>
                            <div className="text-[#CCCCD9] text-sm leading-relaxed font-mono space-y-1">
                               <p>P.M.B. 2084</p>
                               <p>Jos, Plateau State</p>
                               <p>Nigeria, 93001</p>
                            </div>
                            <a 
                              href="https://www.google.com/maps/search/?api=1&query=Jos+Plateau+State+Nigeria" 
                              target="_blank" rel="noopener noreferrer"
                              className="mt-4 inline-flex items-center gap-2 text-xs text-[#DA8CA0] hover:text-[#E8B4C1] transition-colors uppercase tracking-wide font-bold"
                            >
                               Get Directions <ArrowRight className="h-3 w-3" />
                            </a>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Details Grid */}
                <div className="grid gap-4">
                   {[
                     { icon: Building2, label: "Postal Address", val: "P.M.B. 2084, Jos" },
                     { icon: Clock, label: "Response Time", val: "Within 2 hours" }
                   ].map((item, i) => (
                     <motion.div 
                        key={i} 
                        whileHover={{ scale: 1.02 }} 
                        className="p-4 rounded-2xl bg-[#231854] border border-white/5 flex items-center gap-4"
                     >
                        <div className="h-10 w-10 rounded-full bg-[#1C1246] flex items-center justify-center border border-white/10">
                           <item.icon className="h-5 w-5 text-[#CCCCD9]" />
                        </div>
                        <div>
                           <p className="text-[10px] uppercase tracking-wider text-[#DA8CA0] font-bold">{item.label}</p>
                           <p className="text-white text-sm">{item.val}</p>
                        </div>
                     </motion.div>
                   ))}
                </div>
             </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}