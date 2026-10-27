"use client"

import React from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Heart } from "lucide-react"

export default function HeroCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="mt-20 relative w-full max-w-xl mx-auto aspect-[6/7] rounded-[2.5rem] md:rounded-[3rem] overflow-hidden border border-[#DA8CA0]/20 shadow-[0_20px_80px_-20px_rgba(28,18,70,0.8)] group block bg-[#1C1246]"
    >
      {/* Deep overlay for text contrast and premium feel */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1C1246]/20 via-transparent to-[#231854]/80 z-10 pointer-events-none transition-opacity duration-700 group-hover:opacity-80" />
      
      <Image 
        src="/hero-image.png"
        alt="Heal Her Platform Interface"
        fill
        className="object-cover relative z-0 transform group-hover:scale-105 transition-transform duration-[20s] ease-out"
        priority
      />
      
      {/* Decorative Glow Elements inside the card */}
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[#DA8CA0]/20 blur-[80px] rounded-full z-10 pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#DA8CA0]/10 blur-[80px] rounded-full z-10 pointer-events-none" />

      {/* Refined Growth Emblem (Compact & Flush) */}
      <motion.div 
        animate={{ 
          boxShadow: [
            "-10px -10px 25px rgba(218,140,160,0.08)", 
            "-10px -10px 40px rgba(218,140,160,0.2)", 
            "-10px -10px 25px rgba(218,140,160,0.08)"
          ]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 right-0 z-20 flex items-center gap-3 px-5 py-4 bg-[#231854]/95 backdrop-blur-2xl border-t border-l border-white/10 rounded-tl-[2rem]"
      >
        <div className="relative flex items-center justify-center">
          <Heart className="w-5 h-5 text-[#DA8CA0] fill-[#DA8CA0]" />
        </div>
        
        <div className="flex flex-col">
          <span className="text-[9px] uppercase tracking-widest text-[#DA8CA0] font-bold leading-none mb-1">
            Verified
          </span>
          <span className="text-sm text-white font-semibold leading-none">
            Safe Space
          </span>
        </div>
      </motion.div>
    </motion.div>
  )
}