"use client"

import React from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

interface ComingSoonModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ComingSoonModal({ isOpen, onClose }: ComingSoonModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#1C1246]/80 backdrop-blur-sm z-[100]"
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm z-[101] px-4"
          >
            <div className="relative overflow-hidden rounded-3xl border border-[#DA8CA0]/20 bg-[#231854] p-8 shadow-2xl text-center">
              
              {/* Background Decoration */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#DA8CA0]/10 rounded-full blur-3xl pointer-events-none" />
              
              {/* Close Button */}
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-[#CCCCD9]/50 hover:text-white transition-colors z-10"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Logo (Centered) */}
              <div className="relative w-16 h-16 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(218,140,160,0.3)]">
                <Image 
                  src="/heal-logo.png" 
                  alt="Heal Her Logo" 
                  fill
                  className="object-contain"
                />
              </div>

              {/* Text */}
              <h3 className="text-xl font-bold text-white mb-3">Coming Soon</h3>
              <p className="text-[#CCCCD9] text-sm leading-relaxed">
                This feature is currently in the lab! We are crafting it with care for the <span className="text-[#DA8CA0] font-medium">Heal Her v2.0</span> update. Watch this space.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}