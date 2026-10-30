"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  ShieldAlert,
  Scale,
  Lock,
  Loader2,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  KeyRound,
  RotateCw,
  ArrowLeft,
} from "lucide-react";

export type HandshakeState = "reading" | "otp_requesting" | "otp_input" | "executing";

interface LegalConsentModalProps {
  onConsentSuccess?: () => void;
  hasSigned?: boolean;
  requiresReconsent?: boolean;
}

export function LegalConsentModal({
  onConsentSuccess,
  hasSigned = false,
  requiresReconsent = false,
}: LegalConsentModalProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [hasReachedBottom, setHasReachedBottom] = useState(false);
  const [isConsentChecked, setIsConsentChecked] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Phase 2.2 Asymmetric JIT Handshake State Machine
  const [handshakeState, setHandshakeState] = useState<HandshakeState>("reading");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(300);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const activeVersion = "1.0";

  // 1. Z-Index & Blocking: Intercept all keyboard escape attempts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    // Prevent background scrolling while modal is active
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
      document.body.style.overflow = "unset";
    };
  }, []);

  // 2. Native IntersectionObserver API (Mathematical Scroll Detection)
  useEffect(() => {
    if (handshakeState !== "reading") return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const targetMarker = document.getElementById("legal-eof-marker");
    if (!targetMarker) return;

    // Strict threshold: 1.0 ensures 100% of the EOF pixel line is inside viewport before unlocking
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          setHasReachedBottom(true);
        }
      },
      {
        root: container,
        threshold: 1.0,
      }
    );

    observer.observe(targetMarker);

    return () => {
      observer.disconnect();
    };
  }, [handshakeState]);

  // 3. JIT OTP Expiry Countdown & Resend Cooldown Timer
  useEffect(() => {
    if (handshakeState !== "otp_input") return;

    const timer = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });

      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [handshakeState]);

  // Format MM:SS for user timer
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Helper: Retrieve client access token
  const getAccessToken = () => {
    if (typeof window === "undefined") return "";
    return (
      sessionStorage.getItem("accessToken") ||
      sessionStorage.getItem("sb-access-token") ||
      ""
    );
  };

  // 4. Phase 2.2: Step 1 of Handshake - Request JIT OTP from Rust Auth Microservice
  const handleInitiateJitHandshake = async () => {
    if (!hasReachedBottom || !isConsentChecked || handshakeState !== "reading") {
      return;
    }

    setHandshakeState("otp_requesting");
    setErrorMessage(null);

    try {
      const accessToken = getAccessToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }

      const response = await fetch("/api/proxy/api/v1/auth/tos-jit/request", {
        method: "POST",
        headers,
        body: JSON.stringify({
          document_version: activeVersion,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(
          errData?.detail ||
            errData?.message ||
            "Failed to dispatch legal authorization code. Please retry."
        );
      }

      // Success: Slide into OTP Input mode
      setHandshakeState("otp_input");
      setCountdownSeconds(300); // 5-minute strict TTL
      setResendCooldown(30); // 30-second resend cooldown
      setOtpDigits(["", "", "", "", "", ""]);

      // Auto-focus first input box
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
    } catch (err: any) {
      console.error("[JIT OTP REQUEST ERROR]:", err);
      setErrorMessage(err?.message || "Failed to initiate verification handshake.");
      setHandshakeState("reading");
    }
  };

  // 5. Phase 2.2: Step 2 of Handshake - Verify JIT OTP with Rust and Execute Signature with Python
  const handleVerifyAndExecute = useCallback(
    async (codeToVerify: string) => {
      if (handshakeState === "executing" || isRevoking) return;

      setHandshakeState("executing");
      setErrorMessage(null);

      try {
        const accessToken = getAccessToken();
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (accessToken) {
          headers["Authorization"] = `Bearer ${accessToken}`;
        }

        // 1. Verify OTP with Rust Auth microservice to receive Asymmetric Ed25519 JIT Receipt
        const verifyResponse = await fetch("/api/proxy/api/v1/auth/tos-jit/verify", {
          method: "POST",
          headers,
          body: JSON.stringify({
            code: codeToVerify,
            active_version: activeVersion,
          }),
        });

        if (!verifyResponse.ok) {
          const verifyErr = await verifyResponse.json().catch(() => null);
          throw new Error(
            verifyErr?.detail ||
              verifyErr?.message ||
              "Invalid verification code. Please check your email and try again."
          );
        }

        const verifyData = await verifyResponse.json();
        const jitReceipt = verifyData.jit_receipt;

        if (!jitReceipt) {
          throw new Error("Invalid cryptographic receipt from authentication authority.");
        }

        // 2. Resolve client legal name from session storage
        let clientName = "Authorized Signatory";
        try {
          const rawUserData = sessionStorage.getItem("user-data");
          if (rawUserData) {
            const parsed = JSON.parse(rawUserData);
            if (parsed?.fullName || parsed?.full_name) {
              clientName = parsed.fullName || parsed.full_name;
            }
          }
        } catch {
          // Fallback default retained
        }

        // 3. Dispatch execution payload with JIT receipt to Python Legal Engine
        const executeResponse = await fetch("/api/proxy/api/v1/tos/execute", {
          method: "POST",
          headers,
          body: JSON.stringify({
            client_name: clientName,
            is_parental_consent: false,
            jit_receipt: jitReceipt,
          }),
        });

        if (!executeResponse.ok) {
          const execErr = await executeResponse.json().catch(() => null);
          throw new Error(
            execErr?.detail ||
              execErr?.message ||
              "Legal consent execution rejected by verification service."
          );
        }

        // Immediate unblock upon 200 OK
        setIsVisible(false);
        if (onConsentSuccess) {
          onConsentSuccess();
        }
      } catch (err: any) {
        console.error("[JIT VERIFY & EXECUTE ERROR]:", err);
        setErrorMessage(err?.message || "Verification failed. Please retry.");
        setHandshakeState("otp_input");
        setOtpDigits(["", "", "", "", "", ""]);
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      }
    },
    [handshakeState, isRevoking, onConsentSuccess]
  );

  // OTP Input event handlers
  const handleDigitChange = (index: number, val: string) => {
    const cleanDigit = val.replace(/\D/g, "").slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = cleanDigit;
    setOtpDigits(newDigits);

    // Auto-advance focus to next box
    if (cleanDigit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-trigger verification upon 6th digit entered
    if (cleanDigit && index === 5 && newDigits.every((d) => d !== "")) {
      const fullCode = newDigits.join("");
      handleVerifyAndExecute(fullCode);
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otpDigits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pastedData) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pastedData[i] || "";
    }
    setOtpDigits(newDigits);

    if (pastedData.length === 6) {
      handleVerifyAndExecute(pastedData);
    } else {
      const nextFocus = Math.min(pastedData.length, 5);
      inputRefs.current[nextFocus]?.focus();
    }
  };

  // 6. 'Decline & Exit' Pipeline: Nuclear Kill-Switch via Rust Auth Microservice
  const handleDeclineAndExit = async () => {
    if (handshakeState === "executing" || isRevoking) return;

    setIsRevoking(true);
    setErrorMessage(null);

    try {
      const accessToken = getAccessToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }

      // Fire cryptographic kill-switch request through proxy to Rust microservice
      const response = await fetch("/api/proxy/api/v1/auth/terminate-session", {
        method: "POST",
        headers,
      });

      if (!response.ok) {
        console.warn(
          "[KILL-SWITCH PROXY WARNING]: Direct termination endpoint returned non-200. Engaging failsafe."
        );
      }

      // Secondary server-side cookie purge via Next.js route handler
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ allDevices: true }),
        });
      } catch {
        // Continue to client wipe
      }
    } catch (err) {
      console.error("[KILL-SWITCH EXCEPTION]:", err);
    } finally {
      // Programmatically wipe all client-side authentication traces
      const cookiesToClear = ["sb-access-token", "accessToken", "sb-refresh-token", "refreshToken"];
      cookiesToClear.forEach((name) => {
        document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; SameSite=Lax`;
      });

      localStorage.clear();
      sessionStorage.clear();

      // Hard redirect to login gateway
      window.location.href = "/login";
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      className="w-screen h-screen fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 overflow-hidden select-none"
    >
      {/* Heavily blurred, darkened un-clickable backdrop */}
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-black/80 backdrop-blur-md pointer-events-auto"
      />

      {/* Modal Dialog Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-3xl rounded-2xl border border-indigo-500/30 bg-zinc-950/95 shadow-[0_0_50px_rgba(99,102,241,0.25)] flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* Header Component */}
        <div className="p-5 sm:p-6 border-b border-white/10 bg-gradient-to-r from-indigo-950/40 via-zinc-900/40 to-transparent">
          {/* Re-Consent Alert Banner */}
          {requiresReconsent && (
            <div className="mb-4 p-3.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-200 flex items-start gap-3 shadow-lg shadow-amber-500/10 animate-pulse">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-bold text-amber-300">
                  Action Required: Updated Terms of Service & Privacy Policy
                </p>
                <p className="text-xs text-amber-100/95 leading-relaxed">
                  We have updated our Legal Consent Agreement (Terms of Service & Privacy Policy).
                  To continue utilizing the HEAL-HER platform and ensure uninterrupted access to your
                  account, you must review and accept the latest version.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 mb-2">
            {requiresReconsent ? (
              <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/25">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                Re-Consent Required
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/25">
                <ShieldAlert className="w-3 h-3 text-indigo-400" />
                Mandatory Legal Enforcement
              </span>
            )}
            <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400 bg-zinc-800/60 px-2.5 py-0.5 rounded-full border border-white/5">
              2-in-1 Unified Covenant
            </span>
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/25">
              Ed25519 JIT
            </span>
          </div>

          <h2
            id="legal-modal-title"
            className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2"
          >
            <Scale className="w-5 h-5 text-indigo-400 flex-shrink-0" />
            Terms of Service & Privacy Protection Covenant
          </h2>

          <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed">
            {handshakeState === "otp_input" || handshakeState === "executing"
              ? "Zero-Trust Physical Presence Handshake: Enter the authorization code sent to your email to seal your legal agreement."
              : requiresReconsent
              ? "We have updated our Legal Consent Agreement. To continue using HEAL-HER, review and re-consent below."
              : "Welcome to HEAL-HER. To ensure your protection and legal compliance, please review and accept our Legal Consent Agreement."}
          </p>
        </div>

        {/* Modal Body - Animated State Machine */}
        <AnimatePresence mode="wait">
          {handshakeState === "reading" || handshakeState === "otp_requesting" ? (
            <motion.div
              key="reading-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              {/* The Legal Summary Viewport (Native Scrollwrap) */}
              <div
                ref={scrollContainerRef}
                tabIndex={0}
                aria-label="Scrollable Legal Agreement Summary"
                className="flex-1 overflow-y-auto max-h-[46vh] sm:max-h-[50vh] p-5 sm:p-6 space-y-5 text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans scrollbar-thin scrollbar-thumb-indigo-500/30 scrollbar-track-zinc-900 focus:outline-none"
              >
                {/* Executive Callout */}
                <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/30 p-4 text-xs text-indigo-200/90 space-y-1">
                  <p className="font-semibold text-indigo-100 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                    Cryptographic Audit Notice & Zero-Knowledge Architecture
                  </p>
                  <p>
                    By executing this agreement, a Just-in-Time (JIT) 6-digit OTP handshake will be
                    dispatched to your email. An asymmetric Ed25519 receipt will mathematically bind
                    your physical presence, and an immutable SHA-512 digest will be recorded in the
                    PostgreSQL audit ledger (<code className="text-indigo-300">tos_audit_ledger</code>).
                  </p>
                </div>

                {/* Section 1: Medical & Clinical Disclaimer */}
                <div className="space-y-1.5 border-l-2 border-amber-500/60 pl-3.5">
                  <h3 className="font-semibold text-amber-200 text-xs sm:text-sm uppercase tracking-wide">
                    1. Non-Clinical Advisory & Medical Data Processing
                  </h3>
                  <p className="text-zinc-300">
                    Heal Her is an autonomous safety, guidance, and emotional triage platform. It is{" "}
                    <strong>not</strong> an accredited medical hospital, psychiatric emergency room,
                    or licensed healthcare provider. Content produced by AI models represents
                    statistical guidance and must <strong>never</strong> substitute for formal medical
                    diagnosis or psychiatric treatment.
                  </p>
                </div>

                {/* Section 2: Zero-Knowledge Privacy Architecture */}
                <div className="space-y-1.5 border-l-2 border-indigo-500/60 pl-3.5">
                  <h3 className="font-semibold text-indigo-200 text-xs sm:text-sm uppercase tracking-wide">
                    2. Zero-Knowledge Encryption Standards & Data Siloing
                  </h3>
                  <p className="text-zinc-300">
                    In accordance with NDPR, GDPR, and international privacy treaties, user identity
                    credentials and conversational disclosures are held in mathematically isolated
                    cryptographic silos. At-rest data utilizes hardware-accelerated AES-256 block
                    ciphers. Heal Her maintains an absolute <strong>no-sale guarantee</strong>: your
                    data is never monetized or brokered.
                  </p>
                </div>

                {/* Section 3: Limitation of Liability */}
                <div className="space-y-1.5 border-l-2 border-rose-500/60 pl-3.5">
                  <h3 className="font-semibold text-rose-200 text-xs sm:text-sm uppercase tracking-wide">
                    3. Limitation of Liability & 10,000 NGN Monetary Cap
                  </h3>
                  <p className="text-zinc-300">
                    The service is supplied &quot;AS IS&quot; without express or implied warranties.
                    To the maximum extent permitted by law, liability is capped at cumulative amounts
                    paid over the preceding 60 days, or <strong>10,000 NGN</strong> (Ten Thousand
                    Nigerian Naira), whichever is less.
                  </p>
                </div>

                {/* Section 4: Minors & Parental Safeguards */}
                <div className="space-y-1.5 border-l-2 border-cyan-500/60 pl-3.5">
                  <h3 className="font-semibold text-cyan-200 text-xs sm:text-sm uppercase tracking-wide">
                    4. Minor Protections & AI Safe Harbor
                  </h3>
                  <p className="text-zinc-300">
                    Child-focused modules operate under strict COPPA and NDPR child safeguarding
                    guidelines. Behavioral profiling of minors is strictly barred. Direct accounts
                    for minors require verifiable parental consent.
                  </p>
                </div>

                {/* Section 5: Mandatory Arbitration */}
                <div className="space-y-1.5 border-l-2 border-emerald-500/60 pl-3.5">
                  <h3 className="font-semibold text-emerald-200 text-xs sm:text-sm uppercase tracking-wide">
                    5. Dispute Resolution & Statutory Right to Erasure
                  </h3>
                  <p className="text-zinc-300">
                    All controversies shall be submitted to confidential, binding arbitration in Jos,
                    Plateau State, Nigeria, conducted in English under the Arbitration and Mediation
                    Act of 2023. You retain the statutory right to petition for total account erasure.
                  </p>
                </div>

                {/* Hidden DOM marker targeted by IntersectionObserver at threshold 1.0 */}
                <div id="legal-eof-marker" className="h-1 w-full opacity-0 pointer-events-none" />
              </div>

              {/* Scroll Progress Status Indicator */}
              <div className="px-5 sm:px-6 py-2 bg-zinc-900/60 border-t border-white/5 flex items-center justify-between text-[11px]">
                {hasReachedBottom ? (
                  <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Document fully reviewed (Reading requirement verified)
                  </span>
                ) : (
                  <span className="text-amber-400/90 font-medium flex items-center gap-1.5 animate-pulse">
                    <ChevronDown className="w-3.5 h-3.5" />
                    Scroll to bottom to unlock consent acknowledgment
                  </span>
                )}
                <span className="text-zinc-500 font-mono">HH-TOS-2026-ENFORCE</span>
              </div>

              {/* Consent Checkbox */}
              <div className="p-5 sm:p-6 border-t border-white/10 bg-zinc-950 flex flex-col gap-4">
                <AnimatePresence>
                  {hasReachedBottom && (
                    <motion.div
                      key="consent-checkbox-container"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-3.5"
                    >
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={isConsentChecked}
                          onChange={(e) => setIsConsentChecked(e.target.checked)}
                          disabled={handshakeState === "otp_requesting" || isRevoking}
                          className="mt-0.5 h-4 w-4 rounded border-indigo-400/50 bg-zinc-900 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-zinc-950 cursor-pointer disabled:opacity-50"
                        />
                        <span className="text-xs sm:text-sm font-medium text-zinc-200 group-hover:text-white transition-colors leading-relaxed">
                          I confirm that I have scrolled through, read, and fully comprehend the legal
                          summary. I hereby agree to be legally bound by the comprehensive 2-in-1 Terms
                          of Service and Privacy Policy.
                        </span>
                      </label>
                    </motion.div>
                  )}
                </AnimatePresence>

                {errorMessage && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Footer Buttons */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleDeclineAndExit}
                    disabled={handshakeState === "otp_requesting" || isRevoking}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRevoking ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
                        <span>Terminating Session...</span>
                      </>
                    ) : (
                      <span>Decline & Exit</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleInitiateJitHandshake}
                    disabled={
                      !hasReachedBottom ||
                      !isConsentChecked ||
                      handshakeState === "otp_requesting" ||
                      isRevoking
                    }
                    className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white transition-all duration-200 shadow-lg ${
                      hasReachedBottom &&
                      isConsentChecked &&
                      handshakeState !== "otp_requesting" &&
                      !isRevoking
                        ? "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30 hover:shadow-indigo-600/50 cursor-pointer"
                        : "bg-indigo-900/50 text-indigo-300/40 border border-indigo-500/20 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    {handshakeState === "otp_requesting" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Dispatching Authorization Code...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Accept & Verify Presence</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : handshakeState === "otp_input" ? (
            <motion.div
              key="otp-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-6 flex-1"
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-500/10">
                <KeyRound className="w-7 h-7 text-indigo-400" />
              </div>

              <div className="space-y-2 max-w-md">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Enter 6-Digit Authorization Code
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  We have dispatched a single-use authorization code to your registered email. Enter
                  it below to cryptographically bind your legal consent.
                </p>
              </div>

              {/* 6-Digit OTP Input Grid */}
              <div className="flex items-center justify-center gap-2 sm:gap-3 my-2">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    pattern="[0-9]*"
                    autoComplete="one-time-code"
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                    onPaste={handleDigitPaste}
                    className="w-10 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-mono font-bold text-white bg-zinc-900 border-2 border-indigo-500/40 rounded-xl focus:border-indigo-400 focus:bg-zinc-800/80 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all duration-150 shadow-inner"
                  />
                ))}
              </div>

              {/* Timer & Resend Controls */}
              <div className="flex flex-col sm:flex-row items-center gap-3 text-xs text-zinc-400">
                <div className="flex items-center gap-1.5 font-mono">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      countdownSeconds > 30 ? "bg-emerald-400 animate-pulse" : "bg-rose-400 animate-ping"
                    }`}
                  />
                  <span>
                    Expires in:{" "}
                    <strong
                      className={countdownSeconds <= 30 ? "text-rose-400 font-bold" : "text-zinc-200"}
                    >
                      {formatTimer(countdownSeconds)}
                    </strong>
                  </span>
                </div>

                <span className="hidden sm:inline text-zinc-600">•</span>

                <button
                  type="button"
                  onClick={handleInitiateJitHandshake}
                  disabled={resendCooldown > 0}
                  className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                  </span>
                </button>
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs max-w-md w-full text-left">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Navigation & Decline Actions */}
              <div className="w-full flex items-center justify-between pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setHandshakeState("reading");
                    setErrorMessage(null);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Review Agreement</span>
                </button>

                <button
                  type="button"
                  onClick={handleDeclineAndExit}
                  disabled={isRevoking}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/30 transition-all disabled:opacity-50"
                >
                  <span>Decline & Exit</span>
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="executing-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-6 flex-1"
            >
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.3)] animate-pulse">
                  <ShieldCheck className="w-10 h-10 text-indigo-400" />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
              </div>

              <div className="space-y-2 max-w-md">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Cryptographically Sealing Legal Agreement
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Verifying Asymmetric Ed25519 receipt, generating SHA-512 non-repudiation digest,
                  and committing immutable record to the audit ledger...
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-mono text-indigo-300">
                <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
                <span>Zero-Trust Verification in Progress</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
