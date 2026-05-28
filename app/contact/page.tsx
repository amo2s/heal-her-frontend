"use client"

import React, { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useMotionTemplate, useMotionValue, Variants, AnimatePresence } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { cn } from "@/lib/utils"
import {
  Mail,
  Building2,
  Globe,
  ArrowRight,
  ShieldCheck,
  Send,
  LifeBuoy,
  ChevronDown,
  Workflow,
  ClipboardCheck,
  Rocket,
  Lock as LockIcon,
  Phone,
  MessageCircle,
  X,
  AlertCircle
} from "lucide-react"

// ============================================================================
// ULTRA-PREMIUM PHYSICS & UTILITIES
// ============================================================================

const premiumSmooth: [number, number, number, number] = [0.16, 1, 0.3, 1]

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)", 
    transition: { duration: 1.2, ease: premiumSmooth } 
  }
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 }
  }
}

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95, filter: "blur(8px)" },
  visible: { 
    opacity: 1, 
    scale: 1, 
    filter: "blur(0px)",
    transition: { duration: 1.2, ease: premiumSmooth } 
  }
}

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
        "group relative border border-white/10 bg-[#231854]/40 overflow-hidden rounded-[1.5rem] md:rounded-[2rem] transition-all duration-700 hover:border-[#DA8CA0]/40 hover:bg-[#231854]/60",
        className
      )}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[1.5rem] md:rounded-[2rem] opacity-0 transition duration-700 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(218, 140, 160, 0.12),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative h-full z-10">{children}</div>
    </div>
  )
}

function GlossyButton({ onClick, children, className = "", type = "button" }: { onClick?: () => void, children: React.ReactNode, className?: string, type?: "button" | "submit" }) {
  return (
    <button 
      type={type}
      onClick={onClick}
      className={cn(
        "group relative inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4 rounded-full bg-gradient-to-b from-[#DA8CA0] to-[#b86981] text-[#1C1246] font-extrabold text-xs md:text-sm lg:text-base tracking-wide overflow-hidden shadow-[0_10px_40px_rgba(218,140,160,0.3)] hover:shadow-[0_10px_50px_rgba(218,140,160,0.6)] transition-all duration-500 will-change-transform hover:-translate-y-1",
        className
      )}
    >
      <div className="absolute top-0 inset-x-0 h-[45%] bg-gradient-to-b from-white/50 to-transparent rounded-t-full pointer-events-none" />
      <div className="absolute inset-0 rounded-full border border-white/40 mix-blend-overlay pointer-events-none" />
      <motion.div 
        className="absolute top-0 left-0 w-[150%] h-[150%] bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-[-45deg]"
        initial={{ x: "-150%" }}
        whileHover={{ x: "150%" }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
      />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  )
}

// ============================================================================
// ENTERPRISE FORM COMPONENT WITH MODAL
// ============================================================================
function ContactForm() {
  const [formData, setFormData] = useState({ name: "", org: "", email: "", subject: "", message: "" })
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsModalOpen(true)
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6 relative z-10">
        <div className="grid gap-5 md:gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-[10px] md:text-xs font-bold text-[#DA8CA0] uppercase tracking-widest ml-1">Full Name</label>
            <input
              type="text" required
              className="w-full bg-[#1C1246] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#FAFAFA] outline-none focus:border-[#DA8CA0]/50 focus:ring-1 focus:ring-[#DA8CA0]/50 transition-all placeholder:text-slate-500"
              placeholder="Jane Doe"
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] md:text-xs font-bold text-[#DA8CA0] uppercase tracking-widest ml-1">Organization / School</label>
            <input
              type="text" required
              className="w-full bg-[#1C1246] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#FAFAFA] outline-none focus:border-[#DA8CA0]/50 focus:ring-1 focus:ring-[#DA8CA0]/50 transition-all placeholder:text-slate-500"
              placeholder="Official Institution Name"
              onChange={(e) => setFormData({...formData, org: e.target.value})}
            />
          </div>
        </div>
        <div className="grid gap-5 md:gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-[10px] md:text-xs font-bold text-[#DA8CA0] uppercase tracking-widest ml-1">Official Email</label>
            <input
              type="email" required
              className="w-full bg-[#1C1246] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#FAFAFA] outline-none focus:border-[#DA8CA0]/50 focus:ring-1 focus:ring-[#DA8CA0]/50 transition-all placeholder:text-slate-500"
              placeholder="admin@institution.org"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] md:text-xs font-bold text-[#DA8CA0] uppercase tracking-widest ml-1">Topic</label>
            <input
              type="text" required
              className="w-full bg-[#1C1246] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#FAFAFA] outline-none focus:border-[#DA8CA0]/50 focus:ring-1 focus:ring-[#DA8CA0]/50 transition-all placeholder:text-slate-500"
              placeholder="Deployment / Support / Partnership"
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] md:text-xs font-bold text-[#DA8CA0] uppercase tracking-widest ml-1">Secure Message</label>
          <textarea
            rows={5} required
            className="w-full bg-[#1C1246] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#FAFAFA] outline-none focus:border-[#DA8CA0]/50 focus:ring-1 focus:ring-[#DA8CA0]/50 transition-all placeholder:text-slate-500 resize-none"
            placeholder="Detail your institution's requirements..."
            onChange={(e) => setFormData({...formData, message: e.target.value})}
          />
        </div>
        
        <div className="pt-2">
          <GlossyButton type="submit" className="w-full">
            Transmit to Administration <Send className="h-4 w-4" />
          </GlossyButton>
        </div>

        <div className="flex items-center justify-center gap-2 text-[10px] text-[#CCCCD9] pt-2">
          <ShieldCheck className="h-3 w-3 text-emerald-500" />
          <span>End-to-End Encrypted routing via <strong>contact@healher.co.site</strong></span>
        </div>
      </form>

      {/* Ultra-Premium Smart Maintenance Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1C1246]/80"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30, opacity: 0, rotateX: 10, filter: "blur(10px)" }}
              animate={{ scale: 1, y: 0, opacity: 1, rotateX: 0, filter: "blur(0px)" }}
              exit={{ scale: 0.95, y: 20, opacity: 0, rotateX: -5, filter: "blur(8px)" }}
              transition={{ duration: 0.7, ease: premiumSmooth }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg bg-[#231854] border border-white/10 rounded-3xl shadow-[0_40px_80px_rgba(0,0,0,0.8)] overflow-hidden perspective-1000"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#DA8CA0]/10 blur-[60px] rounded-full pointer-events-none" />
              
              <div className="p-6 md:p-8 relative z-10">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-[#CCCCD9] hover:text-white transition-all hover:rotate-90 duration-300"
                >
                  <X className="h-5 w-5" />
                </button>
                
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white">System Upgrade in Progress</h3>
                </div>
                
                <p className="text-[#CCCCD9] text-sm md:text-base leading-relaxed font-light mb-8">
                  Our direct intake form is currently undergoing scheduled security maintenance. To ensure your request is handled immediately, please use our active official channels below.
                </p>
                
                <div className="space-y-4">
                  <a href="https://wa.me/2349070594637" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 rounded-xl bg-[#1C1246] border border-white/5 hover:border-emerald-500/30 group transition-all duration-300 shadow-sm hover:shadow-[0_8px_20px_rgba(16,185,129,0.1)]">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                        <MessageCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm group-hover:text-emerald-400 transition-colors">WhatsApp Priority Line</p>
                        <p className="text-[#CCCCD9] text-xs font-mono">0907 059 4637</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-[#CCCCD9] group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                  </a>
                  
                  <a href="tel:+2349063877703" className="flex items-center justify-between p-4 rounded-xl bg-[#1C1246] border border-white/5 hover:border-indigo-500/30 group transition-all duration-300 shadow-sm hover:shadow-[0_8px_20px_rgba(99,102,241,0.1)]">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                        <Phone className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm group-hover:text-indigo-400 transition-colors">Direct Phone Line</p>
                        <p className="text-[#CCCCD9] text-xs font-mono">0906 387 7703</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-[#CCCCD9] group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                  </a>

                  <a href="mailto:contact@healher.co.site" className="flex items-center justify-between p-4 rounded-xl bg-[#1C1246] border border-white/5 hover:border-[#DA8CA0]/30 group transition-all duration-300 shadow-sm hover:shadow-[0_8px_20px_rgba(218,140,160,0.1)]">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-[#DA8CA0]/10 rounded-lg text-[#DA8CA0]">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm group-hover:text-[#DA8CA0] transition-colors">Official Email</p>
                        <p className="text-[#CCCCD9] text-xs font-mono">contact@healher.co.site</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-[#CCCCD9] group-hover:text-[#DA8CA0] group-hover:translate-x-1 transition-all" />
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ============================================================================
// FAQ COMPONENT
// ============================================================================
const FAQS = [
  { q: "Is user data completely safe?", a: "Yes. We operate a zero-knowledge architecture. User profiles are anonymized, and we do not sell, trade, or share data with any advertisers. Total privacy is guaranteed." },
  { q: "How does the age-gating work?", a: "When a profile is created, the user is locked into one of three strict tiers (0-12, 13-17, 18+). Our system physically separates the content databases, ensuring a child can never accidentally access adult reproductive information." },
  { q: "Can we use this platform in rural areas with slow internet?", a: "Absolutely. The platform is engineered to be extremely lightweight, utilizing local caching so that critical medical protocols load instantly, even on 2G and 3G networks." },
  { q: "Are the medical facts verified by professionals?", a: "Yes. Every piece of health information, from hygiene basics to cycle tracking, is aligned with WHO guidelines and reviewed by licensed medical professionals before being added to the AI's core database." },
  { q: "How does the AI detect predators or grooming?", a: "The Red-Flag Engine uses advanced NLP to scan conversational inputs for known predatory patterns, such as requests for secrecy, isolation tactics, or coercion, triggering immediate warnings." },
  { q: "Can schools customize the curriculum?", a: "Yes. Through our Institutional Portal, school boards can tailor the visibility of specific modules to align perfectly with local educational standards and community values." },
  { q: "Does the platform support local languages?", a: "Our live AI intelligence natively supports English, Pidgin English, Yorùbá, Hausa, and Igbo. We are also actively recording our video modules in multiple dialects." },
  { q: "What happens during an active emergency?", a: "Our Escalation Protocol allows users to instantly ping trusted guardians or open a secure line to emergency services and school counselors with a single tap." },
  { q: "Is the platform accessible for users with disabilities?", a: "Yes. It features high-contrast modes, full screen-reader compatibility, and plain-language settings for neurodivergent users or those with cognitive disabilities." },
  { q: "How do you handle teenage cycle tracking data?", a: "Cycle data is encrypted locally on the user's device. It is never transmitted in raw form to our servers, ensuring their most sensitive biological data remains completely private." },
  { q: "Is there any cost for individual users?", a: "No. The core educational and safety platform is completely free for individual young women. We partner with foundations and institutions to fund the infrastructure." },
  { q: "Can parents monitor their child's direct activity?", a: "To protect the child from shame or fear of judgment, direct messages remain anonymous. However, parents and institutions receive high-level oversight metrics regarding safety alerts." },
  { q: "How quickly are new health trends updated?", a: "Our machine learning nodes monitor anonymized aggregate queries. If a sudden surge in questions occurs (e.g., a new virus or harmful TikTok trend), our medical team updates the database within 24 hours." },
  { q: "Can NGOs sponsor a specific region or school?", a: "Yes. Our Global Foundations routing allows NGOs to directly fund and deploy the Heal Her ecosystem into targeted, underserved rural or urban districts." },
  { q: "Do you sell data to advertisers?", a: "Never. We consider the monetization of women's health data to be a severe ethical violation. Our revenue model relies strictly on institutional deployment and philanthropic partnerships." }
]

function FaqAccordion({ q, a }: { q: string, a: string }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="border-b border-white/10 last:border-0">
      <button onClick={() => setIsOpen(!isOpen)} className="flex w-full items-center justify-between py-5 text-left group">
        <span className="text-sm md:text-base font-bold text-[#FAFAFA] group-hover:text-[#DA8CA0] transition-colors pr-4">{q}</span>
        <div className={cn("p-1.5 rounded-full bg-white/5 transition-transform duration-500", isOpen && "rotate-180 bg-[#DA8CA0]/20")}>
          <ChevronDown className={cn("h-4 w-4 text-[#CCCCD9]", isOpen && "text-[#DA8CA0]")} />
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: premiumSmooth }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-sm text-[#CCCCD9] font-light leading-relaxed pr-8">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function InstitutionalContactPage() {
  const [showAllFaqs, setShowAllFaqs] = useState(false)
  const displayedFaqs = showAllFaqs ? FAQS : FAQS.slice(0, 5)

  return (
    <div className="relative min-h-screen bg-[#1C1246] text-[#FAFAFA] selection:bg-[#DA8CA0]/30 selection:text-[#DA8CA0] overflow-x-hidden">
      <GrainOverlay />
      <Navigation />

      {/* --- SECTION 1: THE GATEWAY (Hero Background) --- */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-24 min-h-[100svh] flex flex-col justify-center border-b border-white/5 overflow-hidden">
        
        {/* Absolute Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/ten-hero.png"
            alt="Secure Communication Portal"
            fill
            className="object-cover object-center opacity-40 md:opacity-50"
            priority
          />
          {/* Deep Gradients to maintain text legibility */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#1C1246_80%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1C1246]/90 via-[#1C1246]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1C1246]/80 via-transparent to-[#1C1246]" />
        </div>
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 w-full">
           <motion.div 
             initial="hidden"
             animate="visible"
             variants={staggerContainer}
             className="max-w-2xl text-left pt-10 md:pt-0"
           >
              <motion.div variants={scaleIn} className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-[#1C1246]/80 border border-white/10 text-white text-[10px] md:text-xs font-bold uppercase tracking-widest mb-6 md:mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(218,140,160,0.15)]">
                 <ShieldCheck className="h-3.5 w-3.5 text-[#DA8CA0]" /> Official Communications
              </motion.div>

              <motion.h1 
                variants={fadeInUp}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1] drop-shadow-2xl"
              >
                Connect With Us.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DA8CA0] to-indigo-400">Protect the next generation.</span>
              </motion.h1>

              <motion.p 
                variants={fadeInUp}
                className="text-sm sm:text-base md:text-lg text-[#CCCCD9] leading-relaxed font-light mb-8 max-w-lg drop-shadow-lg"
              >
                Whether you are a school board seeking deployment, a foundation offering support, or an individual requiring immediate assistance, our secure channels are open.
              </motion.p>
           </motion.div>
        </div>

        {/* THIN WATERMARK COVER STICKER */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 1.2, ease: premiumSmooth }}
          className="absolute bottom-6 right-4 md:bottom-8 md:right-8 z-50 flex items-center gap-2 bg-[#1C1246]/95 backdrop-blur-xl border border-[#DA8CA0]/30 px-3 py-1.5 md:px-4 md:py-2 rounded-full shadow-[0_8px_30px_rgba(218,140,160,0.15)]"
        >
           <div className="relative flex h-2 w-2 md:h-2.5 md:w-2.5">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-2 w-2 md:h-2.5 md:w-2.5 bg-emerald-500"></span>
           </div>
           <span className="text-[#DA8CA0] text-[9px] md:text-[10px] uppercase font-mono tracking-widest mt-0.5">Secure Link: VERIFIED</span>
        </motion.div>

      </section>

      {/* --- SECTION 2: DIRECT CHANNELS (The Grid) --- */}
      <section className="py-20 md:py-32 bg-[#1C1246]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div 
            variants={staggerContainer} 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, margin: "-50px" }} 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
          >
             {[
               { icon: LifeBuoy, label: "General Support", desc: "User assistance & app help", val: "Contact Support", href: "mailto:contact@healher.co.site", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
               { icon: Building2, label: "School Integration", desc: "For boards & administrators", val: "Partner with Us", href: "mailto:contact@healher.co.site", color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
               { icon: Globe, label: "Global Foundations", desc: "Sponsorship & deployment", val: "Discuss Deployment", href: "mailto:contact@healher.co.site", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
               { icon: Mail, label: "Direct Admin", desc: "Official correspondence", val: "Message the Founder", href: "mailto:nwakaamos95@gmail.com", color: "text-[#DA8CA0]", bg: "bg-[#DA8CA0]/10", border: "border-[#DA8CA0]/20" }
             ].map((item, i) => (
               <motion.div key={i} variants={fadeInUp} className="h-full">
                 <SpotlightCard className="p-6 md:p-8 h-full bg-[#231854]/40 cursor-pointer group">
                   <a href={item.href} className="block h-full">
                      <div className={cn("mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl border", item.bg, item.border, item.color)}>
                         <item.icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-1">{item.label}</h3>
                      <p className="text-xs text-[#CCCCD9] mb-4 font-light">{item.desc}</p>
                      <div className="text-sm font-bold text-white group-hover:text-[#DA8CA0] transition-colors flex items-center gap-2">
                         {item.val} <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </div>
                   </a>
                 </SpotlightCard>
               </motion.div>
             ))}
          </motion.div>
        </div>
      </section>

      {/* --- SECTION 3: THE ONBOARDING PIPELINE --- */}
      <section className="py-20 md:py-32 bg-[#231854]/20 border-y border-white/5 overflow-hidden">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-50px" }}
               transition={{ duration: 1.2, ease: premiumSmooth }}
               className="text-center mb-16 md:mb-24"
            >
               <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Institutional Deployment Workflow</h2>
               <p className="text-[#CCCCD9] text-base md:text-lg max-w-2xl mx-auto font-light leading-relaxed px-2">
                  We have engineered a zero-friction onboarding process for schools and organizations. Here is exactly what happens when you contact us.
               </p>
            </motion.div>

            <div className="relative max-w-5xl mx-auto">
               <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-y-1/2" />
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative z-10">
                  {[
                     { step: "01", icon: Workflow, title: "Initiate Contact", desc: "Submit your organizational details through our secure portal below. Our compliance team responds within 24 hours." },
                     { step: "02", icon: ClipboardCheck, title: "Needs Assessment", desc: "We evaluate your community size, regional language requirements, and necessary customization for age-gated modules." },
                     { step: "03", icon: Rocket, title: "Custom Deployment", desc: "We roll out the fully encrypted, locally cached platform directly to your student base with zero technical overhead on your end." }
                  ].map((item, i) => (
                     <motion.div 
                       key={i}
                       initial={{ opacity: 0, y: 30 }}
                       whileInView={{ opacity: 1, y: 0 }}
                       viewport={{ once: true, margin: "-50px" }}
                       transition={{ delay: i * 0.2, duration: 1.2, ease: premiumSmooth }}
                       className="relative text-center"
                     >
                        <div className="mx-auto w-16 h-16 rounded-2xl bg-[#1C1246] border border-[#DA8CA0]/30 flex items-center justify-center shadow-[0_0_30px_rgba(218,140,160,0.15)] mb-6 relative">
                           <span className="absolute -top-3 -right-3 text-[10px] font-mono text-[#DA8CA0] bg-[#231854] px-2 py-1 rounded-full border border-white/10">{item.step}</span>
                           <item.icon className="h-7 w-7 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                        <p className="text-[#CCCCD9] text-sm font-light leading-relaxed">{item.desc}</p>
                     </motion.div>
                  ))}
               </div>
            </div>
         </div>
      </section>

      {/* --- SECTION 4: VERIFIED MESSAGING PORTAL (Form) --- */}
      <section className="py-20 md:py-32 bg-[#1C1246]">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
               
               <motion.div 
                 initial={{ opacity: 0, x: -30 }} 
                 whileInView={{ opacity: 1, x: 0 }} 
                 viewport={{ once: true, margin: "-50px" }} 
                 transition={{ duration: 1.2, ease: premiumSmooth }} 
                 className="lg:col-span-5 space-y-6 md:space-y-8"
               >
                  <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">Send a Secure Intake Request.</h2>
                  <p className="text-[#CCCCD9] text-sm md:text-lg font-light leading-relaxed">
                     Fill out the official gateway form to reach our administrative and compliance teams directly. Your submission is end-to-end encrypted.
                  </p>
                  
                  <div className="p-6 rounded-[1.5rem] bg-[#231854]/40 border border-white/5 space-y-4">
                     <div className="flex items-center gap-3">
                        <LockIcon className="h-5 w-5 text-emerald-400" />
                        <span className="text-white font-bold text-sm">Strict Confidentiality</span>
                     </div>
                     <p className="text-[#CCCCD9] text-xs md:text-sm font-light leading-relaxed">
                        We guarantee that any institutional or personal data shared here remains completely sealed. We do not distribute lead data to third parties.
                     </p>
                  </div>
               </motion.div>

               <motion.div 
                 initial={{ opacity: 0, x: 30 }} 
                 whileInView={{ opacity: 1, x: 0 }} 
                 viewport={{ once: true, margin: "-50px" }} 
                 transition={{ duration: 1.2, delay: 0.2, ease: premiumSmooth }} 
                 className="lg:col-span-7"
               >
                  <SpotlightCard className="p-6 md:p-10 bg-[#231854]/60 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                     <ContactForm />
                  </SpotlightCard>
               </motion.div>

            </div>
         </div>
      </section>

      {/* --- SECTION 5: CLEAR ANSWERS (FAQ) --- */}
      <section className="py-20 md:py-32 bg-[#231854]/20 border-t border-white/5">
         <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-50px" }}
               transition={{ duration: 1.2, ease: premiumSmooth }}
               className="text-center mb-12 md:mb-16"
            >
               <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Compliance & Operations FAQ</h2>
               <p className="text-[#CCCCD9] text-sm md:text-lg max-w-2xl mx-auto font-light leading-relaxed px-2">
                  Clear answers to technical, safety, and logistical questions before you initiate deployment.
               </p>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0 }}
               whileInView={{ opacity: 1 }}
               viewport={{ once: true, margin: "-50px" }}
               transition={{ duration: 1.2, ease: premiumSmooth }}
               className="bg-[#1C1246] rounded-[1.5rem] md:rounded-[2rem] border border-white/5 p-4 md:p-8 shadow-2xl"
            >
               <div className="flex flex-col">
                 {displayedFaqs.map((faq, index) => (
                   <FaqAccordion key={index} q={faq.q} a={faq.a} />
                 ))}
               </div>

               <AnimatePresence>
                 {!showAllFaqs && (
                   <motion.div 
                     initial={{ opacity: 0 }} 
                     animate={{ opacity: 1 }} 
                     exit={{ opacity: 0 }} 
                     className="pt-8 text-center"
                   >
                     <button 
                       onClick={() => setShowAllFaqs(true)}
                       className="inline-flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest text-[#DA8CA0] hover:text-white transition-colors px-6 py-3 rounded-full border border-[#DA8CA0]/30 hover:border-white/30 hover:bg-white/5"
                     >
                       Load More Questions <ChevronDown className="h-4 w-4" />
                     </button>
                   </motion.div>
                 )}
               </AnimatePresence>
            </motion.div>
         </div>
      </section>

      <Footer />
    </div>
  )
}