import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ManagementForgotPassword from "@/components/management/auth/forgot-password";

export const metadata: Metadata = {
  title: "Reset Management Password | Heal Her",
  description: "Secure self-service password recovery for Heal Her management operators.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="relative min-h-screen bg-[#0D0821] text-[#FAFAFA] overflow-hidden flex flex-col items-center justify-center p-4 sm:p-6">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[400px] h-[400px] bg-[#DA8CA0]/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[100px]" />
      </div>

      {/* Exit to Homepage Button */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-8 z-50">
        <Link
          href="/"
          className="flex items-center gap-2 text-white/20 hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest group"
        >
          <ArrowLeft className="h-3 w-3" />
          <span>Exit</span>
        </Link>
      </div>

      {/* Main Glassmorphic Card */}
      <div className="w-full max-w-[420px] relative z-10">
        <div className="bg-white/[0.02] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
          <div className="bg-[#1C1246]/60 p-5 sm:p-8 relative">
            {/* Header */}
            <div className="text-center mb-6">
              <img
                src="/heal-logo.png"
                alt="Heal Her Logo"
                className="w-10 h-10 mx-auto rounded-xl mb-3"
              />
              <h1 className="text-xl font-bold text-white tracking-tight">
                Reset Password
              </h1>
              <p className="text-xs text-[#8F8FA3] mt-1">
                Management Credential Recovery
              </p>
            </div>

            {/* 3-Step Recovery Wizard */}
            <ManagementForgotPassword />

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-white/5 flex justify-center">
              <span className="text-[8px] uppercase tracking-[0.4em] text-white/20 font-bold">
                Cryptographic Identity Recovery
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
