"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { Lock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const FooterLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
  <Link href={href} className="group flex items-center gap-3 text-sm text-[#CCCCD9] transition-all duration-300 hover:text-white">
    <span className="h-[1px] w-0 bg-[#DA8CA0] transition-all duration-300 group-hover:w-4 shadow-[0_0_5px_#DA8CA0]" />
    {children}
  </Link>
)

export function Footer() {
  return (
    <footer className="relative mt-20 border-t border-[#DA8CA0]/10 bg-[#1C1246] pt-16 pb-8 overflow-hidden selection:bg-[#DA8CA0]/30 selection:text-[#DA8CA0]">
      
      {/* --- AMBIENCE & ARCHITECTURE --- */}
      <div className="absolute top-0 left-1/2 h-[1px] w-full max-w-5xl -translate-x-1/2 bg-gradient-to-r from-transparent via-[#DA8CA0]/50 to-transparent shadow-[0_0_30px_rgba(218,140,160,0.5)]" />
      <div className="absolute -top-32 left-1/2 -z-10 h-96 w-[600px] -translate-x-1/2 rounded-full bg-[#DA8CA0]/5 blur-[120px] pointer-events-none" />
      
      {/* GIANT WATERMARK */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 -z-10 select-none opacity-[0.02] mix-blend-overlay">
        <h1 className="text-[25vw] font-black leading-none text-white tracking-tighter">HEAL</h1>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* --- TOP SECTION: BRAND --- */}
        <div className="mb-16">
          <Link href="/" className="flex items-center gap-4 group inline-flex">
            <div className="relative flex h-14 w-14 items-center justify-center transition-transform duration-500 group-hover:scale-105">
               <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-[#DA8CA0]/20 to-transparent blur-md group-hover:animate-pulse" />
               <div className="absolute inset-0 rounded-full border border-white/10 bg-[#231854]/50 backdrop-blur-xl shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)]" />
               <div className="relative w-8 h-8">
                  <Image 
                     src="/heal-logo.png" 
                     alt="Heal Her Logo" 
                     fill 
                     className="object-contain drop-shadow-[0_0_10px_rgba(218,140,160,0.5)]" 
                  />
               </div>
            </div>
            <span className="text-3xl font-extrabold tracking-tight text-white drop-shadow-md">
              Heal <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DA8CA0] to-[#E8B4C1]">Her</span>
            </span>
          </Link>
          <p className="mt-6 max-w-md text-base leading-relaxed text-[#CCCCD9] font-light">
            The gap between confusion and confidence is where we step in. We fill that gap with empathy, privacy, and instant health guidance for every girl.
          </p>
        </div>

        {/* --- MIDDLE SECTION: NAVIGATION MATRIX --- */}
        <div className="grid gap-12 sm:grid-cols-3 border-t border-white/5 pt-12 pb-16">
          
          <div>
            <h4 className="mb-8 text-xs font-black uppercase tracking-[0.2em] text-[#DA8CA0]">Platform</h4>
            <ul className="space-y-5">
              <li><FooterLink href="/how-it-works">How AI Helps</FooterLink></li>
              <li><FooterLink href="/parental-guide">Parental Guide</FooterLink></li>
              <li><FooterLink href="/trust">My Privacy</FooterLink></li>
              <li><FooterLink href="/health-disclaimer">Health Disclaimer</FooterLink></li>
              <li><FooterLink href="/use-cases">Use Cases</FooterLink></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-8 text-xs font-black uppercase tracking-[0.2em] text-[#DA8CA0]">Wellness</h4>
            <ul className="space-y-5">
              <li><FooterLink href="/body-guide">Period & Body Guide</FooterLink></li>
              <li><FooterLink href="/health-support">Mental Health Support</FooterLink></li>
              <li><FooterLink href="/impact">Impact</FooterLink></li>
              <li><FooterLink href="/accessibility">Accessibility</FooterLink></li>
              <li><FooterLink href="/features">Features</FooterLink></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-8 text-xs font-black uppercase tracking-[0.2em] text-[#DA8CA0]">Company</h4>
            <ul className="space-y-5">
              <li><FooterLink href="/contact">Get Help</FooterLink></li>
              <li><FooterLink href="/roadmap">Future Plans</FooterLink></li>
              <li><FooterLink href="/team">Who We Are</FooterLink></li>
              <li><FooterLink href="/about">About Heal Her</FooterLink></li>
            </ul>
          </div>

        </div>

        {/* --- DEDICATED ACCESS PORTAL (LIQUID GLASS BUTTONS) --- */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 border-t border-white/5 py-12 relative">
           
           {/* Transparent Glossy Liquid Button (Standard) */}
           <Button asChild className="group relative overflow-hidden h-14 rounded-full bg-white/5 backdrop-blur-xl border border-white/20 border-t-white/40 shadow-[inset_0_1px_10px_rgba(255,255,255,0.1)] hover:bg-white/10 hover:shadow-[inset_0_1px_15px_rgba(255,255,255,0.2)] text-white font-bold px-10 transition-all duration-500">
             <Link href="/login">
               <div className="absolute top-0 left-[-100%] w-[150%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
               <span className="relative z-10 flex items-center">
                 Member Login <ArrowRight className="w-4 h-4 ml-2 opacity-50 group-hover:opacity-100 transition-opacity" />
               </span>
             </Link>
           </Button>

           {/* Dusty Rose Glossy Liquid Glass Button (Premium/Staff) */}
           <Button asChild className="group relative overflow-hidden h-14 rounded-full bg-gradient-to-b from-[#f3cbd4]/90 to-[#DA8CA0]/90 backdrop-blur-xl border border-[#DA8CA0]/50 border-t-white/80 shadow-[inset_0_2px_10px_rgba(255,255,255,0.8),0_10px_30px_-10px_rgba(218,140,160,0.8)] text-[#1C1246] font-extrabold px-10 hover:scale-105 hover:from-[#fae0e6] hover:to-[#e19eb0] transition-all duration-500">
             <Link href="/management/auth/login">
               <div className="absolute top-0 left-[-100%] w-[150%] h-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
               <span className="relative z-10 flex items-center gap-2 tracking-wide">
                 <Lock className="w-4 h-4" /> Staff Portal
               </span>
             </Link>
           </Button>
           
        </div>

        {/* --- BOTTOM BAR: LEGAL --- */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-t border-white/5 pt-8">
          <div className="flex items-center gap-3 text-xs text-[#CCCCD9] font-light">
            <span className="font-medium text-white/80 tracking-wide">© 2026 Heal Her. All rights reserved.</span>
          </div>
          <div className="flex gap-6 text-xs text-[#CCCCD9] font-light">
            <Link href="/privacy" className="hover:text-[#DA8CA0] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#DA8CA0] transition-colors">Terms of Service</Link>
          </div>
        </div>
        
      </div>
    </footer>
  )
}