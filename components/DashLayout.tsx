'use client';

import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "./kids/sidebar";
import { TopBar } from "./kids/topbar";
import { StealthFAB, StealthOverlay } from "@/components/Stealth";

export function DashLayout({ 
  children, 
  base 
}: { 
  children: React.ReactNode; 
  base: "kids" | "teens" | "young-adults" 
}) {
  const pathname = usePathname();

  // 1. Check if the current route is the AI Buddy
  const isChatMode = pathname.includes("ai-buddy");

  // 2. If it's Chat Mode, bypass the standard UI components entirely
  if (isChatMode) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full w-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
        <StealthFAB />
        <StealthOverlay />
      </div>
    );
  }

  // 3. Otherwise, render the standard Dashboard shell
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {/* Universal Cosmic Background */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-cosmic opacity-60" />

      <div className="mx-auto flex max-w-[1440px] gap-0 md:gap-8 px-4 py-4 md:px-8 md:py-6">
        {/* Standard Dashboard Sidebar */}
        <Sidebar base={base} />

        {/* Main Viewport */}
        <div className="flex flex-1 flex-col min-w-0 w-full">
          {/* Standard Dashboard TopBar */}
          <TopBar />

          <AnimatePresence mode="wait">
            <motion.main
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="pb-20"
            >
              {children}
            </motion.main>
          </AnimatePresence>
        </div>
      </div>

      <StealthFAB />
      <StealthOverlay />
    </div>
  );
}