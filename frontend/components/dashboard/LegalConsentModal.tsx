"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ShieldAlert, Scale, Lock, Loader2, AlertCircle, CheckCircle2, ChevronDown } from "lucide-react";

interface LegalConsentModalProps {
  onConsentSuccess?: () => void;
}

export function LegalConsentModal({ onConsentSuccess }: LegalConsentModalProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [hasReachedBottom, setHasReachedBottom] = useState(false);
  const [isConsentChecked, setIsConsentChecked] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
  }, []);

  // 3. 'Accept & Sign' Pipeline: Optimistic UI & Python Legal Engine Dispatch
  const handleAcceptAndSign = async () => {
    // Mathematical impossibility guard
    if (!hasReachedBottom || !isConsentChecked || isProcessing || isRevoking) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Resolve client identity from session storage or fallback
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

      const accessToken =
        sessionStorage.getItem("accessToken") ||
        sessionStorage.getItem("sb-access-token") ||
        "";

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }

      // Execute signature request through Next.js proxy to Python Legal Consent Microservice
      const response = await fetch("/api/proxy/api/v1/tos/execute", {
        method: "POST",
        headers,
        body: JSON.stringify({
          client_name: clientName,
          is_parental_consent: false,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.detail || errData?.message || "Legal execution rejected by microservice.");
      }

      // Event-Driven Decoupling: Immediate unblock as soon as 200 OK is returned
      setIsVisible(false);
      if (onConsentSuccess) {
        onConsentSuccess();
      }
    } catch (err: any) {
      console.error("[LEGAL ENFORCEMENT ERROR]:", err);
      setErrorMessage(err?.message || "Failed to seal legal agreement. Please retry.");
      setIsProcessing(false);
    }
  };

  // 4. 'Decline & Exit' Pipeline: Nuclear Kill-Switch via Rust Auth Microservice
  const handleDeclineAndExit = async () => {
    if (isProcessing || isRevoking) return;

    setIsRevoking(true);
    setErrorMessage(null);

    try {
      const accessToken =
        sessionStorage.getItem("accessToken") ||
        sessionStorage.getItem("sb-access-token") ||
        "";

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
        console.warn("[KILL-SWITCH PROXY WARNING]: Direct termination endpoint returned non-200. Engaging failsafe.");
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
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/25">
              <ShieldAlert className="w-3 h-3 text-indigo-400" />
              Mandatory Legal Enforcement
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400 bg-zinc-800/60 px-2.5 py-0.5 rounded-full border border-white/5">
              2-in-1 Unified Covenant
            </span>
          </div>

          <h2 id="legal-modal-title" className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Scale className="w-5 h-5 text-indigo-400 flex-shrink-0" />
            Terms of Service & Privacy Protection Covenant
          </h2>

          <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed">
            To maintain cryptographic audit compliance and safeguard your sensitive health data, you must review and execute this unified instrument before continuing to your dashboard.
          </p>
        </div>

        {/* The Legal Summary Viewport (Native Scrollwrap) */}
        <div
          ref={scrollContainerRef}
          tabIndex={0}
          aria-label="Scrollable Legal Agreement Summary"
          className="flex-1 overflow-y-auto max-h-[50vh] sm:max-h-[55vh] p-5 sm:p-6 space-y-5 text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans scrollbar-thin scrollbar-thumb-indigo-500/30 scrollbar-track-zinc-900 focus:outline-none"
        >
          {/* Executive Callout */}
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/30 p-4 text-xs text-indigo-200/90 space-y-1">
            <p className="font-semibold text-indigo-100 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
              Cryptographic Audit Notice & Zero-Knowledge Architecture
            </p>
            <p>
              By executing this agreement, an immutable SHA-512 digest will be calculated in volatile RAM, recorded in the PostgreSQL audit ledger (<code className="text-indigo-300">tos_audit_ledger</code>), and vaulted to Supabase with AES-256 encryption.
            </p>
          </div>

          {/* Section 1: Medical & Clinical Disclaimer */}
          <div className="space-y-1.5 border-l-2 border-amber-500/60 pl-3.5">
            <h3 className="font-semibold text-amber-200 text-xs sm:text-sm uppercase tracking-wide">
              1. Non-Clinical Advisory & Medical Data Processing
            </h3>
            <p className="text-zinc-300">
              Heal Her is an autonomous safety, guidance, and emotional triage platform. It is <strong>not</strong> an accredited medical hospital, psychiatric emergency room, or licensed healthcare provider. Content produced by AI models and conversational triage represents statistical guidance and must <strong>never</strong> substitute for formal medical diagnosis or psychiatric treatment. Interacting with the platform does not create a physician-patient relationship.
            </p>
          </div>

          {/* Section 2: Zero-Knowledge Privacy Architecture */}
          <div className="space-y-1.5 border-l-2 border-indigo-500/60 pl-3.5">
            <h3 className="font-semibold text-indigo-200 text-xs sm:text-sm uppercase tracking-wide">
              2. Zero-Knowledge Encryption Standards & Data Siloing
            </h3>
            <p className="text-zinc-300">
              In accordance with NDPR, GDPR, and international privacy treaties, user identity credentials and conversational disclosures are held in mathematically isolated cryptographic silos ("Iron Wall" architecture). In-transit data traverses TLS 1.3 tunnels, while at-rest data utilizes hardware-accelerated AES-256 block ciphers. Heal Her maintains an absolute <strong>no-sale guarantee</strong>: your personal identity, biometric cycle telemetry, and chat transcripts are never monetized, brokered, or leveraged for third-party commercial profiling.
            </p>
          </div>

          {/* Section 3: Limitation of Liability & 10,000 NGN Cap */}
          <div className="space-y-1.5 border-l-2 border-rose-500/60 pl-3.5">
            <h3 className="font-semibold text-rose-200 text-xs sm:text-sm uppercase tracking-wide">
              3. Limitation of Liability & 10,000 NGN Monetary Cap
            </h3>
            <p className="text-zinc-300">
              The service is supplied on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without express or implied warranties. To the maximum extent permitted under applicable law, in no event shall Heal Her, its executive directors, or its affiliates be liable for direct, indirect, punitive, or consequential damages exceeding the cumulative amount paid by the user over the preceding 60 days, or <strong>10,000 NGN</strong> (Ten Thousand Nigerian Naira), whichever is less.
            </p>
          </div>

          {/* Section 4: Minors & Parental Safeguards */}
          <div className="space-y-1.5 border-l-2 border-cyan-500/60 pl-3.5">
            <h3 className="font-semibold text-cyan-200 text-xs sm:text-sm uppercase tracking-wide">
              4. Minor Protections & AI Safe Harbor
            </h3>
            <p className="text-zinc-300">
              Interactions in our child-focused modules (AI Buddy) operate under strict COPPA and NDPR child safeguarding guidelines. Behavioral profiling of minors is strictly barred. Direct accounts for minors require verifiable parental or legal guardian consent logged in the compliance ledger.
            </p>
          </div>

          {/* Section 5: Mandatory Arbitration & Erasure Rights */}
          <div className="space-y-1.5 border-l-2 border-emerald-500/60 pl-3.5">
            <h3 className="font-semibold text-emerald-200 text-xs sm:text-sm uppercase tracking-wide">
              5. Dispute Resolution & Statutory Right to Erasure
            </h3>
            <p className="text-zinc-300">
              All controversies stemming from this agreement shall be submitted to confidential, binding arbitration in Jos, Plateau State, Nigeria, conducted in English under the Arbitration and Mediation Act of 2023. You retain the non-negotiable statutory right to petition for total account and profile record erasure, executing a permanent cryptographic purge across our database clusters.
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

        {/* Step 3: Double-Blind Consent Checkbox (Rendered dynamically via Framer Motion) */}
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
                    disabled={isProcessing || isRevoking}
                    className="mt-0.5 h-4 w-4 rounded border-indigo-400/50 bg-zinc-900 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-zinc-950 cursor-pointer disabled:opacity-50"
                  />
                  <span className="text-xs sm:text-sm font-medium text-zinc-200 group-hover:text-white transition-colors leading-relaxed">
                    I confirm that I have scrolled through, read, and fully comprehend the legal summary. I hereby agree to be legally bound by the comprehensive 2-in-1 Terms of Service and Privacy Policy.
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

          {/* Action Buttons Footer */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={handleDeclineAndExit}
              disabled={isProcessing || isRevoking}
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
              onClick={handleAcceptAndSign}
              disabled={!hasReachedBottom || !isConsentChecked || isProcessing || isRevoking}
              className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white transition-all duration-200 shadow-lg ${
                hasReachedBottom && isConsentChecked && !isProcessing && !isRevoking
                  ? "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30 hover:shadow-indigo-600/50 cursor-pointer"
                  : "bg-indigo-900/50 text-indigo-300/40 border border-indigo-500/20 opacity-50 cursor-not-allowed"
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Cryptographically Signing...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Accept & Sign</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

