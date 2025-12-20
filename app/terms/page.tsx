"use client"

import React, { useRef } from "react"
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
  ChevronRight
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

// --- SECURE SIGNATURE COMPONENT ---
const FounderSignature = () => {
  return (
    <div 
      className="relative select-none pointer-events-none" 
      onContextMenu={(e) => e.preventDefault()} 
    >
      <svg
        width="200"
        height="60"
        viewBox="0 0 200 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-blue-500"
      >
        <path
          d="M10 40 C 15 35, 25 15, 30 20 S 40 50, 45 45 S 55 25, 60 30"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M70 35 C 75 30, 85 40, 90 35 S 100 25, 105 30"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
         <path
          d="M120 30 C 130 20, 140 40, 150 25 S 160 35, 170 30"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
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
    <div className="relative min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30 selection:text-blue-200">
      <GrainOverlay />
      
      {/* Hide Navigation on Print */}
      <div className="print:hidden">
        <Navigation />
      </div>

      {/* --- HEADER (Screen Only) --- */}
      <section className="relative pt-32 pb-12 border-b border-white/5 bg-slate-900/50 print:hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-xs font-mono uppercase mb-4">
                    <Scale className="h-3 w-3" /> Agreement Reference: MG-TOS-2026-V2
                 </div>
                 <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-2">Terms of Service</h1>
                 <p className="text-slate-400 max-w-xl text-sm leading-relaxed">
                    This document constitutes a legally binding agreement between you and MedGuard AI. It outlines your rights, obligations, and the limitations of our liability regarding the use of our Artificial Intelligence services.
                 </p>
              </div>
              
              {/* Document Metadata & Download */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-2 min-w-[240px]">
                 <div className="flex justify-between items-center text-xs text-slate-500 font-mono">
                    <span>Effective Date:</span>
                    <span className="text-white">January 15, 2026</span>
                 </div>
                 <div className="flex justify-between items-center text-xs text-slate-500 font-mono">
                    <span>Jurisdiction:</span>
                    <span className="text-white">Nigeria (Federal)</span>
                 </div>
                 <div className="flex justify-between items-center text-xs text-slate-500 font-mono">
                    <span>Status:</span>
                    <span className="text-emerald-500 font-bold">ENFORCED</span>
                 </div>
                 
                 {/* UPDATED BUTTON STYLE */}
                 <Button 
                    onClick={handlePrint} 
                    className="mt-2 h-9 text-xs w-full flex items-center justify-center gap-2 bg-transparent border border-slate-800 text-slate-400 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300"
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
                     <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Agreement Sections</h3>
                     <nav className="space-y-1 border-l border-slate-800">
                        {[
                           "1. Definitions & Interpretation",
                           "2. Acceptance of Agreement",
                           "3. Medical Disclaimer (Critical)",
                           "4. License & Access",
                           "5. AI & Algorithmic Limitations",
                           "6. User Obligations & Conduct",
                           "7. Emergency Protocols",
                           "8. Intellectual Property Rights",
                           "9. Data Privacy (NDPR)",
                           "10. Disclaimers of Warranty",
                           "11. Limitation of Liability",
                           "12. Indemnification",
                           "13. Dispute Resolution",
                           "14. General Provisions"
                        ].map((item, i) => (
                           <a key={i} href={`#section-${i+1}`} className="block pl-4 py-2 text-xs text-slate-400 hover:text-blue-400 hover:border-l-blue-500 border-l border-transparent transition-all truncate">
                              {item}
                           </a>
                        ))}
                     </nav>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                     <h4 className="text-white font-bold text-sm mb-2 flex items-center gap-2">
                        <History className="h-4 w-4 text-blue-500" /> Recent Changes
                     </h4>
                     <p className="text-[10px] text-slate-500 leading-relaxed">
                        Updated <strong>Section 5</strong> to include specific clauses regarding Generative AI hallucinations and <strong>Section 9</strong> for NDPR (Nigeria Data Protection Regulation) compliance.
                     </p>
                  </div>
               </div>
            </div>

            {/* --- LEGAL TEXT --- */}
            <div className="lg:col-span-9 print:col-span-12" ref={contentRef}>
               
               {/* Print-Only Header */}
               <div className="hidden print:block mb-8 border-b border-black pb-4">
                  <h1 className="text-2xl font-bold text-black">Master Service Agreement - MedGuard AI</h1>
                  <p className="text-xs text-gray-600">Generated: {new Date().toLocaleDateString()} | Reference: MG-TOS-2026</p>
               </div>

               <div className="prose prose-invert prose-slate max-w-none print:prose-black print:text-sm">
                  
                  {/* 1. Definitions */}
                  <div id="section-1" className="mb-16 scroll-mt-32">
                     <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 border-b border-slate-800 pb-2">
                        <span className="text-blue-500 font-mono text-sm">01.</span> Definitions & Interpretation
                     </h2>
                     <p className="text-slate-400 text-sm leading-7">
                        <strong>1.1. "Company"</strong> refers to MedGuard AI Solutions, an entity operating under the laws of the Federal Republic of Nigeria, having its registered office at P.M.B. 2084, Jos, Plateau State, Nigeria.
                     </p>
                     <p className="text-slate-400 text-sm leading-7">
                        <strong>1.2. "Service"</strong> includes the MedGuard AI website, mobile applications (iOS/Android), API interfaces, voice assistants, and any related digital infrastructure provided by the Company.
                     </p>
                     <p className="text-slate-400 text-sm leading-7">
                        <strong>1.3. "AI Content"</strong> means any data, text, audio, image, or video generated by the artificial intelligence algorithms integrated into the Service.
                     </p>
                     <p className="text-slate-400 text-sm leading-7">
                        <strong>1.4. "User"</strong> refers to any individual or entity accessing or using the Service.
                     </p>
                  </div>

                  {/* 2. Acceptance */}
                  <div id="section-2" className="mb-16 scroll-mt-32">
                     <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 border-b border-slate-800 pb-2">
                        <span className="text-blue-500 font-mono text-sm">02.</span> Acceptance of Agreement
                     </h2>
                     <p className="text-slate-400 text-sm leading-7">
                        By accessing, downloading, installing, or using the Service, you represent and warrant that you have the legal capacity to enter into a binding contract. You explicitly acknowledge that you have read, understood, and agreed to be bound by these Terms. 
                     </p>
                     <p className="text-slate-400 text-sm leading-7 mt-4 bg-slate-900 p-4 rounded border-l-2 border-blue-500">
                        IF YOU DO NOT AGREE TO ALL OF THESE TERMS, INCLUDING THE MANDATORY ARBITRATION PROVISION AND CLASS ACTION WAIVER, YOU ARE EXPRESSLY PROHIBITED FROM USING THE SERVICE AND MUST DISCONTINUE USE IMMEDIATELY.
                     </p>
                  </div>

                  {/* 3. MEDICAL DISCLAIMER (CRITICAL) */}
                  <div id="section-3" className="mb-16 scroll-mt-32">
                     <div className="relative overflow-hidden rounded-xl border border-rose-500/30 bg-rose-950/10 p-8">
                        <div className="flex items-center gap-3 mb-6 text-rose-500">
                           <ShieldAlert className="h-6 w-6" />
                           <h2 className="text-xl font-bold m-0">03. NO MEDICAL ADVICE / DISCLAIMER</h2>
                        </div>
                        <div className="space-y-4 text-slate-300 text-sm leading-7">
                           <p><strong>3.1. NOT A HEALTHCARE PROVIDER.</strong> MEDGUARD AI IS A SOFTWARE TECHNOLOGY COMPANY, NOT A DOCTOR, NURSE, HOSPITAL, OR MEDICAL PROVIDER. THE SERVICE DOES NOT PROVIDE MEDICAL DIAGNOSIS, TREATMENT, OR PRESCRIPTIONS.</p>
                           
                           <p><strong>3.2. INFORMATIONAL USE ONLY.</strong> The content provided by the Service is for informational and educational guidance purposes only. It is derived from statistical patterns in medical data and does not constitute a professional medical opinion.</p>
                           
                           <p><strong>3.3. NO DOCTOR-PATIENT RELATIONSHIP.</strong> Use of the Service does not create a physician-patient relationship between you and MedGuard AI. Communications with the AI are not confidential medical records under HIPAA, though we protect them via our Privacy Policy.</p>
                           
                           <p><strong>3.4. ASSUMPTION OF RISK.</strong> YOU EXPLICITLY ACKNOWLEDGE THAT RELYING ON ANY INFORMATION PROVIDED BY THE SERVICE IS SOLELY AT YOUR OWN RISK. THE COMPANY SHALL NOT BE LIABLE FOR ANY DEATH, INJURY, OR HEALTH DETERIORATION RESULTING FROM YOUR USE OF THE SERVICE.</p>
                        </div>
                     </div>
                  </div>

                  {/* 4. Scope of Service */}
                  <div id="section-4" className="mb-16 scroll-mt-32">
                     <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 border-b border-slate-800 pb-2">
                        <span className="text-blue-500 font-mono text-sm">04.</span> License & Access
                     </h2>
                     <p className="text-slate-400 text-sm leading-7">
                        <strong>4.1. Limited License.</strong> We grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Service for your personal, non-commercial use.
                     </p>
                     <p className="text-slate-400 text-sm leading-7">
                        <strong>4.2. Prohibited Uses.</strong> You agree not to:
                     </p>
                     <ul className="list-disc pl-5 text-slate-400 text-sm space-y-1 mt-2">
                        <li>Use the Service for any illegal purpose or in violation of any local, state, national, or international law.</li>
                        <li>Attempt to "jailbreak," manipulate, or trick the AI into providing harmful, illegal, or unethical content.</li>
                        <li>Reverse engineer, decompile, disassemble, or attempt to discover the source code or algorithms of the Service.</li>
                        <li>Use automated scripts or bots to access or scrape data from the Service.</li>
                     </ul>
                  </div>

                  {/* 5. AI Limitations */}
                  <div id="section-5" className="mb-16 scroll-mt-32">
                     <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 border-b border-slate-800 pb-2">
                        <span className="text-blue-500 font-mono text-sm">05.</span> AI & Algorithmic Limitations
                     </h2>
                     <p className="text-slate-400 text-sm leading-7">
                        The User acknowledges that the Service utilizes Large Language Models (LLMs) which are probabilistic in nature.
                     </p>
                     <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                           <h4 className="text-white font-bold text-sm mb-2">Hallucinations</h4>
                           <p className="text-slate-400 text-xs leading-relaxed">
                              The AI may confidently generate incorrect, fabricated, or unsafe information ("hallucinations"). It may cite non-existent medical protocols or mix up symptoms.
                           </p>
                        </div>
                        <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                           <h4 className="text-white font-bold text-sm mb-2">Context Blindness</h4>
                           <p className="text-slate-400 text-xs leading-relaxed">
                              The AI cannot visually inspect the patient (unless using specific vision features) and relies solely on user input, which may be incomplete or inaccurate.
                           </p>
                        </div>
                     </div>
                  </div>

                  {/* 7. Emergency Protocols */}
                  <div id="section-7" className="mb-16 scroll-mt-32">
                     <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 border-b border-slate-800 pb-2">
                        <span className="text-blue-500 font-mono text-sm">07.</span> Emergency Protocol
                     </h2>
                     <p className="text-slate-400 text-sm leading-7">
                        The Service is not a replacement for emergency dispatch systems. In the event of a life-threatening situation (e.g., cardiac arrest, stroke, severe bleeding), you agree to bypass the Service and contact:
                     </p>
                     <ul className="mt-4 space-y-2 text-sm text-slate-300 font-mono">
                        <li className="flex items-center gap-2"><Globe className="h-4 w-4 text-emerald-500"/> <strong>Nigeria:</strong> Dial 112 or 122</li>
                        <li className="flex items-center gap-2"><Globe className="h-4 w-4 text-blue-500"/> <strong>USA:</strong> Dial 911</li>
                        <li className="flex items-center gap-2"><Globe className="h-4 w-4 text-purple-500"/> <strong>UK/EU:</strong> Dial 999 or 112</li>
                     </ul>
                  </div>

                  {/* 9. Data Protection */}
                  <div id="section-9" className="mb-16 scroll-mt-32">
                     <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 border-b border-slate-800 pb-2">
                        <span className="text-blue-500 font-mono text-sm">09.</span> Data Protection (NDPR)
                     </h2>
                     <p className="text-slate-400 text-sm leading-7">
                        We collect and process personal data in strict accordance with the <strong>Nigeria Data Protection Regulation (NDPR) 2019</strong> and applicable international laws.
                     </p>
                     <p className="text-slate-400 text-sm leading-7 mt-2">
                        <strong>9.1. Consent.</strong> By using the Service, you consent to the processing of your health data for the purpose of providing emergency guidance.
                     </p>
                     <p className="text-slate-400 text-sm leading-7 mt-2">
                        <strong>9.2. Data Security.</strong> We implement technical measures (AES-256 encryption) to protect your data. However, no method of transmission over the Internet is 100% secure.
                     </p>
                  </div>

                  {/* 10. Disclaimers */}
                  <div id="section-10" className="mb-16 scroll-mt-32">
                     <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 border-b border-slate-800 pb-2">
                        <span className="text-blue-500 font-mono text-sm">10.</span> Disclaimers of Warranty
                     </h2>
                     <p className="text-slate-400 text-sm leading-7 uppercase">
                        THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. TO THE FULLEST EXTENT PERMITTED BY LAW, MEDGUARD AI DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
                     </p>
                  </div>

                  {/* 11. Limitation of Liability */}
                  <div id="section-11" className="mb-16 scroll-mt-32">
                     <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 border-b border-slate-800 pb-2">
                        <span className="text-blue-500 font-mono text-sm">11.</span> Limitation of Liability
                     </h2>
                     <p className="text-slate-400 text-sm leading-7">
                        TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL MEDGUARD AI, ITS AFFILIATES, AGENTS, DIRECTORS, OR EMPLOYEES BE LIABLE FOR ANY INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES, INCLUDING DAMAGES FOR LOSS OF PROFITS, GOODWILL, OR DATA.
                     </p>
                     <p className="text-slate-400 text-sm leading-7 mt-4 border-l-2 border-slate-700 pl-4">
                        <strong>Cap on Liability:</strong> Under no circumstances will MedGuard AI's total liability to you for all damages, losses, or causes of action exceed the amount you have paid MedGuard AI in the last six (6) months, or Ten Thousand Nigerian Naira (₦10,000), whichever is greater.
                     </p>
                  </div>

                  {/* 13. Dispute Resolution */}
                  <div id="section-13" className="mb-16 scroll-mt-32">
                     <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 border-b border-slate-800 pb-2">
                        <span className="text-blue-500 font-mono text-sm">13.</span> Dispute Resolution & Governing Law
                     </h2>
                     <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-3 mb-4">
                           <Gavel className="h-6 w-6 text-amber-500" />
                           <h3 className="text-lg font-bold text-white m-0">Governing Jurisdiction: Nigeria</h3>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed mb-4">
                           <strong>13.1. Law.</strong> These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria.
                        </p>
                        <p className="text-slate-400 text-sm leading-relaxed mb-4">
                           <strong>13.2. Arbitration.</strong> Any dispute arising out of or in connection with this contract, including any question regarding its existence, validity, or termination, shall be referred to and finally resolved by binding arbitration under the Arbitration and Conciliation Act (Cap A18 LFN 2004).
                        </p>
                        <ul className="text-slate-400 text-sm list-disc pl-5 space-y-1">
                           <li><strong>Seat:</strong> Jos, Plateau State, Nigeria (or online via video conference).</li>
                           <li><strong>Language:</strong> English.</li>
                           <li><strong>Arbitrator:</strong> Single arbitrator appointed by mutual agreement.</li>
                        </ul>
                     </div>
                  </div>

                  {/* 14. Contact */}
                  <div id="section-14" className="mb-16 scroll-mt-32 border-t border-slate-800 pt-8">
                     <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <span className="text-blue-500 font-mono text-sm">14.</span> General Provisions & Contact
                     </h2>
                     <p className="text-slate-400 text-sm leading-7">
                        <strong>Severability:</strong> If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full force and effect.
                     </p>
                     
                     <div className="mt-8 p-6 bg-slate-900/50 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-8">
                        <div className="flex-1">
                           <h4 className="text-white font-bold mb-2">Legal Notices</h4>
                           <p className="text-slate-400 text-xs">
                              Please send all legal notices, subpoenas, or data requests to our registered office.
                           </p>
                        </div>
                        <div className="flex-1 border-l border-slate-800 pl-8">
                           <div className="space-y-3 font-mono text-sm">
                              <div>
                                 <span className="text-slate-500 block text-xs uppercase tracking-wider">Email</span>
                                 <a href="mailto:medguardai@gmail.com" className="text-blue-400 hover:text-white transition-colors">medguardai@gmail.com</a>
                              </div>
                              <div>
                                 <span className="text-slate-500 block text-xs uppercase tracking-wider">Physical Address</span>
                                 <span className="text-slate-300">P.M.B. 2084, Jos,<br/>Plateau State, Nigeria, 93001</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* --- DIGITAL SIGNATURE BLOCK --- */}
                  <div className="mt-20 pt-12 border-t border-slate-800 break-inside-avoid">
                     <div className="flex flex-col md:flex-row justify-between items-end gap-12">
                        
                        {/* Company Signature */}
                        <div className="space-y-4">
                           <p className="text-xs text-slate-500 uppercase tracking-widest">Executed by MedGuard AI:</p>
                           <div className="relative">
                              {/* The Signature */}
                              <FounderSignature />
                              {/* The Stamp Overlay */}
                              <div className="absolute -top-4 -right-12 opacity-30 pointer-events-none rotate-[-12deg] border-4 border-blue-500 rounded-full w-32 h-32 flex items-center justify-center">
                                 <div className="text-[10px] font-mono text-blue-500 text-center leading-tight font-bold">
                                    OFFICIAL<br/>DIGITAL<br/>SEAL<br/>2026
                                 </div>
                              </div>
                           </div>
                           <div className="h-px w-64 bg-slate-700" />
                           <p className="text-xs text-slate-400 font-mono">
                              <strong>Nwaka Amos Chika</strong><br/>
                              Founder & Chief Executive Officer (CEO)<br/>
                              MedGuard AI Solutions
                           </p>
                        </div>

                        {/* Date Block */}
                        <div className="space-y-4">
                           <p className="text-xs text-slate-500 uppercase tracking-widest">Date of Effect:</p>
                           <div className="text-xl text-white font-mono">
                              January 15, 2026
                           </div>
                           <div className="h-px w-48 bg-slate-700" />
                           <p className="text-xs text-slate-400 font-mono">
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
          .print\\:col-span-12 { grid-column: span 12 / span 12 !important; }
          .print\\:prose-black { color: black !important; }
          .print\\:text-sm { font-size: 11px !important; }
          p, li, h1, h2, h3, h4 { color: black !important; }
          a { text-decoration: none; color: black !important; }
          .bg-slate-900, .bg-slate-950 { background: transparent !important; border: 1px solid #ccc !important; }
        }
      `}</style>
    </div>
  )
}