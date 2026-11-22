"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Clock,
  ShieldCheck,
  RefreshCw,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Mail,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ManagementIdentityProfile,
  fetchManagementMe,
  logoutManagementSession,
  refreshManagementSession,
} from "@/lib/management-governance";

interface PendingApprovalShellProps {
  identity: ManagementIdentityProfile;
}

export function PendingApprovalShell({ identity }: PendingApprovalShellProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "info" | "success" | "error";
    text: string;
  } | null>(null);

  const isApprovedRef = useRef(false);

  const checkStatus = useCallback(async () => {
    if (isChecking || isApprovedRef.current) return;
    setIsChecking(true);
    setStatusMessage(null);

    try {
      const res = await fetchManagementMe();

      if (res.ok) {
        if (res.data.approvalStatus === "APPROVED" || res.data.requiresTokenRefresh) {
          isApprovedRef.current = true;
          setStatusMessage({
            type: "success",
            text: "Account approved! Unlocking your management workspace...",
          });

          // Refresh token pair to upgrade from PENDING to APPROVED JWT
          await refreshManagementSession();

          // Seamlessly swap into active portal
          setTimeout(() => {
            window.location.reload();
          }, 1200);
          return;
        }

        setStatusMessage({
          type: "info",
          text: "Status checked: Your registration is still awaiting administrative review.",
        });
      } else {
        if (
          res.error.code === "UNAUTHORIZED" ||
          res.error.code === "ACCOUNT_REJECTED" ||
          res.error.code === "ACCOUNT_SUSPENDED"
        ) {
          setStatusMessage({
            type: "error",
            text: res.error.message || "Registration status update requires re-authentication.",
          });
          setTimeout(async () => {
            await logoutManagementSession();
            router.push("/management/auth/login");
          }, 2000);
        } else {
          setStatusMessage({
            type: "info",
            text: res.error.message || "Unable to check status at this time. Please try again.",
          });
        }
      }
    } catch {
      setStatusMessage({
        type: "info",
        text: "Network check failed. Will check again shortly.",
      });
    } finally {
      setIsChecking(false);
    }
  }, [isChecking, router]);

  // Window focus listener + polite 30-second interval check while tab is visible
  useEffect(() => {
    const handleFocus = () => {
      checkStatus();
    };

    window.addEventListener("focus", handleFocus);
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        checkStatus();
      }
    }, 30000);

    return () => {
      window.removeEventListener("focus", handleFocus);
      clearInterval(interval);
    };
  }, [checkStatus]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutManagementSession();
    } finally {
      router.push("/management/auth/login");
    }
  };

  const roleTitle =
    identity.role === "staff"
      ? "Staff Operations Applicant"
      : identity.role === "admin"
      ? "Admin Operations Applicant"
      : "Management Applicant";

  const reviewerNote =
    identity.role === "staff"
      ? "An active Admin or Super Admin must review and approve your registration."
      : "A Super Admin must review and approve your administrative registration.";

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-500/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-indigo-600/5 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-[540px] relative z-10">
        <div className="bg-white/[0.03] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl backdrop-blur-2xl">
          {/* Top Decorative Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-amber-400 to-indigo-500" />

          <div className="p-6 sm:p-10 space-y-6">
            {/* Header Greeting */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                  <Clock className="h-3 w-3 animate-pulse" />
                  <span>Pending Approval Shell</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-white pt-2">
                  Welcome, {identity.firstName || identity.fullName}
                </h1>
                <p className="text-xs text-[#8F8FA3]">{roleTitle}</p>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-white/40">
                <ShieldCheck className="h-6 w-6 text-amber-400" />
              </div>
            </div>

            {/* Status Alert Banner */}
            {statusMessage && (
              <div
                className={`p-3.5 rounded-xl border flex items-center gap-3 text-xs ${
                  statusMessage.type === "success"
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-200"
                    : statusMessage.type === "error"
                    ? "bg-red-500/10 border-red-500/20 text-red-200"
                    : "bg-white/[0.04] border-white/10 text-white/80"
                }`}
              >
                {statusMessage.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                ) : statusMessage.type === "error" ? (
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                ) : (
                  <RefreshCw className="h-4 w-4 shrink-0 text-amber-400 animate-spin" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            {/* Explanation Card */}
            <div className="bg-black/30 border border-white/5 rounded-2xl p-5 space-y-4">
              <div className="space-y-2">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span>Workspace Locked</span>
                </h2>
                <p className="text-xs text-[#8F8FA3] leading-relaxed">
                  Your credentials have been securely verified. However, this management workspace
                  enforces a strict zero-trust governance gate and requires tiered approval before
                  operational permissions, inquiries inbox, and directory access are granted.
                </p>
              </div>

              <div className="border-t border-white/5 pt-3 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-white/70">
                  <User className="h-3.5 w-3.5 text-white/40" />
                  <span className="text-white/40">Account:</span>
                  <span className="font-medium text-white">{identity.fullName}</span>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <Mail className="h-3.5 w-3.5 text-white/40" />
                  <span className="text-white/40">Work Email:</span>
                  <span className="font-mono text-white/90">{identity.email}</span>
                </div>
                <div className="text-[11px] text-amber-300/80 pt-1">
                  {reviewerNote}
                </div>
              </div>
            </div>

            {/* Actions: Live Check & Logout */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                type="button"
                onClick={checkStatus}
                disabled={isChecking}
                className="flex-1 bg-[#4F46E5] hover:bg-[#4338CA] text-white py-5 rounded-xl text-xs font-semibold shadow-lg"
              >
                {isChecking ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Checking Status...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    <span>Check Approval Status</span>
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="border-white/10 bg-white/[0.02] hover:bg-white/5 text-white/80 py-5 rounded-xl text-xs"
              >
                {isLoggingOut ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <LogOut className="h-4 w-4 mr-2" />
                )}
                <span>Log Out</span>
              </Button>
            </div>

            <p className="text-[10px] text-center text-white/20 uppercase tracking-[0.25em]">
              Heal Her Management Governance Shell
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
