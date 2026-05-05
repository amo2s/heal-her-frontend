"use client"

import React, { useRef, useEffect, useState } from "react"
import { Header } from "@/components/kids/ai-buddy/topbar"
import { Sidebar } from "@/components/kids/ai-buddy/sidebar"

// --- BACKGROUND COMPONENTS ---

const FloatingCells = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let particles: Array<{
      x: number
      y: number
      radius: number
      vy: number
      opacity: number
      pulse: number
    }> = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initParticles()
    }

    const initParticles = () => {
      const particleCount = window.innerWidth < 768 ? 20 : 35
      particles = []
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 4 + 1.5,
          vy: -Math.random() * 0.5 - 0.1,
          opacity: Math.random() * 0.5 + 0.1,
          pulse: Math.random() * Math.PI,
        })
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p) => {
        p.y += p.vy
        p.pulse += 0.02
        const currentOpacity = p.opacity + Math.sin(p.pulse) * 0.05
        if (p.y + p.radius < 0) {
          p.y = canvas.height + p.radius
          p.x = Math.random() * canvas.width
        }
        ctx.beginPath()
        ctx.fillStyle = `rgba(218, 140, 160, ${currentOpacity})`
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 15
        ctx.shadowColor = "rgba(218, 140, 160, 0.5)"
      })
      ctx.shadowBlur = 0
      animationFrameId = requestAnimationFrame(animate)
    }

    window.addEventListener("resize", resize)
    resize()
    animate()

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-10 pointer-events-none opacity-60 mix-blend-screen"
    />
  )
}

const AuroraBackground = () => (
  <div className="fixed inset-0 z-0 overflow-hidden bg-[#1C1246]">
    <div
      className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] bg-[#231854] rounded-full blur-[120px] opacity-60 animate-pulse"
      style={{ animationDuration: "8s" }}
    />
    <div
      className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#DA8CA0]/10 rounded-full blur-[100px] opacity-40 animate-pulse"
      style={{ animationDuration: "10s" }}
    />
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-soft-light" />
    <FloatingCells />
  </div>
)

// --- AI BUDDY CHAT LAYOUT ---

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="relative flex h-screen w-full bg-[#1C1246] text-[#FAFAFA] overflow-hidden selection:bg-[#DA8CA0]/30 selection:text-[#DA8CA0]">
      
      <AuroraBackground />

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-72 h-full relative z-20 border-r border-white/5 bg-[#1C1246]/20 backdrop-blur-xl">
         <Sidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="absolute inset-0 z-[60] md:hidden flex">
          <div 
            className="absolute inset-0 bg-[#0a051e]/80 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-4/5 max-w-[300px] h-full bg-[#1C1246] border-r border-white/10 shadow-2xl animate-in slide-in-from-left duration-300">
            <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        {/* Universal Chat Header */}
        <Header
          onMenuAction={(action: string) => console.log("Menu action:", action)}
          onSidebarToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        <main className="flex-1 relative flex flex-col overflow-y-auto pt-24 pr-1
          [&::-webkit-scrollbar]:w-2
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-track]:mt-24
          [&::-webkit-scrollbar-thumb]:bg-[#DA8CA0]/20
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:border-r-2
          [&::-webkit-scrollbar-thumb]:border-transparent
          [&::-webkit-scrollbar-thumb]:bg-clip-content
          hover:[&::-webkit-scrollbar-thumb]:bg-[#DA8CA0]/40
          [scrollbar-width:thin]
          [scrollbar-color:rgba(218,140,160,0.2)_transparent]">
          {children}
        </main>
      </div>
    </div>
  )
}