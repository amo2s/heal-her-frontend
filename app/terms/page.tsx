"use client"

import React, { useState, useEffect, useRef } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import LegalTermsDocument, { SignaturePayload } from "@/components/legal/terms"
import { Loader2, ShieldCheck, X, MailCheck } from "lucide-react"

const GRAPHQL_ENDPOINT = "api/proxy/graphql"

// Masks an email for display so the modal never echoes the full address back on-screen.
function maskEmail(email: string): string {
  const [user, domain] = email.split("@")
  if (!user || !domain) return email
  const visible = user.slice(0, Math.min(2, user.length))
  return `${visible}${"•".repeat(Math.max(user.length - 2, 3))}@${domain}`
}

export default function TermsPage() {
  const [isProcessing, setIsProcessing] = useState(false)

  const [showOtpModal, setShowOtpModal] = useState(false)
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(""))
  const [otpError, setOtpError] = useState("")
  const [isShaking, setIsShaking] = useState(false)

  const [resendCooldown, setResendCooldown] = useState(0)
  const [isResending, setIsResending] = useState(false)

  const [pendingPayload, setPendingPayload] = useState<SignaturePayload | null>(null)

  // One ref per digit box, used to drive auto-advance/auto-focus without extra state.
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const otpCode = otpDigits.join("")

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => setResendCooldown((prev) => prev - 1), 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  // Autofocus the first box the instant the modal mounts.
  useEffect(() => {
    if (showOtpModal) inputRefs.current[0]?.focus()
  }, [showOtpModal])

  const triggerShake = () => {
    setIsShaking(true)
    setTimeout(() => setIsShaking(false), 500)
  }

  const resetOtpDigits = () => setOtpDigits(Array(6).fill(""))

  // Handles a single digit typed into one box, then jumps focus to the next.
  const handleDigitChange = (index: number, value: string) => {
    const digit = value.replace(/[^0-9]/g, "").slice(-1)
    setOtpDigits((prev) => {
      const next = [...prev]
      next[index] = digit
      return next
    })
    setOtpError("")
    if (digit && index < 5) inputRefs.current[index + 1]?.focus()
  }

  // Backspace on an empty box steps focus back instead of getting stuck.
  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  // Lets a user paste the full 6-digit code from their inbox in one action.
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6)
    if (!pasted) return
    e.preventDefault()
    const next = Array(6).fill("")
    pasted.split("").forEach((char, i) => (next[i] = char))
    setOtpDigits(next)
    inputRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  // --- STEP 1: REQUEST OTP ---
  const handleDocumentExecution = async (payload: SignaturePayload) => {
    setIsProcessing(true)
    setOtpError("")

    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            mutation RequestSignatureOtp($email: String!, $name: String!, $minorName: String, $minorAge: Int) {
              requestLegalSignatureOtp(email: $email, name: $name, minorName: $minorName, minorAge: $minorAge)
            }
          `,
          variables: {
            email: payload.clientEmail,
            name: payload.clientName,
            minorName: payload.minorName || null,
            minorAge: payload.minorAge ? Number(payload.minorAge) : null
          }
        })
      })

      const result = await response.json()

      if (result.errors) throw new Error(result.errors[0].message)

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
    resetOtpDigits()

    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            mutation RequestSignatureOtp($email: String!, $name: String!, $minorName: String, $minorAge: Int) {
              requestLegalSignatureOtp(email: $email, name: $name, minorName: $minorName, minorAge: $minorAge)
            }
          `,
          variables: {
            email: pendingPayload.clientEmail,
            name: pendingPayload.clientName,
            minorName: pendingPayload.minorName || null,
            minorAge: pendingPayload.minorAge ? Number(pendingPayload.minorAge) : null
          }
        })
      })

      const result = await response.json()

      if (result.errors) {
        const err = result.errors[0]
        if (err.extensions?.retry_after_seconds) setResendCooldown(err.extensions.retry_after_seconds)
        throw new Error(err.message)
      }

      if (result.data?.requestLegalSignatureOtp) {
        setResendCooldown(60)
        setOtpError("A new code has been sent.")
        setTimeout(() => setOtpError(""), 3000)
        inputRefs.current[0]?.focus()
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
    setOtpError("")

    try {
      // Client-side IP is only a convenience hint — the backend proxy resolves the real one.
      let clientIp = "Unknown-IP"
      try {
        const ipRes = await fetch("https://api.ipify.org?format=json")
        const ipData = await ipRes.json()
        clientIp = ipData.ip
      } catch (e) {
        console.warn("Could not resolve IP address, using fallback.")
      }

      // name/minorName/minorAge are deliberately absent — step 2 trusts only the locked payload from step 1.
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            mutation ExecuteSignature($email: String!, $otpCode: String!, $ipAddress: String!) {
              executeDocumentSignature(email: $email, otpCode: $otpCode, ipAddress: $ipAddress) {
                status
                message
                documentHash
                storageUrl
              }
            }
          `,
          variables: {
            email: pendingPayload.clientEmail,
            otpCode: otpCode,
            ipAddress: clientIp
          }
        })
      })

      const result = await response.json()

      if (result.errors) {
        const err = result.errors[0]
        if (err.extensions?.retry_after_seconds) setResendCooldown(err.extensions.retry_after_seconds)
        throw new Error(err.message)
      }

      const executionData = result.data?.executeDocumentSignature

      if (executionData?.status === "success") {
        setShowOtpModal(false)
        resetOtpDigits()
        setPendingPayload(null)
        setResendCooldown(0)

        if (executionData.storageUrl) window.open(executionData.storageUrl, "_blank")

        alert("Success! Your document has been securely signed and saved.")
      } else {
        setOtpError(executionData?.message || "Invalid or expired code.")
        resetOtpDigits()
        triggerShake()
        inputRefs.current[0]?.focus()
      }
    } catch (error: any) {
      console.error("Step 2 Execution Error:", error)
      setOtpError(error.message || "An error occurred during verification.")
      resetOtpDigits()
      triggerShake()
      inputRefs.current[0]?.focus()
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1C1246] relative">
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
        .otp-box:focus { transform: translateY(-2px); }
      `}} />

      <Navigation />

      <main className="pt-10 pb-24">
        <div className="max-w-6xl mx-auto">
          <LegalTermsDocument onExecuteSignature={handleDocumentExecution} isProcessing={isProcessing} />
        </div>
      </main>

      <Footer />

      {/* --- OTP SECURE MODAL --- */}
      {showOtpModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0F0A26]/80 backdrop-blur-md animate-in fade-in duration-300">
          <div
            className={`bg-[#1C1246] border border-[#DA8CA0]/30 rounded-2xl w-full max-w-sm p-6 relative shadow-[0_0_40px_rgba(218,140,160,0.15)] transition-all duration-300 ease-out ${
              isShaking ? "animate-shake border-rose-500/50" : "animate-in zoom-in-95 fade-in"
            }`}
          >
            <button
              onClick={() => {
                setShowOtpModal(false)
                resetOtpDigits()
                setResendCooldown(0)
              }}
              className="absolute top-4 right-4 text-[#CCCCD9]/60 hover:text-white transition-colors"
              aria-label="Close verification modal"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col items-center text-center mb-6 mt-2">
              <div className="h-11 w-11 bg-[#DA8CA0]/10 rounded-full flex items-center justify-center mb-3 border border-[#DA8CA0]/20">
                <ShieldCheck className="h-5 w-5 text-[#DA8CA0]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1.5">Security Verification</h3>
              <div className="text-xs text-[#CCCCD9] leading-relaxed px-2 space-y-1.5">
                {/* Shows the masked address so the user can confirm it's the right inbox without full exposure. */}
                <p className="flex items-center justify-center gap-1.5 text-[#CCCCD9]/80">
                  <MailCheck className="h-3.5 w-3.5 text-[#DA8CA0]/70" />
                  Code sent to {pendingPayload ? maskEmail(pendingPayload.clientEmail) : "your email"}
                </p>
                {pendingPayload?.minorName && (
                  <p className="text-[#DA8CA0]">
                    Verifying as legal guardian of <strong>{pendingPayload.minorName}</strong>
                  </p>
                )}
              </div>
            </div>

            <form onSubmit={handleOtpSubmit} className="space-y-5">
              {/* Six independent boxes replace the single masked input for a clearer, faster entry flow. */}
              <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    disabled={isProcessing}
                    onChange={(e) => handleDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleDigitKeyDown(index, e)}
                    className={`otp-box w-11 h-13 py-2 bg-[#231854] border ${
                      otpError && otpError !== "A new code has been sent." ? "border-rose-500/50" : "border-[#DA8CA0]/30"
                    } rounded-xl text-center text-xl text-white font-mono focus:outline-none focus:border-[#DA8CA0] focus:shadow-[0_0_12px_rgba(218,140,160,0.25)] transition-all duration-200 disabled:opacity-50`}
                  />
                ))}
              </div>

              {otpError && (
                <p
                  className={`text-xs text-center font-medium ${
                    otpError === "A new code has been sent." ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {otpError}
                </p>
              )}

              <button
                type="submit"
                disabled={otpCode.length !== 6 || isProcessing}
                className="liquid-glass-btn h-11 w-full flex items-center justify-center gap-2 rounded-xl text-sm font-bold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" /> Verifying Code...
                  </>
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