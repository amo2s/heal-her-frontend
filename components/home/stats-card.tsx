"use client"

import React, { useEffect, useRef } from "react"
import { motion, useInView, useMotionValue, useSpring, useTransform, useMotionValueEvent } from "framer-motion"
import { Users, Layers, ShieldCheck, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

// Premium easing curve for high-end feel
const smoothEase: [number, number, number, number] = [0.22, 1, 0.36, 1]

interface AnimatedCounterProps {
  value: number
  prefix?: string
  suffix?: string
  delay?: number
}

function AnimatedCounter({ value, prefix = "", suffix = "", delay = 0 }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  
  const motionValue = useMotionValue(0)
  
  // Drastically reduced stiffness and increased damping for a very slow, premium deceleration
  const springValue = useSpring(motionValue, {
    stiffness: 10,
    damping: 30,
    mass: 2,
  })
  
  const displayValue = useTransform(springValue, (current) => Math.round(current))
  const scale = useSpring(1, { stiffness: 300, damping: 15 })
  const hasBounced = useRef(false)

  // Trigger counting with staggered delay
  useEffect(() => {
    if (isInView) {
      const timeout = setTimeout(() => {
        motionValue.set(value)
      }, delay * 1000)
      return () => clearTimeout(timeout)
    }
  }, [isInView, motionValue, value, delay])

  // Intelligent state tracking for the final premium bounce
  useMotionValueEvent(springValue, "change", (latest) => {
    if (!hasBounced.current && motionValue.get() === value && Math.round(latest) === value) {
      hasBounced.current = true
      scale.set(1.15) // Spring up
      setTimeout(() => scale.set(1), 150) // Spring back down
    }
  })

  return (
    <motion.span ref={ref} style={{ scale }} className="inline-flex items-center origin-center tabular-nums">
      {prefix && <span>{prefix}</span>}
      <motion.span>{displayValue}</motion.span>
      {suffix && <span>{suffix}</span>}
    </motion.span>
  )
}

const stats = [
  {
    icon: Users,
    value: 100,
    suffix: "+",
    label: "Girls Lounge",
    description: "Active community members",
  },
  {
    icon: Layers,
    value: 50,
    suffix: "+",
    label: "Life Scenarios",
    description: "Interactive learning modules",
  },
  {
    icon: ShieldCheck,
    value: 100,
    suffix: "%",
    label: "Clinical Accuracy",
    description: "Doctor-approved facts",
  },
  {
    icon: Zap,
    prefix: "<",
    value: 1,
    suffix: "s",
    label: "Response Time",
    description: "Average AI reply speed",
  },
]

export default function StatsCard() {
  return (
    <section className="relative py-24 bg-[#1C1246] border-t border-white/5 overflow-hidden z-10">
      {/* Breathing Background Glow */}
      <motion.div 
        animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#DA8CA0]/10 blur-[120px] rounded-full pointer-events-none" 
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: smoothEase }}
          className="relative p-8 md:p-12 border border-white/10 border-t-white/20 rounded-[2.5rem] bg-gradient-to-b from-[#231854]/80 to-[#1C1246]/90 backdrop-blur-2xl shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_20px_40px_-10px_rgba(28,18,70,0.8)] overflow-hidden"
        >
          {/* Moving Top Edge Highlight */}
          <div className="absolute top-0 left-0 right-0 h-[2px] opacity-70">
            <motion.div 
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
              className="w-1/2 h-full bg-gradient-to-r from-transparent via-[#DA8CA0]/60 to-transparent" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 divide-y md:divide-y-0 md:divide-x divide-white/10 relative z-10">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.8, 
                  delay: 0.2 + idx * 0.15, 
                  ease: smoothEase 
                }}
                className="group relative flex flex-col items-center text-center pt-8 md:pt-0 px-4 first:pt-0"
              >
                {/* Icon Wrapper with Hover Glow */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-[#DA8CA0]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[#DA8CA0]/20 to-transparent border border-white/10 border-t-white/30 flex items-center justify-center group-hover:scale-110 group-hover:border-[#DA8CA0]/50 group-hover:shadow-[inset_0_1px_4px_rgba(255,255,255,0.4),0_0_30px_rgba(218,140,160,0.3)] transition-all duration-500 overflow-hidden shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)]">
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                    <stat.icon className="w-6 h-6 text-[#DA8CA0] drop-shadow-md relative z-10" />
                  </div>
                </div>

                {/* Shimmering Text & Staggered Counter */}
                <motion.h4 
                  animate={{ backgroundPosition: ["0% 50%", "200% 50%"] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#FAFAFA] via-[#DA8CA0] to-[#FAFAFA] bg-[length:200%_auto] drop-shadow-lg mb-2"
                >
                  <AnimatedCounter 
                    value={stat.value} 
                    prefix={stat.prefix} 
                    suffix={stat.suffix} 
                    delay={idx * 0.2}
                  />
                </motion.h4>

                {/* Labels */}
                <div className="text-sm font-bold tracking-widest text-[#DA8CA0] uppercase mb-2 transition-colors duration-300 group-hover:text-white">
                  {stat.label}
                </div>
                <p className="text-sm text-[#CCCCD9] font-medium leading-relaxed">
                  {stat.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}