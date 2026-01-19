"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Menu, 
  X, 
  ChevronDown, 
  MessageCircle, // Updated for Chat
  Heart, 
  BookOpen, 
  User, 
  ArrowRight // Updated for Button
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// --- MICRO COMPONENTS ---

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link 
      href={href} 
      className={cn(
        "relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 group",
        isActive 
          ? "text-[#1C1246] bg-[#DA8CA0]" // Active: Dusty Rose bg, Indigo text
          : "text-[#CCCCD9] hover:text-white hover:bg-white/5"
      )}
    >
      {children}
      {isActive && (
        <motion.div
          layoutId="navbar-indicator"
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FAFAFA] shadow-[0_0_15px_rgba(250,250,250,0.8)]"
          transition={{ duration: 0.3 }}
        />
      )}
    </Link>
  )
}

const MobileNavLink = ({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) => (
  <Link
    href={href}
    onClick={onClick}
    className="block rounded-xl px-4 py-3 text-base font-medium text-[#CCCCD9] hover:bg-white/5 hover:text-[#DA8CA0] transition-all active:scale-[0.98]"
  >
    {children}
  </Link>
)

// Helper for glowing dropdowns
const DropdownContentStyled = ({ children, className = "", ...props }: any) => (
  <DropdownMenuContent 
    align="center" 
    // UPDATED: Midnight Indigo bg, Dusty Rose border glow
    className={cn(
      "w-48 border border-[#DA8CA0]/20 bg-[#1C1246]/95 backdrop-blur-2xl text-[#CCCCD9] shadow-[0_0_30px_-10px_rgba(218,140,160,0.3)]", 
      className
    )}
    {...props}
  >
    {children}
  </DropdownMenuContent>
)

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Detect Scroll for Glass Effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed top-0 z-50 w-full border-b transition-all duration-500",
        isScrolled
          ? "border-[#DA8CA0]/10 bg-[#1C1246]/80 shadow-[0_4px_30px_rgba(0,0,0,0.2)] backdrop-blur-md supports-[backdrop-filter]:bg-[#1C1246]/60"
          : "border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          
          {/* --- LOGO (HEAL HER) --- */}
          <Link href="/" className="group flex items-center gap-3 relative z-10">
            {/* Logo Container with Subtle Glow */}
            <div className="relative flex h-12 w-12 items-center justify-center transition-transform duration-500 group-hover:scale-105">
              
              {/* Outer Glow (Dusty Rose) - Reduced Strength */}
              <div className="absolute -inset-1 rounded-full bg-[#DA8CA0]/10 animate-pulse" style={{ animationDuration: '4s' }} />
              
              {/* Actual Image Logo - Increased Size */}
              <div className="relative w-12 h-12">
                 <Image 
                    src="/heal-logo.png" 
                    alt="Heal Her Logo" 
                    fill 
                    className="object-contain" 
                 />
              </div>
            </div>

            <span className="text-2xl font-bold tracking-tight text-white">
              Heal <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DA8CA0] to-[#E8B4C1] group-hover:from-[#E8B4C1] group-hover:to-white transition-all">Her</span>
            </span>
          </Link>

          {/* --- DESKTOP NAV --- */}
          <div className="hidden items-center gap-2 md:flex">
            
            {/* Dropdown: About */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="px-3 py-2 rounded-lg flex items-center gap-1 text-sm font-medium text-[#CCCCD9] hover:text-white hover:bg-white/5 transition-all outline-none data-[state=open]:text-white data-[state=open]:bg-white/10">
                  About <ChevronDown className="h-3 w-3 opacity-50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownContentStyled>
                <DropdownMenuItem className="focus:bg-[#DA8CA0]/20 focus:text-[#DA8CA0] cursor-pointer" asChild>
                  <Link href="/about">Our Mission</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-[#DA8CA0]/20 focus:text-[#DA8CA0] cursor-pointer" asChild>
                  <Link href="/privacy">Privacy & Safety</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-[#DA8CA0]/20 focus:text-[#DA8CA0] cursor-pointer" asChild>
                  <Link href="/ethics">Parent's Guide</Link>
                </DropdownMenuItem>
              </DropdownContentStyled>
            </DropdownMenu>

            {/* Dropdown: Learn */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="px-3 py-2 rounded-lg flex items-center gap-1 text-sm font-medium text-[#CCCCD9] hover:text-white hover:bg-white/5 transition-all outline-none data-[state=open]:text-white data-[state=open]:bg-white/10">
                  Learn <ChevronDown className="h-3 w-3 opacity-50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownContentStyled className="w-56">
                <DropdownMenuItem className="focus:bg-[#DA8CA0]/20 focus:text-[#DA8CA0] cursor-pointer gap-2" asChild>
                  <Link href="/chat">
                    <MessageCircle className="h-4 w-4 text-[#DA8CA0]" /> AI Health Chat
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-[#DA8CA0]/20 focus:text-[#DA8CA0] cursor-pointer gap-2" asChild>
                  <Link href="/wellness">
                    <Heart className="h-4 w-4 text-pink-400" /> Wellness Guide
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-[#DA8CA0]/20 focus:text-[#DA8CA0] cursor-pointer gap-2" asChild>
                  <Link href="/library">
                    <BookOpen className="h-4 w-4 text-purple-400" /> Body Library
                  </Link>
                </DropdownMenuItem>
              </DropdownContentStyled>
            </DropdownMenu>

            <NavLink href="/community">Community</NavLink>
            <NavLink href="/contact">Support</NavLink>
          </div>

          {/* --- CTA BUTTONS --- */}
          <div className="hidden items-center gap-4 md:flex">
            <Link href="/staff/login" className="text-sm font-medium text-[#CCCCD9] hover:text-white transition-colors px-3 py-2 hover:bg-white/5 rounded-lg">
              Staff Portal
            </Link>
            {/* CTA: Dusty Rose Gradient with Arrow */}
            <Button asChild className="relative h-11 overflow-hidden rounded-full bg-gradient-to-b from-[#DA8CA0] to-[#d47890] px-8 text-sm font-bold text-[#1C1246] transition-all hover:to-[#DA8CA0] hover:shadow-[0_0_30px_rgba(218,140,160,0.5)] border border-[#DA8CA0]/50 hover:scale-105 active:scale-95">
              <Link href="/launch">
                Start Chat <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          {/* --- MOBILE TOGGLE --- */}
          <button 
            className="md:hidden relative z-50 p-2 -mr-2 text-[#CCCCD9] hover:text-white transition-colors rounded-lg hover:bg-white/10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* --- MOBILE MENU OVERLAY --- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "100vh" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 top-0 z-40 bg-[#1C1246]/98 backdrop-blur-xl pt-24 md:hidden"
          >
             {/* Background Gradients for Mobile */}
             <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none opacity-50">
                <div className="absolute top-[-10%] right-[-20%] w-[500px] h-[500px] bg-[#DA8CA0]/20 rounded-full blur-3xl animate-pulse" style={{animationDuration: '8s'}} />
                <div className="absolute bottom-[-10%] left-[-20%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-3xl animate-pulse" style={{animationDuration: '10s'}}/>
             </div>

            <div className="flex flex-col h-full px-6 pb-10 overflow-y-auto">
              <div className="flex-1 space-y-2">
                <div className="px-4 pb-4 text-xs font-bold uppercase tracking-widest text-[#DA8CA0]">Menu</div>
                <MobileNavLink href="/about" onClick={() => setMobileMenuOpen(false)}>About Heal Her</MobileNavLink>
                <MobileNavLink href="/chat" onClick={() => setMobileMenuOpen(false)}>AI Health Chat</MobileNavLink>
                <MobileNavLink href="/wellness" onClick={() => setMobileMenuOpen(false)}>Wellness Guide</MobileNavLink>
                <MobileNavLink href="/community" onClick={() => setMobileMenuOpen(false)}>Community</MobileNavLink>
                <MobileNavLink href="/contact" onClick={() => setMobileMenuOpen(false)}>Contact Support</MobileNavLink>
              </div>

              <div className="mt-auto space-y-4 border-t border-white/10 pt-8">
                <Button variant="outline" asChild className="w-full justify-start gap-2 border-[#2a2259] bg-[#231854] text-[#CCCCD9] hover:bg-[#2a2259] hover:text-white h-12 rounded-xl font-semibold">
                  <Link href="/staff/login" onClick={() => setMobileMenuOpen(false)}>
                    <User className="h-5 w-5" /> Staff Portal
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start gap-2 bg-gradient-to-r from-[#DA8CA0] to-[#E8B4C1] text-[#1C1246] hover:from-[#d47890] hover:to-[#DA8CA0] shadow-lg shadow-[#DA8CA0]/30 h-12 rounded-xl font-bold text-lg">
                  <Link href="/launch" onClick={() => setMobileMenuOpen(false)}>
                    Start Chatting <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}