"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  logoutManagementSession,
  refreshManagementSession,
} from "@/lib/management-governance";

export function SessionRefreshGate() {
  const router = useRouter();
  const refreshedRef = useRef(false);

  useEffect(() => {
    if (refreshedRef.current) return;
    refreshedRef.current = true;

    async function syncSession() {
      try {
        const res = await refreshManagementSession();
        if (res.ok) {
          router.refresh();
        } else {
          // If refresh fails due to revocation or suspension, purge cookies and redirect
          await logoutManagementSession();
          router.push("/management/auth/login");
        }
      } catch (err) {
        console.warn("[SESSION REFRESH GATE SYNC ERROR]", err);
      }
    }

    syncSession();
  }, [router]);

  return null;
}
