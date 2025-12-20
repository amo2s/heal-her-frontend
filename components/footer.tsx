"use client"

import React, { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  Activity, 
  Heart, 
  Shield, 
  ArrowRight, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Github,
  CheckCircle2,
  Wifi
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// --- MICRO-INTERACTION COMPONENTS ---

const SocialLink = ({ icon: Icon, href }: { icon: any, href: string }) => (
  <a 
    href={href}
    className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-800 bg-slate-900/50 text-slate-400 transition-all hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-blue-400"
  >
    <Icon className="h-4 w-4 transition-transform group-hover:scale-110" />
    <span className="absolute -bottom-8 scale-0 rounded bg-slate-800 px-2 py-1 text-[10px] text-white transition-all group-hover:scale-100">
      Follow
    </span>
  </a>
)

const FooterLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
  <Link href={href} className="group flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-blue-400">
    <span className="h-[1px] w-0 bg-blue-500 transition-all duration-300 group-hover:w-3" />
    {children}
  </Link>
)

export function Footer() {
  const [email, setEmail] = useState("")

  return (
    <footer className="relative mt-20 border-t border-slate-800 bg-slate-950 pt-20 overflow-hidden">
      
      {/* 1. BACKGROUND AMBIENCE */}
      <div className="absolute top-0 left-1/2 h-[1px] w-full max-w-4xl -translate-x-1/2 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50 shadow-[0_0_30px_rgba(59,130,246,0.5)]" />
      <div className="absolute -top-24 left-1/2 -z-10 h-64 w-96 -translate-x-1/2 rounded-full bg-blue-600/10 blur-[80px]" />
      
      {/* GIANT WATERMARK (Subtle depth) */}
      <div className="pointer-events-none absolute bottom-0 left-0 -z-10 select-none opacity-[0.02]">
        <h1 className="text-[20vw] font-bold leading-none text-white">MED</h1>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* 2. TOP SECTION: BRAND & NEWSLETTER */}
        <div className="mb-20 grid gap-12 lg:grid-cols-2 lg:gap-24">
          
          {/* Brand Identity */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-500/25">
                <Activity className="h-6 w-6 text-white" />
                {/* The "Pulse" Animation */}
                <span className="absolute inset-0 -z-10 animate-ping rounded-xl bg-blue-500 opacity-20 duration-1000" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">MedGuard AI</span>
            </Link>
            <p className="max-w-md text-base leading-relaxed text-slate-400">
              The gap between an emergency and the ambulance is where lives are lost. We fill that gap with intelligence, empathy, and instant guidance.
            </p>
            <div className="flex gap-4">
              <SocialLink icon={Twitter} href="#" />
              <SocialLink icon={Github} href="#" />
              <SocialLink icon={Linkedin} href="#" />
              <SocialLink icon={Instagram} href="#" />
            </div>
          </div>

          {/* "Stay Prepared" Input */}
          <div className="flex flex-col justify-center rounded-3xl border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-sm">
            <h3 className="mb-2 text-lg font-semibold text-white">Join the Safety Network</h3>
            <p className="mb-6 text-sm text-slate-400">Get critical first-aid updates and app feature releases.</p>
            <div className="flex gap-3">
              <Input 
                type="email" 
                placeholder="enter@email.com" 
                className="bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-blue-500/20"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button className="bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-900/20">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* 3. MIDDLE SECTION: NAVIGATION MATRIX */}
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4 border-t border-slate-800 pt-16 pb-16">
          
          <div>
            <h4 className="mb-6 text-xs font-bold uppercase tracking-widest text-slate-500">Platform</h4>
            <ul className="space-y-4">
              <li><FooterLink href="/how-it-works">How it Works</FooterLink></li>
              <li><FooterLink href="/ethics">Ethics</FooterLink></li>
              <li><FooterLink href="/privacy">Security & Privacy</FooterLink></li>
              <li><FooterLink href="/disclaimer">Disclaimer</FooterLink></li>
              <li><FooterLink href="/use-cases">Use Cases</FooterLink></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-xs font-bold uppercase tracking-widest text-slate-500">Resources</h4>
            <ul className="space-y-4">
              <li><FooterLink href="/first-aid">First Aid </FooterLink></li>
              <li><FooterLink href="/emergency-response">Emergency Response</FooterLink></li>
              <li><FooterLink href="/local-numbers">Emergency Numbers</FooterLink></li>
              <li><FooterLink href="/impact">Impact</FooterLink></li>
              <li><FooterLink href="/accessibility">Accessibility</FooterLink></li>
              <li><FooterLink href="/features">Features</FooterLink></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-xs font-bold uppercase tracking-widest text-slate-500">Company</h4>
            <ul className="space-y-4">
              <li><FooterLink href="/mission">Our Mission</FooterLink></li>
              <li><FooterLink href="/careers">Careers</FooterLink></li>
              <li><FooterLink href="/partners">Medical Partners</FooterLink></li>
              <li><FooterLink href="/contact">Contact Support</FooterLink></li>
              <li><FooterLink href="/roadmap">Road Map</FooterLink></li>
              <li><FooterLink href="team">Teams</FooterLink></li>
              <li><FooterLink href="/about">About</FooterLink></li>
            </ul>
          </div>

          <div>
             {/* THE "STATUS" CARD - High Tech Touch */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
              <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">System Status</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Wifi className="w-3 h-3" /> API Latency
                  </span>
                  <span className="text-green-400 font-mono text-xs">24ms</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Shield className="w-3 h-3" /> Encryption
                  </span>
                  <span className="text-green-400 font-mono text-xs">AES-256</span>
                </div>
                <div className="mt-2 h-1 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full w-full bg-green-500 animate-pulse" />
                </div>
                <p className="text-[10px] text-slate-500 pt-1">All systems operational. Ready to assist.</p>
              </div>
            </div>
          </div>

        </div>

        {/* 4. BOTTOM BAR: LEGAL & BADGES */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-t border-slate-800 py-8">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-xs text-slate-500">
            <span>© 2025 MedGuard AI Inc.</span>
            <Link href="/privacy" className="hover:text-slate-300">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-300">Terms of Service</Link>
          </div>

          <div className="flex items-center gap-4">
             {/* Dynamic Badge 1 */}
            <div className="flex items-center gap-1.5 rounded-full border border-blue-900/30 bg-blue-900/10 px-3 py-1 text-xs font-medium text-blue-400">
              <CheckCircle2 className="h-3 w-3" />
              <span>Medical Board Reviewed</span>
            </div>
            
             {/* Dynamic Badge 2 */}
             <div className="flex items-center gap-1.5 rounded-full border border-rose-900/30 bg-rose-900/10 px-3 py-1 text-xs font-medium text-rose-400">
              <Heart className="h-3 w-3" />
              <span>Human First Design</span>
            </div>
          </div>
        </div>
        
      </div>
    </footer>
  )
}