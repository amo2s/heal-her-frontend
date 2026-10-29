"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, AlertTriangle, Loader2 } from "lucide-react";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LogoutModal({ isOpen, onClose }: LogoutModalProps) {
  const [isPending, setIsPending] = useState(false);
  const [allDevices, setAllDevices] = useState(false);

  // 1. Accessibility & Scroll Lock Shield
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isPending, onClose]);

  // 2. The Atomic Execution Lifecycle
  const handleLogout = async () => {
    setIsPending(true);

    try {
      // Hit the proxy to destroy httpOnly cookies and signal the Rust backend
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allDevices }),
      });

      // Local State Clearance: Wipe any ghost data hanging in the browser
      localStorage.clear();
      sessionStorage.clear();
    } catch (error) {
      console.error("[UI SHIELD] Failsafe triggered during logout:", error);
    } finally {
      // 3. Client-Side History Nuke (Security Imperative)
      // We explicitly use window.location.replace to purge browser history
      // and prevent back-button traversal into cached authenticated views.
      window.location.replace("/login");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-title"
        >
          {/* Backdrop Glassmorphism */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={!isPending ? onClose : undefined}
          />

          {/* Modal Surface */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border/50 bg-background p-6 shadow-2xl"
          >
            {/* Header section */}
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-7 w-7 text-destructive" />
              </div>
              
              <div className="space-y-2">
                <h2 id="logout-title" className="text-xl font-semibold tracking-tight text-foreground">
                  End your session?
                </h2>
                <p className="text-sm text-muted-foreground">
                  You are about to securely log out of Heal Her. You will need your credentials to access your dashboard again.
                </p>
              </div>
            </div>

            {/* Dual-Mode Session Termination Toggle */}
            <div className="mt-5 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm transition-colors hover:border-white/20">
              <div className="flex flex-col text-left pr-2">
                <label
                  htmlFor="all-devices-toggle"
                  className="cursor-pointer text-xs font-semibold text-[#CCCCD9] select-none"
                >
                  End sessions on all other devices
                </label>
                <span className="text-[11px] text-[#A1A1AA] select-none">
                  Revoke all active logins across phones and laptops
                </span>
              </div>
              <input
                type="checkbox"
                id="all-devices-toggle"
                checked={allDevices}
                onChange={(e) => setAllDevices(e.target.checked)}
                disabled={isPending}
                className="h-4 w-4 rounded border-white/20 bg-black/40 accent-[#DA8CA0] cursor-pointer focus:ring-1 focus:ring-[#DA8CA0] focus:ring-offset-0 disabled:opacity-50"
              />
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-4">
              <button
                type="button"
                disabled={isPending}
                onClick={onClose}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-input bg-transparent px-5 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 sm:flex-none"
              >
                Cancel
              </button>
              
              <button
                type="button"
                disabled={isPending}
                onClick={handleLogout}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-destructive px-5 text-sm font-medium text-destructive-foreground transition-all hover:bg-destructive/90 disabled:pointer-events-none disabled:opacity-80 sm:flex-none"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Terminating...
                  </>
                ) : (
                  <>
                    <LogOut className="mr-2 h-4 w-4" />
                    Secure Logout
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
