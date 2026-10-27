"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, Trash2, X } from "lucide-react"

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading: boolean
}

export function DeleteConfirmationModal({ 
  isOpen, onClose, onConfirm, isLoading 
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-sm bg-[#1C1246] border border-red-500/30 rounded-2xl p-6 shadow-2xl text-center"
        >
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <h3 className="text-xl font-bold text-white mb-2">Are you absolutely sure?</h3>
          <p className="text-sm text-[#CCCCD9]/70 mb-6">
            This action is permanent. All your profile data, images, and account settings will be wiped forever.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
            >
              {isLoading ? "Deleting..." : "Yes, Delete Everything"}
            </button>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-all"
            >
              Wait, take me back
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}