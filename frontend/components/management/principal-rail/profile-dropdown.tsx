"use client";

import { useRouter } from "next/navigation";
import { User, Settings, LogOut, Shield } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useTransition } from "react";

interface ProfileDropdownProps {
  profile: {
    fullName: string;
    role: string;
  } | null;
}

export function ProfileDropdown({ profile }: ProfileDropdownProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await fetch("/api/proxy/api/auth/logout", { method: "POST" });
      router.push("/management/auth/login");
      router.refresh();
    });
  };

  const initials = profile?.fullName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2) || "??";

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex items-center gap-3 px-3 py-2 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00FFFF]/20 to-[#FF1493]/20 flex items-center justify-center border border-white/10">
            <span className="text-xs font-black text-white">{initials}</span>
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-white leading-none">
              {profile?.fullName || "Loading..."}
            </p>
            <p className="text-[9px] font-mono text-[#00FFFF] uppercase tracking-wider">
              {profile?.role || "Unknown"}
            </p>
          </div>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[200px] bg-black border border-white/10 rounded-xl shadow-2xl p-2 animate-in fade-in zoom-in-95"
          sideOffset={8}
          align="end"
        >
          <div className="px-3 py-2 border-b border-white/5 mb-2">
            <p className="text-xs font-bold text-white">{profile?.fullName}</p>
            <p className="text-[9px] text-gray-500">{profile?.role}</p>
          </div>

          <DropdownMenu.Item asChild>
            <button
              onClick={() => router.push("/management/dashboard/settings")}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </DropdownMenu.Item>

          <DropdownMenu.Item asChild>
            <button
              onClick={() => router.push("/management/dashboard/security")}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <Shield className="w-4 h-4" />
              Security
            </button>
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="h-px bg-white/5 my-2" />

          <DropdownMenu.Item asChild>
            <button
              onClick={handleLogout}
              disabled={isPending}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              {isPending ? "Disconnecting..." : "Sign Out"}
            </button>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
