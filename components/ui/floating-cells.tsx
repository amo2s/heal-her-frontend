"use client"

import React, { useRef, useEffect } from "react"

export function FloatingCells() {
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
      // Use parent dimensions if possible, else window
      const parent = canvas.parentElement
      canvas.width = parent ? parent.clientWidth : window.innerWidth
      canvas.height = parent ? parent.clientHeight : window.innerHeight
      initParticles()
    }

    const initParticles = () => {
      // Fewer particles for smaller areas (like sidebar)
      const isSmall = canvas.width < 400
      const particleCount = isSmall ? 10 : (window.innerWidth < 768 ? 20 : 35)
      
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
        
        // Reset if it goes off top
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

    // Observer to handle resize of parent elements (like sidebar opening)
    const resizeObserver = new ResizeObserver(() => resize())
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement)
    }
    
    window.addEventListener("resize", resize)
    resize()
    animate()

    return () => {
      window.removeEventListener("resize", resize)
      if (canvas.parentElement) resizeObserver.unobserve(canvas.parentElement)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none opacity-60 mix-blend-screen"
    />
  )
}