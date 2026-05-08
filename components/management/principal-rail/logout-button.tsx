"use client";

import { LogOut, Loader2 } from "lucide-react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
// NOTE: You will need to create this server action file
// import { destroySession } from "@/app/actions/auth-actions"; 

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleLogout = () => {
    // We wrap the server action in a transition to show the spinner natively
    startTransition(async () => {
      // await destroySession(); // Server action that deletes cookies
      
      // Fallback for proxy logic if you don't use Server Actions yet:
      await fetch("/api/proxy/api/auth/logout", { method: "POST" });
      
      router.push("/management/auth/login");
      router.refresh(); // Forces layout to re-run its Aegis check
    });
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="w-full flex items-center gap-4 px-3 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-medium overflow-hidden whitespace-nowrap"
    >
      {isPending ? (
        <Loader2 className="w-5 h-5 shrink-0 animate-spin" />
      ) : (
        <LogOut className="w-5 h-5 shrink-0" />
      )}
      <span className="text-sm transition-opacity duration-300 opacity-100 group-[.peer-checked+aside]:opacity-0">
        {isPending ? "Disconnecting..." : "Sign Out"}
      </span>
    </button>
  );
}