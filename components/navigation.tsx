"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ChevronDown, Activity, Zap, Shield, Heart, User, LogIn } from "lucide-react"
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
      // UPDATED: Added padding and background hover effect for a more "app-like" feel
      className={cn(
        "relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 group",
        isActive 
          ? "text-white bg-white/10" 
          : "text-slate-400 hover:text-white hover:bg-white/5"
      )}
    >
      {children}
      {/* UPDATED: Made the active indicator subtly glow */}
      {isActive && (
        <motion.div
          layoutId="navbar-indicator"
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-400 shadow-[0_0_15px_rgba(59,130,246,1)]"
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
    className="block rounded-xl px-4 py-3 text-base font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-all active:scale-[0.98]"
  >
    {children}
  </Link>
)

// Helper for glowing dropdowns
const DropdownContentStyled = ({ children, className = "", ...props }: any) => (
  <DropdownMenuContent 
    align="center" 
    // UPDATED: Added a blue glow shadow and tighter border integration
    className={cn(
      "w-48 border border-blue-500/10 bg-slate-900/95 backdrop-blur-2xl text-slate-300 shadow-[0_0_30px_-10px_rgba(59,130,246,0.3)]", 
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
          // UPDATED: Deeper, more premium glass effect on scroll with subtle shadow
          ? "border-white/[0.08] bg-slate-950/70 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-md supports-[backdrop-filter]:bg-slate-900/60"
          : "border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          
          {/* --- LOGO (ENHANCED PULSATING) --- */}
          <Link href="/" className="group flex items-center gap-3 relative z-10">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30 transition-all duration-500 group-hover:shadow-blue-500/60 group-hover:scale-105">
              
              {/* UPDATED: Stronger, larger pulse effect that extends outside the box */}
              <div className="absolute -inset-2 rounded-xl bg-blue-500/40 animate-ping" style={{ animationDuration: '2s' }} />
              
              {/* NEW: A subtle secondary "breathing" glow layer */}
              <div className="absolute -inset-1 rounded-xl bg-indigo-500/20 animate-pulse blur-sm" style={{ animationDuration: '3s' }} />
              
              <Activity className="h-6 w-6 text-white animate-pulse relative z-10" /> 
              <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/30 z-10" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              MedGuard <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 group-hover:from-blue-300 group-hover:to-indigo-300 transition-all">AI</span>
            </span>
          </Link>

          {/* --- DESKTOP NAV --- */}
          <div className="hidden items-center gap-2 md:flex">
            
            {/* Dropdown: About */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="px-3 py-2 rounded-lg flex items-center gap-1 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all outline-none data-[state=open]:text-white data-[state=open]:bg-white/10">
                  About <ChevronDown className="h-3 w-3 opacity-50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownContentStyled>
                <DropdownMenuItem className="focus:bg-blue-600/20 focus:text-blue-200 cursor-pointer" asChild>
                  <Link href="/about">Mission & Vision</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-blue-600/20 focus:text-blue-200 cursor-pointer" asChild>
                  <Link href="/how-it-works">How AI Works</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-blue-600/20 focus:text-blue-200 cursor-pointer" asChild>
                  <Link href="/ethics">Ethical Standards</Link>
                </DropdownMenuItem>
              </DropdownContentStyled>
            </DropdownMenu>

            {/* Dropdown: Features */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="px-3 py-2 rounded-lg flex items-center gap-1 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all outline-none data-[state=open]:text-white data-[state=open]:bg-white/10">
                  Platform <ChevronDown className="h-3 w-3 opacity-50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownContentStyled className="w-56">
                <DropdownMenuItem className="focus:bg-blue-600/20 focus:text-blue-200 cursor-pointer gap-2" asChild>
                  <Link href="/emergency-response">
                    <Zap className="h-4 w-4 text-blue-400" /> Emergency Triage
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-blue-600/20 focus:text-blue-200 cursor-pointer gap-2" asChild>
                  <Link href="/first-aid">
                    <Heart className="h-4 w-4 text-rose-400" /> First Aid Guide
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-blue-600/20 focus:text-blue-200 cursor-pointer gap-2" asChild>
                  <Link href="/privacy">
                    <Shield className="h-4 w-4 text-emerald-400" /> Security & Privacy
                  </Link>
                </DropdownMenuItem>
              </DropdownContentStyled>
            </DropdownMenu>

            <NavLink href="/pricing">Pricing</NavLink>
            <NavLink href="/contact">Contact</NavLink>
            <NavLink href="/team">Team</NavLink>
          </div>

          {/* --- CTA BUTTONS --- */}
          <div className="hidden items-center gap-4 md:flex">
            <Link href="/staff/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors px-3 py-2 hover:bg-white/5 rounded-lg">
              Staff Login
            </Link>
            {/* UPDATED: More prominent launch button with stronger glow */}
            <Button asChild className="relative h-11 overflow-hidden rounded-full bg-gradient-to-b from-white to-blue-50 px-8 text-sm font-bold text-blue-900 transition-all hover:to-white hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] border border-blue-100/50 hover:scale-105 active:scale-95">
              <Link href="/launch">
                Launch App
              </Link>
            </Button>
          </div>

          {/* --- MOBILE TOGGLE --- */}
          <button 
            className="md:hidden relative z-50 p-2 -mr-2 text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-white/10"
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
            className="fixed inset-0 top-0 z-40 bg-slate-950/95 backdrop-blur-xl pt-24 md:hidden"
          >
             {/* Background Gradients for Mobile */}
             <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none opacity-50">
                <div className="absolute top-[-10%] right-[-20%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl animate-pulse" style={{animationDuration: '8s'}} />
                <div className="absolute bottom-[-10%] left-[-20%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-3xl animate-pulse" style={{animationDuration: '10s'}}/>
             </div>

            <div className="flex flex-col h-full px-6 pb-10 overflow-y-auto">
              <div className="flex-1 space-y-2">
                <div className="px-4 pb-4 text-xs font-bold uppercase tracking-widest text-blue-500">Menu</div>
                <MobileNavLink href="/about" onClick={() => setMobileMenuOpen(false)}>About MedGuard</MobileNavLink>
                <MobileNavLink href="/how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</MobileNavLink>
                <MobileNavLink href="/team" onClick={() => setMobileMenuOpen(false)}>Meet The Team</MobileNavLink>
                <MobileNavLink href="/pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</MobileNavLink>
                <MobileNavLink href="/contact" onClick={() => setMobileMenuOpen(false)}>Contact Support</MobileNavLink>
              </div>

              <div className="mt-auto space-y-4 border-t border-white/10 pt-8">
                <Button variant="outline" asChild className="w-full justify-start gap-2 border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800 hover:text-white h-12 rounded-xl font-semibold">
                  <Link href="/staff/login" onClick={() => setMobileMenuOpen(false)}>
                    <User className="h-5 w-5" /> Staff Portal
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-900/30 h-12 rounded-xl font-bold text-lg">
                  <Link href="/launch" onClick={() => setMobileMenuOpen(false)}>
                    <Zap className="h-5 w-5 fill-white" /> Launch AI
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