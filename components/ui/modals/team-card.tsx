"use client"

import React, { useEffect, useRef } from "react"
import Image from "next/image"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { 
  ClipboardCheck, Heart, GraduationCap, Target, X, Info, Sparkles,
  Mail, Instagram, Phone, Github, Briefcase 
} from "lucide-react"

// ============================================================================
// HELPER COMPONENTS FOR SOCIALS
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
    className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#CCCCD9] hover:bg-[#DA8CA0] hover:text-[#1C1246] hover:border-[#DA8CA0] transition-all duration-300 transform hover:-translate-y-0.5"
  >
    <Icon className="h-4 w-4" />
  </a>
)

// ============================================================================
// KEYWORD DICTIONARY & PARSER (Intelligent Engine)
// ============================================================================
const keywordDictionary: Record<string, string> = {
  "Girls Lounge": "Our secure, judgment-free peer support space protecting over 200 young women.",
  "zero-tracking": "Our strict server-level guarantee that user data is never stored, sold, or monitored.",
  "cultural stigmas": "Societal pressures that prevent young women from asking vital health questions.",
  "operational security": "Strict internal protocols to ensure our development workflow and data remain uncompromised.",
  "misinformation": "Dangerous, unverified health advice circulating on social media and unchecked forums."
}

const IntelligentText = ({ text }: { text: string }) => {
  const keywords = Object.keys(keywordDictionary)
  if (keywords.length === 0) return <>{text}</>

  const regex = new RegExp(`(${keywords.join("|")})`, "gi")
  const parts = text.split(regex)

  return (
    <>
      {parts.map((part, i) => {
        const lowerPart = part.toLowerCase()
        const matchedKeyword = keywords.find(k => k.toLowerCase() === lowerPart)

        if (matchedKeyword) {
          return (
            <span key={i} className="relative group inline-block cursor-help">
              <span className="text-[#DA8CA0] border-b border-[#DA8CA0]/40 group-hover:border-[#DA8CA0] transition-colors duration-300">
                {part}
              </span>
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3.5 bg-[#1C1246]/95 backdrop-blur-md border border-[#DA8CA0]/30 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 pointer-events-none transform group-hover:-translate-y-1">
                <span className="flex items-center gap-2 mb-1.5">
                  <Info className="h-3.5 w-3.5 text-[#DA8CA0]" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">Concept</span>
                </span>
                <span className="text-xs text-[#CCCCD9] font-light leading-relaxed block">
                  {keywordDictionary[matchedKeyword]}
                </span>
              </span>
            </span>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

// ============================================================================
// PREMIUM PHYSICS
// ============================================================================
// Ultra-smooth spring physics replacing the standard ease for a cinematic snap
const premiumSpring = { type: "spring" as const, damping: 25, stiffness: 200, mass: 0.8 }

// ============================================================================
// THE ISOLATED MODAL COMPONENT (Default Export)
// ============================================================================
interface TeamMemberProps {
  member: any;
  onClose: () => void;
}

export default function ExpandedTeamMember({ member, onClose }: TeamMemberProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  
  // Interaction Memory: Restores scroll position perfectly
  useEffect(() => {
    const savedScroll = sessionStorage.getItem(`scroll-pos-${member.name}`)
    if (scrollRef.current && savedScroll) {
      scrollRef.current.scrollTop = parseInt(savedScroll, 10)
    }

    const handleScroll = () => {
      if (scrollRef.current) {
        sessionStorage.setItem(`scroll-pos-${member.name}`, scrollRef.current.scrollTop.toString())
      }
    }

    const currentRef = scrollRef.current
    if (currentRef) {
      currentRef.addEventListener("scroll", handleScroll)
    }
    return () => {
      if (currentRef) {
        currentRef.removeEventListener("scroll", handleScroll)
      }
    }
  }, [member.name])

  // Scroll-Aware Contrast
  const { scrollYProgress } = useScroll({ container: scrollRef })
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.8], [0, 0.85])

  // Adaptive Ambient Glow mapping
  const getAmbientColor = (role: string) => {
    if (role.includes("Founder")) return "rgba(218, 140, 160, 0.25)" // Brighter Founder Glow
    if (role.includes("Medical") || role.includes("UI")) return "rgba(218, 140, 160, 0.15)"
    if (role.includes("Security") || role.includes("Backend") || role.includes("Operations")) return "rgba(56, 189, 248, 0.15)" 
    if (role.includes("Growth") || role.includes("Community") || role.includes("Engineer")) return "rgba(250, 204, 21, 0.15)" 
    return "rgba(255, 255, 255, 0.1)"
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12"
    >
      {/* Blurred Backdrop */}
      <motion.div 
        className="absolute inset-0 bg-[#0B071F]/80 backdrop-blur-xl cursor-pointer"
        onClick={onClose}
      />
      
      {/* Scroll-Aware Darkening Overlay */}
      <motion.div 
        className="absolute inset-0 bg-black pointer-events-none"
        style={{ opacity: overlayOpacity }}
      />

      {/* Main Glass Container */}
      <motion.div 
        layoutId={`card-container-${member.name}`}
        transition={premiumSpring}
        onClick={(e) => e.stopPropagation()} 
        className="relative w-full max-w-4xl max-h-[90vh] md:max-h-[85vh] bg-[#1C1246] rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl flex flex-col md:flex-row"
        style={{ boxShadow: `0 0 100px ${getAmbientColor(member.role)}` }}
      >
        {/* Floating Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 z-50 h-10 w-10 bg-[#0B071F]/50 hover:bg-[#DA8CA0]/20 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center text-white transition-all duration-300 shadow-lg"
          aria-label="Close Profile"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Left Side: Media Asset Hub */}
        <motion.div 
          layoutId={`image-container-${member.name}`}
          className="w-full md:w-2/5 h-[280px] md:h-auto relative bg-[#231854] shrink-0"
        >
          <Image 
            src={member.image} 
            alt={member.name} 
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1246] via-[#1C1246]/40 to-transparent md:bg-gradient-to-r md:from-transparent md:to-[#1C1246]" />
          
          <div className="absolute bottom-6 left-6 md:left-8 z-10 pr-6">
            {/* Intelligent Founder Flair Logic */}
            {member.isFounder && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-1.5 mb-3 text-[#DA8CA0] bg-[#DA8CA0]/10 border border-[#DA8CA0]/30 px-2.5 py-1 rounded-md w-fit backdrop-blur-md shadow-[0_0_15px_rgba(218,140,160,0.3)]"
              >
                <Sparkles className="h-3 w-3" />
                <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Visionary Leader</span>
              </motion.div>
            )}

            <motion.div layoutId={`badge-${member.name}`} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium text-white mb-3">
              <member.icon className="h-3.5 w-3.5 text-[#DA8CA0]" />
              {member.role}
            </motion.div>
            <motion.h3 layoutId={`title-${member.name}`} className="text-2xl md:text-3xl font-bold text-white mb-1 leading-tight drop-shadow-lg">
              {member.name}
            </motion.h3>
            <p className="text-[#DA8CA0] font-mono text-[10px] md:text-xs uppercase tracking-widest drop-shadow-md">{member.nickname}</p>
          </div>
        </motion.div>

        {/* Right Side: Smart Narrative Scroll */}
        {/* CUSTOM SCROLLBAR CSS INJECTED VIA TAILWIND ARBITRARY VARIANTS */}
        <div 
          ref={scrollRef}
          className="w-full md:w-3/5 p-6 md:p-10 overflow-y-auto flex flex-col gap-8 relative z-10 
          [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#DA8CA0]/50 transition-colors"
        >
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h4 className="text-xs font-mono uppercase tracking-widest text-[#CCCCD9]/50 mb-3 flex items-center gap-2">
              <ClipboardCheck className="h-3.5 w-3.5" /> Operational Scope
            </h4>
            <p className="text-sm md:text-base text-[#CCCCD9] font-light leading-relaxed">
              <IntelligentText text={member.operationalRole} />
            </p>
          </motion.div>

          <div className="w-full h-px bg-white/5" />

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h4 className="text-xs font-mono uppercase tracking-widest text-[#DA8CA0]/70 mb-3 flex items-center gap-2">
              <Heart className="h-3.5 w-3.5" /> The Driving Force
            </h4>
            <p className="text-sm md:text-base text-white font-light leading-relaxed">
              <IntelligentText text={member.personalMission} />
            </p>
          </motion.div>

          {/* Academic/Professional Tags */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-2 p-5 rounded-2xl bg-[#231854]/40 border border-white/5 space-y-4"
          >
             <div className="flex items-start gap-4">
                <GraduationCap className="h-5 w-5 text-[#CCCCD9] mt-0.5 opacity-60 shrink-0" />
                <div>
                   <span className="block text-[10px] uppercase tracking-wider font-bold text-[#CCCCD9]/50">Academic Focus</span>
                   <span className="block text-sm font-medium text-[#FAFAFA] mt-0.5">{member.education}</span>
                </div>
             </div>
             <div className="flex items-start gap-4">
                <Target className="h-5 w-5 text-[#DA8CA0] mt-0.5 opacity-80 shrink-0" />
                <div>
                   <span className="block text-[10px] uppercase tracking-wider font-bold text-[#CCCCD9]/50">Professional Trajectory</span>
                   <span className="block text-sm font-bold text-[#FAFAFA] mt-0.5">{member.aspiration}</span>
                </div>
             </div>
          </motion.div>

          {/* Social Links Row */}
          {member.socials && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-wrap gap-3 pt-4 border-t border-white/5 mt-auto"
            >
              {member.socials.email && <SocialButton icon={Mail} href={member.socials.email} label="Email" />}
              {member.socials.whatsapp && <SocialButton icon={WhatsAppIcon} href={member.socials.whatsapp} label="WhatsApp" />}
              {member.socials.phone && <SocialButton icon={Phone} href={member.socials.phone} label="Call" />}
              {member.socials.instagram && <SocialButton icon={Instagram} href={member.socials.instagram} label="Instagram" />}
              {member.socials.github && <SocialButton icon={Github} href={member.socials.github} label="GitHub" />}
              {member.socials.portfolio && <SocialButton icon={Briefcase} href={member.socials.portfolio} label="Portfolio" />}
            </motion.div>
          )}

        </div>
      </motion.div>
    </motion.div>
  )
}