"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon, X, Shield } from "lucide-react";
import { ManagementRole } from "@/lib/management-governance";
import { PortalHeader } from "./PortalHeader";

export interface PortalNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface PortalShellProps {
  portalRole: ManagementRole;
  user: {
    fullName: string;
    firstName: string;
    email: string;
    role: ManagementRole;
  };
  navItems: PortalNavItem[];
  children: React.ReactNode;
  notificationSlot?: React.ReactNode;
}

export function PortalShell({
  portalRole,
  user,
  navItems,
  children,
  notificationSlot,
}: PortalShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const roleMeta = {
    staff: {
      title: "Staff Operations",
      subtitle: "Frontline Console",
      accent: "text-emerald-400",
      activeBg: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    },
    admin: {
      title: "Admin Command",
      subtitle: "Operations & Approvals",
      accent: "text-indigo-400",
      activeBg: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
    },
    super_admin: {
      title: "Executive Portal",
      subtitle: "Governance & Oversight",
      accent: "text-rose-400",
      activeBg: "bg-rose-500/10 text-rose-300 border-rose-500/20",
    },
  }[portalRole];

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex overflow-hidden">
      {/* ================================================================= */}
      {/* DESKTOP SIDEBAR                                                   */}
      {/* ================================================================= */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/5 bg-black/40 backdrop-blur-2xl shrink-0 z-30">
        {/* Brand / Role Header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-white/5">
          <img src="/heal-logo.png" alt="Heal Her Logo" className="w-8 h-8 rounded-lg" />
          <div className="min-w-0">
            <div className="text-xs font-bold text-white tracking-tight truncate">
              {roleMeta.title}
            </div>
            <div className="text-[10px] text-[#8F8FA3] truncate">{roleMeta.subtitle}</div>
          </div>
        </div>

        {/* Navigation Rail */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto" aria-label="Portal Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === `/management/${portalRole.replace("_", "-")}`
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                  isActive
                    ? `${roleMeta.activeBg} shadow-sm`
                    : "border-transparent text-white/50 hover:text-white hover:bg-white/[0.03]"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? "" : "text-white/40"}`} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl bg-white/[0.02] border border-white/5">
            <Shield className="h-3.5 w-3.5 text-white/30 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-medium text-white/80 truncate">
                {user.fullName}
              </div>
              <div className="text-[9px] text-white/30 uppercase tracking-widest">
                Protected Portal
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ================================================================= */}
      {/* MOBILE DRAWER SLIDE-OVER                                         */}
      {/* ================================================================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          <div className="relative w-64 max-w-[80vw] bg-[#0A0A0F] border-r border-white/10 flex flex-col z-10">
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-5 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <img src="/heal-logo.png" alt="Heal Her Logo" className="w-7 h-7 rounded-lg" />
                <span className="text-xs font-bold text-white">{roleMeta.title}</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-white/40 hover:text-white"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === `/management/${portalRole.replace("_", "-")}`
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                      isActive
                        ? `${roleMeta.activeBg} shadow-sm`
                        : "border-transparent text-white/50 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MAIN STAGE                                                        */}
      {/* ================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <PortalHeader
          portalRole={portalRole}
          user={user}
          onToggleMobileMenu={() => setMobileMenuOpen(true)}
          notificationSlot={notificationSlot}
        />

        <main className="flex-1 overflow-y-auto relative z-10 p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
