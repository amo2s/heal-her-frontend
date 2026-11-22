"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Shield,
  ArrowLeft,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  SelfRegisterableManagementRole,
  signupManagementAccount,
  validateManagementSignupInput,
} from "@/lib/management-governance";

export default function ManagementSignupPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    requestedRole: "staff" as SelfRegisterableManagementRole,
    botTrap: "",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inFlightRef = useRef(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Success Confirmation State
  const [submittedAccount, setSubmittedAccount] = useState<{
    fullName: string;
    email: string;
    role: SelfRegisterableManagementRole;
  } | null>(null);

  const handleRoleChange = (role: SelfRegisterableManagementRole) => {
    setFormData((prev) => ({ ...prev, requestedRole: role }));
    if (fieldErrors.requestedRole) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.requestedRole;
        return next;
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    if (generalError) setGeneralError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (inFlightRef.current || isSubmitting) return;

    // Check confirm password
    if (formData.password !== formData.confirmPassword) {
      setFieldErrors({ confirmPassword: "Passwords do not match." });
      return;
    }

    // Client-side mirrored validation
    const validation = validateManagementSignupInput({
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      requestedRole: formData.requestedRole,
      botTrap: formData.botTrap,
    });

    if (!validation.isValid || !validation.sanitized) {
      setFieldErrors(validation.fieldErrors || { form: "Validation failed." });
      return;
    }

    inFlightRef.current = true;
    setIsSubmitting(true);
    setGeneralError(null);

    try {
      const res = await signupManagementAccount(validation.sanitized);

      if (res.ok) {
        setSubmittedAccount({
          fullName: res.data.fullName,
          email: res.data.email,
          role: res.data.role,
        });
      } else {
        if (res.error.code === "CONFLICT") {
          setFieldErrors({
            email: "An account with this email address already exists.",
          });
        } else if (res.error.code === "VALIDATION_ERROR" && res.error.fieldErrors) {
          setFieldErrors(res.error.fieldErrors);
        } else {
          setGeneralError(res.error.message || "Failed to register account. Please try again.");
        }
      }
    } catch {
      setGeneralError("An unexpected network error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
      inFlightRef.current = false;
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0A0A0F] text-[#FAFAFA] overflow-hidden flex flex-col items-center justify-center p-4 sm:p-6">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#DA8CA0]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px]" />
      </div>

      {/* Exit Button */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-8 z-50">
        <Link
          href="/management/auth/login"
          className="flex items-center gap-2 text-white/30 hover:text-white transition-all text-[11px] font-bold uppercase tracking-widest group"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Sign In</span>
        </Link>
      </div>

      {/* Main Card */}
      <motion.div
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[460px] relative z-10"
      >
        <div className="bg-white/[0.03] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl backdrop-blur-xl">
          <div className="bg-[#1C1246]/50 p-6 sm:p-8 relative">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex p-3 rounded-2xl bg-[#DA8CA0]/10 mb-3 border border-[#DA8CA0]/20">
                <Shield className="h-6 w-6 text-[#DA8CA0]" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Management Access
              </h1>
              <p className="text-xs text-[#8F8FA3] mt-1">
                Self-Registration for Heal Her Operations & Administration
              </p>
            </div>

            <AnimatePresence mode="wait">
              {submittedAccount ? (
                /* Confirmation Card */
                <motion.div
                  key="confirmation"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="space-y-6 text-center py-4"
                >
                  <div className="inline-flex p-3.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300">
                    <Clock className="h-8 w-8 animate-pulse" />
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-lg font-semibold text-white">
                      Registration Received
                    </h2>
                    <p className="text-xs text-[#8F8FA3] leading-relaxed">
                      Your account request for{" "}
                      <span className="text-white font-medium">{submittedAccount.fullName}</span>{" "}
                      has been submitted in{" "}
                      <span className="text-amber-300 font-semibold uppercase tracking-wider">
                        Pending Approval
                      </span>{" "}
                      status.
                    </p>
                  </div>

                  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-left space-y-2 text-xs">
                    <div className="flex justify-between items-center text-white/50">
                      <span>Assigned Role:</span>
                      <span className="text-white font-medium capitalize">
                        {submittedAccount.role}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-white/50">
                      <span>Approval Tier:</span>
                      <span className="text-white font-medium">
                        {submittedAccount.role === "staff"
                          ? "Admin or Super Admin Review"
                          : "Super Admin Review"}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8F8FA3] pt-2 border-t border-white/5">
                      You may sign in immediately to access your personalized Pending Approval
                      greeting shell, check your verification status, or log out.
                    </p>
                  </div>

                  <div className="pt-2">
                    <Button asChild className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white">
                      <Link href="/management/auth/login">
                        <span>Sign In to Check Approval Status</span>
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              ) : (
                /* Registration Form */
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {/* General Error Banner */}
                  {generalError && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{generalError}</span>
                    </div>
                  )}

                  {/* Stealth Bot Trap Honeypot */}
                  <input
                    type="text"
                    name="botTrap"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    value={formData.botTrap}
                    onChange={handleChange}
                    className="sr-only pointer-events-none"
                  />

                  {/* Requested Role Segmented Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">
                      Requested Role
                    </label>
                    <div className="grid grid-cols-2 gap-2 bg-black/20 p-1 rounded-xl border border-white/5">
                      <button
                        type="button"
                        onClick={() => handleRoleChange("staff")}
                        className={cn(
                          "py-2.5 px-3 rounded-lg text-xs font-semibold transition-all text-center",
                          formData.requestedRole === "staff"
                            ? "bg-[#DA8CA0]/15 text-[#DA8CA0] border border-[#DA8CA0]/30 shadow-sm"
                            : "text-white/40 hover:text-white"
                        )}
                      >
                        <div>Staff</div>
                        <div className="text-[9px] font-normal opacity-70">
                          Operations & Inquiries
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRoleChange("admin")}
                        className={cn(
                          "py-2.5 px-3 rounded-lg text-xs font-semibold transition-all text-center",
                          formData.requestedRole === "admin"
                            ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-sm"
                            : "text-white/40 hover:text-white"
                        )}
                      >
                        <div>Admin</div>
                        <div className="text-[9px] font-normal opacity-70">
                          Staff Approvals & Mgmt
                        </div>
                      </button>
                    </div>
                    {fieldErrors.requestedRole && (
                      <p className="text-[11px] text-red-400 px-1">{fieldErrors.requestedRole}</p>
                    )}
                  </div>

                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">
                      Full Name
                    </label>
                    <div className="relative rounded-xl border border-white/5 bg-black/20 focus-within:border-[#DA8CA0]">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                      <input
                        type="text"
                        name="fullName"
                        placeholder="Dr. Sarah Connor"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full bg-transparent text-white placeholder:text-white/10 px-10 py-2.5 text-xs outline-none"
                      />
                    </div>
                    {fieldErrors.fullName && (
                      <p className="text-[11px] text-red-400 px-1">{fieldErrors.fullName}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">
                      Work Email
                    </label>
                    <div className="relative rounded-xl border border-white/5 bg-black/20 focus-within:border-[#DA8CA0]">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                      <input
                        type="email"
                        name="email"
                        placeholder="sarah@healher.org"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-transparent text-white placeholder:text-white/10 px-10 py-2.5 text-xs outline-none"
                      />
                    </div>
                    {fieldErrors.email && (
                      <p className="text-[11px] text-red-400 px-1">{fieldErrors.email}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">
                      Password (min 8 characters)
                    </label>
                    <div className="relative rounded-xl border border-white/5 bg-black/20 focus-within:border-[#DA8CA0]">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="••••••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full bg-transparent text-white placeholder:text-white/10 px-10 py-2.5 text-xs outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <p className="text-[11px] text-red-400 px-1">{fieldErrors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">
                      Confirm Password
                    </label>
                    <div className="relative rounded-xl border border-white/5 bg-black/20 focus-within:border-[#DA8CA0]">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="••••••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full bg-transparent text-white placeholder:text-white/10 px-10 py-2.5 text-xs outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                    {fieldErrors.confirmPassword && (
                      <p className="text-[11px] text-red-400 px-1">{fieldErrors.confirmPassword}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white py-5 rounded-xl font-semibold text-xs tracking-wide shadow-lg"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          <span>Registering Account...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Registration</span>
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Existing Account Footer Link */}
                  <div className="text-center pt-2">
                    <Link
                      href="/management/auth/login"
                      className="text-xs text-white/40 hover:text-[#DA8CA0] transition-colors"
                    >
                      Already have an account? Sign in
                    </Link>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
