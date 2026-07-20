"use client"

import React, { useState, useRef } from "react"
import { motion, useScroll, useTransform, useMotionTemplate, useMotionValue, Variants } from "framer-motion"
import { 
  ShieldAlert, 
  EyeOff,
  Database,
  Trash2,
  Lock,
  Mail,
  Monitor,
  Fingerprint,
  Scale,
  BrainCircuit,
  FileCheck
} from "lucide-react"

// --- TYPES & INTERFACES ---
export interface SignaturePayload {
  clientName: string;
  clientEmail: string;
  isParentalConsent: boolean;
  minorName?: string;
  minorAge?: number;
}

interface LegalTermsDocumentProps {
  onExecuteSignature?: (payload: SignaturePayload) => Promise<void>;
  isProcessing?: boolean;
}

// --- PREMIUM ANIMATION VARIANTS ---
const luxuryEase: [number, number, number, number] = [0.16, 1, 0.3, 1]

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 1.2, ease: luxuryEase }
  }
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1, ease: luxuryEase }
  }
}

// --- SUB-COMPONENTS ---
const GrainOverlay = () => (
  <div 
    className="pointer-events-none absolute inset-0 z-0 opacity-[0.04]"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
    }}
  />
)

const FounderSignature = () => (
  <div className="relative select-none pointer-events-none" onContextMenu={(e) => e.preventDefault()}>
    <svg width="240" height="80" viewBox="0 0 240 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#DA8CA0]">
      <path d="M40 60 C 30 50, 40 20, 50 15 C 60 10, 70 60, 35 55" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M65 40 Q 70 30, 75 40 Q 80 30, 85 40 Q 90 30, 95 45" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M100 40 C 95 35, 105 35, 105 40 C 105 45, 95 45, 100 38" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M115 40 C 110 40, 110 45, 115 45 C 120 45, 115 50, 110 50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M20 70 C 60 65, 180 65, 220 50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6" />
    </svg>
  </div>
)

// --- PREMIUM INTERACTIVE CLAUSE WRAPPER ---
const LegalClause = ({ 
  number, 
  title, 
  children, 
  isCritical = false,
  icon: Icon
}: { 
  number: string, 
  title: string, 
  children: React.ReactNode, 
  isCritical?: boolean,
  icon?: any
}) => {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  return (
    <motion.div variants={fadeInUp} className="mb-20 scroll-mt-32 relative group" id={`section-${parseInt(number)}`} onMouseMove={handleMouseMove}>
      <motion.div
        className={`pointer-events-none absolute -inset-6 rounded-3xl opacity-0 transition duration-700 group-hover:opacity-100 ${isCritical ? 'z-0' : '-z-10'}`}
        style={{
          background: useMotionTemplate`
            radial-gradient(
              600px circle at ${mouseX}px ${mouseY}px,
              ${isCritical ? 'rgba(244, 63, 94, 0.08)' : 'rgba(218, 140, 160, 0.05)'},
              transparent 80%
            )
          `,
        }}
      />
      
      {isCritical ? (
        <div className="relative z-10 overflow-hidden rounded-2xl border border-rose-500/30 bg-[#1C1246]/50 backdrop-blur-sm p-8 md:p-10 shadow-[0_0_40px_rgba(244,63,94,0.05)] transition-colors duration-500 hover:border-rose-500/60">
          <div className="flex items-center gap-4 mb-8 text-rose-400">
            <div className="h-12 w-12 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
              {Icon ? <Icon className="h-6 w-6" /> : <ShieldAlert className="h-6 w-6" />}
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold m-0 tracking-tight text-white">{number}. {title}</h2>
          </div>
          <div className="space-y-6 text-[#CCCCD9] text-base leading-relaxed font-light">
            {children}
          </div>
        </div>
      ) : (
        <div className="relative z-10 px-2">
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-4 border-b border-[#DA8CA0]/10 pb-4">
            <span className="flex items-center justify-center h-8 w-8 text-[#DA8CA0] font-mono text-xs bg-[#DA8CA0]/10 rounded-lg border border-[#DA8CA0]/20 shadow-inner">
              {number}
            </span> 
            {title}
          </h2>
          <div className="space-y-6 text-[#CCCCD9] text-base md:text-lg leading-relaxed font-light">
            {children}
          </div>
        </div>
      )}
    </motion.div>
  )
}

// --- MAIN EXPORTED COMPONENT ---
export default function PrivacyPolicyDocument({ onExecuteSignature, isProcessing = false }: LegalTermsDocumentProps) {
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [isParentalConsent, setIsParentalConsent] = useState(false)
  const [minorName, setMinorName] = useState("")
  const [minorAge, setMinorAge] = useState("")
  const [validationError, setValidationError] = useState(false)
  
  const signatureAnchorRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll()
  const headerOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0.9])

  const handleValidationAndSubmit = () => {
    const isBaseInvalid = !clientName.trim() || !clientEmail.trim()
    const parsedAge = parseInt(minorAge)
    const isMinorInvalid = isParentalConsent && (!minorName.trim() || !minorAge.trim() || isNaN(parsedAge) || parsedAge < 8)

    if (isBaseInvalid || isMinorInvalid) {
      setValidationError(true)
      signatureAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setValidationError(false)
    if (onExecuteSignature) {
      onExecuteSignature({
        clientName,
        clientEmail,
        isParentalConsent,
        minorName: isParentalConsent ? minorName : undefined,
        minorAge: isParentalConsent ? parsedAge : undefined
      })
    }
  }

  const handleContactLegal = () => {
    const user = "nwakaamos95"
    const domain = "gmail.com"
    window.location.href = `mailto:${user}@${domain}`
  }

  const sections = [
    "1. Anonymous by Design",
    "2. Data We Actually Collect",
    "3. AI Training & Internal Logs (Critical)",
    "4. The No-Export Rule",
    "5. The Red Flag Detector",
    "6. AI Buddy for Kids",
    "7. Young Adult Guidance",
    "8. Period Tracking Data",
    "9. The No-Sell Guarantee",
    "10. Security & Encryption",
    "11. Third-Party Infrastructure",
    "12. Law Enforcement",
    "13. Algorithmic Guardrails",
    "14. Right to Erasure",
    "15. Cookies & Tracking",
    "16. Legal Compliance & Contact"
  ]

  return (
    <div className="relative w-full bg-transparent text-[#FAFAFA] selection:bg-[#DA8CA0]/30 selection:text-[#DA8CA0] overflow-hidden custom-scrollbar rounded-3xl shadow-[0_0_60px_rgba(218,140,160,0.05)] border border-white/5">
      <GrainOverlay />
      
      {/* MOBILE ADVISORY */}
      <div className="md:hidden sticky top-0 z-[60] w-full bg-[#1C1246]/95 backdrop-blur-xl border-b border-[#DA8CA0]/20 py-3 px-4 flex items-center justify-center gap-3 shadow-2xl">
        <Monitor className="h-4 w-4 text-[#DA8CA0] animate-pulse" />
        <p className="text-[11px] font-medium text-[#DA8CA0] tracking-wide text-center">
          For the optimal legal execution experience, please use a desktop interface.
        </p>
      </div>

      {/* --- PREMIUM HEADER --- */}
      <motion.section 
        style={{ opacity: headerOpacity }}
        className="relative pt-16 md:pt-24 pb-16 border-b border-[#DA8CA0]/10 bg-gradient-to-b from-[#1C1246]/80 to-[#0F0A26] px-6 sm:px-12"
      >
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12"
        >
          <motion.div variants={fadeInUp} className="max-w-3xl relative z-10">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#DA8CA0]/10 border border-[#DA8CA0]/20 text-[#DA8CA0] text-xs font-mono uppercase tracking-widest mb-6 shadow-[0_0_20px_rgba(218,140,160,0.1)]">
              <ShieldAlert className="h-3.5 w-3.5" /> HH-PRIV-2026-V2
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-[#DA8CA0]/80 tracking-tight mb-6 drop-shadow-sm">
              Privacy Policy.
            </h1>
            <p className="text-[#CCCCD9] text-lg md:text-xl leading-relaxed font-light max-w-2xl">
              We believe privacy is a fundamental human right. This document explains exactly what data we collect, why we keep it, and how we protect your dignity. Written in plain English, because legal jargon is designed to hide the truth, and we have nothing to hide.
            </p>
          </motion.div>
          
          <motion.div variants={fadeInUp} className="w-full lg:w-auto bg-[#1C1246]/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col gap-4 min-w-[280px] shadow-2xl relative z-10 group hover:border-[#DA8CA0]/30 transition-colors">
            <div className="flex justify-between items-center text-xs text-[#CCCCD9] font-mono border-b border-white/5 pb-3">
              <span className="uppercase tracking-widest opacity-60">Effective Date</span>
              <span className="text-white font-medium">July 20, 2026</span>
            </div>
            <div className="flex justify-between items-center text-xs text-[#CCCCD9] font-mono border-b border-white/5 pb-3">
              <span className="uppercase tracking-widest opacity-60">Jurisdiction</span>
              <span className="text-white font-medium">NDPR / Global</span>
            </div>
            <div className="flex justify-between items-center text-xs text-[#CCCCD9] font-mono pt-1">
              <span className="uppercase tracking-widest opacity-60">Status</span>
              <span className="text-emerald-400 font-bold flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> ACTIVE
              </span>
            </div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* --- MAIN CONTENT LAYOUT --- */}
      <div className="px-6 sm:px-12 py-20 relative z-10">
        <div className="grid lg:grid-cols-12 gap-16">
          
          {/* --- SIDEBAR (Sticky Nav) --- */}
          <div className="hidden lg:block lg:col-span-4 xl:col-span-3">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: luxuryEase, delay: 0.2 }}
              className="sticky top-12 space-y-10"
            >
              <div>
                <h3 className="text-[10px] font-bold text-[#DA8CA0] uppercase tracking-[0.2em] mb-6">Table of Contents</h3>
                <nav className="space-y-1.5 border-l-2 border-white/5 max-h-[65vh] overflow-y-auto pr-4 custom-scrollbar">
                  {sections.map((item, i) => (
                    <a 
                      key={i} 
                      href={`#section-${i+1}`} 
                      className="block pl-5 py-2 text-sm text-[#CCCCD9]/60 hover:text-white hover:border-l-[#DA8CA0] border-l-2 border-transparent transition-all duration-300 font-medium truncate -ml-[2px]"
                    >
                      {item}
                    </a>
                  ))}
                </nav>
              </div>
              
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#231854]/80 to-[#1C1246]/80 border border-white/10 shadow-xl backdrop-blur-md">
                <h4 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                  <Fingerprint className="h-4 w-4 text-[#DA8CA0]" /> The Iron Wall
                </h4>
                <p className="text-xs text-[#CCCCD9]/80 leading-relaxed font-light">
                  Your identity and your queries exist in separate, heavily encrypted databases. We separate <em>who you are</em> from <em>what you ask</em>.
                </p>
              </div>
            </motion.div>
          </div>

          {/* --- LEGAL TEXT (16 Sections) --- */}
          <div className="lg:col-span-8 xl:col-span-9">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="max-w-4xl"
            >
              
              {/* 1. Anonymous by Design */}
              <LegalClause number="01" title="Anonymous by Design">
                <p><strong>1.1. No Real Names Required.</strong> We do not track your real name, and frankly, we do not want it. When you create an account, we ask you to pick a safe nickname. To our systems, you are just "StarGirl" or "Bluebird."</p>
                <p><strong>1.2. Identity Separation.</strong> The system architecture is built like an iron wall. We store your account credentials in one locked vault, and your health conversations in a completely different one. Even if our database was somehow compromised, the attackers could not tie your specific health questions back to your identity.</p>
              </LegalClause>

              {/* 2. What We Actually Collect */}
              <LegalClause number="02" title="Data We Actually Collect">
                <p>We believe in strictly minimal data collection. We only hoard data if it directly benefits your experience. Here is exactly what we keep:</p>
                <ul className="space-y-4 mt-6 list-disc pl-5">
                  <li className="pl-2"><strong>Your Email Address:</strong> Collected solely so you can reset your password. We do not use it to track you across the internet.</li>
                  <li className="pl-2"><strong>Your Chat Text:</strong> Saved so you can read your past advice and pick up conversations where you left off.</li>
                  <li className="pl-2"><strong>General Region:</strong> We need to know roughly where you are so that if you are in severe danger, the AI gives you the correct local emergency numbers (e.g., 112 in Nigeria vs. 911 in the US).</li>
                </ul>
              </LegalClause>

              {/* 3. AI Training (Critical) */}
              <LegalClause number="03" title="AI Training & Internal Chat Logs" isCritical icon={BrainCircuit}>
                <p><strong>3.1. Yes, We Use Your Logs.</strong> Let us be completely transparent: we save your chat logs, and we do use them to train our AI models. Why? Because the AI needs to learn how to give better, more empathetic, and more accurate advice to the next girl who needs help.</p>
                <p><strong>3.2. Stripped and Scrubbed.</strong> Before your chat ever gets near our training models, it goes through an automated scrubbing process. All personally identifiable information (PII) is permanently stripped away. By the time the AI studies the conversation, it is just anonymous text.</p>
                <div className="mt-8 bg-rose-950/30 border border-rose-500/20 p-6 rounded-xl">
                  <p className="text-rose-200 text-sm font-medium tracking-wide leading-relaxed">
                    <strong>3.3. The "Common Sense" Clause.</strong> Please use common sense. Do not type your home address, your bank PIN, or your passwords into the chat. We automatically run scrubbers to catch this, but it is much safer (and makes our engineering lives much easier) if you just don't do it. We are a health platform, not a secure delivery service for your financial secrets.
                  </p>
                </div>
              </LegalClause>

              {/* 4. No Export Rule */}
              <LegalClause number="04" title="The No-Export Rule (Data Portability)">
                <p><strong>4.1. Disabled by Design.</strong> Normally, privacy laws mandate a feature called "Data Portability"—the right to click a button and download all your data. We have intentionally disabled this for your chat logs.</p>
                <p><strong>4.2. Security Over Convenience.</strong> Why? Because these logs are retained strictly to train our AI to be smarter; they are not meant to be a personal scrapbook. Leaving a PDF titled <code>My_Deepest_Insecurities.pdf</code> lying around in your local downloads folder is terrible op-sec. We keep your secrets locked down in our encrypted vaults, for the system's eyes only.</p>
              </LegalClause>

              {/* 5. Red Flag Detector */}
              <LegalClause number="05" title="The Red Flag Detector (External Chats)">
                <p><strong>5.1. Scanning for Predators.</strong> Our platform features a "Red Flag Detector" where you can paste screenshots or text from other apps (like WhatsApp or Instagram) to check for grooming, gaslighting, or manipulation tactics.</p>
                <p><strong>5.2. Ephemeral Processing.</strong> When you paste these external chats, the AI analyzes the text, identifies the toxic behavior, generates a safe reply, and then <em>immediately purges</em> the pasted text from our active memory.</p>
                <p><strong>5.3. We Don't Save Trash.</strong> To put it plainly: if a guy named Chad is trying to manipulate you, we will analyze his tactics to protect you, but we do not permanently archive Chad's emotional abuse in our databases. It is processed and dumped.</p>
              </LegalClause>

              {/* 6. AI Buddy for Kids */}
              <LegalClause number="06" title="AI Buddy for Kids">
                <p><strong>6.1. Extreme Constraints.</strong> For our child-focused AI Buddy modules, data processing operates under extreme NDPR and COPPA constraints. The AI acts as a digital shield, mentor, and educational guide.</p>
                <p><strong>6.2. Cryptographic Parental Consent.</strong> We do not build marketing profiles on children. Period. Before a minor can initiate their first chat, parental or guardian consent must be cryptographically logged and verified through our signature matrix (found at the bottom of this document).</p>
              </LegalClause>

              {/* 7. Young Adults */}
              <LegalClause number="07" title="Young Adult Guidance & Boundaries">
                <p><strong>7.1. Safe Exploration.</strong> We provide specific modules for young adults to help them understand their rights, set personal boundaries, and navigate complex social dynamics. Conversations in these modules are highly sensitive.</p>
                <p><strong>7.2. Elevated Privacy Routing.</strong> Queries routed through the young adult boundary modules are assigned the highest level of contextual anonymity. The system is designed to provide actionable advice without attaching the vulnerability to a permanent, identifiable user record.</p>
              </LegalClause>

              {/* 8. Period Tracking */}
              <LegalClause number="08" title="Period & Reproductive Tracking">
                <p><strong>8.1. Weaponization Defense.</strong> Information regarding your reproductive health and menstrual cycles is classified as hyper-sensitive data. We encrypt this data at rest using AES-256 and do not allow it to be co-mingled with general demographic analytics.</p>
                <p><strong>8.2. Absolute Control.</strong> You maintain absolute control over your cycle data. It is never used to target you with advertisements for health products, and it cannot be queried by unauthorized internal staff.</p>
              </LegalClause>

              {/* 9. No-Sell Guarantee */}
              <LegalClause number="09" title="The No-Sell Guarantee" icon={Database}>
                <div className="p-6 bg-gradient-to-r from-[#231854]/40 to-transparent border-l-4 border-[#DA8CA0] rounded-r-xl">
                  <p className="text-white font-medium text-lg">We do not sell your data. Period.</p>
                  <p className="mt-3 text-[#CCCCD9]">We do not broker it to marketers, we do not share it with advertising networks, and we do not use sneaky tracking pixels to follow you around the internet. Your health concerns are a private matter, not a product for us to auction off.</p>
                </div>
              </LegalClause>

              {/* 10. Security & Encryption */}
              <LegalClause number="10" title="Bank-Grade Security & Encryption">
                <p><strong>10.1. Encryption Matrix.</strong> As soon as you hit send, your message is wrapped in an AES-256 digital lock. It travels through the internet via TLS 1.3 secure tunnels. At rest in our databases, the storage volumes are fully encrypted.</p>
                <p><strong>10.2. Key Management.</strong> The decryption keys are physically separated from the database clusters. Without the proper application-layer authentication, a stolen hard drive looks like complete mathematical gibberish.</p>
              </LegalClause>

              {/* 11. Third-Party Infra */}
              <LegalClause number="11" title="Third-Party Infrastructure">
                <p><strong>11.1. Who Touches the Servers?</strong> We build the software, but we don't own the physical server racks. We use premium, audited third-party infrastructure (like Aiven Valkey and secure model hosting providers) to run our systems.</p>
                <p><strong>11.2. Zero-Knowledge Processing.</strong> These infrastructure partners process the data, but they do not have the keys to read it. They simply provide the computing power. We hold them to strict Data Processing Agreements (DPAs) that legally bind them to our privacy standards.</p>
              </LegalClause>

              {/* 12. Law Enforcement */}
              <LegalClause number="12" title="Law Enforcement & Subpoenas">
                <p><strong>12.1. Legal Compliance.</strong> If we receive a legally valid, court-ordered subpoena, we are obligated to comply with the law. We do not operate above it.</p>
                <p><strong>12.2. The Reality of the Iron Wall.</strong> However, because your real identity is decoupled from your encrypted health data, handing over a file that says <em>"Anonymous User #8274 asked about menstrual cramps"</em> is not exactly the smoking gun authorities usually hope for. We can only hand over what we have, and we design our systems to have very little identifying information.</p>
              </LegalClause>

              {/* 13. Algorithmic Guardrails */}
              <LegalClause number="13" title="Algorithmic Guardrails & Bias">
                <p><strong>13.1. Safety Over Output.</strong> We implement strict constitutional AI guardrails. If a prompt attempts to bypass safety protocols or requests instructions for self-harm or violence, the model intercepts it and refuses to generate a harmful response.</p>
                <p><strong>13.2. Bias Mitigation.</strong> Because the AI is trained on historical data, we actively monitor and patch the models to prevent racial, geographic, or gender-based medical biases from creeping into the advice.</p>
              </LegalClause>

              {/* 14. Erasure */}
              <LegalClause number="14" title="Your Right to Erasure (The Nuke Button)" isCritical icon={Trash2}>
                <p><strong>14.1. Absolute Deletion.</strong> You have the absolute right to delete your account at any time. When you hit the delete button in your settings, your data isn't just "deactivated" or hidden.</p>
                <p><strong>14.2. Digital Dust.</strong> The deletion protocol executes a hard purge across the primary database. Your chat history, account credentials, and customized settings become digital dust, completely unreadable and unrecoverable forever. Not even our lead engineers can retrieve it.</p>
              </LegalClause>

              {/* 15. Cookies */}
              <LegalClause number="15" title="Cookies & Tracking Technologies">
                <p><strong>15.1. Strictly Functional.</strong> We use minimal cookies. These are tiny text files that exist purely to keep you logged into your account during your active session and remember your theme preferences.</p>
                <p><strong>15.2. No Creepy Tech.</strong> We absolutely refuse to implement third-party advertising cookies, fingerprinting scripts, or cross-site trackers. What you do outside of Heal Her is none of our business.</p>
              </LegalClause>

              {/* 16. Contact */}
              <motion.div variants={fadeInUp} id="section-16" className="mb-20 scroll-mt-32 border-t border-white/10 pt-16">
                <h2 className="text-3xl font-bold text-white mb-10 flex items-center gap-4">
                  <span className="text-[#DA8CA0] font-mono text-sm bg-[#DA8CA0]/10 px-3 py-1.5 rounded-lg border border-[#DA8CA0]/20">16</span> Legal Compliance & Contact
                </h2>
                
                <div className="p-10 bg-gradient-to-br from-[#1C1246] to-[#0F0A26] rounded-3xl border border-[#DA8CA0]/20 flex flex-col md:flex-row gap-12 shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
                  <div className="flex-1">
                    <h4 className="text-white text-xl font-bold mb-4 flex items-center gap-2"><Scale className="h-5 w-5 text-[#DA8CA0]" /> Data Protection Officer</h4>
                    <p className="text-[#CCCCD9] text-sm leading-relaxed mb-8 font-light">
                      Our data processing protocols strictly comply with the <strong>Nigeria Data Protection Regulation (NDPR)</strong>. If you have questions about your privacy, or wish to formally exercise your rights under the law, contact our legal desk.
                    </p>
                    
                    <button 
                      onClick={handleContactLegal}
                      className="liquid-glass-btn h-12 px-8 flex items-center justify-center gap-3 rounded-xl font-bold tracking-wide text-sm w-full md:w-auto"
                    >
                      <Mail className="h-4 w-4" /> Contact Legal Department
                    </button>
                  </div>
                  <div className="flex-1 md:border-l md:border-white/10 md:pl-12 flex flex-col justify-center">
                    <div className="space-y-6 font-mono text-sm">
                      <div>
                        <span className="text-[#CCCCD9]/50 block text-[10px] uppercase tracking-[0.2em] mb-2">Operating Base</span>
                        <span className="text-white text-base">Jos, Plateau State<br/>Federal Republic of Nigeria</span>
                      </div>
                      <div>
                        <span className="text-[#CCCCD9]/50 block text-[10px] uppercase tracking-[0.2em] mb-2">Governing Law</span>
                        <span className="text-emerald-400 font-bold">NDPR Framework</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* --- DIGITAL SIGNATURE BLOCK & AUDIT FORM --- */}
              <motion.div variants={fadeInUp} className="mt-32 pt-20 border-t border-white/10 break-inside-avoid pb-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 items-start">
                  
                  {/* Executive Signature (Col 1) */}
                  <div className="space-y-6">
                    <p className="text-[10px] text-[#DA8CA0] uppercase tracking-[0.2em] font-bold">Policy Authorized By:</p>
                    <div className="relative pt-4">
                      <FounderSignature />
                      {/* Authority Seal */}
                      <div className="absolute -top-4 -right-4 opacity-30 pointer-events-none rotate-[-15deg] border-[2px] border-[#DA8CA0] rounded-full w-32 h-32 flex items-center justify-center shadow-[0_0_30px_rgba(218,140,160,0.2)] mix-blend-screen">
                        <div className="text-[9px] font-mono text-[#DA8CA0] text-center leading-tight font-bold tracking-widest">
                          DATA<br/>PROTECTION<br/>SEAL<br/>2026
                        </div>
                      </div>
                    </div>
                    <div className="h-px w-full bg-gradient-to-r from-[#DA8CA0]/50 to-transparent" />
                    <div className="text-sm text-[#CCCCD9] font-mono leading-relaxed">
                      <span className="text-white font-bold text-lg block mb-1">Nwaka Amos Chika</span>
                      Founder & Executive Director<br/>
                      Heal Her
                    </div>
                  </div>

                  {/* Client Signature & Email Form (Col 2) */}
                  <div className="space-y-6 relative" ref={signatureAnchorRef}>
                    <p className="text-[10px] text-[#DA8CA0] uppercase tracking-[0.2em] font-bold">
                      {isParentalConsent ? "Consent Granted By Parent:" : "Consent Granted By User:"}
                    </p>
                    <div className="space-y-4">
                      <div>
                        <input 
                          type="text" 
                          placeholder={isParentalConsent ? "Enter Parent's Full Legal Name" : "Enter Full Legal Name"}
                          value={clientName}
                          onChange={(e) => { setClientName(e.target.value); setValidationError(false); }}
                          className={`w-full bg-[#1C1246]/50 border ${validationError && !clientName ? 'border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)]' : 'border-white/10'} rounded-xl px-5 py-3.5 text-sm text-white placeholder:text-[#CCCCD9]/40 focus:outline-none focus:border-[#DA8CA0] focus:bg-[#1C1246] transition-all`}
                        />
                      </div>
                      <div>
                        <input 
                          type="email" 
                          placeholder="Email for PDF Delivery"
                          value={clientEmail}
                          onChange={(e) => { setClientEmail(e.target.value); setValidationError(false); }}
                          className={`w-full bg-[#1C1246]/50 border ${validationError && !clientEmail ? 'border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)]' : 'border-white/10'} rounded-xl px-5 py-3.5 text-sm text-white placeholder:text-[#CCCCD9]/40 focus:outline-none focus:border-[#DA8CA0] focus:bg-[#1C1246] transition-all`}
                        />
                      </div>

                      {/* Parental Consent Toggle */}
                      <label className="flex items-center gap-3 cursor-pointer group mt-4 w-max">
                        <input 
                          type="checkbox" 
                          className="hidden" 
                          checked={isParentalConsent}
                          onChange={(e) => { 
                            setIsParentalConsent(e.target.checked); 
                            setValidationError(false); 
                          }} 
                        />
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-300 ${isParentalConsent ? 'bg-[#DA8CA0] border-[#DA8CA0] shadow-[0_0_10px_rgba(218,140,160,0.5)]' : 'border-white/20 bg-[#1C1246] group-hover:border-[#DA8CA0]/50'}`}>
                          {isParentalConsent && (
                            <svg className="w-3.5 h-3.5 text-[#0F0A26]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className="text-xs text-[#CCCCD9] font-medium tracking-wide select-none group-hover:text-white transition-colors">Signing on behalf of a minor</span>
                      </label>

                      {/* Minor Information conditionally rendered */}
                      {isParentalConsent && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }} 
                          animate={{ opacity: 1, height: 'auto' }} 
                          className="space-y-4 pt-4 border-t border-white/5 overflow-hidden"
                        >
                          <div>
                            <input 
                              type="text" 
                              placeholder="Enter Minor's Full Name"
                              value={minorName}
                              onChange={(e) => { setMinorName(e.target.value); setValidationError(false); }}
                              className={`w-full bg-[#1C1246]/50 border ${validationError && isParentalConsent && !minorName ? 'border-rose-500' : 'border-white/10'} rounded-xl px-5 py-3.5 text-sm text-white placeholder:text-[#CCCCD9]/40 focus:outline-none focus:border-[#DA8CA0] transition-all`}
                            />
                          </div>
                          <div>
                            <input 
                              type="number" 
                              min="8"
                              max="17"
                              placeholder="Minor's Age (Minimum 8)"
                              value={minorAge}
                              onChange={(e) => { setMinorAge(e.target.value); setValidationError(false); }}
                              className={`w-full bg-[#1C1246]/50 border ${validationError && isParentalConsent && (!minorAge || parseInt(minorAge) < 8) ? 'border-rose-500' : 'border-white/10'} rounded-xl px-5 py-3.5 text-sm text-white placeholder:text-[#CCCCD9]/40 focus:outline-none focus:border-[#DA8CA0] transition-all`}
                            />
                          </div>
                        </motion.div>
                      )}
                      
                      {/* Action Button */}
                      {onExecuteSignature && (
                         <button 
                            onClick={handleValidationAndSubmit}
                            disabled={isProcessing}
                            className="liquid-glass-btn mt-8 h-14 text-sm w-full flex items-center justify-center gap-2 rounded-xl font-bold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                          >
                            {isProcessing ? (
                              <><Database className="h-4 w-4 animate-pulse text-white" /> Establishing Cipher...</>
                            ) : (
                              <><Lock className="h-4 w-4 text-white group-hover/btn:scale-110 transition-transform" /> Grant Processing Consent</>
                            )}
                          </button>
                      )}

                      <div className="text-[10px] text-[#CCCCD9]/50 font-mono leading-relaxed mt-4 bg-white/[0.02] p-4 rounded-xl border border-white/5">
                        <FileCheck className="h-3.5 w-3.5 inline mr-2 text-[#DA8CA0]" />
                        By entering your credentials, you generate a cryptographically secure PKCS#7 audit trail establishing formal legal consent to process your data under the conditions strictly outlined above.
                      </div>
                    </div>
                  </div>

                  {/* Date Block (Col 3) */}
                  <div className="space-y-5 md:text-right">
                    <p className="text-[10px] text-[#DA8CA0] uppercase tracking-[0.2em] font-bold">Date of Execution:</p>
                    <div className="text-2xl text-white font-mono tracking-tight drop-shadow-md">
                      July 20, 2026
                    </div>
                    <div className="h-px w-full md:w-32 bg-gradient-to-l from-[#DA8CA0]/50 to-transparent md:ml-auto" />
                    <p className="text-sm text-[#CCCCD9] font-mono leading-relaxed">
                      Jos, Plateau State<br /> Republic of Nigeria
                    </p>
                  </div>

                </div>
              </motion.div>

            </motion.div>
          </div>
        </div>
      </div>

      {/* CSS for Premium UI Enhancements */}
      <style jsx global>{`
        /* Minimalist Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(218, 140, 160, 0.3);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(218, 140, 160, 0.6);
        }

        /* Expensive Liquid Glass Button */
        .liquid-glass-btn {
          background: linear-gradient(135deg, rgba(218, 140, 160, 0.25) 0%, rgba(35, 24, 84, 0.6) 100%);
          box-shadow: 
            inset 0px 1px 3px rgba(255, 255, 255, 0.3),  
            inset 0px -2px 6px rgba(0, 0, 0, 0.6),       
            0px 10px 30px -5px rgba(0, 0, 0, 0.8),             
            inset 1px 0px 3px rgba(255, 255, 255, 0.1), 
            inset -1px 0px 3px rgba(0, 0, 0, 0.3);       
          border: 1px solid rgba(218, 140, 160, 0.2);
          color: #FAFAFA;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        
        .liquid-glass-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(218, 140, 160, 0.35) 0%, rgba(35, 24, 84, 0.8) 100%);
          box-shadow: 
            inset 0px 2px 4px rgba(255, 255, 255, 0.4),  
            inset 0px -2px 6px rgba(0, 0, 0, 0.7),       
            0px 15px 40px -5px rgba(218, 140, 160, 0.2),             
            inset 1px 0px 3px rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(218, 140, 160, 0.4);
          transform: translateY(-2px);
        }

        .liquid-glass-btn:active:not(:disabled) {
          box-shadow: 
            inset 0px 4px 8px rgba(0, 0, 0, 0.6),
            0px 2px 5px rgba(0, 0, 0, 0.5);
          transform: translateY(1px);
        }
      `}</style>
    </div>
  )
}