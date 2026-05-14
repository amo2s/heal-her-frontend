"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion"
import { 
  Menu, 
  X, 
  ChevronDown, 
  MessageCircle, 
  Heart, 
  BookOpen, 
  User, 
  ArrowRight 
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
        "relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 group",
        isActive 
          ? "text-[#1C1246] bg-[#DA8CA0]" 
          : "text-[#CCCCD9] hover:text-white hover:bg-white/5"
      )}
    >
      {children}
      {isActive && (
        <motion.div
          layoutId="navbar-indicator"
          className="absolute -bottom-1 left-1/2 w-6 -translate-x-1/2 h-[3px] rounded-full bg-[#FAFAFA]"
          transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
        />
      )}
    </Link>
  )
}

const MobileNavLink = ({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) => (
  <Link
    href={href}
    onClick={onClick}
    className="block rounded-2xl px-4 py-3 text-base font-medium text-[#CCCCD9] hover:bg-white/5 hover:text-[#DA8CA0] transition-all active:scale-[0.98]"
  >
    {children}
  </Link>
)

const DropdownContentStyled = ({ children, className = "", ...props }: any) => (
  <DropdownMenuContent 
    align="center" 
    className={cn(
      "w-52 border border-white/10 border-t-[#DA8CA0]/30 bg-[#1C1246]/95 backdrop-blur-xl text-[#CCCCD9] shadow-2xl rounded-2xl p-2", 
      className
    )}
    {...props}
  >
    {children}
  </DropdownMenuContent>
)

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const { scrollY } = useScroll()
  const lastYRef = useRef(0)

  // Hide on scroll down, show on scroll up
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 20)
    
    const previous = lastYRef.current
    if (latest > previous && latest > 150) {
      setIsVisible(false)
      setMobileMenuOpen(false) // Close mobile menu if open while scrolling down
    } else if (latest < previous) {
      setIsVisible(true)
    }
    lastYRef.current = latest
  })

  // Ultra-smooth easing curve
  const smoothEase: [number, number, number, number] = [0.22, 1, 0.36, 1]

  return (
    <>
      <motion.header
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : "-100%" }}
        transition={{ duration: 0.6, ease: smoothEase }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 flex justify-center w-full transition-all duration-700",
          isScrolled 
            ? "bg-[#1C1246]/85 backdrop-blur-2xl border-b border-white/5 shadow-lg" 
            : "bg-transparent border-transparent pt-4"
        )}
      >
        <div className="flex items-center justify-between mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
          
          {/* --- LOGO & TAGLINE --- */}
          <Link href="/" className="group flex items-center gap-4 relative z-10 shrink-0">
            <div className="relative flex h-14 w-14 items-center justify-center transition-transform duration-500 group-hover:scale-105">
              <div className="relative w-14 h-14">
                 <Image 
                    src="/heal-logo.png" 
                    alt="Heal Her Logo" 
                    fill 
                    className="object-contain" 
                 />
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <span className="text-2xl font-extrabold tracking-tight text-white leading-none">
                Heal <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DA8CA0] to-[#E8B4C1]">Her</span>
              </span>
              <span className="text-[#DA8CA0]/90 font-semibold tracking-widest uppercase text-[10px] mt-1.5">
                Her Questions • Our Answers • Her Power
              </span>
            </div>
          </Link>

          {/* --- DESKTOP NAV --- */}
          <div className="hidden items-center gap-2 md:flex">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="px-4 py-2 rounded-xl flex items-center gap-1.5 text-sm font-medium text-[#CCCCD9] hover:text-white hover:bg-white/5 transition-all outline-none data-[state=open]:text-white data-[state=open]:bg-white/10">
                  About <ChevronDown className="h-3.5 w-3.5 opacity-50 transition-transform data-[state=open]:rotate-180" />
                </button>
              </DropdownMenuTrigger>
              <DropdownContentStyled>
                <DropdownMenuItem className="focus:bg-white/5 focus:text-white cursor-pointer rounded-lg mb-1" asChild>
                  <Link href="/about">Our Mission</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-white/5 focus:text-white cursor-pointer rounded-lg mb-1" asChild>
                  <Link href="/privacy">Privacy & Safety</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-white/5 focus:text-white cursor-pointer rounded-lg" asChild>
                  <Link href="/ethics">Parent's Guide</Link>
                </DropdownMenuItem>
              </DropdownContentStyled>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="px-4 py-2 rounded-xl flex items-center gap-1.5 text-sm font-medium text-[#CCCCD9] hover:text-white hover:bg-white/5 transition-all outline-none data-[state=open]:text-white data-[state=open]:bg-white/10">
                  Learn <ChevronDown className="h-3.5 w-3.5 opacity-50 transition-transform data-[state=open]:rotate-180" />
                </button>
              </DropdownMenuTrigger>
              <DropdownContentStyled className="w-60">
                <DropdownMenuItem className="focus:bg-white/5 focus:text-white cursor-pointer gap-3 rounded-lg mb-1 p-3" asChild>
                  <Link href="/chat">
                    <MessageCircle className="h-4 w-4 text-[#DA8CA0]" /> AI Health Chat
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-white/5 focus:text-white cursor-pointer gap-3 rounded-lg mb-1 p-3" asChild>
                  <Link href="/wellness">
                    <Heart className="h-4 w-4 text-[#DA8CA0]" /> Wellness Guide
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-white/5 focus:text-white cursor-pointer gap-3 rounded-lg p-3" asChild>
                  <Link href="/library">
                    <BookOpen className="h-4 w-4 text-[#DA8CA0]" /> Body Library
                  </Link>
                </DropdownMenuItem>
              </DropdownContentStyled>
            </DropdownMenu>

            <NavLink href="/community">Community</NavLink>
            <NavLink href="/contact">Support</NavLink>
          </div>

          {/* --- CTA BUTTONS --- */}
          <div className="hidden items-center gap-4 md:flex shrink-0">
            <Link href="/staff/login" className="text-sm font-medium text-[#CCCCD9] hover:text-white transition-colors px-4 py-2 hover:bg-white/5 rounded-xl">
              Staff Portal
            </Link>
            <Button asChild className="relative h-12 overflow-hidden rounded-full bg-gradient-to-r from-[#DA8CA0] to-[#E8B4C1] px-8 text-sm font-bold text-[#1C1246] transition-transform hover:scale-105 active:scale-95">
              <Link href="/launch">
                Start Chat <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          {/* --- MOBILE TOGGLE --- */}
          <button 
            className="md:hidden relative z-50 flex h-10 w-10 items-center justify-center -mr-2 text-[#CCCCD9] hover:text-[#DA8CA0] transition-colors rounded-full hover:bg-white/5 active:scale-95"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </motion.header>

      {/* --- MOBILE MENU OVERLAY --- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop Blur Layer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-30 bg-[#1C1246]/60 backdrop-blur-sm md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* The Mobile Dropdown Island */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.4, ease: smoothEase }}
              className="fixed left-0 right-0 top-[100px] z-40 mx-auto w-[92%] max-w-sm md:hidden overflow-hidden rounded-[2rem] border border-white/10 bg-[#1C1246]/95 p-6 shadow-2xl backdrop-blur-2xl"
            >
              <div className="flex flex-col relative z-10 space-y-1">
                <div className="px-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-[#DA8CA0]">Menu</div>
                <MobileNavLink href="/about" onClick={() => setMobileMenuOpen(false)}>About Heal Her</MobileNavLink>
                <MobileNavLink href="/chat" onClick={() => setMobileMenuOpen(false)}>AI Health Chat</MobileNavLink>
                <MobileNavLink href="/wellness" onClick={() => setMobileMenuOpen(false)}>Wellness Guide</MobileNavLink>
                <MobileNavLink href="/community" onClick={() => setMobileMenuOpen(false)}>Community</MobileNavLink>
                <MobileNavLink href="/contact" onClick={() => setMobileMenuOpen(false)}>Contact Support</MobileNavLink>

                <div className="space-y-3 border-t border-white/10 pt-6 mt-4">
                  <Button variant="outline" asChild className="w-full justify-start gap-3 border-white/10 bg-transparent text-[#CCCCD9] hover:bg-white/5 hover:text-white h-14 rounded-2xl font-semibold transition-all">
                    <Link href="/staff/login" onClick={() => setMobileMenuOpen(false)}>
                      <User className="h-5 w-5" /> Staff Portal
                    </Link>
                  </Button>
                  <Button asChild className="w-full justify-start gap-3 bg-gradient-to-r from-[#DA8CA0] to-[#E8B4C1] text-[#1C1246] h-14 rounded-2xl font-bold text-base transition-transform hover:scale-[1.02]">
                    <Link href="/launch" onClick={() => setMobileMenuOpen(false)}>
                      Start Chatting <ArrowRight className="h-5 w-5 ml-auto" />
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}