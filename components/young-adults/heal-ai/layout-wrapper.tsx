"use client"

import { usePathname } from "next/navigation"
import { DashLayout } from "@/components/DashLayout"
import { TopBar } from "@/components/young-adults/topbar"
import { Sidebar } from "@/components/young-adults/sidebar" 

export function YoungAdultLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // DashLayout handles the full-screen 'isChatMode' automatically 
  // based on the URL including 'heal-ai'
  
  return (
    <DashLayout 
      base="young-adults" 
      Sidebar={Sidebar} 
      TopBar={TopBar}
    >
      {children}
    </DashLayout>
  )
}