"use client"

import React, { useRef, useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/side-bar"

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

// --- CHAT LAYOUT ---

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="relative flex h-screen w-full bg-[#1C1246] text-[#FAFAFA] overflow-hidden selection:bg-[#DA8CA0]/30 selection:text-[#DA8CA0]">
      
      {/* 1. Global Background */}
      <AuroraBackground />

      {/* 2. Desktop Sidebar (Always visible on MD+, no close action needed) */}
      <aside className="hidden md:block w-64 h-full relative z-20 border-r border-white/5 bg-[#1C1246]/30 backdrop-blur-md">
         <Sidebar />
      </aside>

      {/* 3. Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="absolute inset-0 z-50 md:hidden flex">
          {/* Backdrop - Click to Close */}
          <div 
            className="absolute inset-0 bg-[#1C1246]/90 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Sidebar Panel */}
          <div className="relative w-3/4 max-w-[280px] h-full bg-[#1C1246] border-r border-white/10 shadow-2xl">
            {/* Pass the close function here */}
            <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* 4. Main Content Wrapper */}
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        
        <Header
          onMenuAction={(action) => console.log(action)}
          onSidebarToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        <main className="flex-1 relative flex flex-col overflow-hidden">
          {children}
        </main>
      
      </div>
    </div>
  )
}