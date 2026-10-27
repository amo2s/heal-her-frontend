"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useMotionTemplate, useMotionValue, Variants, AnimatePresence } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { cn } from "@/lib/utils"
import { 
  Heart, Sparkles, Shield, Globe, Lock, Activity,
  CheckCircle2, ArrowRight, Target, Users, Stethoscope, Fingerprint,
  Crown, Mail, Instagram, Phone, GraduationCap, Github, Briefcase
} from "lucide-react"

// Import the intelligent modal component we built
import ExpandedTeamMember from "@/components/ui/modals/team-card"

// ============================================================================
// ULTRA-SMOOTH SPRING ANIMATIONS & PHYSICS
// ============================================================================
const premiumSpring: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 80, damping: 20, mass: 1 } 
  }
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 }
  }
}

// ============================================================================
// PRO COMPONENTS & ICONS
// ============================================================================

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
)

const SocialButton = ({ icon: Icon, href, label }: { icon: any, href: string, label: string }) => (
  <a 
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    onClick={(e) => e.stopPropagation()} 
    className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#CCCCD9] hover:bg-[#DA8CA0] hover:text-[#1C1246] hover:border-[#DA8CA0] transition-all duration-300 transform hover:-translate-y-0.5"
  >
    <Icon className="h-3.5 w-3.5" />
  </a>
)

function SpotlightCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const [isTouch, setIsTouch] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  const backgroundTemplate = useMotionTemplate`
    radial-gradient(
      650px circle at ${mouseX}px ${mouseY}px,
      rgba(218, 140, 160, 0.15),
      transparent 80%
    )
  `

  useEffect(() => {
    setIsMounted(true)
    setIsTouch(window.matchMedia("(pointer: coarse)").matches)
  }, [])

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    if (isTouch) return; 
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  return (
    <div
      className={cn(
        "group relative border border-white/10 bg-[#231854]/50 overflow-hidden rounded-3xl transition-all duration-700 hover:border-[#DA8CA0]/40 hover:shadow-[0_0_40px_rgba(218,140,160,0.1)]",
        className
      )}
      onMouseMove={handleMouseMove}
    >
      {isMounted && !isTouch && (
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-700 group-hover:opacity-100"
          style={{ background: backgroundTemplate }}
        />
      )}
      {isMounted && isTouch && (
        <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-[#DA8CA0]/10 to-transparent opacity-0 transition duration-500 active:opacity-100" />
      )}
      <div className="relative h-full z-10">{children}</div>
    </div>
  )
}

const GlossyPinkButton = ({ children, href, className = "" }: { children: React.ReactNode, href: string, className?: string }) => (
  <Link href={href} className="w-full sm:w-auto block">
    <div className={cn(
      "group relative flex items-center justify-center gap-2 overflow-hidden rounded-full bg-[#DA8CA0] px-6 py-4 md:px-8 text-[#1C1246] font-bold shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),_0_8px_20px_rgba(218,140,160,0.4)] transition-all duration-500 hover:bg-[#E8B4C1] hover:scale-[1.02] hover:shadow-[inset_0_2px_6px_rgba(255,255,255,0.9),_0_12px_30px_rgba(218,140,160,0.6)] active:scale-95 border border-white/20",
      className
    )}>
      <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/40 to-transparent pointer-events-none opacity-50" />
      <span className="relative z-10 flex items-center gap-2 drop-shadow-sm w-full justify-center">{children}</span>
    </div>
  </Link>
)

const TransparentGlassButton = ({ children, href, className = "" }: { children: React.ReactNode, href: string, className?: string }) => (
  <Link href={href} className="w-full sm:w-auto block">
    <div className={cn(
      "group relative flex items-center justify-center gap-2 overflow-hidden rounded-full bg-white/5 border border-[#DA8CA0]/40 px-6 py-4 md:px-8 text-white font-bold backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),_0_8px_20px_rgba(0,0,0,0.2)] transition-all duration-500 hover:bg-white/10 hover:border-[#DA8CA0]/60 hover:scale-[1.02] active:scale-95",
      className
    )}>
      <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
      <span className="relative z-10 flex items-center gap-2 drop-shadow-md w-full justify-center">{children}</span>
    </div>
  </Link>
)

// ============================================================================
// MAIN PAGE LAYOUT
// ============================================================================

export default function AboutPage() {
  const [selectedMember, setSelectedMember] = useState<any | null>(null);

  // Disable background scrolling when modal is open
  useEffect(() => {
    if (selectedMember) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto" };
  }, [selectedMember]);

  // Executive Data specifically injected for the About Page
  const executiveTeam = [
    {
      name: "Nwaka Amos Chika",
      nickname: "Sliverboy",
      role: "Founder & Lead Engineer",
      image: "/sliver.png", 
      operationalRole: "I lead the vision and development of HEAL Her. I manage the product roadmap, coordinate the team, oversee the design and development of new features, make key product decisions, and ensure the platform stays focused on helping girls access safe, trusted, and easy-to-understand health information. I also work closely with my team to improve the platform through research, user feedback, testing, and continuous innovation.",
      personalMission: "I founded HEAL Her because I believe every girl deserves access to trusted health education, no matter where she lives or her background. I have always wanted to use technology to solve real-life problems, and I saw that many girls struggle to get safe, simple, and reliable information about their health. HEAL Her was created to empower girls with knowledge, help them make better health decisions, and protect them from misinformation and harmful situations. My mission is to build technology that saves lives, educates people, and creates a healthier future for young girls across Nigeria,  Africa and beyond.",
      education: "Student - B.Sc Computer Science",
      aspiration: "Full Stack Web Developer",
      icon: Crown, 
      isFounder: true, 
      socials: {
        instagram: "https://www.instagram.com/prism_y4",
        facebook: "https://www.facebook.com/share/1FC78LeYK8/",
        email: "mailto:nwakaamos95@gmail.com",
        whatsapp: "https://wa.me/2349063877703",
        phone: "tel:09063877703",
        github: "https://github.com/amo2s",
        portfolio: "https://sliver-designs.vercel.app/sliverboy"
      }
    },
    {
      name: "Khadija Maumda Musa",
      nickname: "HT Girl",
      role: "Co-Founder & UI Lead",
      image: "/khadija.jpg",
      operationalRole: "As the Co-Founder, Khadija is the emotional and operational core of Heal Her. Her primary skills lie in community leadership, health advocacy, and empathetic content curation. Her main contribution to the project is actively managing and nurturing the 'Girls Lounge'—our secure, judgment-free peer support space that already protects a growing community of over 200 young women. She meticulously oversees our health content to ensure every girl feels heard, protected, and empowered.",
      personalMission: "Growing up, I witnessed firsthand how societal stigma and fear silence young women when it comes to vital health issues. Seeing girls in my immediate circles turn to unverified online forums—leaving themselves vulnerable to misinformation and predatory strangers—made me realize that existing clinical resources are too cold and intimidating for young women to trust. This is what drove me to co-found Heal Her. My mission is to ensure that no girl ever has to face a health scare or a question alone. By directly managing and growing our community of over 200 young women in the 'Girls Lounge,' I see every day the transformative power of safe, empathetic, and medically accurate support. I am fully committed to scaling Heal Her across Nigeria, bridging the gap between raw technology and human empathy to give the next generation of women the private, judgment-free education they deserve.",
      education: "Student - B.Sc Computer Science",
      aspiration: "Frontend Web Developer",
      icon: Heart,
      socials: {
        email: "mailto:khadijaganandaji26@gmail.com",
        whatsapp: "https://wa.me/2348120607103",
        phone: "tel:08120607103"
      }
    },
  ]

  return (
    <div className="relative min-h-screen bg-[#1C1246] text-[#FAFAFA] selection:bg-[#DA8CA0]/30 selection:text-[#DA8CA0] overflow-hidden">
      <Navigation />
      
      {/* --- INTELLIGENT MODAL MOUNT POINT --- */}
      <AnimatePresence>
        {selectedMember && (
          <ExpandedTeamMember 
            member={selectedMember} 
            onClose={() => setSelectedMember(null)} 
          />
        )}
      </AnimatePresence>

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-[100svh] md:min-h-[95vh] flex items-center justify-center pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/thirteen-hero.png" 
            alt="Heal Her Platform" 
            className="w-full h-full object-cover object-center scale-105 animate-pulse-slow" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1C1246]/95 via-[#1C1246]/80 to-[#1C1246]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light pointer-events-none" />
        </div>

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10 text-center flex flex-col items-center mt-12 lg:mt-0">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex flex-col items-center w-full"
          >
            <motion.div variants={premiumSpring}>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#DA8CA0]/40 bg-[#DA8CA0]/10 px-4 py-1.5 md:px-5 md:py-2 text-[10px] md:text-sm font-semibold text-[#DA8CA0] mb-6 md:mb-8 backdrop-blur-md shadow-lg shadow-[#DA8CA0]/5">
                <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span>The Future of Women's Health Education</span>
              </div>
            </motion.div>
            
            <motion.h1 variants={premiumSpring} className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white mb-6 leading-[1.15] drop-shadow-2xl">
              Empowering the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DA8CA0] to-[#E8B4C1]">
                Next Generation.
              </span>
            </motion.h1>
            
            <motion.p variants={premiumSpring} className="max-w-2xl text-base sm:text-lg md:text-xl text-[#CCCCD9] leading-relaxed mb-10 drop-shadow-lg font-medium px-4 sm:px-0">
              We are building a scalable, deeply empathetic digital platform. Heal Her merges cutting-edge technology with medically backed guidance to eradicate health illiteracy.
            </motion.p>

            <motion.div variants={premiumSpring} className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full px-4 sm:px-0 sm:w-auto">
              <GlossyPinkButton href="/contact">
                Partner With Us
              </GlossyPinkButton>
              <TransparentGlassButton href="/login">
                Explore Our Solution
              </TransparentGlassButton>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- MISSION & VISION --- */}
      <section className="py-16 md:py-24 bg-[#1C1246] border-t border-white/5 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid gap-6 md:gap-8 lg:grid-cols-2"
          >
            <motion.div variants={premiumSpring}>
              <SpotlightCard className="p-8 md:p-12 h-full bg-[#231854]/80 border-[#DA8CA0]/20 flex flex-col">
                <div className="mb-6 md:mb-8 inline-flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-2xl bg-[#DA8CA0]/10 border border-[#DA8CA0]/20 text-[#DA8CA0]">
                  <Target className="h-6 w-6 md:h-8 md:w-8" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Our Mission</h2>
                <p className="text-[#CCCCD9] leading-relaxed text-base md:text-lg mb-8 flex-grow">
                  To democratize access to vital health education, dismantling systemic stigmas. We provide institutions, parents, families and individuals with a secure, judgment-free platform where every young woman can understand her body with absolute medical clarity.
                </p>
                <div className="pt-6 md:pt-8 border-t border-white/10 flex items-center gap-4 w-full">
                   <div className="h-1 flex-1 bg-[#1C1246] rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-[#DA8CA0]" />
                   </div>
                   <span className="text-[10px] md:text-xs font-mono text-[#DA8CA0] uppercase tracking-wider whitespace-nowrap">Education_First</span>
                </div>
              </SpotlightCard>
            </motion.div>

            <motion.div variants={premiumSpring}>
              <SpotlightCard className="p-8 md:p-12 h-full bg-gradient-to-br from-[#231854] to-[#1C1246] flex flex-col">
                <div className="mb-6 md:mb-8 inline-flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <Globe className="h-6 w-6 md:h-8 md:w-8" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Our Vision</h2>
                <p className="text-[#CCCCD9] leading-relaxed text-base md:text-lg mb-8 flex-grow">
                  A future where women's health is universally recognized as a foundation of societal well-being. We envision a world where scalable technology ensures no girl is left vulnerable to misinformation or fear.
                </p>
                <div className="pt-6 md:pt-8 border-t border-white/10 flex items-center gap-4 w-full">
                   <div className="h-1 flex-1 bg-[#1C1246] rounded-full overflow-hidden">
                      <div className="h-full w-1/2 bg-purple-500" />
                   </div>
                   <span className="text-[10px] md:text-xs font-mono text-purple-400 uppercase tracking-wider whitespace-nowrap">Global_Confidence</span>
                </div>
              </SpotlightCard>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- THE IMPACT HORIZON --- */}
      <section className="py-16 md:py-24 relative bg-[#231854]/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-white mb-4 md:mb-6"
            >
              The Impact Horizon
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-base md:text-lg text-[#CCCCD9]"
            >
              We are not just building an app; we are solving a systemic crisis in women's health education. Here is why institutions are partnering with us.
            </motion.p>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid sm:grid-cols-2 md:grid-cols-3 gap-6"
          >
             {[
               { icon: Activity, title: "The Misinformation Crisis", desc: "Over 70% of young women rely on unverified online forums for health queries. We replace noise with medically backed facts." },
               { icon: Lock, title: "The Privacy Deficit", desc: "Heal Her provides a zero-tracking, localized AI environment where anonymity is mathematically guaranteed for every user." },
               { icon: Heart, title: "The Empathy Gap", desc: "Clinical resources are often cold. Our conversational engine is designed to respond with the warmth of an older sister." }
             ].map((item, i) => (
                <motion.div key={i} variants={premiumSpring} className="h-full">
                  <SpotlightCard className="p-6 md:p-8 h-full bg-[#1C1246]">
                    <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#DA8CA0]/10 text-[#DA8CA0]">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-white mb-3">{item.title}</h3>
                    <p className="text-[#CCCCD9] text-sm md:text-base leading-relaxed">{item.desc}</p>
                  </SpotlightCard>
                </motion.div>
             ))}
          </motion.div>
        </div>
      </section>

      {/* --- THE ARCHITECTURE OF TRUST (SMART BENTO GRID) --- */}
      <section className="py-20 md:py-32 bg-[#1C1246] border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#DA8CA0]/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">The Architecture of Trust</h2>
            <p className="text-base md:text-lg text-[#CCCCD9]">An ecosystem engineered from the ground up to protect, educate, and empower without compromise.</p>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 md:gap-6 max-w-5xl mx-auto h-auto md:h-[500px]"
          >
            {/* Bento Box 1: Core Privacy */}
            <motion.div variants={premiumSpring} className="md:col-span-1 md:row-span-2 relative group rounded-[2rem] overflow-hidden bg-[#231854]/40 border border-white/10 p-6 md:p-8 flex flex-col justify-end min-h-[300px] md:min-h-0">
              <div className="absolute top-8 right-8 text-[#DA8CA0]/20 group-hover:text-[#DA8CA0]/40 transition-colors duration-500">
                <Fingerprint className="w-24 h-24" strokeWidth={1} />
              </div>
              <div className="relative z-10 mt-auto">
                <div className="h-10 w-10 rounded-full bg-[#DA8CA0]/10 flex items-center justify-center mb-4 border border-[#DA8CA0]/20">
                  <Shield className="w-5 h-5 text-[#DA8CA0]" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Zero-Tracking Guarantee</h3>
                <p className="text-sm text-[#CCCCD9] leading-relaxed">
                  Our server architecture is built on absolute anonymity. We mathematically guarantee that no personal health data is ever tracked, stored permanently, or monetized. A true digital safe haven.
                </p>
              </div>
            </motion.div>

            {/* Bento Box 2: The Girls Lounge */}
            <motion.div variants={premiumSpring} className="md:col-span-2 md:row-span-1 relative group rounded-[2rem] overflow-hidden bg-gradient-to-r from-[#231854]/80 to-[#1C1246] border border-white/10 p-6 md:p-8 flex items-center">
              <div className="relative z-10 pr-4 md:pr-20 w-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                    <Users className="w-4 h-4 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">The Girls Lounge</h3>
                </div>
                <p className="text-sm text-[#CCCCD9] leading-relaxed max-w-xl">
                  A strictly moderated, peer-to-peer digital ecosystem protecting over 200 young women. It bridges the empathy gap, ensuring no question is asked in isolation and every fear is met with communal support.
                </p>
              </div>
              <div className="absolute right-8 top-1/2 -translate-y-1/2 flex gap-2 opacity-30 group-hover:opacity-100 transition-opacity duration-700 hidden md:flex">
                <span className="h-3 w-3 rounded-full bg-purple-400 animate-pulse" />
                <span className="h-3 w-3 rounded-full bg-[#DA8CA0] animate-pulse" style={{ animationDelay: '200ms' }} />
                <span className="h-3 w-3 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: '400ms' }} />
              </div>
            </motion.div>

            {/* Bento Box 3: Clinical Auditing */}
            <motion.div variants={premiumSpring} className="md:col-span-2 md:row-span-1 relative group rounded-[2rem] overflow-hidden bg-[#231854]/40 border border-white/10 p-6 md:p-8 flex items-center">
              <div className="relative z-10 w-full">
                <div className="flex items-center justify-between mb-3 w-full">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                      <Stethoscope className="w-4 h-4 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Clinical Auditing</h3>
                  </div>
                  <div className="text-[10px] font-mono text-blue-400 uppercase tracking-widest border border-blue-500/30 px-2 py-1 rounded-full hidden sm:block">
                    JUTH Verified
                  </div>
                </div>
                <p className="text-sm text-[#CCCCD9] leading-relaxed max-w-xl">
                  Our health scripts and automated routing protocols undergo rigorous review by medical consultants. We replace dangerous internet hearsay with 100% medically accurate, professionally audited facts.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- THE STORY SO FAR --- */}
      <section className="py-20 md:py-24">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 md:mb-20">
               <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Our Growth Trajectory</h2>
               <p className="text-sm md:text-base text-[#CCCCD9] max-w-2xl mx-auto">From an identified necessity to a scalable, transformative digital health solution.</p>
            </div>

            <div className="relative border-l-2 border-[#DA8CA0]/20 ml-6 md:ml-1/2 space-y-12 md:space-y-16 max-w-5xl mx-auto">
               {[
                  { year: "2024", title: "Identifying the Gap", desc: "We identified systemic health misinformation among students, forming the blueprint for a tech-driven, empathetic solution." },
                  { year: "Early 2025", title: "Architecting the Core", desc: "Development commenced on a proprietary engine designed strictly around localized privacy protocols." },
                  { year: "Late 2025", title: "Successful Beta Deployment", desc: "Heal Her launched to a pilot group, yielding overwhelming user retention and community growth in the Girls Lounge." },
                  { year: "The Horizon", title: "National Institutional Rollout", desc: "We are currently scaling infrastructure to deploy Heal Her across young women nationwide." }
               ].map((item, i) => (
                  <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ type: "spring", stiffness: 70, damping: 20 }}
                      viewport={{ once: true, margin: "-50px" }}
                      className="relative pl-6 md:pl-0"
                  >
                     <div className="absolute left-[-29px] md:left-[calc(50%-9px)] top-2 h-4 w-4 rounded-full bg-[#DA8CA0] border-4 border-[#1C1246] shadow-[0_0_15px_rgba(218,140,160,0.6)] z-10" />
                     
                     <div className="md:grid md:grid-cols-2 md:gap-16 items-start">
                        <div className={`md:text-right pt-1 mb-3 md:mb-0 ${i % 2 === 0 ? 'md:order-1' : 'md:order-2 md:text-left'}`}>
                           <span className="inline-block text-[10px] md:text-sm font-bold px-3 py-1 md:px-4 md:py-1.5 rounded-full border bg-[#DA8CA0]/10 text-[#DA8CA0] border-[#DA8CA0]/30 backdrop-blur-sm tracking-wider">
                              {item.year}
                           </span>
                        </div>
                        <div className={`${i % 2 === 0 ? 'md:order-2' : 'md:order-1 md:text-right'} bg-[#231854]/40 hover:bg-[#231854]/60 transition-colors p-6 md:p-8 rounded-2xl md:rounded-3xl border border-white/5`}>
                           <h3 className="text-lg md:text-xl font-bold text-white mb-2">{item.title}</h3>
                           <p className="text-sm md:text-base text-[#CCCCD9] leading-relaxed">{item.desc}</p>
                        </div>
                     </div>
                  </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* --- EXECUTIVE LEADERSHIP (THE VISIONARIES) --- */}
      <section className="py-20 md:py-32 bg-[#1C1246] border-t border-white/5 relative z-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">The Visionaries</h2>
            <p className="text-base md:text-lg text-[#CCCCD9]">
              The minds bridging raw engineering logic with relentless empathy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 justify-center">
            {executiveTeam.map((member, index) => (
              <motion.div
                key={member.name}
                layoutId={`card-container-${member.name}`}
                onClick={() => setSelectedMember(member)}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 1.2, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="group cursor-pointer relative flex flex-col w-full h-full bg-[#231854]/40 rounded-[2rem] border border-white/10 overflow-hidden transition-all duration-500 hover:border-[#DA8CA0]/40 hover:bg-[#231854]/60 hover:shadow-[0_20px_60px_rgba(218,140,160,0.08)]"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-[#DA8CA0]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                <motion.div 
                  layoutId={`image-container-${member.name}`}
                  className="relative w-full aspect-[4/5] md:aspect-[4/4] bg-[#1C1246]/50 overflow-hidden border-b border-white/5"
                >
                  <Image 
                    src={member.image} 
                    alt={member.name} 
                    fill
                    className="object-cover object-center opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105 filter grayscale-[20%] group-hover:grayscale-0"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  
                  <motion.div 
                    layoutId={`badge-${member.name}`} 
                    className="absolute bottom-4 left-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1C1246]/90 backdrop-blur-md border border-white/10 text-xs font-medium text-white shadow-xl"
                  >
                    <member.icon className="h-3.5 w-3.5 text-[#DA8CA0]" />
                    {member.role}
                  </motion.div>
                </motion.div>

                <div className="p-6 md:p-8 flex flex-col flex-grow relative z-10">
                  <div className="mb-4">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-[#DA8CA0] mb-2 opacity-80">
                      {member.nickname}
                    </div>
                    <motion.h3 
                      layoutId={`title-${member.name}`} 
                      className="text-2xl md:text-3xl font-bold text-white group-hover:text-[#DA8CA0] transition-colors duration-300"
                    >
                      {member.name}
                    </motion.h3>
                  </div>
                  
                  <p className="text-sm text-[#CCCCD9] font-light leading-relaxed mb-8 flex-grow line-clamp-3">
                    {member.operationalRole}
                  </p>

                  <div className="flex flex-col gap-5 mt-auto">
                    <div className="border-t border-white/10 pt-5 flex items-center text-xs font-bold uppercase tracking-wider text-[#DA8CA0] group-hover:text-white transition-colors w-full">
                      View Full Mission & Profile 
                      <ArrowRight className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>

                    <div className="flex gap-2">
                      {member.socials?.email && <SocialButton icon={Mail} href={member.socials.email} label="Email" />}
                      {member.socials?.whatsapp && <SocialButton icon={WhatsAppIcon} href={member.socials.whatsapp} label="WhatsApp" />}
                      {member.socials?.phone && <SocialButton icon={Phone} href={member.socials.phone} label="Call" />}
                      {member.socials?.instagram && <SocialButton icon={Instagram} href={member.socials.instagram} label="Instagram" />}
                      {member.socials?.github && <SocialButton icon={Github} href={member.socials.github} label="GitHub" />}
                      {member.socials?.portfolio && <SocialButton icon={Briefcase} href={member.socials.portfolio} label="Portfolio" />}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-20 md:py-32 relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-b from-[#1C1246] via-[#231854]/40 to-[#1C1246] -z-10" />
         
         <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10">
           <motion.div 
             initial={{ opacity: 0, y: 40, scale: 0.95 }}
             whileInView={{ opacity: 1, y: 0, scale: 1 }}
             transition={{ type: "spring", stiffness: 70, damping: 20 }}
             viewport={{ once: true }}
             className="relative rounded-[2rem] md:rounded-[3rem] overflow-hidden p-1"
           >
             <div className="absolute inset-0 bg-gradient-to-r from-[#DA8CA0] via-purple-500 to-[#DA8CA0] opacity-20 animate-spin-slow rounded-[2rem] md:rounded-[3rem]" style={{ animationDuration: '10s' }} />
             
             <div className="relative bg-[#1C1246]/80 backdrop-blur-2xl rounded-[1.9rem] md:rounded-[2.9rem] p-8 md:p-20 text-center border border-white/10 shadow-2xl flex flex-col items-center">
               <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight">Partner in Our Mission</h2>
               <p className="text-base md:text-xl text-[#CCCCD9] max-w-2xl mx-auto mb-8 md:mb-12 leading-relaxed">
                 Whether you are an educational institution looking to integrate safe health tech, or an investor scaling impact—your partnership can help us protect and educate millions of girls.
               </p>
               
               <GlossyPinkButton href="/contact" className="w-full sm:w-auto px-8 py-4 md:px-12 md:py-5 text-base md:text-lg">
                 Contact Us <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
               </GlossyPinkButton>

               <div className="mt-8 md:mt-12 flex flex-col sm:flex-row flex-wrap justify-center gap-4 sm:gap-8 text-xs md:text-sm text-[#CCCCD9]/70 font-medium">
                 <span className="flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-[#DA8CA0]" /> B2B Integration Ready</span>
                 <span className="flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-[#DA8CA0]" /> Scalable Infrastructure</span>
               </div>
             </div>
           </motion.div>
         </div>
      </section>

      <Footer />
    </div>
  )
}