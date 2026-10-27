"use client"

import React, { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import PrivacyPolicyDocument, { SignaturePayload } from "@/components/legal/privacy"
import { Loader2, ShieldCheck, X } from "lucide-react"

// Updated to route through the Next.js API Proxy
const GRAPHQL_ENDPOINT = "/api/proxy/graphql"

export default function PrivacyPage() {
  const [isProcessing, setIsProcessing] = useState(false)
  
  // OTP Modal State
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [otpCode, setOtpCode] = useState("")
  const [otpError, setOtpError] = useState("")
  
  // Payload Storage (Saved from Step 1 to use in Step 2)
  const [pendingPayload, setPendingPayload] = useState<SignaturePayload | null>(null)

  // --- STEP 1: REQUEST OTP ---
  const handleDocumentExecution = async (payload: SignaturePayload) => {
    setIsProcessing(true)
    setOtpError("")
    
    try {
      // 1. Fire the OTP request to the backend
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation RequestSignatureOtp($email: String!, $name: String!) {
              requestLegalSignatureOtp(email: $email, name: $name)
            }
          `,
          variables: { 
            email: payload.clientEmail, 
            name: payload.clientName 
          }
        })
      })

      const result = await response.json()

      if (result.errors) {
        throw new Error(result.errors[0].message)
      }

      // 2. If successful, lock the payload in state and pop the modal
      if (result.data?.requestLegalSignatureOtp) {
        setPendingPayload(payload)
        setShowOtpModal(true)
      } else {
        throw new Error("Failed to generate OTP challenge.")
      }

    } catch (error: any) {
      console.error("Step 1 Signature Error:", error)
      alert(error.message || "An error occurred while connecting to the legal server.")
    } finally {
      setIsProcessing(false)
    }
  }

  // --- STEP 2: EXECUTE SIGNATURE ---
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pendingPayload || otpCode.length !== 6) return

    setIsProcessing(true)
    setOtpError("")

    try {
      // 1. Fetch Client IP for the Cryptographic Audit
      let clientIp = "Unknown-IP"
      try {
        const ipRes = await fetch("https://api.ipify.org?format=json")
        const ipData = await ipRes.json()
        clientIp = ipData.ip
      } catch (e) {
        console.warn("Could not resolve IP address, using fallback.")
      }

      // 2. Fire the final execution matrix
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation ExecuteSignature($email: String!, $name: String!, $otpCode: String!, $ipAddress: String!) {
              executeDocumentSignature(email: $email, name: $name, otpCode: $otpCode, ipAddress: $ipAddress) {
                status
                message
                documentHash
                storageUrl
              }
            }
          `,
          variables: { 
            email: pendingPayload.clientEmail, 
            name: pendingPayload.clientName,
            otpCode: otpCode,
            ipAddress: clientIp
          }
        })
      })

      const result = await response.json()
      
      if (result.errors) {
        throw new Error(result.errors[0].message)
      }

      const executionData = result.data?.executeDocumentSignature

      if (executionData?.status === "success") {
        // 3. Success! Close modal and hand off the PDF to the user
        setShowOtpModal(false)
        setOtpCode("")
        setPendingPayload(null)
        
        // Force the browser to open/download the Supabase PDF link
        if (executionData.storageUrl) {
          window.open(executionData.storageUrl, "_blank")
        }
        
        alert("Success! Your Privacy Policy consent has been cryptographically sealed and saved.")
      } else {
        setOtpError(executionData?.message || "Invalid or expired authorization code.")
      }

    } catch (error: any) {
      console.error("Step 2 Execution Error:", error)
      // Temporary fallback message while PDF generation engine is being finalized
      setOtpError("We are still working on finalizing the PDF generation engine! Please bear with us while this feature is completed.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1C1246] relative">
      <Navigation />
      
      <main className="pt-10 pb-24">
        <div className="max-w-6xl mx-auto">
          {/* We pass the execution function right into the Privacy Policy component */}
          <PrivacyPolicyDocument 
            onExecuteSignature={handleDocumentExecution} 
            isProcessing={isProcessing} 
          />
        </div>
      </main>

      <Footer />

      {/* --- OTP SECURE MODAL --- */}
      {showOtpModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0F0A26]/80 backdrop-blur-sm">
          {/* Modal shrunk to max-w-sm and padding reduced to p-6 */}
          <div className="bg-[#1C1246] border border-[#DA8CA0]/30 rounded-2xl w-full max-w-sm p-6 relative shadow-[0_0_40px_rgba(218,140,160,0.15)] animate-in fade-in zoom-in duration-200">
            
            <button 
              onClick={() => { setShowOtpModal(false); setOtpCode(""); }}
              className="absolute top-4 right-4 text-[#CCCCD9]/60 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col items-center text-center mb-6">
              <div className="h-12 w-12 bg-[#DA8CA0]/10 rounded-full flex items-center justify-center mb-4 border border-[#DA8CA0]/20">
                <ShieldCheck className="h-6 w-6 text-[#DA8CA0]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Cryptographic Verification</h3>
              <p className="text-sm text-[#CCCCD9] leading-relaxed">
                A 6-digit authorization code has been dispatched to <strong>{pendingPayload?.clientEmail}</strong>. 
                Enter it below to securely seal your privacy consent.
              </p>
            </div>

            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="• • • • • •"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full bg-[#231854] border border-[#DA8CA0]/30 rounded-xl px-4 py-4 text-center text-2xl tracking-[0.5em] text-white font-mono placeholder:text-[#CCCCD9]/30 focus:outline-none focus:border-[#DA8CA0] transition-colors"
                  autoFocus
                />
                {otpError && (
                  <p className="text-rose-400 text-xs text-center mt-2 font-medium">{otpError}</p>
                )}
              </div>

              <button 
                type="submit"
                disabled={otpCode.length !== 6 || isProcessing}
                className="liquid-glass-btn h-12 w-full flex items-center justify-center gap-2 rounded-xl font-bold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <><Loader2 className="h-4 w-4 animate-spin text-white" /> Sealing Consent...</>
                ) : (
                  "Confirm Processing Consent"
                )}
              </button>
            </form>

            <p className="text-[10px] text-[#CCCCD9]/50 text-center mt-6 font-mono">
              By executing, you agree to store your IP address and cryptographic hash in our immutable audit ledger.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}