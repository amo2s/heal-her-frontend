// app/verify-voice/page.tsx
"use client"

import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"

// --- THE FIX: DYNAMIC IMPORT ---
// We import the component from the /components folder
// AND we disable SSR (Server Side Rendering) so the Worker logic doesn't crash node.
const VoiceRecorder = dynamic(() => import("@/components/VoiceRecorder"), {
  ssr: false, 
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-[#160d33] text-white">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-10 w-10 text-[#DA8CA0] animate-spin" />
        <p className="text-[#CCCCD9]/60 text-sm">Initializing Secure Environment...</p>
      </div>
    </div>
  ),
})

export default function VoiceVerificationPage() {
  return <VoiceRecorder />
}