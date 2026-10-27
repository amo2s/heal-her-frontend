"use client"

import React, { useState, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion"
import { 
  Menu, 
  X, 
  User, 
  Lock,
  ArrowRight 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// --- MICRO COMPONENTS ---

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link 
      href={href} 
      className={cn(
        "relative px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group",
        isActive 
          ? "text-white" 
          : "text-[#CCCCD9] hover:text-white hover:bg-white/5"
      )}
    >
      <span className="relative z-10">{children}</span>
      {isActive && (
        <motion.div
          layoutId="navbar-indicator"
          className="absolute inset-0 rounded-xl bg-white/10 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)]"
          transition={{ duration: 0.5, type: "spring", bounce: 0.2 }}
        />
      )}
      {!isActive && (
        <div className="absolute inset-0 rounded-xl bg-[#DA8CA0]/0 group-hover:bg-[#DA8CA0]/10 transition-colors duration-300" />
      )}
    </Link>
  )
}

const MobileNavLink = ({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) => (
  <motion.div variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}>
    <Link
      href={href}
      onClick={onClick}
      className="block rounded-2xl px-4 py-4 text-base font-medium text-[#CCCCD9] hover:bg-white/5 hover:text-white transition-all active:scale-[0.98]"
    >
      {children}
    </Link>
  </motion.div>
)

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const { scrollY } = useScroll()

  // Track scroll position exclusively for morphing the navbar
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 20)
  })

  // Ultra-fluid custom bezier curve for architectural morphing
  const morphEase: [number, number, number, number] = [0.16, 1, 0.3, 1]

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center w-full pt-4 sm:pt-6 pointer-events-none">
        <motion.div
          initial={false}
          animate={{
            width: isScrolled ? "1000px" : "100%",
            maxWidth: isScrolled ? "1000px" : "1280px",
            backgroundColor: isScrolled ? "rgba(28, 18, 70, 0.85)" : "rgba(0, 0, 0, 0)",
            borderColor: isScrolled ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0)",
            paddingTop: isScrolled ? "0.5rem" : "0.25rem",
            paddingBottom: isScrolled ? "0.5rem" : "0.25rem",
            boxShadow: isScrolled ? "0 25px 50px -12px rgba(0,0,0,0.5)" : "0 0px 0px 0px rgba(0,0,0,0)",
          }}
          transition={{ duration: 0.8, ease: morphEase }}
          style={{ backdropFilter: isScrolled ? "blur(24px)" : "blur(0px)" }}
          className="flex items-center justify-between rounded-[2.5rem] border px-4 sm:px-6 w-[95%] transition-all pointer-events-auto"
        >
          {/* --- LIVING LOGO --- */}
          <Link href="/" className="group flex items-center gap-4 relative z-10 shrink-0">
            <div className="relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center transition-transform duration-500 group-hover:scale-105">
              {/* Outer Breathing Aura */}
              <motion.div 
                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full bg-[#DA8CA0]/30 blur-xl" 
              />
              {/* Solid Glass Base */}
              <div className="absolute inset-1 rounded-full border border-white/20 bg-gradient-to-tr from-[#1C1246] to-[#231854] shadow-[inset_0_2px_8px_rgba(255,255,255,0.2)]" />
              {/* Levitating Inner Logo */}
              <motion.div
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-6 h-6 sm:w-7 sm:h-7"
              >
                 <Image 
                    src="/heal-logo.png" 
                    alt="Heal Her Logo" 
                    fill 
                    className="object-contain drop-shadow-[0_0_12px_rgba(218,140,160,0.8)]" 
                 />
              </motion.div>
            </div>
            
            <div className="flex flex-col justify-center">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-none drop-shadow-lg">
                Heal <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DA8CA0] to-[#E8B4C1]">Her</span>
              </span>
            </div>
          </Link>

          {/* --- DESKTOP NAV --- */}
          <motion.div 
            animate={{ 
              backgroundColor: isScrolled ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0)",
              borderColor: isScrolled ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0)"
            }}
            transition={{ duration: 0.8, ease: morphEase }}
            className="hidden md:flex items-center gap-1 mx-auto rounded-2xl p-1.5 border"
          >
            <NavLink href="/about">About</NavLink>
            <NavLink href="/team">Team</NavLink>
            <NavLink href="/privacy">Privacy</NavLink>
            <NavLink href="/contact">Contact</NavLink>
          </motion.div>

          {/* --- CTA BUTTONS (HIGH CONTRAST & PREMIUM) --- */}
          <div className="hidden md:flex items-center gap-4 shrink-0">
            
            {/* Highly Visible Member Access */}
            <Button asChild className="group relative overflow-hidden h-12 rounded-full bg-white/15 backdrop-blur-2xl border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.3)] hover:bg-white/25 hover:shadow-[0_8px_32px_rgba(255,255,255,0.3)] text-white font-bold px-8 transition-all duration-500">
              <Link href="/login">
                <div className="absolute top-0 left-[-100%] w-[150%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
                <span className="relative z-10 flex items-center tracking-wide">
                  Member Access <ArrowRight className="w-4 h-4 ml-2 opacity-60 group-hover:opacity-100 transition-opacity" />
                </span>
              </Link>
            </Button>

            {/* Dusty Rose Staff Login */}
            <Button asChild className="group relative overflow-hidden h-12 rounded-full bg-gradient-to-b from-[#f3cbd4]/90 to-[#DA8CA0]/90 backdrop-blur-xl border border-[#DA8CA0]/50 border-t-white/80 shadow-[inset_0_2px_10px_rgba(255,255,255,0.8),0_10px_20px_-10px_rgba(218,140,160,0.8)] text-[#1C1246] font-extrabold px-8 hover:scale-105 hover:from-[#fae0e6] hover:to-[#e19eb0] transition-all duration-500">
              <Link href="/management/auth/login">
                <div className="absolute top-0 left-[-100%] w-[150%] h-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
                <span className="relative z-10 flex items-center gap-2 tracking-wide">
                  <Lock className="w-4 h-4" /> Staff Login
                </span>
              </Link>
            </Button>

          </div>

          {/* --- MOBILE TOGGLE --- */}
          <button 
            className="md:hidden relative z-50 flex h-12 w-12 items-center justify-center text-white transition-colors rounded-full active:scale-95 border border-white/20 bg-white/10 backdrop-blur-md shadow-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </motion.div>
      </header>

      {/* --- MOBILE MENU OVERLAY --- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="fixed inset-0 z-30 bg-[#1C1246]/90 backdrop-blur-xl md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, y: -30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ duration: 0.5, ease: morphEase }}
              className="fixed left-0 right-0 top-[110px] z-40 mx-auto w-[92%] max-w-sm md:hidden rounded-[2.5rem] border border-white/10 bg-[#231854]/95 p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-3xl"
            >
              <motion.div 
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
                }}
                initial="hidden"
                animate="visible"
                className="flex flex-col relative z-10 space-y-2"
              >
                <div className="px-4 pb-4 text-[10px] font-black uppercase tracking-[0.2em] text-[#DA8CA0]">Menu</div>
                
                <MobileNavLink href="/about" onClick={() => setMobileMenuOpen(false)}>About</MobileNavLink>
                <MobileNavLink href="/team" onClick={() => setMobileMenuOpen(false)}>Team</MobileNavLink>
                <MobileNavLink href="/privacy" onClick={() => setMobileMenuOpen(false)}>Privacy</MobileNavLink>
                <MobileNavLink href="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</MobileNavLink>

                <div className="space-y-4 border-t border-white/10 pt-8 mt-6 pb-2">
                  <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
                    <Button asChild className="w-full justify-start h-16 rounded-2xl bg-white/15 backdrop-blur-xl border border-white/30 text-white font-bold shadow-[0_8px_32px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.3)] active:scale-[0.98] transition-all">
                      <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                        <User className="h-5 w-5 mr-3" /> Member Access <ArrowRight className="h-5 w-5 ml-auto opacity-50" />
                      </Link>
                    </Button>
                  </motion.div>
                  
                  <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
                    <Button asChild className="w-full justify-start h-16 rounded-2xl bg-gradient-to-r from-[#DA8CA0] to-[#E8B4C1] text-[#1C1246] font-extrabold shadow-[inset_0_2px_10px_rgba(255,255,255,0.8)] active:scale-[0.98] transition-all">
                      <Link href="/management/auth/login" onClick={() => setMobileMenuOpen(false)}>
                        <Lock className="h-5 w-5 mr-3" /> Staff Login <ArrowRight className="h-5 w-5 ml-auto" />
                      </Link>
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}