'use client';

import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar as KidsSidebar } from "./kids/sidebar";
import { TopBar as KidsTopBar } from "./kids/topbar";
import { Sidebar as TeensSidebar } from "./teens/sidebar";
import { TopBar as TeensTopBar } from "./teens/topbar";
import { Sidebar as YoungAdultsSidebar } from "./young-adults/sidebar";
import { TopBar as YoungAdultsTopBar } from "./young-adults/topbar";
import { StealthFAB, StealthOverlay } from "@/components/Stealth";
import type { ReactNode, ComponentType } from "react";

export function DashLayout({
  children,
  base,
  Sidebar: CustomSidebar,
  TopBar: CustomTopBar,
}: {
  children: ReactNode;
  base: "kids" | "teens" | "young-adults";
  Sidebar?: ComponentType<{ base: string }>;
  TopBar?: ComponentType;
}) {
  const pathname = usePathname();

  // Dynamically select default components based on the base prop
  const SidebarComponent = CustomSidebar ?? (
    base === "young-adults" ? YoungAdultsSidebar : 
    base === "teens" ? TeensSidebar : 
    KidsSidebar
  );
  
  const TopBarComponent = CustomTopBar ?? (
    base === "young-adults" ? YoungAdultsTopBar : 
    base === "teens" ? TeensTopBar : 
    KidsTopBar
  );

  // Check if current route is chat mode for any segment
  const isChatMode = pathname.includes("ai-buddy") || pathname.includes("heal-ai");

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

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-cosmic opacity-60" />

      <div className="mx-auto flex max-w-[1440px] gap-0 md:gap-8 px-4 py-4 md:px-8 md:py-6">
        <SidebarComponent base={base} />

        <div className="flex flex-1 flex-col min-w-0 w-full">
          <TopBarComponent />

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