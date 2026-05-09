"use client"

import { usePathname } from "next/navigation"
import { DashLayout } from "@/components/DashLayout"
import { TopBar } from "@/components/teens/topbar"
// Ensure this points to your standard teens sidebar
import { Sidebar } from "@/components/teens/sidebar" 

export function TeensLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // DashLayout handles the full-screen 'isChatMode' automatically 
  // based on the URL including 'heal-ai'
  
  return (
    <DashLayout 
      base="teens" 
      Sidebar={Sidebar} 
      TopBar={TopBar}
    >
      {children}
    </DashLayout>
  )
}