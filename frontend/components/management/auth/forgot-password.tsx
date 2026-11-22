"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Clock,
  KeyRound,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  confirmManagementPasswordReset,
  requestManagementPasswordReset,
  validateManagementResetConfirmInput,
  validateManagementResetEmail,
  validateManagementResetOtp,
  validatePasswordEntropy,
  verifyManagementPasswordResetOtp,
} from "@/lib/management-governance";

type Step = 1 | 2 | 3 | "success";

interface StatusMessageProps {
  type: "success" | "error" | "warning";
  message: string;
  onClose?: () => void;
}

const StatusMessage: React.FC<StatusMessageProps> = ({ type, message, onClose }) => (
  <motion.div
    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
    animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
    className={cn(
      "overflow-hidden flex items-start gap-3 p-3.5 rounded-xl border backdrop-blur-md shadow-lg text-xs leading-relaxed",
      type === "success" && "bg-emerald-500/10 border-emerald-500/20 text-emerald-200",
      type === "error" && "bg-red-500/10 border-red-500/20 text-red-200",
      type === "warning" && "bg-amber-500/10 border-amber-500/20 text-amber-200"
    )}
  >
    <div
      className={cn(
        "p-1.5 rounded-full shrink-0 mt-0.5",
        type === "success" && "bg-emerald-500/20",
        type === "error" && "bg-red-500/20",
        type === "warning" && "bg-amber-500/20"
      )}
    >
      {type === "success" && <CheckCircle2 className="h-3.5 w-3.5" />}
      {type === "error" && <AlertCircle className="h-3.5 w-3.5" />}
      {type === "warning" && <ShieldAlert className="h-3.5 w-3.5" />}
    </div>
    <div className="flex-1">
      <p className="font-medium">{message}</p>
    </div>
    {onClose && (
      <button
        type="button"
        onClick={onClose}
        className="text-white/40 hover:text-white transition-colors p-0.5 -mr-1"
        aria-label="Dismiss message"
      >
        <span className="text-base leading-none">×</span>
      </button>
    )}
  </motion.div>
);

export default function ManagementForgotPassword() {
  const router = useRouter();

  // Current wizard step
  const [step, setStep] = useState<Step>(1);

  // Form inputs
  const [email, setEmail] = useState("");
  const [botTrap, setBotTrap] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Show/Hide password toggles
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & error feedback
  const [status, setStatus] = useState<{
    type: "success" | "error" | "warning";
    message: string;
  } | null>(null);

  // Synchronous double-submit lock & UI loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inFlightRef = useRef(false);

  // Ephemeral Reset Token in React component memory ONLY (never in storage, URL, or cookies)
  const resetTokenRef = useRef<string | null>(null);
  const [hasToken, setHasToken] = useState(false);

  // Timers
  const [resendCooldown, setResendCooldown] = useState(0);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(300); // 5 minutes (300s)

  // Unmount cleanup: wipe all tokens and passwords immediately
  useEffect(() => {
    return () => {
      resetTokenRef.current = null;
    };
  }, []);

  // 60-second Resend OTP Cooldown Timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // 5-minute (300s) Reset Session Countdown Timer in Step 3
  useEffect(() => {
    if (step !== 3 || !hasToken) return;

    const interval = setInterval(() => {
      setSessionTimeLeft((prev) => {
        if (prev <= 1) {
          // Token expired! Wipe from memory and kick back to Step 1
          resetTokenRef.current = null;
          setHasToken(false);
          setOtp("");
          setNewPassword("");
          setConfirmPassword("");
          setStep(1);
          setStatus({
            type: "warning",
            message: "Authorization window expired. Please request a new verification code.",
          });
          return 300;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step, hasToken]);

  // Password Complexity Checklist (Live Synchronization with validatePasswordEntropy)
  const passwordChecks = useMemo(() => {
    return {
      length: newPassword.length >= 8 && newPassword.length <= 128,
      upper: /[A-Z]/.test(newPassword),
      lower: /[a-z]/.test(newPassword),
      digit: /[0-9]/.test(newPassword),
      special: /[^A-Za-z0-9]/.test(newPassword),
      match: newPassword.length > 0 && newPassword === confirmPassword,
      noControl: !/[\x00-\x1F\x7F]/.test(newPassword),
    };
  }, [newPassword, confirmPassword]);

  const isPasswordValid = useMemo(() => {
    return (
      passwordChecks.length &&
      passwordChecks.upper &&
      passwordChecks.lower &&
      passwordChecks.digit &&
      passwordChecks.special &&
      passwordChecks.match &&
      passwordChecks.noControl
    );
  }, [passwordChecks]);

  // --------------------------------------------------------------------------
  // STEP 1: REQUEST OTP
  // --------------------------------------------------------------------------
  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (inFlightRef.current || isSubmitting) return;

    setStatus(null);

    const emailVal = validateManagementResetEmail(email);
    if (!emailVal.isValid || !emailVal.sanitized) {
      setStatus({
        type: "error",
        message: emailVal.error || "Please enter a valid work email address.",
      });
      return;
    }

    inFlightRef.current = true;
    setIsSubmitting(true);

    try {
      const res = await requestManagementPasswordReset({
        email: emailVal.sanitized,
        botTrap: botTrap || undefined,
      });

      if (res.ok) {
        setEmail(emailVal.sanitized);
        setStep(2);
        setResendCooldown(60);
        setStatus({
          type: "success",
          message:
            "If an eligible management account matches this email, a 6-digit verification code has been dispatched.",
        });
      } else {
        if (res.error.code === "RATE_LIMITED") {
          setStatus({
            type: "warning",
            message: res.error.message || "Too many reset attempts. Please wait 10 minutes before trying again.",
          });
        } else {
          setStatus({
            type: "error",
            message: res.error.message || "Unable to process password reset request.",
          });
        }
      }
    } catch {
      setStatus({
        type: "error",
        message: "Network error encountered. Please check your connection and retry.",
      });
    } finally {
      inFlightRef.current = false;
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------------------------------
  // STEP 2: VERIFY OTP
  // --------------------------------------------------------------------------
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inFlightRef.current || isSubmitting) return;

    setStatus(null);

    const otpVal = validateManagementResetOtp(otp);
    if (!otpVal.isValid || !otpVal.sanitized) {
      setStatus({
        type: "error",
        message: otpVal.error || "Please enter the complete 6-digit verification code.",
      });
      return;
    }

    inFlightRef.current = true;
    setIsSubmitting(true);

    try {
      const res = await verifyManagementPasswordResetOtp({
        email,
        otp: otpVal.sanitized,
      });

      if (res.ok) {
        // Ephemeral in-memory storage only
        resetTokenRef.current = res.data.resetToken;
        setHasToken(true);
        setOtp(""); // Immediately wipe OTP code from state
        setSessionTimeLeft(res.data.expiresInSeconds || 300);
        setStep(3);
        setStatus(null);
      } else {
        if (res.error.code === "ACCOUNT_LOCKED") {
          setStatus({
            type: "error",
            message: "Too many failed attempts. Account recovery locked for 15 minutes.",
          });
        } else if (res.error.code === "INVALID_OTP") {
          setOtp(""); // Clear wrong OTP for clean retry
          setStatus({
            type: "error",
            message: "Invalid or expired verification code. Please check and retry.",
          });
        } else {
          setStatus({
            type: "error",
            message: res.error.message || "Verification failed. Please retry.",
          });
        }
      }
    } catch {
      setStatus({
        type: "error",
        message: "Network error during verification. Please retry.",
      });
    } finally {
      inFlightRef.current = false;
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------------------------------
  // STEP 3: CONFIRM NEW PASSWORD
  // --------------------------------------------------------------------------
  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inFlightRef.current || isSubmitting) return;

    setStatus(null);

    const resetToken = resetTokenRef.current;
    if (!resetToken) {
      setStatus({
        type: "error",
        message: "Authorization token missing or expired. Please restart the recovery flow.",
      });
      setStep(1);
      return;
    }

    const validation = validateManagementResetConfirmInput({
      email,
      resetToken,
      newPassword,
      confirmPassword,
    });

    if (!validation.isValid || !validation.sanitized) {
      setStatus({
        type: "error",
        message: validation.error || "Password does not meet complexity requirements.",
      });
      return;
    }

    inFlightRef.current = true;
    setIsSubmitting(true);

    try {
      const res = await confirmManagementPasswordReset({
        email,
        resetToken: validation.sanitized.resetToken,
        newPassword: validation.sanitized.newPassword,
        confirmPassword: validation.sanitized.newPassword,
      });

      // Immediate memory wipe
      resetTokenRef.current = null;
      setHasToken(false);
      setNewPassword("");
      setConfirmPassword("");

      if (res.ok) {
        setStep("success");
      } else {
        if (res.error.code === "TOKEN_EXPIRED") {
          setStatus({
            type: "warning",
            message: "Your reset session has expired. Please request a new verification code.",
          });
          setStep(1);
        } else if (res.error.code === "FORBIDDEN") {
          setStatus({
            type: "error",
            message: "Account status has changed or is not eligible for self-service reset.",
          });
        } else {
          setStatus({
            type: "error",
            message: res.error.message || "Failed to update password. Please retry.",
          });
        }
      }
    } catch {
      setStatus({
        type: "error",
        message: "Network error while saving password. Please retry.",
      });
    } finally {
      inFlightRef.current = false;
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------------------------------
  // STEP HELPERS & RESETS
  // --------------------------------------------------------------------------
  const handleChangeEmail = () => {
    setOtp("");
    resetTokenRef.current = null;
    setHasToken(false);
    setStatus(null);
    setStep(1);
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="w-full">
      {/* 3-Step Visual Progress Bar */}
      {step !== "success" && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2">
            <span className={cn(step >= 1 ? "text-[#DA8CA0]" : "")}>1. Email</span>
            <span className={cn(step >= 2 ? "text-[#DA8CA0]" : "")}>2. Code</span>
            <span className={cn(step >= 3 ? "text-[#DA8CA0]" : "")}>3. Password</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 h-1">
            <div
              className={cn(
                "rounded-full transition-all duration-300",
                step >= 1 ? "bg-[#DA8CA0]" : "bg-white/10"
              )}
            />
            <div
              className={cn(
                "rounded-full transition-all duration-300",
                step >= 2 ? "bg-[#DA8CA0]" : "bg-white/10"
              )}
            />
            <div
              className={cn(
                "rounded-full transition-all duration-300",
                step >= 3 ? "bg-[#DA8CA0]" : "bg-white/10"
              )}
            />
          </div>
        </div>
      )}

      {/* Global Status Banner */}
      <AnimatePresence>
        {status && (
          <StatusMessage
            type={status.type}
            message={status.message}
            onClose={() => setStatus(null)}
          />
        )}
      </AnimatePresence>

      {/* =================================================================== */}
      {/* STEP 1: WORK EMAIL INPUT                                            */}
      {/* =================================================================== */}
      {step === 1 && (
        <form onSubmit={handleRequestOtp} className="space-y-4">
          {/* Honeypot Bot Trap (invisible to humans) */}
          <div className="sr-only" aria-hidden="true">
            <input
              type="text"
              name="botTrap"
              value={botTrap}
              onChange={(e) => setBotTrap(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">
              Work Email Address
            </label>
            <div className="relative group transition-all duration-300 rounded-xl border border-white/5 hover:border-white/10 bg-black/20 focus-within:border-[#DA8CA0] focus-within:ring-1 focus-within:ring-[#DA8CA0]/20">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#DA8CA0] transition-colors">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                name="email"
                required
                placeholder="staff@healher.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full bg-transparent text-white placeholder:text-white/10 px-12 py-3.5 rounded-xl outline-none text-sm font-medium"
              />
            </div>
          </div>

          {/* Calm Helper Copy */}
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-[#8F8FA3] leading-relaxed">
            <p>
              Recovery authorization codes are issued strictly to approved, active management
              operators. Pending, unapproved, or deactivated accounts cannot complete password
              reset.
            </p>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !email.trim()}
            className={cn(
              "w-full h-12 font-bold text-sm rounded-xl transition-all uppercase tracking-[0.2em]",
              email.trim()
                ? "bg-[#DA8CA0] hover:bg-[#c76b85] text-[#1C1246] shadow-[0_8px_30px_rgb(218,140,160,0.2)]"
                : "bg-white/5 text-white/20 cursor-not-allowed border border-white/5 hover:bg-white/5"
            )}
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin mx-auto text-[#1C1246]" />
            ) : (
              <span className="flex items-center justify-center gap-2">
                Send Recovery Code <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>

          <div className="text-center pt-2">
            <Link
              href="/management/auth/login"
              className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Back to Management Login</span>
            </Link>
          </div>
        </form>
      )}

      {/* =================================================================== */}
      {/* STEP 2: 6-DIGIT OTP VERIFICATION                                    */}
      {/* =================================================================== */}
      {step === 2 && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="flex items-center justify-between px-1 text-xs">
            <span className="text-white/40 text-[10px] uppercase tracking-wider font-bold">
              Target Operator
            </span>
            <button
              type="button"
              onClick={handleChangeEmail}
              className="text-[#DA8CA0] hover:underline text-[11px]"
            >
              Change Email
            </button>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-white/80 font-mono truncate">
            {email}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">
              6-Digit Security Code
            </label>
            <div className="relative group transition-all duration-300 rounded-xl border border-white/5 hover:border-white/10 bg-black/20 focus-within:border-[#DA8CA0] focus-within:ring-1 focus-within:ring-[#DA8CA0]/20">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#DA8CA0] transition-colors">
                <KeyRound className="h-4 w-4" />
              </div>
              <input
                type="text"
                name="otp"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                required
                placeholder="123456"
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtp(val);
                }}
                className="w-full bg-transparent text-white placeholder:text-white/10 px-12 py-3.5 rounded-xl outline-none text-base font-mono tracking-[0.25em] text-center"
              />
            </div>
          </div>

          {/* Security Notice: 3-Attempt Limit */}
          <div className="p-3 rounded-xl bg-amber-500/[0.05] border border-amber-500/10 text-[11px] text-amber-200/80 leading-relaxed flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <p>
              Security Notice: 3-attempt limit. Three consecutive incorrect entries will lock
              recovery for 15 minutes.
            </p>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || otp.length !== 6}
            className={cn(
              "w-full h-12 font-bold text-sm rounded-xl transition-all uppercase tracking-[0.2em]",
              otp.length === 6
                ? "bg-[#DA8CA0] hover:bg-[#c76b85] text-[#1C1246] shadow-[0_8px_30px_rgb(218,140,160,0.2)]"
                : "bg-white/5 text-white/20 cursor-not-allowed border border-white/5 hover:bg-white/5"
            )}
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin mx-auto text-[#1C1246]" />
            ) : (
              <span className="flex items-center justify-center gap-2">
                Verify Code <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>

          {/* Resend Cooldown Action */}
          <div className="flex items-center justify-between pt-2 px-1 text-xs text-white/40">
            <button
              type="button"
              onClick={handleChangeEmail}
              className="inline-flex items-center gap-1 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Back</span>
            </button>

            <button
              type="button"
              disabled={resendCooldown > 0 || isSubmitting}
              onClick={() => handleRequestOtp()}
              className={cn(
                "inline-flex items-center gap-1 transition-colors",
                resendCooldown > 0
                  ? "text-white/20 cursor-not-allowed"
                  : "text-[#DA8CA0] hover:text-[#f0abc0]"
              )}
            >
              <RotateCcw className="h-3 w-3" />
              <span>
                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend code"}
              </span>
            </button>
          </div>
        </form>
      )}

      {/* =================================================================== */}
      {/* STEP 3: NEW PASSWORD CONFIGURATION                                  */}
      {/* =================================================================== */}
      {step === 3 && (
        <form onSubmit={handleConfirmReset} className="space-y-4">
          {/* Live Session Expiry Countdown Pill */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-indigo-300" />
              <span>Session window:</span>
            </div>
            <span className="font-bold">{formatCountdown(sessionTimeLeft)}</span>
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">
              New Password
            </label>
            <div className="relative group transition-all duration-300 rounded-xl border border-white/5 hover:border-white/10 bg-black/20 focus-within:border-[#DA8CA0] focus-within:ring-1 focus-within:ring-[#DA8CA0]/20">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#DA8CA0] transition-colors">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                required
                placeholder="••••••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full bg-transparent text-white placeholder:text-white/10 px-12 py-3.5 rounded-xl outline-none text-sm font-medium"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                aria-label={showNewPassword ? "Hide password" : "Show password"}
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">
              Confirm New Password
            </label>
            <div className="relative group transition-all duration-300 rounded-xl border border-white/5 hover:border-white/10 bg-black/20 focus-within:border-[#DA8CA0] focus-within:ring-1 focus-within:ring-[#DA8CA0]/20">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#DA8CA0] transition-colors">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                required
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full bg-transparent text-white placeholder:text-white/10 px-12 py-3.5 rounded-xl outline-none text-sm font-medium"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Live Password Complexity Checklist */}
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 text-[11px]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-white/40 block">
              Complexity Requirements
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-white/60">
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full transition-colors",
                    passwordChecks.length ? "bg-emerald-400" : "bg-white/20"
                  )}
                />
                <span className={cn(passwordChecks.length && "text-white font-medium")}>
                  8–128 characters
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full transition-colors",
                    passwordChecks.upper ? "bg-emerald-400" : "bg-white/20"
                  )}
                />
                <span className={cn(passwordChecks.upper && "text-white font-medium")}>
                  Uppercase letter
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full transition-colors",
                    passwordChecks.lower ? "bg-emerald-400" : "bg-white/20"
                  )}
                />
                <span className={cn(passwordChecks.lower && "text-white font-medium")}>
                  Lowercase letter
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full transition-colors",
                    passwordChecks.digit ? "bg-emerald-400" : "bg-white/20"
                  )}
                />
                <span className={cn(passwordChecks.digit && "text-white font-medium")}>
                  Numeric digit
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full transition-colors",
                    passwordChecks.special ? "bg-emerald-400" : "bg-white/20"
                  )}
                />
                <span className={cn(passwordChecks.special && "text-white font-medium")}>
                  Special symbol
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full transition-colors",
                    passwordChecks.match ? "bg-emerald-400" : "bg-white/20"
                  )}
                />
                <span className={cn(passwordChecks.match && "text-white font-medium")}>
                  Passwords match
                </span>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !isPasswordValid}
            className={cn(
              "w-full h-12 font-bold text-sm rounded-xl transition-all uppercase tracking-[0.2em]",
              isPasswordValid
                ? "bg-[#DA8CA0] hover:bg-[#c76b85] text-[#1C1246] shadow-[0_8px_30px_rgb(218,140,160,0.2)]"
                : "bg-white/5 text-white/20 cursor-not-allowed border border-white/5 hover:bg-white/5"
            )}
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin mx-auto text-[#1C1246]" />
            ) : (
              <span className="flex items-center justify-center gap-2">
                Update Password <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={handleChangeEmail}
              className="text-xs text-white/40 hover:text-white transition-colors"
            >
              Cancel and Start Over
            </button>
          </div>
        </form>
      )}

      {/* =================================================================== */}
      {/* SUCCESS CONFIRMATION VIEW                                           */}
      {/* =================================================================== */}
      {step === "success" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-5 py-2"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.15)]">
            <CheckCircle2 className="h-6 w-6" />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Credentials Updated
            </h2>
            <p className="text-xs text-[#8F8FA3] leading-relaxed max-w-sm mx-auto">
              Your management account password has been securely reset. All previous sessions across
              all active devices have been permanently signed out, and the event has been logged to
              the governance audit trail.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-white/60 text-left font-mono space-y-1">
            <div className="flex justify-between">
              <span className="text-white/40 font-sans">Target Email:</span>
              <span className="text-white truncate max-w-[200px]">{email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40 font-sans">Active Sessions:</span>
              <span className="text-emerald-400 font-sans font-bold">Purged (0 Active)</span>
            </div>
          </div>

          <Button
            type="button"
            onClick={() => router.push("/management/auth/login?reset=success")}
            className="w-full h-12 font-bold text-sm rounded-xl transition-all uppercase tracking-[0.2em] bg-[#DA8CA0] hover:bg-[#c76b85] text-[#1C1246] shadow-[0_8px_30px_rgb(218,140,160,0.2)]"
          >
            <span className="flex items-center justify-center gap-2">
              Sign In with New Password <ArrowRight className="h-4 w-4" />
            </span>
          </Button>
        </motion.div>
      )}
    </div>
  );
}
