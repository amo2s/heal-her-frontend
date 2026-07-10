"use client"

import React, { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { 
  Scale, 
  History, 
  Gavel, 
  ShieldAlert, 
  Globe, 
  UserCheck,
  Copyright,
  AlertTriangle,
  FileText,
  Loader2,
  Mail,
  Monitor
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

const FounderSignature = () => (
  <div 
    className="relative select-none pointer-events-none" 
    onContextMenu={(e) => e.preventDefault()} 
  >
    <svg
      width="240"
      height="80"
      viewBox="0 0 240 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-[#DA8CA0]"
    >
      <path d="M40 60 C 30 50, 40 20, 50 15 C 60 10, 70 60, 35 55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M65 40 Q 70 30, 75 40 Q 80 30, 85 40 Q 90 30, 95 45" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M100 40 C 95 35, 105 35, 105 40 C 105 45, 95 45, 100 38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M115 40 C 110 40, 110 45, 115 45 C 120 45, 115 50, 110 50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M20 70 C 60 65, 180 65, 220 50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
    </svg>
  </div>
)

// --- FLUID SPRING ANIMATIONS ---
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring" as const, stiffness: 80, damping: 20, mass: 1 }
  }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 }
  }
}

export default function TermsPage() {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  
  // --- SIGNATURE AUDIT STATE ---
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [isParentalConsent, setIsParentalConsent] = useState(false)
  const [minorName, setMinorName] = useState("")
  const [minorAge, setMinorAge] = useState("")
  const [validationError, setValidationError] = useState(false)
  const signatureAnchorRef = useRef<HTMLDivElement>(null)

  // --- PDF GENERATION & VALIDATION LOGIC ---
  const handleGeneratePDF = async () => {
    // 1. Validate Signature Fields
    const isBaseInvalid = !clientName.trim() || !clientEmail.trim()
    const parsedAge = parseInt(minorAge)
    const isMinorInvalid = isParentalConsent && (!minorName.trim() || !minorAge.trim() || isNaN(parsedAge) || parsedAge < 8)

    if (isBaseInvalid || isMinorInvalid) {
      setValidationError(true)
      signatureAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setValidationError(false)
    setIsGeneratingPDF(true)
    
    try {
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation GenerateLegalDocument($input: GeneratePDFInput!) {
              generatePdf(input: $input) {
                success
                downloadUrl
                documentId
                error
              }
            }
          `,
          variables: {
            input: {
              documentType: "TERMS_OF_SERVICE",
              reference: "HH-TOS-2026-V5",
              includeSignature: true,
              clientName: clientName,
              clientEmail: clientEmail,
              isParentalConsent: isParentalConsent,
              minorName: isParentalConsent ? minorName : undefined,
              minorAge: isParentalConsent ? parsedAge : undefined
            }
          }
        })
      })

      const data = await response.json()
      
      if (data?.data?.generatePdf?.success) {
        window.location.href = data.data.generatePdf.downloadUrl
      } else {
        console.error("PDF generation failed at proxy layer.")
      }
    } catch (error) {
      console.error("Network error during PDF generation:", error)
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  // --- SECURE EMAIL TRIGGER ---
  const handleContactLegal = () => {
    const user = "nwakaamos95"
    const domain = "gmail.com"
    window.location.href = `mailto:${user}@${domain}`
  }

  const sections = [
    "1. Legal Status & Entity",
    "2. Definitions & Interpretation",
    "3. Acceptance of Agreement",
    "4. Medical Disclaimer (Critical)",
    "5. License & Access",
    "6. AI & Algorithmic Limitations",
    "7. User Obligations",
    "8. Emergency Protocols",
    "9. Intellectual Property",
    "10. Data Protection (NDPR)",
    "11. Disclaimers of Warranty",
    "12. Limitation of Liability",
    "13. Indemnification",
    "14. Dispute Resolution",
    "15. Termination of Access",
    "16. Right to Modify Terms",
    "17. Data Retention & Deletion",
    "18. Severability & Entire Agreement",
    "19. Consumer Protection",
    "20. General Provisions"
  ]

  return (
    <div className="relative min-h-screen bg-[#1C1246] text-[#FAFAFA] selection:bg-[#DA8CA0]/30 selection:text-[#DA8CA0] overflow-hidden custom-scrollbar">
      <GrainOverlay />
      
      {/* MOBILE-ONLY DESKTOP ADVISORY */}
      <div className="md:hidden sticky top-0 z-[60] w-full bg-[#1C1246]/95 backdrop-blur-md border-b border-[#DA8CA0]/20 py-2.5 px-4 flex items-center justify-center gap-2 shadow-md">
        <Monitor className="h-4 w-4 text-[#DA8CA0]" />
        <p className="text-[11px] font-medium text-[#DA8CA0] tracking-wide text-center">
          For the optimal legal execution experience, please switch to a desktop device.
        </p>
      </div>

      <Navigation />

      {/* --- HEADER --- */}
      <section className="relative pt-24 md:pt-32 pb-12 border-b border-[#DA8CA0]/10 bg-[#231854]/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
           <motion.div 
             initial="hidden"
             animate="visible"
             variants={staggerContainer}
             className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8"
           >
              <motion.div variants={fadeInUp} className="max-w-2xl">
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1C1246] border border-[#DA8CA0]/20 text-[#DA8CA0] text-xs font-mono uppercase mb-4 shadow-[0_0_15px_rgba(218,140,160,0.1)]">
                    <Scale className="h-3 w-3" /> Agreement Reference: HH-TOS-2026-V5
                 </div>
                 <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">Terms of Service</h1>
                 <p className="text-[#CCCCD9] text-base leading-relaxed">
                    This document is a legally binding contract between you and Heal Her. It plainly outlines your rights, your obligations, and the absolute limits of our liability as an independent entity. Please read it carefully.
                 </p>
              </motion.div>
              
              {/* Document Metadata & Download */}
              <motion.div variants={fadeInUp} className="w-full md:w-auto bg-[#1C1246]/80 border border-[#DA8CA0]/20 rounded-xl p-5 flex flex-col gap-3 min-w-[260px] shadow-2xl shadow-[#DA8CA0]/5">
                 <div className="flex justify-between items-center text-xs text-[#CCCCD9] font-mono">
                    <span>Revised Date:</span>
                    <span className="text-white">July 9, 2026</span>
                 </div>
                 <div className="flex justify-between items-center text-xs text-[#CCCCD9] font-mono">
                    <span>Jurisdiction:</span>
                    <span className="text-white">Nigeria (Federal)</span>
                 </div>
                 <div className="flex justify-between items-center text-xs text-[#CCCCD9] font-mono">
                    <span>Status:</span>
                    <span className="text-emerald-400 font-bold">ACTIVE & BINDING</span>
                 </div>
                 
                 <button 
                    onClick={handleGeneratePDF}
                    disabled={isGeneratingPDF}
                    className="liquid-glass-btn mt-3 h-10 text-xs w-full flex items-center justify-center gap-2 rounded-lg font-medium tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                    {isGeneratingPDF ? (
                      <><Loader2 className="h-4 w-4 animate-spin text-white/90" /> Processing Request...</>
                    ) : (
                      <><FileText className="h-4 w-4 text-white/90" /> Sign & Request Official PDF</>
                    )}
                 </button>
              </motion.div>
           </motion.div>
        </div>
      </section>

      {/* --- MAIN CONTENT LAYOUT --- */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
         <div className="grid lg:grid-cols-12 gap-12">
            
            {/* --- SIDEBAR (Sticky) --- */}
            <div className="hidden lg:block lg:col-span-3">
               <motion.div 
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ type: "spring" as const, stiffness: 60, delay: 0.2 }}
                 className="sticky top-24 space-y-8"
               >
                  <div>
                     <h3 className="text-xs font-bold text-[#CCCCD9] uppercase tracking-widest mb-4">Table of Contents</h3>
                     <nav className="space-y-1 border-l border-[#DA8CA0]/10 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                        {sections.map((item, i) => (
                           <a key={i} href={`#section-${i+1}`} className="block pl-4 py-2 text-xs text-[#CCCCD9]/70 hover:text-[#DA8CA0] hover:border-l-[#DA8CA0] border-l border-transparent transition-colors truncate">
                              {item}
                           </a>
                        ))}
                     </nav>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-[#231854] border border-[#DA8CA0]/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                     <h4 className="text-white font-bold text-sm mb-2 flex items-center gap-2">
                        <History className="h-4 w-4 text-[#DA8CA0]" /> Legal Notice
                     </h4>
                     <p className="text-xs text-[#CCCCD9] leading-relaxed">
                        Heal Her operates strictly as an independent entity. All associated legal liabilities and operational protocols reflect this standalone infrastructure.
                     </p>
                  </div>
               </motion.div>
            </div>

            {/* --- LEGAL TEXT --- */}
            <div className="lg:col-span-9">
               <motion.div 
                 initial="hidden"
                 whileInView="visible"
                 viewport={{ once: true, margin: "-100px" }}
                 variants={staggerContainer}
                 className="prose prose-invert prose-slate max-w-none"
               >
                  
                  {/* 1. Legal Status */}
                  <motion.div variants={fadeInUp} id="section-1" className="mb-16 scroll-mt-32">
                     <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 border-b border-[#DA8CA0]/20 pb-3">
                        <span className="text-[#DA8CA0] font-mono text-sm bg-[#DA8CA0]/10 px-2 py-1 rounded">01</span> Legal Status & Entity
                     </h2>
                     <p className="text-[#CCCCD9] text-base leading-7">
                        <strong>1.1. Independence.</strong> "Heal Her" is an independent digital platform and proprietary technology stack. It operates as a standalone entity, wholly detached from any prior parent companies or third-party overarching organizations.
                     </p>
                     <p className="text-[#CCCCD9] text-base leading-7 mt-3">
                        <strong>1.2. Unified Liability.</strong> All legal obligations, warranties, and indemnifications outlined in this agreement apply solely to Heal Her and its direct managing executives.
                     </p>
                  </motion.div>

                  {/* 2. Definitions */}
                  <motion.div variants={fadeInUp} id="section-2" className="mb-16 scroll-mt-32">
                     <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 border-b border-[#DA8CA0]/20 pb-3">
                        <span className="text-[#DA8CA0] font-mono text-sm bg-[#DA8CA0]/10 px-2 py-1 rounded">02</span> Definitions & Interpretation
                     </h2>
                     <ul className="space-y-3">
                        <li className="text-[#CCCCD9] text-base leading-7">
                           <strong>"Service"</strong> refers to the Heal Her website, mobile applications, API interfaces, and related digital infrastructure.
                        </li>
                        <li className="text-[#CCCCD9] text-base leading-7">
                           <strong>"AI Content"</strong> means any data, text, audio, image, or video generated by the artificial intelligence algorithms integrated into our Service.
                        </li>
                     </ul>
                  </motion.div>

                  {/* 3. Acceptance */}
                  <motion.div variants={fadeInUp} id="section-3" className="mb-16 scroll-mt-32">
                     <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 border-b border-[#DA8CA0]/20 pb-3">
                        <span className="text-[#DA8CA0] font-mono text-sm bg-[#DA8CA0]/10 px-2 py-1 rounded">03</span> Acceptance of Agreement
                     </h2>
                     <p className="text-[#CCCCD9] text-base leading-7">
                        By accessing or using the Service, you confirm that you have the legal capacity to enter into a binding contract. You explicitly acknowledge that you have read, understood, and agreed to be bound by these Terms. 
                     </p>
                     <div className="mt-6 bg-[#231854]/80 p-5 rounded-lg border-l-4 border-[#DA8CA0] shadow-md">
                        <p className="text-white text-sm font-semibold tracking-wide">
                           IF YOU DO NOT AGREE TO ALL OF THESE TERMS, INCLUDING THE MANDATORY ARBITRATION PROVISION, YOU ARE EXPRESSLY PROHIBITED FROM USING THE SERVICE AND MUST DISCONTINUE USE IMMEDIATELY.
                        </p>
                     </div>
                  </motion.div>

                  {/* 4. MEDICAL DISCLAIMER */}
                  <motion.div variants={fadeInUp} id="section-4" className="mb-16 scroll-mt-32">
                     <div className="relative overflow-hidden rounded-xl border border-rose-500/40 bg-gradient-to-br from-rose-950/20 to-transparent p-8 shadow-[0_0_30px_rgba(244,63,94,0.08)]">
                        <div className="flex items-center gap-3 mb-6 text-rose-400">
                           <ShieldAlert className="h-7 w-7" />
                           <h2 className="text-2xl font-bold m-0 tracking-tight">04. CRITICAL MEDICAL DISCLAIMER</h2>
                        </div>
                        <div className="space-y-5 text-[#CCCCD9] text-base leading-relaxed">
                           <p><strong>4.1. Not a Healthcare Provider.</strong> Heal Her is an educational and informational tool. It is not a doctor, nurse, or hospital. The Service does not provide medical diagnoses, professional treatments, or prescriptions.</p>
                           <p><strong>4.2. Informational Use Only.</strong> The content provided is derived from statistical patterns in data. It does not constitute a professional medical opinion and should never replace consultation with a qualified healthcare professional.</p>
                           <p><strong>4.3. No Doctor-Patient Relationship.</strong> Using this Service does not create a physician-patient relationship. Communications are not classified as confidential medical records under standard healthcare laws, though they are protected by our strict Privacy Policy.</p>
                           <p className="text-rose-200/90 font-medium"><strong>4.4. Assumption of Risk.</strong> Relying on any information provided by the Service is solely at your own risk. Heal Her and its operators shall not be liable for any injury, health deterioration, or death resulting from your use of the platform.</p>
                        </div>
                     </div>
                  </motion.div>

                  {/* 5. License & Access */}
                  <motion.div variants={fadeInUp} id="section-5" className="mb-16 scroll-mt-32">
                     <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 border-b border-[#DA8CA0]/20 pb-3">
                        <span className="text-[#DA8CA0] font-mono text-sm bg-[#DA8CA0]/10 px-2 py-1 rounded">05</span> License & Access
                     </h2>
                     <p className="text-[#CCCCD9] text-base leading-7">
                        <strong>5.1. Limited License.</strong> We grant you a limited, non-exclusive, non-transferable license to access the Service for personal, non-commercial use.
                     </p>
                     <p className="text-[#CCCCD9] text-base leading-7 mt-4 font-semibold">5.2. Prohibited Conduct. You explicitly agree not to:</p>
                     <ul className="list-disc pl-5 text-[#CCCCD9] text-base space-y-2 mt-2">
                        <li>Use the Service for any illegal or unauthorized purpose.</li>
                        <li>Attempt to "jailbreak," manipulate, or bypass the AI's safety protocols.</li>
                        <li>Reverse engineer, decompile, or steal the source code of the Service.</li>
                     </ul>
                  </motion.div>

                  {/* 6. AI Limitations */}
                  <motion.div variants={fadeInUp} id="section-6" className="mb-16 scroll-mt-32">
                     <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 border-b border-[#DA8CA0]/20 pb-3">
                        <span className="text-[#DA8CA0] font-mono text-sm bg-[#DA8CA0]/10 px-2 py-1 rounded">06</span> AI & Algorithmic Limitations
                     </h2>
                     <div className="mt-6 grid gap-6 md:grid-cols-2">
                        <div className="bg-[#1C1246] p-6 rounded-xl border border-[#DA8CA0]/15 shadow-lg relative overflow-hidden group">
                           <div className="absolute inset-0 bg-gradient-to-br from-[#DA8CA0]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                           <h4 className="text-white font-bold text-base mb-3 relative z-10">AI Hallucinations</h4>
                           <p className="text-[#CCCCD9] text-sm leading-relaxed relative z-10">
                              The AI may confidently generate incorrect or fabricated information. It may cite non-existent medical protocols or misunderstand symptoms. You must verify critical information.
                           </p>
                        </div>
                        <div className="bg-[#1C1246] p-6 rounded-xl border border-[#DA8CA0]/15 shadow-lg relative overflow-hidden group">
                           <div className="absolute inset-0 bg-gradient-to-br from-[#DA8CA0]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                           <h4 className="text-white font-bold text-base mb-3 relative z-10">Context Blindness</h4>
                           <p className="text-[#CCCCD9] text-sm leading-relaxed relative z-10">
                              The AI cannot visually inspect the patient and relies entirely on user input. If your input is incomplete or inaccurate, the AI's response will inherently be flawed.
                           </p>
                        </div>
                     </div>
                  </motion.div>

                  {/* 7. User Obligations */}
                  <motion.div variants={fadeInUp} id="section-7" className="mb-16 scroll-mt-32">
                     <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 border-b border-[#DA8CA0]/20 pb-3">
                        <span className="text-[#DA8CA0] font-mono text-sm bg-[#DA8CA0]/10 px-2 py-1 rounded">07</span> User Obligations
                     </h2>
                     <div className="flex items-start gap-5 p-6 bg-[#231854]/40 border border-[#DA8CA0]/10 rounded-xl">
                        <UserCheck className="h-6 w-6 text-[#DA8CA0] shrink-0 mt-1" />
                        <div className="text-base text-[#CCCCD9] leading-7">
                           <p className="mb-3"><strong>7.1. Honest Representation.</strong> You agree to provide truthful information. Providing misleading inputs to the AI can result in dangerous outputs.</p>
                           <p><strong>7.2. Age Requirement.</strong> You must be at least 8 years of age. Users under 18 require active parental supervision to use the Service.</p>
                        </div>
                     </div>
                  </motion.div>

                  {/* 8. Emergency Protocols */}
                  <motion.div variants={fadeInUp} id="section-8" className="mb-16 scroll-mt-32">
                     <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 border-b border-[#DA8CA0]/20 pb-3">
                        <span className="text-[#DA8CA0] font-mono text-sm bg-[#DA8CA0]/10 px-2 py-1 rounded">08</span> Emergency Protocol
                     </h2>
                     <p className="text-[#CCCCD9] text-base leading-7">
                        This Service is not a replacement for emergency dispatch systems. In a life-threatening situation (e.g., heavy bleeding, severe pain, loss of consciousness), you must bypass the Service immediately and contact local emergency services:
                     </p>
                     <ul className="mt-6 space-y-3 text-base text-[#CCCCD9] bg-[#1C1246] p-6 rounded-xl border border-[#DA8CA0]/20 shadow-lg">
                        <li className="flex items-center gap-3"><Globe className="h-5 w-5 text-emerald-400"/> <strong>Nigeria:</strong> Dial 112 or 122</li>
                        <li className="flex items-center gap-3"><Globe className="h-5 w-5 text-blue-400"/> <strong>USA:</strong> Dial 911</li>
                        <li className="flex items-center gap-3"><Globe className="h-5 w-5 text-purple-400"/> <strong>UK/EU:</strong> Dial 999 or 112</li>
                     </ul>
                  </motion.div>

                  {/* 9. Intellectual Property */}
                  <motion.div variants={fadeInUp} id="section-9" className="mb-16 scroll-mt-32">
                     <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 border-b border-[#DA8CA0]/20 pb-3">
                        <span className="text-[#DA8CA0] font-mono text-sm bg-[#DA8CA0]/10 px-2 py-1 rounded">09</span> Intellectual Property
                     </h2>
                     <div className="flex items-start gap-5 p-6 bg-[#231854]/40 border border-[#DA8CA0]/10 rounded-xl">
                        <Copyright className="h-6 w-6 text-[#DA8CA0] shrink-0 mt-1" />
                        <div className="text-base text-[#CCCCD9] leading-7">
                           <p className="mb-3"><strong>9.1. Ownership.</strong> Heal Her retains complete ownership of the Service, including all source code, databases, AI models, and branding.</p>
                           <p><strong>9.2. Trademarks.</strong> The name "Heal Her" and our associated logos are strictly proprietary. Unauthorized commercial use is a violation of law.</p>
                        </div>
                     </div>
                  </motion.div>

                  {/* 10. Data Protection */}
                  <motion.div variants={fadeInUp} id="section-10" className="mb-16 scroll-mt-32">
                     <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 border-b border-[#DA8CA0]/20 pb-3">
                        <span className="text-[#DA8CA0] font-mono text-sm bg-[#DA8CA0]/10 px-2 py-1 rounded">10</span> Data Protection (NDPR)
                     </h2>
                     <p className="text-[#CCCCD9] text-base leading-7">
                        We collect and process your data in strict compliance with the <strong>Nigeria Data Protection Regulation (NDPR)</strong> and globally recognized privacy frameworks. We utilize AES-256 encryption to secure your data; however, no internet transmission is entirely secure.
                     </p>
                  </motion.div>

                  {/* 11. Disclaimers of Warranty */}
                  <motion.div variants={fadeInUp} id="section-11" className="mb-16 scroll-mt-32">
                     <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 border-b border-[#DA8CA0]/20 pb-3">
                        <span className="text-[#DA8CA0] font-mono text-sm bg-[#DA8CA0]/10 px-2 py-1 rounded">11</span> Disclaimers of Warranty
                     </h2>
                     <div className="p-6 border border-slate-600 bg-[#0F0A26] rounded-xl shadow-inner">
                        <p className="text-[#CCCCD9] text-sm leading-7 uppercase font-bold tracking-widest">
                           THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE". HEAL HER EXPLICITLY DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. WE DO NOT GUARANTEE THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ENTIRELY ERROR-FREE.
                        </p>
                     </div>
                  </motion.div>

                  {/* 12. Limitation of Liability */}
                  <motion.div variants={fadeInUp} id="section-12" className="mb-16 scroll-mt-32">
                     <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 border-b border-[#DA8CA0]/20 pb-3">
                        <span className="text-[#DA8CA0] font-mono text-sm bg-[#DA8CA0]/10 px-2 py-1 rounded">12</span> Limitation of Liability
                     </h2>
                     <p className="text-[#CCCCD9] text-base leading-7">
                        To the maximum extent permitted by law, Heal Her shall not be liable for any indirect, incidental, special, or consequential damages resulting from your use of the platform.
                     </p>
                     <p className="text-[#DA8CA0] text-base leading-7 mt-4 border-l-2 border-[#DA8CA0] pl-5 bg-[#DA8CA0]/5 py-3 rounded-r-lg">
                        <strong>Financial Cap on Liability:</strong> Our total liability to you shall not exceed the amount you have paid Heal Her in the past six (6) months, or Ten Thousand Nigerian Naira (₦10,000), whichever is greater.
                     </p>
                  </motion.div>

                  {/* 13. Indemnification */}
                  <motion.div variants={fadeInUp} id="section-13" className="mb-16 scroll-mt-32">
                     <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 border-b border-[#DA8CA0]/20 pb-3">
                        <span className="text-[#DA8CA0] font-mono text-sm bg-[#DA8CA0]/10 px-2 py-1 rounded">13</span> Indemnification
                     </h2>
                     <div className="flex items-start gap-5 p-6 bg-[#231854]/40 border border-[#DA8CA0]/10 rounded-xl">
                        <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0 mt-1" />
                        <p className="text-base text-[#CCCCD9] leading-7">
                           You agree to defend, indemnify, and hold harmless Heal Her and its executives from any legal claims, damages, obligations, or expenses (including attorney's fees) arising from your misuse of the Service or a breach of these Terms.
                        </p>
                     </div>
                  </motion.div>

                  {/* 14. Dispute Resolution */}
                  <motion.div variants={fadeInUp} id="section-14" className="mb-16 scroll-mt-32">
                     <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 border-b border-[#DA8CA0]/20 pb-3">
                        <span className="text-[#DA8CA0] font-mono text-sm bg-[#DA8CA0]/10 px-2 py-1 rounded">14</span> Dispute Resolution
                     </h2>
                     <div className="bg-[#1C1246] p-8 rounded-xl border border-[#DA8CA0]/20 shadow-xl relative overflow-hidden">
                        <div className="absolute right-0 top-0 opacity-5 pointer-events-none">
                           <Gavel className="h-48 w-48 -mt-8 -mr-8" />
                        </div>
                        <div className="relative z-10">
                           <h3 className="text-xl font-bold text-white mb-4">Governing Jurisdiction: Nigeria</h3>
                           <p className="text-[#CCCCD9] text-base leading-relaxed mb-4">
                              <strong>14.1. Law.</strong> These Terms are governed strictly by the laws of the Federal Republic of Nigeria.
                           </p>
                           <p className="text-[#CCCCD9] text-base leading-relaxed mb-4">
                              <strong>14.2. Binding Arbitration.</strong> Any disputes shall be resolved by binding arbitration under the Arbitration and Conciliation Act (Cap A18 LFN 2004).
                           </p>
                           <ul className="text-[#CCCCD9] text-base list-disc pl-5 space-y-2">
                              <li><strong>Arbitration Seat:</strong> Jos, Plateau State, Nigeria.</li>
                              <li><strong>Language:</strong> Proceedings shall be conducted in English.</li>
                           </ul>
                        </div>
                     </div>
                  </motion.div>

                  {/* 15. Termination of Access */}
                  <motion.div variants={fadeInUp} id="section-15" className="mb-16 scroll-mt-32">
                     <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 border-b border-[#DA8CA0]/20 pb-3">
                        <span className="text-[#DA8CA0] font-mono text-sm bg-[#DA8CA0]/10 px-2 py-1 rounded">15</span> Termination of Access
                     </h2>
                     <p className="text-[#CCCCD9] text-base leading-7">
                        We reserve the right to immediately suspend or terminate your access to the Service, without prior notice or liability, for any reason, particularly if you breach these Terms of Service or engage in malicious activity.
                     </p>
                  </motion.div>

                  {/* 16. Right to Modify */}
                  <motion.div variants={fadeInUp} id="section-16" className="mb-16 scroll-mt-32">
                     <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 border-b border-[#DA8CA0]/20 pb-3">
                        <span className="text-[#DA8CA0] font-mono text-sm bg-[#DA8CA0]/10 px-2 py-1 rounded">16</span> Right to Modify Terms
                     </h2>
                     <p className="text-[#CCCCD9] text-base leading-7">
                        Heal Her reserves the right to modify these Terms at any time. Significant changes will be indicated by an updated "Revised Date" at the top of this document. Your continued use of the platform after updates are posted constitutes your acceptance of the changes.
                     </p>
                  </motion.div>

                  {/* 17. Data Retention */}
                  <motion.div variants={fadeInUp} id="section-17" className="mb-16 scroll-mt-32">
                     <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 border-b border-[#DA8CA0]/20 pb-3">
                        <span className="text-[#DA8CA0] font-mono text-sm bg-[#DA8CA0]/10 px-2 py-1 rounded">17</span> Data Retention & Deletion
                     </h2>
                     <p className="text-[#CCCCD9] text-base leading-7">
                        <strong>17.1. Query Logs.</strong> Automated AI query logs may be retained temporarily to improve the system, but they are fully stripped of personally identifiable information (PII).
                     </p>
                     <p className="text-[#CCCCD9] text-base leading-7 mt-3">
                        <strong>17.2. Right to Erasure.</strong> You have the absolute right to request the complete deletion of your account and associated records by contacting our legal department.
                     </p>
                  </motion.div>

                  {/* 18. Severability & Entire Agreement */}
                  <motion.div variants={fadeInUp} id="section-18" className="mb-16 scroll-mt-32">
                     <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 border-b border-[#DA8CA0]/20 pb-3">
                        <span className="text-[#DA8CA0] font-mono text-sm bg-[#DA8CA0]/10 px-2 py-1 rounded">18</span> Severability & Entire Agreement
                     </h2>
                     <p className="text-[#CCCCD9] text-base leading-7">
                        <strong>18.1. Severability.</strong> If any part of these Terms is deemed unenforceable by a court of law, that specific provision will be modified to reflect the original intent as closely as possible, and all remaining provisions will remain in full effect.
                     </p>
                     <p className="text-[#CCCCD9] text-base leading-7 mt-3">
                        <strong>18.2. Entire Agreement.</strong> This document constitutes the entire legal agreement between you and Heal Her, superseding any prior verbal or written understandings.
                     </p>
                  </motion.div>

                  {/* 19. Consumer Protection */}
                  <motion.div variants={fadeInUp} id="section-19" className="mb-16 scroll-mt-32">
                     <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 border-b border-[#DA8CA0]/20 pb-3">
                        <span className="text-[#DA8CA0] font-mono text-sm bg-[#DA8CA0]/10 px-2 py-1 rounded">19</span> Consumer Protection (FCCPC)
                     </h2>
                     <p className="text-[#CCCCD9] text-base leading-7">
                        Nothing in this agreement is intended to limit or completely exclude non-waivable statutory consumer rights you possess under the Federal Competition and Consumer Protection Act (FCCPA) of Nigeria.
                     </p>
                  </motion.div>

                  {/* 20. Contact */}
                  <motion.div variants={fadeInUp} id="section-20" className="mb-16 scroll-mt-32 border-t border-[#DA8CA0]/30 pt-10">
                     <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                        <span className="text-[#DA8CA0] font-mono text-sm bg-[#DA8CA0]/10 px-2 py-1 rounded">20</span> General Provisions & Contact
                     </h2>
                     
                     <div className="p-8 bg-gradient-to-br from-[#231854] to-[#1C1246] rounded-2xl border border-[#DA8CA0]/20 flex flex-col md:flex-row gap-10 shadow-2xl">
                        <div className="flex-1">
                           <h4 className="text-white text-lg font-bold mb-3">Legal Notices & Subpoenas</h4>
                           <p className="text-[#CCCCD9] text-sm leading-relaxed mb-6">
                              Please direct all formal legal notices, data erasure requests, or inquiries regarding these terms to our official legal communication channel.
                           </p>
                           
                           {/* Secure Email Button - LIQUID GLASS STYLED */}
                           <button 
                             onClick={handleContactLegal}
                             className="liquid-glass-btn h-10 px-6 flex items-center justify-center gap-2 rounded-lg font-medium tracking-wide text-xs w-full md:w-auto"
                           >
                              <Mail className="h-4 w-4" /> Contact Legal Department
                           </button>
                        </div>
                        <div className="flex-1 md:border-l md:border-[#DA8CA0]/20 md:pl-10 flex flex-col justify-center">
                           <div className="space-y-4 font-mono text-sm">
                              <div>
                                 <span className="text-[#CCCCD9]/60 block text-xs uppercase tracking-widest mb-1">Operating Base</span>
                                 <span className="text-[#FAFAFA] text-base">Jos, Plateau State<br/>Federal Republic of Nigeria</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </motion.div>

                  {/* --- DIGITAL SIGNATURE BLOCK & AUDIT FORM --- */}
                  <motion.div variants={fadeInUp} className="mt-24 pt-16 border-t border-[#DA8CA0]/20 break-inside-avoid pb-12">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 items-start">
                        
                        {/* Executive Signature (Col 1) */}
                        <div className="space-y-5">
                           <p className="text-xs text-[#CCCCD9]/80 uppercase tracking-widest font-semibold">Executed & Authorized By:</p>
                           <div className="relative">
                              <FounderSignature />
                              
                              {/* Authority Seal */}
                              <div className="absolute -top-6 -right-4 opacity-40 pointer-events-none rotate-[-15deg] border-[3px] border-[#DA8CA0] rounded-full w-32 h-32 flex items-center justify-center shadow-[0_0_20px_rgba(218,140,160,0.15)]">
                                 <div className="text-[10px] font-mono text-[#DA8CA0] text-center leading-tight font-bold tracking-widest">
                                    OFFICIAL<br/>AUTHORITY<br/>SEAL<br/>2026
                                 </div>
                              </div>
                           </div>
                           <div className="h-px w-full bg-gradient-to-r from-[#DA8CA0]/60 to-transparent" />
                           <div className="text-sm text-[#CCCCD9] font-mono leading-relaxed">
                              <span className="text-white font-bold text-lg block mb-1">Nwaka Amos Chika</span>
                              Founder & Executive Director<br/>
                              Heal Her
                           </div>
                        </div>

                        {/* Client Signature & Email Form (Col 2) */}
                        <div className="space-y-5 relative" ref={signatureAnchorRef}>
                           <p className="text-xs text-[#CCCCD9]/80 uppercase tracking-widest font-semibold">
                             {isParentalConsent ? "Executed By Parent/Guardian:" : "Executed By User:"}
                           </p>
                           <div className="space-y-4 pt-2">
                             <div>
                               <input 
                                 type="text" 
                                 placeholder={isParentalConsent ? "Enter Parent's Full Legal Name" : "Enter Full Legal Name"}
                                 value={clientName}
                                 onChange={(e) => { setClientName(e.target.value); setValidationError(false); }}
                                 className={`w-full bg-[#1C1246] border ${validationError && !clientName ? 'border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]' : 'border-[#DA8CA0]/30'} rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-[#CCCCD9]/40 focus:outline-none focus:border-[#DA8CA0] transition-all`}
                               />
                             </div>
                             <div>
                               <input 
                                 type="email" 
                                 placeholder="Email for PDF Delivery"
                                 value={clientEmail}
                                 onChange={(e) => { setClientEmail(e.target.value); setValidationError(false); }}
                                 className={`w-full bg-[#1C1246] border ${validationError && !clientEmail ? 'border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]' : 'border-[#DA8CA0]/30'} rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-[#CCCCD9]/40 focus:outline-none focus:border-[#DA8CA0] transition-all`}
                               />
                             </div>

                             {/* Parental Consent Toggle with Hidden Input for Accessibility/Interactivity */}
                             <label className="flex items-center gap-3 cursor-pointer group mt-2 w-max">
                               <input 
                                 type="checkbox" 
                                 className="hidden" 
                                 checked={isParentalConsent}
                                 onChange={(e) => { 
                                   setIsParentalConsent(e.target.checked); 
                                   setValidationError(false); 
                                 }} 
                               />
                               <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isParentalConsent ? 'bg-[#DA8CA0] border-[#DA8CA0]' : 'border-[#DA8CA0]/50 bg-transparent group-hover:border-[#DA8CA0]'}`}>
                                 {isParentalConsent && (
                                   <svg className="w-3 h-3 text-[#1C1246]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                     <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                   </svg>
                                 )}
                               </div>
                               <span className="text-xs text-[#CCCCD9] font-medium tracking-wide select-none">Signing on behalf of a minor</span>
                             </label>

                             {/* Minor Information conditionally rendered */}
                             {isParentalConsent && (
                               <motion.div 
                                 initial={{ opacity: 0, height: 0 }} 
                                 animate={{ opacity: 1, height: 'auto' }} 
                                 className="space-y-4 pt-2 border-t border-[#DA8CA0]/20 overflow-hidden"
                               >
                                 <div>
                                   <input 
                                     type="text" 
                                     placeholder="Enter Minor's Full Name"
                                     value={minorName}
                                     onChange={(e) => { setMinorName(e.target.value); setValidationError(false); }}
                                     className={`w-full bg-[#1C1246] border ${validationError && isParentalConsent && !minorName ? 'border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]' : 'border-[#DA8CA0]/30'} rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-[#CCCCD9]/40 focus:outline-none focus:border-[#DA8CA0] transition-all`}
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
                                     className={`w-full bg-[#1C1246] border ${validationError && isParentalConsent && (!minorAge || parseInt(minorAge) < 8) ? 'border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]' : 'border-[#DA8CA0]/30'} rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-[#CCCCD9]/40 focus:outline-none focus:border-[#DA8CA0] transition-all`}
                                   />
                                 </div>
                               </motion.div>
                             )}
                             
                             <div className="text-[10px] text-[#CCCCD9]/60 font-mono leading-relaxed mt-2 bg-[#DA8CA0]/5 p-3 rounded-lg border border-[#DA8CA0]/10">
                               <ShieldAlert className="h-3 w-3 inline mr-1 text-[#DA8CA0]" />
                               By entering your name and email, you generate a cryptographically secure audit trail establishing formal legal consent.
                             </div>
                           </div>
                        </div>

                        {/* Date Block (Col 3) */}
                        <div className="space-y-4 md:text-right">
                           <p className="text-xs text-[#CCCCD9]/80 uppercase tracking-widest font-semibold">Date of Effect:</p>
                           <div className="text-2xl text-white font-mono tracking-tight">
                              July 9, 2026
                           </div>
                           <div className="h-px w-full md:w-48 bg-gradient-to-l from-[#DA8CA0]/60 to-transparent md:ml-auto" />
                           <p className="text-sm text-[#CCCCD9] font-mono">
                              Jos, Plateau State<br /> Nigeria
                           </p>
                        </div>

                     </div>
                  </motion.div>

               </motion.div>
            </div>
         </div>
      </div>

      <Footer />
      
      {/* CSS for Liquid Glass & Custom Scrollbar */}
      <style jsx global>{`
        /* Custom Minimalist Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(28, 18, 70, 0.2);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(218, 140, 160, 0.4);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(218, 140, 160, 0.6);
        }

        /* True Liquid Glass Button - NO HOVER STATES */
        .liquid-glass-btn {
          background: linear-gradient(135deg, rgba(218, 140, 160, 0.35) 0%, rgba(35, 24, 84, 0.7) 100%);
          box-shadow: 
            inset 0px 2px 5px rgba(255, 255, 255, 0.4),  /* Top inner highlight */
            inset 0px -3px 8px rgba(0, 0, 0, 0.7),       /* Bottom inner shadow */
            0px 8px 20px rgba(0, 0, 0, 0.5),             /* Outer drop shadow */
            inset 2px 0px 5px rgba(255, 255, 255, 0.15), /* Left inner reflection */
            inset -2px 0px 5px rgba(0, 0, 0, 0.4);       /* Right inner shadow */
          border: 1px solid rgba(218, 140, 160, 0.2);
          color: #FAFAFA;
          backdrop-filter: none; /* No standard blur to maintain fluid look */
          transition: none !important; /* Forces removal of hover states */
        }
        
        .liquid-glass-btn:active {
          box-shadow: 
            inset 0px 4px 8px rgba(0, 0, 0, 0.8),
            0px 2px 5px rgba(0, 0, 0, 0.5);
          transform: translateY(1px);
        }
      `}</style>
    </div>
  )
}