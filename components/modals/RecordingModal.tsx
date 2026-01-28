"use client"

import React, { useState, useEffect, useRef } from "react"
import { LiveAudioVisualizer } from "react-audio-visualize"
import { Square, Mic } from "lucide-react"
import { Button } from "@/components/ui/button"

interface RecordingModalProps {
  onStop: (blobUrl: string) => void
  mediaRecorder: MediaRecorder | null
}

export default function RecordingModal({ onStop, mediaRecorder }: RecordingModalProps) {
  // We use a ref to track the media recorder locally for the visualizer
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null)

  useEffect(() => {
    if (mediaRecorder) {
      setRecorder(mediaRecorder)
    }
  }, [mediaRecorder])

  return (
    <div className="w-full h-32 rounded-xl border border-[#DA8CA0]/30 bg-[#1C1246]/80 backdrop-blur-md flex flex-col items-center justify-center p-4 relative overflow-hidden animate-in fade-in zoom-in duration-300">
      
      {/* THE LIVE STATUS BARS */}
      <div className="flex items-center justify-center w-full h-16 mb-2">
        {recorder ? (
          <LiveAudioVisualizer
            mediaRecorder={recorder}
            width={300}
            height={50}
            barWidth={3}
            gap={2}
            barColor="#DA8CA0"
          />
        ) : (
          <div className="flex gap-1">
             {[...Array(5)].map((_, i) => (
               <div key={i} className="w-1 h-4 bg-[#DA8CA0]/20 animate-pulse" />
             ))}
          </div>
        )}
      </div>

      <p className="text-[#DA8CA0] text-[10px] uppercase tracking-tighter font-bold animate-pulse mb-1">
        Analyzing Frequency...
      </p>

      {/* GLOW EFFECT BEHIND BARS */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#DA8CA0]/5 to-transparent pointer-events-none" />
    </div>
  )
}