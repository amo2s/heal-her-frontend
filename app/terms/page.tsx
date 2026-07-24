"use client"

import React, { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import LegalTermsDocument, { SignaturePayload } from "@/components/legal/terms"
import { Loader2, ShieldCheck, X } from "lucide-react"

// Updated to route through the Next.js API Proxy
const GRAPHQL_ENDPOINT = "api/proxy/graphql"

export default function TermsPage() {
  const [isProcessing, setIsProcessing] = useState(false)
  
  // OTP Modal State
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [otpCode, setOtpCode] = useState("")
  const [otpError, setOtpError] = useState("")
  const [isShaking, setIsShaking] = useState(false) // Controls the shake animation on error
  
  // Resend Cooldown State
  const [resendCooldown, setResendCooldown] = useState(0)
  const [isResending, setIsResending] = useState(false)
  
  // Payload Storage (Saved from Step 1 to use in Step 2)
  const [pendingPayload, setPendingPayload] = useState<SignaturePayload | null>(null)

  // Reactive Cooldown Timer
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  // Helper to trigger the shake animation
  const triggerShake = () => {
    setIsShaking(true)
    setTimeout(() => setIsShaking(false), 500)
  }

  // --- STEP 1: REQUEST OTP ---
  const handleDocumentExecution = async (payload: SignaturePayload) => {
    setIsProcessing(true)
    setOtpError("")
    
    try {
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

      if (result.data?.requestLegalSignatureOtp) {
        setPendingPayload(payload)
        setShowOtpModal(true)
        setResendCooldown(60)
      } else {
        throw new Error("Failed to send the security code.")
      }

    } catch (error: any) {
      console.error("Step 1 Signature Error:", error)
      alert(error.message || "An error occurred while connecting to the server.")
    } finally {
      setIsProcessing(false)
    }
  }

  // --- ISOLATED RESEND TRIGGER ---
  const handleResendOtp = async () => {
    if (!pendingPayload || resendCooldown > 0 || isResending) return

    setIsResending(true)
    setOtpError("")
    setOtpCode("") // Clear the existing code when resending

    try {
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
            email: pendingPayload.clientEmail, 
            name: pendingPayload.clientName 
          }
        })
      })

      const result = await response.json()

      if (result.errors) {
        const err = result.errors[0]
        if (err.extensions?.retry_after_seconds) {
          setResendCooldown(err.extensions.retry_after_seconds)
        }
        throw new Error(err.message)
      }

      if (result.data?.requestLegalSignatureOtp) {
        setResendCooldown(60)
        setOtpError("A new code has been sent.")
        setTimeout(() => setOtpError(""), 3000)
      }
    } catch (error: any) {
      console.error("Resend OTP Error:", error)
      setOtpError(error.message || "Failed to resend the code.")
      triggerShake()
    } finally {
      setIsResending(false)
    }
  }

  // --- STEP 2: EXECUTE SIGNATURE ---
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pendingPayload || otpCode.length !== 6) return

    setIsProcessing(true)
    setOtpError("") // Clear any previous errors while verifying

    try {
      // 1. Fetch Client IP
      let clientIp = "Unknown-IP"
      try {
        const ipRes = await fetch("https://api.ipify.org?format=json")
        const ipData = await ipRes.json()
        clientIp = ipData.ip
      } catch (e) {
        console.warn("Could not resolve IP address, using fallback.")
      }

      // 2. Fire the execution
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
        const err = result.errors[0]
        if (err.extensions?.retry_after_seconds) {
          setResendCooldown(err.extensions.retry_after_seconds)
        }
        throw new Error(err.message)
      }

      const executionData = result.data?.executeDocumentSignature

      if (executionData?.status === "success") {
        setShowOtpModal(false)
        setOtpCode("")
        setPendingPayload(null)
        setResendCooldown(0)
        
        if (executionData.storageUrl) {
          window.open(executionData.storageUrl, "_blank")
        }
        
        alert("Success! Your document has been securely signed and saved.")
      } else {
        setOtpError(executionData?.message || "Invalid or expired code.")
        setOtpCode("") // Clear the incorrect code
        triggerShake()
      }

    } catch (error: any) {
      console.error("Step 2 Execution Error:", error)
      setOtpError(error.message || "An error occurred during verification.")
      setOtpCode("") // Clear the code on system error too
      triggerShake()
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1C1246] relative">
      {/* Injecting a tiny custom style for the smooth shake animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}} />

      <Navigation />
      
      <main className="pt-10 pb-24">
        <div className="max-w-6xl mx-auto">
          <LegalTermsDocument 
            onExecuteSignature={handleDocumentExecution} 
            isProcessing={isProcessing} 
          />
        </div>
      </main>

      <Footer />

      {/* --- OTP SECURE MODAL --- */}
      {showOtpModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0F0A26]/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className={`bg-[#1C1246] border border-[#DA8CA0]/30 rounded-2xl w-full max-w-sm p-5 relative shadow-[0_0_40px_rgba(218,140,160,0.15)] transition-all duration-300 ease-out ${isShaking ? 'animate-shake border-rose-500/50' : 'animate-in zoom-in-95 fade-in'}`}>
            
            <button 
              onClick={() => { 
                setShowOtpModal(false)
                setOtpCode("")
                setResendCooldown(0)
              }}
              className="absolute top-4 right-4 text-[#CCCCD9]/60 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col items-center text-center mb-5 mt-2">
              <div className="h-10 w-10 bg-[#DA8CA0]/10 rounded-full flex items-center justify-center mb-3 border border-[#DA8CA0]/20">
                <ShieldCheck className="h-5 w-5 text-[#DA8CA0]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1.5">Security Verification</h3>
              <p className="text-xs text-[#CCCCD9] leading-relaxed px-2">
                If the email you provided is correct, a 6-digit security code has been sent to it.
              </p>
            </div>

            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="• • • • • •"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                  disabled={isProcessing}
                  className={`w-full bg-[#231854] border ${otpError && otpError !== "A new code has been sent." ? 'border-rose-500/50' : 'border-[#DA8CA0]/30'} rounded-xl px-4 py-3.5 text-center text-2xl tracking-[0.5em] text-white font-mono placeholder:text-[#CCCCD9]/30 focus:outline-none focus:border-[#DA8CA0] transition-colors disabled:opacity-50`}
                  autoFocus
                />
                {otpError && (
                  <p className={`text-xs text-center mt-2 font-medium ${otpError === "A new code has been sent." ? "text-emerald-400" : "text-rose-400"}`}>
                    {otpError}
                  </p>
                )}
              </div>

              <button 
                type="submit"
                disabled={otpCode.length !== 6 || isProcessing}
                className="liquid-glass-btn h-11 w-full flex items-center justify-center gap-2 rounded-xl text-sm font-bold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isProcessing ? (
                  <><Loader2 className="h-4 w-4 animate-spin text-white" /> Verifying Code...</>
                ) : (
                  "Securely Sign Document"
                )}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || isResending}
                className="text-xs font-medium text-[#CCCCD9]/70 hover:text-white transition-colors disabled:opacity-50 disabled:hover:text-[#CCCCD9]/70"
              >
                {isResending ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <Loader2 className="h-3 w-3 animate-spin" /> Sending...
                  </span>
                ) : resendCooldown > 0 ? (
                  `Resend code in ${resendCooldown}s`
                ) : (
                  "Didn't receive a code? Resend"
                )}
              </button>
            </div>

            <p className="text-[9px] text-[#CCCCD9]/40 text-center mt-5 font-mono leading-tight px-4">
              By continuing, you agree to securely store your IP address and digital signature in our permanent record.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}