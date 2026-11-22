"use client";

import React, { useState } from "react";
import { Bell, LogOut, Menu, Shield, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ManagementRole, logoutManagementSession } from "@/lib/management-governance";

interface PortalHeaderProps {
  portalRole: ManagementRole;
  user: {
    fullName: string;
    firstName: string;
    email: string;
    role: ManagementRole;
  };
  onToggleMobileMenu?: () => void;
  notificationSlot?: React.ReactNode;
}

export function PortalHeader({
  portalRole,
  user,
  onToggleMobileMenu,
  notificationSlot,
}: PortalHeaderProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutManagementSession();
    } finally {
      router.push("/management/auth/login");
    }
  };

  const roleStyles = {
    staff: {
      pill: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
      label: "STAFF",
    },
    admin: {
      pill: "bg-indigo-500/10 border-indigo-500/20 text-indigo-300",
      label: "ADMIN",
    },
    super_admin: {
      pill: "bg-rose-500/10 border-rose-500/20 text-rose-300",
      label: "SUPER ADMIN",
    },
  }[portalRole];

  return (
    <header className="h-16 border-b border-white/5 bg-black/40 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 z-40 sticky top-0">
      {/* Mobile Menu Trigger & Role Title */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <div className="hidden sm:flex items-center gap-2">
          <Shield className="h-4 w-4 text-white/30" />
          <span className="text-xs font-semibold text-white/80">Management Portal</span>
        </div>
      </div>

      {/* Right Controls: Notification Slot + User Identity + Logout */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* ================================================================= */}
        {/* RESERVED PHASE 5 ROLE-ISOLATED NOTIFICATION SLOT                   */}
        {/* Ready to house the upcoming Phase 5 Rust Notification System      */}
        {/* ================================================================= */}
        {notificationSlot ? (
          notificationSlot
        ) : (
          <div className="relative group">
            <button
              type="button"
              disabled
              title="Notifications — Coming in Phase 5"
              aria-label="Notifications coming in Phase 5"
              className="p-2 rounded-xl border border-white/5 bg-white/[0.02] text-white/20 cursor-not-allowed group-hover:text-white/40 transition-colors relative"
            >
              <Bell className="h-4 w-4" />
              {/* Subtle muted beacon dot representing ready wiring */}
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-white/20" />
            </button>
            <div className="absolute right-0 top-full mt-1.5 hidden group-hover:block z-50 pointer-events-none">
              <div className="bg-[#1C1246] border border-white/10 rounded-lg px-2.5 py-1 text-[10px] text-white/70 whitespace-nowrap shadow-xl">
                Notifications — Scoped Rust Hub in Phase 5
              </div>
            </div>
          </div>
        )}

        {/* User Identity Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-white/5">
          <div className="hidden md:block text-right">
            <div className="text-xs font-medium text-white leading-tight">
              {user.firstName || user.fullName}
            </div>
            <div className="text-[10px] text-[#8F8FA3] leading-tight font-mono">
              {user.email}
            </div>
          </div>

          <span
            className={`px-2 py-0.5 rounded-md border text-[10px] font-bold tracking-wider uppercase ${roleStyles.pill}`}
          >
            {roleStyles.label}
          </span>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          title="Sign out of management session"
          aria-label="Sign out"
          className="p-2 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-red-500/10 hover:border-red-500/20 text-white/50 hover:text-red-300 transition-all"
        >
          {isLoggingOut ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
        </button>
      </div>
    </header>
  );
}
