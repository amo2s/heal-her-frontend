"use client"

import React, { useRef } from "react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { cn } from "@/lib/utils"
import { 
  Scale, 
  History, 
  Gavel, 
  ShieldAlert, 
  Globe, 
  Printer,
  ChevronRight,
  Heart,
  Baby,
  UserCheck,
  Copyright,
  AlertTriangle
} from "lucide-react"
import { Button } from "@/components/ui/button"

// --- PRO COMPONENTS ---

const GrainOverlay = () => (
  <div 
    className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
    }}
  />
)

// --- SECURE HANDWRITTEN SIGNATURE (SVG PATHS) ---
// This is not a font. It is a drawing, making it impossible to "copy/paste" as text.
const FounderSignature = () => {
  return (
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
        {/* 'A' for Amos */}
        <path
          d="M40 60 C 30 50, 40 20, 50 15 C 60 10, 70 60, 35 55"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        {/* 'm' */}
        <path
          d="M65 40 Q 70 30, 75 40 Q 80 30, 85 40 Q 90 30, 95 45"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        {/* 'o' */}
        <path
          d="M100 40 C 95 35, 105 35, 105 40 C 105 45, 95 45, 100 38"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        {/* 's' */}
        <path
          d="M115 40 C 110 40, 110 45, 115 45 C 120 45, 115 50, 110 50"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Underline / Flourish */}
        <path
          d="M20 70 C 60 65, 180 65, 220 50"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
        />
      </svg>
    </div>
  )
}

export default function TermsPage() {
  const contentRef = useRef<HTMLDivElement>(null)

  // --- PDF GENERATION LOGIC ---
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="relative min-h-screen bg-[#1C1246] text-[#FAFAFA] selection:bg-[#DA8CA0]/30 selection:text-[#DA8CA0]">
      <GrainOverlay />
      
      {/* Hide Navigation on Print */}
      <div className="print:hidden">
        <Navigation />
      </div>

      {/* --- HEADER (Screen Only) --- */}
      <section className="relative pt-32 pb-12 border-b border-[#DA8CA0]/10 bg-[#231854]/50 print:hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1C1246] border border-[#DA8CA0]/20 text-[#DA8CA0] text-xs font-mono uppercase mb-4">
                    <Scale className="h-3 w-3" /> Agreement Reference: HH-TOS-2026-V4
                 </div>
                 <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-2">Terms of Service</h1>
                 <p className="text-[#CCCCD9] max-w-xl text-sm leading-relaxed">
                    This document constitutes a legally binding agreement between you and Heal Her (a product of MedGuard AI). It outlines your rights, obligations, and the limitations of our liability.
                 </p>
              </div>
              
              {/* Document Metadata & Download */}
              <div className="bg-[#1C1246] border border-[#DA8CA0]/20 rounded-xl p-4 flex flex-col gap-2 min-w-[240px]">
                 <div className="flex justify-between items-center text-xs text-[#CCCCD9] font-mono">
                    <span>Effective Date:</span>
                    <span className="text-white">January 16, 2026</span>
                 </div>
                 <div className="flex justify-between items-center text-xs text-[#CCCCD9] font-mono">
                    <span>Jurisdiction:</span>
                    <span className="text-white">Nigeria (Federal)</span>
                 </div>
                 <div className="flex justify-between items-center text-xs text-[#CCCCD9] font-mono">
                    <span>Status:</span>
                    <span className="text-emerald-400 font-bold">ACTIVE</span>
                 </div>
                 
                 <Button 
                    onClick={handlePrint} 
                    className="mt-2 h-9 text-xs w-full flex items-center justify-center gap-2 bg-transparent border border-[#DA8CA0]/30 text-[#DA8CA0] hover:bg-[#DA8CA0] hover:text-[#1C1246] hover:border-[#DA8CA0] transition-all duration-300"
                 >
                    <Printer className="h-3 w-3" /> Save as PDF
                 </Button>
              </div>
           </div>
        </div>
      </section>

      {/* --- MAIN CONTENT LAYOUT --- */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
         <div className="grid lg:grid-cols-12 gap-12">
            
            {/* --- SIDEBAR (Sticky) --- */}
            <div className="hidden lg:block lg:col-span-3 print:hidden">
               <div className="sticky top-24 space-y-8">
                  <div>
                     <h3 className="text-xs font-bold text-[#CCCCD9] uppercase tracking-widest mb-4">Agreement Sections</h3>
                     <nav className="space-y-1 border-l border-[#DA8CA0]/10">
                        {[
                           "1. Relationship with MedGuard AI",
                           "2. Definitions & Interpretation",
                           "3. Acceptance of Agreement",
                           "4. Medical Disclaimer (Critical)",
                           "5. License & Access",
                           "6. AI & Algorithmic Limitations",
                           "7. User Obligations & Conduct",
                           "8. Emergency Protocols",
                           "9. Intellectual Property Rights",
                           "10. Data Privacy (NDPR)",
                           "11. Disclaimers of Warranty",
                           "12. Limitation of Liability",
                           "13. Indemnification",
                           "14. Dispute Resolution",
                           "15. General Provisions"
                        ].map((item, i) => (
                           <a key={i} href={`#section-${i+1}`} className="block pl-4 py-2 text-xs text-[#CCCCD9]/70 hover:text-[#DA8CA0] hover:border-l-[#DA8CA0] border-l border-transparent transition-all truncate">
                              {item}
                           </a>
                        ))}
                     </nav>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-[#231854] border border-[#DA8CA0]/10">
                     <h4 className="text-white font-bold text-sm mb-2 flex items-center gap-2">
                        <History className="h-4 w-4 text-[#DA8CA0]" /> Recent Updates
                     </h4>
                     <p className="text-[10px] text-[#CCCCD9] leading-relaxed">
                        Added <strong>Section 9 (IP Rights)</strong> and <strong>Section 13 (Indemnification)</strong> to protect community-generated content.
                     </p>
                  </div>
               </div>
            </div>

            {/* --- LEGAL TEXT --- */}
            <div className="lg:col-span-9 print:col-span-12" ref={contentRef}>
               
               {/* Print-Only Header */}
               <div className="hidden print:block mb-8 border-b border-black pb-4">
                  <h1 className="text-2xl font-bold text-black">Master Service Agreement - Heal Her</h1>
                  <p className="text-xs text-gray-600">Parent Company: MedGuard AI Solutions | Generated: {new Date().toLocaleDateString()} | Reference: HH-TOS-2026</p>
               </div>

               <div className="prose prose-invert prose-slate max-w-none print:prose-black print:text-sm">
                  
                  {/* 1. Relationship with MedGuard AI */}
                  <div id="section-1" className="mb-16 scroll-mt-32">
                     <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 border-b border-[#DA8CA0]/20 pb-2">
                        <span className="text-[#DA8CA0] font-mono text-sm">01.</span> Relationship with MedGuard AI
                     </h2>
                     <p className="text-[#CCCCD9] text-sm leading-7">
                        <strong>1.1. Legal Structure.</strong> "Heal Her" is a product and registered trademark owned and operated by 
                        <span className="print:hidden">
                           {/* UPDATED LINK */}
                           <Link href="https://medguard-ai-eight.vercel.app/" className="text-[#DA8CA0] hover:underline mx-1 font-bold">
                              MedGuard AI Solutions
                           </Link>
                        </span>
                        <span className="hidden print:inline font-bold mx-1"> MedGuard AI Solutions </span>
                        (hereinafter referred to as the "Parent Company").
                     </p>
                     <p className="text-[#CCCCD9] text-sm leading-7">
                        <strong>1.2. Unified Liability.</strong> All legal liabilities, warranties, and indemnifications outlined in this agreement apply to the Parent Company. Any claim arising from the use of Heal Her is a claim against MedGuard AI Solutions.
                     </p>
                  </div>

                  {/* 2. Definitions */}
                  <div id="section-2" className="mb-16 scroll-mt-32">
                     <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 border-b border-[#DA8CA0]/20 pb-2">
                        <span className="text-[#DA8CA0] font-mono text-sm">02.</span> Definitions & Interpretation
                     </h2>
                     <p className="text-[#CCCCD9] text-sm leading-7">
                        <strong>2.1. "Service"</strong> includes the Heal Her website, mobile applications (iOS/Android), API interfaces, and any related digital infrastructure provided by MedGuard AI.
                     </p>
                     <p className="text-[#CCCCD9] text-sm leading-7">
                        <strong>2.2. "AI Content"</strong> means any data, text, audio, image, or video generated by the artificial intelligence algorithms integrated into the Service.
                     </p>
                     <p className="text-[#CCCCD9] text-sm leading-7">
                        <strong>2.3. "User"</strong> refers to any individual or entity accessing or using the Service.
                     </p>
                  </div>

                  {/* 3. Acceptance */}
                  <div id="section-3" className="mb-16 scroll-mt-32">
                     <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 border-b border-[#DA8CA0]/20 pb-2">
                        <span className="text-[#DA8CA0] font-mono text-sm">03.</span> Acceptance of Agreement
                     </h2>
                     <p className="text-[#CCCCD9] text-sm leading-7">
                        By accessing, downloading, installing, or using the Service, you represent and warrant that you have the legal capacity to enter into a binding contract. You explicitly acknowledge that you have read, understood, and agreed to be bound by these Terms. 
                     </p>
                     <p className="text-[#CCCCD9] text-sm leading-7 mt-4 bg-[#231854] p-4 rounded border-l-2 border-[#DA8CA0]">
                        IF YOU DO NOT AGREE TO ALL OF THESE TERMS, INCLUDING THE MANDATORY ARBITRATION PROVISION AND CLASS ACTION WAIVER, YOU ARE EXPRESSLY PROHIBITED FROM USING THE SERVICE AND MUST DISCONTINUE USE IMMEDIATELY.
                     </p>
                  </div>

                  {/* 4. MEDICAL DISCLAIMER (CRITICAL) */}
                  <div id="section-4" className="mb-16 scroll-mt-32">
                     <div className="relative overflow-hidden rounded-xl border border-rose-500/30 bg-rose-950/10 p-8">
                        <div className="flex items-center gap-3 mb-6 text-rose-500">
                           <ShieldAlert className="h-6 w-6" />
                           <h2 className="text-xl font-bold m-0">04. NO MEDICAL ADVICE / DISCLAIMER</h2>
                        </div>
                        <div className="space-y-4 text-[#CCCCD9] text-sm leading-7">
                           <p><strong>4.1. NOT A HEALTHCARE PROVIDER.</strong> HEAL HER IS AN EDUCATIONAL TOOL, NOT A DOCTOR, NURSE, OR HOSPITAL. THE SERVICE DOES NOT PROVIDE MEDICAL DIAGNOSIS, TREATMENT, OR PRESCRIPTIONS.</p>
                           
                           <p><strong>4.2. INFORMATIONAL USE ONLY.</strong> The content provided by the Service is for informational and educational guidance purposes only. It is derived from statistical patterns in medical data and does not constitute a professional medical opinion.</p>
                           
                           <p><strong>4.3. NO DOCTOR-PATIENT RELATIONSHIP.</strong> Use of the Service does not create a physician-patient relationship between you and MedGuard AI. Communications with the AI are not confidential medical records under HIPAA, though we protect them via our Privacy Policy.</p>
                           
                           <p><strong>4.4. ASSUMPTION OF RISK.</strong> YOU EXPLICITLY ACKNOWLEDGE THAT RELYING ON ANY INFORMATION PROVIDED BY THE SERVICE IS SOLELY AT YOUR OWN RISK. THE COMPANY SHALL NOT BE LIABLE FOR ANY DEATH, INJURY, OR HEALTH DETERIORATION RESULTING FROM YOUR USE OF THE SERVICE.</p>
                        </div>
                     </div>
                  </div>

                  {/* 5. License & Access */}
                  <div id="section-5" className="mb-16 scroll-mt-32">
                     <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 border-b border-[#DA8CA0]/20 pb-2">
                        <span className="text-[#DA8CA0] font-mono text-sm">05.</span> License & Access
                     </h2>
                     <p className="text-[#CCCCD9] text-sm leading-7">
                        <strong>5.1. Limited License.</strong> We grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Service for your personal, non-commercial use.
                     </p>
                     <p className="text-[#CCCCD9] text-sm leading-7">
                        <strong>5.2. Prohibited Uses.</strong> You agree not to:
                     </p>
                     <ul className="list-disc pl-5 text-[#CCCCD9] text-sm space-y-1 mt-2">
                        <li>Use the Service for any illegal purpose or in violation of any local, state, national, or international law.</li>
                        <li>Attempt to "jailbreak," manipulate, or trick the AI into providing harmful, illegal, or unethical content.</li>
                        <li>Reverse engineer, decompile, disassemble, or attempt to discover the source code or algorithms of the Service.</li>
                     </ul>
                  </div>

                  {/* 6. AI Limitations */}
                  <div id="section-6" className="mb-16 scroll-mt-32">
                     <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 border-b border-[#DA8CA0]/20 pb-2">
                        <span className="text-[#DA8CA0] font-mono text-sm">06.</span> AI & Algorithmic Limitations
                     </h2>
                     <p className="text-[#CCCCD9] text-sm leading-7">
                        The User acknowledges that the Service utilizes Large Language Models (LLMs) which are probabilistic in nature.
                     </p>
                     <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div className="bg-[#231854] p-4 rounded-lg border border-[#DA8CA0]/10">
                           <h4 className="text-white font-bold text-sm mb-2">Hallucinations</h4>
                           <p className="text-[#CCCCD9] text-xs leading-relaxed">
                              The AI may confidently generate incorrect, fabricated, or unsafe information ("hallucinations"). It may cite non-existent medical protocols or mix up symptoms.
                           </p>
                        </div>
                        <div className="bg-[#231854] p-4 rounded-lg border border-[#DA8CA0]/10">
                           <h4 className="text-white font-bold text-sm mb-2">Context Blindness</h4>
                           <p className="text-[#CCCCD9] text-xs leading-relaxed">
                              The AI cannot visually inspect the patient (unless using specific vision features) and relies solely on user input, which may be incomplete or inaccurate.
                           </p>
                        </div>
                     </div>
                  </div>

                  {/* 7. User Obligations (RESTORED) */}
                  <div id="section-7" className="mb-16 scroll-mt-32">
                     <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 border-b border-[#DA8CA0]/20 pb-2">
                        <span className="text-[#DA8CA0] font-mono text-sm">07.</span> User Obligations & Conduct
                     </h2>
                     <div className="flex items-start gap-4 p-4 bg-[#231854] border border-[#DA8CA0]/10 rounded-lg">
                        <UserCheck className="h-5 w-5 text-[#DA8CA0] shrink-0 mt-1" />
                        <div className="text-sm text-[#CCCCD9] leading-7">
                           <p className="mb-2"><strong>7.1. Honest Representation.</strong> You agree to provide truthful and accurate information about symptoms when querying the AI. Misleading inputs may lead to dangerous outputs.</p>
                           <p className="mb-2"><strong>7.2. Age Requirement.</strong> Users must be at least 13 years of age. Users under 18 should use the service with parental supervision.</p>
                           <p><strong>7.3. Account Security.</strong> You are responsible for maintaining the confidentiality of your login credentials (if any) and for all activities that occur under your account.</p>
                        </div>
                     </div>
                  </div>

                  {/* 8. Emergency Protocols */}
                  <div id="section-8" className="mb-16 scroll-mt-32">
                     <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 border-b border-[#DA8CA0]/20 pb-2">
                        <span className="text-[#DA8CA0] font-mono text-sm">08.</span> Emergency Protocol
                     </h2>
                     <p className="text-[#CCCCD9] text-sm leading-7">
                        The Service is not a replacement for emergency dispatch systems. In the event of a life-threatening situation (e.g., cardiac arrest, stroke, severe bleeding), you agree to bypass the Service and contact:
                     </p>
                     <ul className="mt-4 space-y-2 text-sm text-[#CCCCD9] font-mono">
                        <li className="flex items-center gap-2"><Globe className="h-4 w-4 text-emerald-500"/> <strong>Nigeria:</strong> Dial 112 or 122</li>
                        <li className="flex items-center gap-2"><Globe className="h-4 w-4 text-blue-500"/> <strong>USA:</strong> Dial 911</li>
                        <li className="flex items-center gap-2"><Globe className="h-4 w-4 text-purple-500"/> <strong>UK/EU:</strong> Dial 999 or 112</li>
                     </ul>
                  </div>

                  {/* 9. Intellectual Property (RESTORED) */}
                  <div id="section-9" className="mb-16 scroll-mt-32">
                     <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 border-b border-[#DA8CA0]/20 pb-2">
                        <span className="text-[#DA8CA0] font-mono text-sm">09.</span> Intellectual Property Rights
                     </h2>
                     <div className="flex items-start gap-4 p-4 bg-[#231854] border border-[#DA8CA0]/10 rounded-lg">
                        <Copyright className="h-5 w-5 text-[#DA8CA0] shrink-0 mt-1" />
                        <div className="text-sm text-[#CCCCD9] leading-7">
                           <p className="mb-2"><strong>9.1. Ownership.</strong> MedGuard AI retains all right, title, and interest in and to the Service, including all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics.</p>
                           <p><strong>9.2. Trademarks.</strong> "MedGuard AI", "Heal Her", and our logos are trademarks of the Company. You may not use them without prior written permission.</p>
                        </div>
                     </div>
                  </div>

                  {/* 10. Data Protection */}
                  <div id="section-10" className="mb-16 scroll-mt-32">
                     <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 border-b border-[#DA8CA0]/20 pb-2">
                        <span className="text-[#DA8CA0] font-mono text-sm">10.</span> Data Protection (NDPR)
                     </h2>
                     <p className="text-[#CCCCD9] text-sm leading-7">
                        We collect and process personal data in strict accordance with the <strong>Nigeria Data Protection Regulation (NDPR) 2019</strong> and applicable international laws.
                     </p>
                     <p className="text-[#CCCCD9] text-sm leading-7 mt-2">
                        <strong>10.1. Consent.</strong> By using the Service, you consent to the processing of your health data for the purpose of providing educational guidance.
                     </p>
                     <p className="text-[#CCCCD9] text-sm leading-7 mt-2">
                        <strong>10.2. Data Security.</strong> We implement technical measures (AES-256 encryption) to protect your data. However, no method of transmission over the Internet is 100% secure.
                     </p>
                  </div>

                  {/* 11. Disclaimers of Warranty (RESTORED) */}
                  <div id="section-11" className="mb-16 scroll-mt-32">
                     <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 border-b border-[#DA8CA0]/20 pb-2">
                        <span className="text-[#DA8CA0] font-mono text-sm">11.</span> Disclaimers of Warranty
                     </h2>
                     <div className="p-4 border border-slate-700 bg-slate-900 rounded-lg">
                        <p className="text-[#CCCCD9] text-sm leading-7 uppercase font-bold">
                           THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. TO THE FULLEST EXTENT PERMITTED BY LAW, MEDGUARD AI DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
                        </p>
                     </div>
                  </div>

                  {/* 12. Limitation of Liability */}
                  <div id="section-12" className="mb-16 scroll-mt-32">
                     <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 border-b border-[#DA8CA0]/20 pb-2">
                        <span className="text-[#DA8CA0] font-mono text-sm">12.</span> Limitation of Liability
                     </h2>
                     <p className="text-[#CCCCD9] text-sm leading-7">
                        TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL MEDGUARD AI, ITS AFFILIATES, AGENTS, DIRECTORS, OR EMPLOYEES BE LIABLE FOR ANY INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES, INCLUDING DAMAGES FOR LOSS OF PROFITS, GOODWILL, OR DATA.
                     </p>
                     <p className="text-[#CCCCD9] text-sm leading-7 mt-4 border-l-2 border-[#DA8CA0]/50 pl-4">
                        <strong>Cap on Liability:</strong> Under no circumstances will MedGuard AI's total liability to you for all damages, losses, or causes of action exceed the amount you have paid MedGuard AI in the last six (6) months, or Ten Thousand Nigerian Naira (₦10,000), whichever is greater.
                     </p>
                  </div>

                  {/* 13. Indemnification (RESTORED) */}
                  <div id="section-13" className="mb-16 scroll-mt-32">
                     <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 border-b border-[#DA8CA0]/20 pb-2">
                        <span className="text-[#DA8CA0] font-mono text-sm">13.</span> Indemnification
                     </h2>
                     <div className="flex items-start gap-4 p-4 bg-[#231854] border border-[#DA8CA0]/10 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-1" />
                        <p className="text-sm text-[#CCCCD9] leading-7">
                           You agree to defend, indemnify, and hold harmless MedGuard AI and its licensees and licensors, and their employees, contractors, agents, officers, and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees), resulting from or arising out of a) your use and access of the Service, or b) a breach of these Terms.
                        </p>
                     </div>
                  </div>

                  {/* 14. Dispute Resolution */}
                  <div id="section-14" className="mb-16 scroll-mt-32">
                     <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 border-b border-[#DA8CA0]/20 pb-2">
                        <span className="text-[#DA8CA0] font-mono text-sm">14.</span> Dispute Resolution & Governing Law
                     </h2>
                     <div className="bg-[#231854] p-6 rounded-xl border border-[#DA8CA0]/10">
                        <div className="flex items-center gap-3 mb-4">
                           <Gavel className="h-6 w-6 text-amber-500" />
                           <h3 className="text-lg font-bold text-white m-0">Governing Jurisdiction: Nigeria</h3>
                        </div>
                        <p className="text-[#CCCCD9] text-sm leading-relaxed mb-4">
                           <strong>14.1. Law.</strong> These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria.
                        </p>
                        <p className="text-[#CCCCD9] text-sm leading-relaxed mb-4">
                           <strong>14.2. Arbitration.</strong> Any dispute arising out of or in connection with this contract, including any question regarding its existence, validity, or termination, shall be referred to and finally resolved by binding arbitration under the Arbitration and Conciliation Act (Cap A18 LFN 2004).
                        </p>
                        <ul className="text-[#CCCCD9] text-sm list-disc pl-5 space-y-1">
                           <li><strong>Seat:</strong> Jos, Plateau State, Nigeria (or online via video conference).</li>
                           <li><strong>Language:</strong> English.</li>
                           <li><strong>Arbitrator:</strong> Single arbitrator appointed by mutual agreement.</li>
                        </ul>
                     </div>
                  </div>

                  {/* 15. Contact */}
                  <div id="section-15" className="mb-16 scroll-mt-32 border-t border-[#DA8CA0]/20 pt-8">
                     <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <span className="text-[#DA8CA0] font-mono text-sm">15.</span> General Provisions & Contact
                     </h2>
                     
                     <div className="mt-8 p-6 bg-[#231854]/50 rounded-xl border border-[#DA8CA0]/10 flex flex-col md:flex-row gap-8">
                        <div className="flex-1">
                           <h4 className="text-white font-bold mb-2">Legal Notices</h4>
                           <p className="text-[#CCCCD9] text-xs">
                              Please send all legal notices, subpoenas, or data requests to our registered office.
                           </p>
                        </div>
                        <div className="flex-1 border-l border-[#DA8CA0]/10 pl-8">
                           <div className="space-y-3 font-mono text-sm">
                              <div>
                                 <span className="text-[#CCCCD9]/60 block text-xs uppercase tracking-wider">Email</span>
                                 <a href="mailto:medguardai@gmail.com" className="text-[#DA8CA0] hover:text-white transition-colors">medguardai@gmail.com</a>
                              </div>
                              <div>
                                 <span className="text-[#CCCCD9]/60 block text-xs uppercase tracking-wider">Physical Address</span>
                                 <span className="text-[#CCCCD9]">P.M.B. 2084, Jos,<br/>Plateau State, Nigeria, 93001</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* --- DIGITAL SIGNATURE BLOCK --- */}
                  <div className="mt-20 pt-12 border-t border-[#DA8CA0]/20 break-inside-avoid">
                     <div className="flex flex-col md:flex-row justify-between items-end gap-12">
                        
                        {/* Company Signature */}
                        <div className="space-y-4">
                           <p className="text-xs text-[#CCCCD9] uppercase tracking-widest">Executed by MedGuard AI:</p>
                           <div className="relative">
                              {/* The Secure Handwriting Signature */}
                              <FounderSignature />
                              
                              {/* The Stamp Overlay */}
                              <div className="absolute -top-4 -right-12 opacity-30 pointer-events-none rotate-[-12deg] border-4 border-[#DA8CA0] rounded-full w-32 h-32 flex items-center justify-center">
                                 <div className="text-[10px] font-mono text-[#DA8CA0] text-center leading-tight font-bold">
                                    OFFICIAL<br/>DIGITAL<br/>SEAL<br/>2026
                                 </div>
                              </div>
                           </div>
                           <div className="h-px w-64 bg-[#DA8CA0]/30" />
                           <p className="text-xs text-[#CCCCD9] font-mono">
                              <strong>Nwaka Amos Chika</strong><br/>
                              Founder & Chief Executive Officer (CEO)<br/>
                              MedGuard AI Solutions
                           </p>
                        </div>

                        {/* Date Block */}
                        <div className="space-y-4">
                           <p className="text-xs text-[#CCCCD9] uppercase tracking-widest">Date of Effect:</p>
                           <div className="text-xl text-white font-mono">
                              January 16, 2026
                           </div>
                           <div className="h-px w-48 bg-[#DA8CA0]/30" />
                           <p className="text-xs text-[#CCCCD9] font-mono">
                              Jos, Plateau State, Nigeria
                           </p>
                        </div>

                     </div>
                  </div>

               </div>
            </div>
         </div>
      </div>

      <div className="print:hidden">
        <Footer />
      </div>
      
      {/* CSS for Print Formatting */}
      <style jsx global>{`
        @media print {
          @page { margin: 2cm; }
          body { background: white; color: black; }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          .print\\:inline { display: inline !important; }
          .print\\:col-span-12 { grid-column: span 12 / span 12 !important; }
          .print\\:prose-black { color: black !important; }
          .print\\:text-sm { font-size: 11px !important; }
          p, li, h1, h2, h3, h4 { color: black !important; }
          a { text-decoration: none; color: black !important; }
          .bg-slate-900, .bg-slate-950, .bg-\\[\\#231854\\], .bg-\\[\\#1C1246\\] { background: transparent !important; border: 1px solid #ccc !important; }
        }
      `}</style>
    </div>
  )
}