"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { 
  Heart, 
  Shield, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Github,
  CheckCircle2,
  Wifi,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// --- MICRO-INTERACTION COMPONENTS ---

const SocialLink = ({ icon: Icon, href }: { icon: any, href: string }) => (
  <a 
    href={href}
    className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-white/5 bg-[#231854] text-[#CCCCD9] transition-all hover:border-[#DA8CA0]/50 hover:bg-[#DA8CA0]/10 hover:text-[#DA8CA0]"
  >
    <Icon className="h-4 w-4 transition-transform group-hover:scale-110" />
    <span className="absolute -bottom-8 scale-0 rounded bg-[#DA8CA0] px-2 py-1 text-[10px] text-[#1C1246] font-bold transition-all group-hover:scale-100">
      Follow
    </span>
  </a>
)

const FooterLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
  <Link href={href} className="group flex items-center gap-2 text-sm text-[#CCCCD9] transition-colors hover:text-[#DA8CA0]">
    <span className="h-[1px] w-0 bg-[#DA8CA0] transition-all duration-300 group-hover:w-3" />
    {children}
  </Link>
)

export function Footer() {
  const [email, setEmail] = useState("")

  return (
    <footer className="relative mt-20 border-t border-[#DA8CA0]/10 bg-[#1C1246] pt-20 overflow-hidden">
      
      {/* 1. BACKGROUND AMBIENCE */}
      <div className="absolute top-0 left-1/2 h-[1px] w-full max-w-4xl -translate-x-1/2 bg-gradient-to-r from-transparent via-[#DA8CA0] to-transparent opacity-50 shadow-[0_0_30px_rgba(218,140,160,0.5)]" />
      <div className="absolute -top-24 left-1/2 -z-10 h-64 w-96 -translate-x-1/2 rounded-full bg-[#DA8CA0]/10 blur-[80px]" />
      
      {/* GIANT WATERMARK */}
      <div className="pointer-events-none absolute bottom-0 left-0 -z-10 select-none opacity-[0.03]">
        <h1 className="text-[20vw] font-bold leading-none text-white tracking-tighter">HEAL</h1>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* 2. TOP SECTION: BRAND & NEWSLETTER */}
        <div className="mb-20 grid gap-12 lg:grid-cols-2 lg:gap-24">
          
          {/* Brand Identity */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative flex h-12 w-12 items-center justify-center transition-transform group-hover:scale-105">
                 <div className="absolute -inset-1 rounded-full bg-[#DA8CA0]/10 animate-pulse" />
                 <div className="relative w-10 h-10">
                    <Image 
                       src="/heal-logo.png" 
                       alt="Heal Her Logo" 
                       fill 
                       className="object-contain" 
                    />
                 </div>
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                Heal <span className="text-[#DA8CA0]">Her</span>
              </span>
            </Link>
            
            <p className="max-w-md text-base leading-relaxed text-[#CCCCD9]">
              The gap between confusion and confidence is where we step in. We fill that gap with empathy, privacy, and instant health guidance for every girl.
            </p>
            <div className="flex gap-4">
              <SocialLink icon={Twitter} href="#" />
              <SocialLink icon={Github} href="#" />
              <SocialLink icon={Linkedin} href="#" />
              <SocialLink icon={Instagram} href="#" />
            </div>
          </div>

          {/* "Stay Prepared" Input */}
          <div className="flex flex-col justify-center rounded-3xl border border-white/5 bg-[#231854]/50 p-8 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#DA8CA0]/10 rounded-full blur-3xl pointer-events-none" />
            
            <h3 className="mb-2 text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#DA8CA0]" /> Join the Community
            </h3>
            <p className="mb-6 text-sm text-[#CCCCD9]">Get wellness tips, cycle tracking updates, and new feature alerts.</p>
            <div className="flex gap-3">
              <Input 
                type="email" 
                placeholder="enter@email.com" 
                className="bg-[#1C1246] border-white/10 text-white placeholder:text-slate-500 focus:border-[#DA8CA0]/50 focus:ring-[#DA8CA0]/20"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button className="bg-[#DA8CA0] hover:bg-[#E8B4C1] text-[#1C1246] font-bold shadow-lg shadow-[#DA8CA0]/20">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* 3. MIDDLE SECTION: NAVIGATION MATRIX */}
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4 border-t border-white/5 pt-16 pb-16">
          
          <div>
            <h4 className="mb-6 text-xs font-bold uppercase tracking-widest text-[#DA8CA0]">Platform</h4>
            <ul className="space-y-4">
              <li><FooterLink href="/how-it-works">How AI Helps</FooterLink></li>
              <li><FooterLink href="/ethics">Parental Guide</FooterLink></li>
              <li><FooterLink href="/privacy">My Privacy</FooterLink></li>
              <li><FooterLink href="/disclaimer">Health Disclaimer</FooterLink></li>
              <li><FooterLink href="/use-cases">For Schools</FooterLink></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-xs font-bold uppercase tracking-widest text-[#DA8CA0]">Wellness</h4>
            <ul className="space-y-4">
              {/* Renamed but same path */}
              <li><FooterLink href="/first-aid">Period & Body Guide</FooterLink></li>
              <li><FooterLink href="/emergency-response">Mental Health Support</FooterLink></li>
              <li><FooterLink href="/local-numbers">Helplines</FooterLink></li>
              <li><FooterLink href="/impact">Success Stories</FooterLink></li>
              <li><FooterLink href="/accessibility">Accessibility</FooterLink></li>
              <li><FooterLink href="/features">New Tools</FooterLink></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-xs font-bold uppercase tracking-widest text-[#DA8CA0]">Company</h4>
            <ul className="space-y-4">
              <li><FooterLink href="/mission">Our Promise</FooterLink></li>
              <li><FooterLink href="/careers">Volunteer</FooterLink></li>
              <li><FooterLink href="/partners">Medical Partners</FooterLink></li>
              <li><FooterLink href="/contact">Get Help</FooterLink></li>
              <li><FooterLink href="/roadmap">Future Plans</FooterLink></li>
              <li><FooterLink href="team">Who We Are</FooterLink></li>
              <li><FooterLink href="/about">About Heal Her</FooterLink></li>
            </ul>
          </div>

          <div>
             {/* THE "STATUS" CARD */}
            <div className="rounded-2xl border border-white/5 bg-[#231854] p-5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#DA8CA0]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#DA8CA0]">System Health</h4>
              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#CCCCD9] flex items-center gap-2">
                    <Wifi className="w-3 h-3" /> AI Status
                  </span>
                  <span className="text-emerald-400 font-mono text-xs">Online</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#CCCCD9] flex items-center gap-2">
                    <Shield className="w-3 h-3" /> Safe Mode
                  </span>
                  <span className="text-emerald-400 font-mono text-xs">Active</span>
                </div>
                <div className="mt-2 h-1 w-full rounded-full bg-[#1C1246] overflow-hidden">
                  <div className="h-full w-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-[10px] text-slate-500 pt-1">Safe space active. We are here for you.</p>
              </div>
            </div>
          </div>

        </div>

        {/* 4. BOTTOM BAR: LEGAL & BADGES */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 border-t border-white/5 py-8">
          
          <div className="flex flex-col md:flex-row items-center gap-4 text-xs text-slate-500 text-center lg:text-left">
             <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 items-center sm:items-start">
                <span className="font-medium text-[#CCCCD9]">© 2026 Heal Her.</span>
                <span className="hidden sm:inline opacity-30">|</span>
                <span>A Product of 
                    {/* UPDATED: Link to MedGuard AI */}
                    <a 
                        href="https://medguard-ai-eight.vercel.app/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#DA8CA0] hover:underline ml-1 font-bold"
                    >
                        MedGuard AI
                    </a>.
                </span>
                <span className="hidden sm:inline opacity-30">|</span>
                <span>Powered by <span className="text-white">Sliver Verse</span>.</span>
             </div>
             <div className="flex gap-4 mt-2 md:mt-0">
                <Link href="/privacy" className="hover:text-[#DA8CA0] transition-colors">Privacy</Link>
                <Link href="/terms" className="hover:text-[#DA8CA0] transition-colors">Terms</Link>
             </div>
          </div>

          <div className="flex items-center gap-4">
             {/* Badges */}
            <div className="flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300">
              <CheckCircle2 className="h-3 w-3" />
              <span>Verified Safe</span>
            </div>
             <div className="flex items-center gap-1.5 rounded-full border border-[#DA8CA0]/30 bg-[#DA8CA0]/10 px-3 py-1 text-xs font-medium text-[#DA8CA0]">
              <Heart className="h-3 w-3" />
              <span>Made with Love</span>
            </div>
          </div>
        </div>
        
      </div>
    </footer>
  )
}