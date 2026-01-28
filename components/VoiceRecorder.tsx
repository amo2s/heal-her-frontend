"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Mic, Square, Loader2, Quote, ShieldCheck, ShieldAlert, RefreshCw, LogOut } from "lucide-react"
import { useReactMediaRecorder } from "react-media-recorder"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/proxy" 

// --- ERROR SANITIZER ---
const sanitizeError = (rawMessage: string) => {
  const msg = (rawMessage || "").toLowerCase()
  if (msg.includes("male")) return "Access Denied: Male voice detected."
  if (msg.includes("phrase")) return "Verification Failed: Incorrect phrase."
  if (msg.includes("unclear") || msg.includes("noisy")) return "Voice unclear. Please speak louder."
  return "Verification failed. Please retry."
}

const SmartVisualizer = ({ stream }: { stream: MediaStream | null }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!stream || !canvasRef.current) return

    let audioContext: AudioContext | null = null
    let animationId: number
    let source: MediaStreamAudioSourceNode
    let analyser: AnalyserNode

    const init = async () => {
      const tracks = stream.getAudioTracks()
      if (!tracks.length) return

      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      if (audioContext.state === "suspended") await audioContext.resume()

      try { source = audioContext.createMediaStreamSource(stream) } catch { return }

      analyser = audioContext.createAnalyser()
      analyser.fftSize = 2048
      source.connect(analyser)

      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      const canvas = canvasRef.current!
      const ctx = canvas.getContext("2d")!

      const draw = () => {
        animationId = requestAnimationFrame(draw)
        analyser.getByteTimeDomainData(dataArray)
        ctx.fillStyle = "rgba(22,13,51,.3)"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.lineWidth = 3
        ctx.strokeStyle = "#DA8CA0"
        ctx.beginPath()

        const sliceWidth = canvas.width / bufferLength
        let x = 0

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128
          const y = (v * canvas.height) / 2
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
          x += sliceWidth
        }

        ctx.lineTo(canvas.width, canvas.height / 2)
        ctx.stroke()
      }

      draw()
    }

    init()

    return () => {
      cancelAnimationFrame(animationId)
      if (audioContext && audioContext.state !== "closed") audioContext.close()
    }
  }, [stream])

  return <canvas ref={canvasRef} width={400} height={120} className="w-full h-28 rounded-xl border border-white/10 bg-black/40 shadow-inner" />
}

export default function VoiceRecorder() {
  const router = useRouter()

  const [status, setStatus] = useState<'idle' | 'recording' | 'review' | 'analyzing' | 'success' | 'failed'>('idle')
  const [serverMessage, setServerMessage] = useState("")
  const [challengePhrase, setChallengePhrase] = useState("")
  const [isLoadingPhrase, setIsLoadingPhrase] = useState(true)
  const [progress, setProgress] = useState(0)
  const [loadingText, setLoadingText] = useState("Uploading audio securely...")

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pendingResultRef = useRef<any>(null)
  const minWaitCompleteRef = useRef(false)
  const safetyTimerRef = useRef<NodeJS.Timeout | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const { startRecording, stopRecording, mediaBlobUrl, clearBlobUrl, previewStream } =
    useReactMediaRecorder({ audio: true, blobPropertyBag: { type: "audio/wav" } })

  useEffect(() => {
    const init = async () => {
      const token = sessionStorage.getItem("sb-access-token")
      if (!token) return router.push("/login")

      try {
        const res = await api.get("/verification/get-challenge", {
          headers: { Authorization: `Bearer ${token}` }
        })
        setChallengePhrase(res.data.phrase)
      } catch {
        setServerMessage("Could not load challenge.")
      } finally {
        setIsLoadingPhrase(false)
      }
    }

    init()
  }, [router])

  const handleStart = () => {
    clearBlobUrl()
    setStatus("recording")
    setServerMessage("")
    startRecording()
  }

  const handleStop = () => {
    stopRecording()
    setStatus("review")
  }

  const handleRetry = () => {
    setStatus("idle")
    clearBlobUrl()
    setProgress(0)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#160d33] p-4 text-white overflow-hidden">
      <motion.div initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">

        <div className="bg-[#1C1246]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col gap-5">

          {/* HEADER */}
          <div className="text-center space-y-2">
            <div className="relative h-14 w-14 mx-auto">
              <Image src="/heal-logo.png" alt="Heal Her Logo" fill className="object-contain" />
            </div>
            <h1 className="text-xl font-bold">Security Check</h1>
            <p className="text-[#CCCCD9]/60 text-xs">Read the phrase below to verify you.</p>
          </div>

          {/* PHRASE */}
          <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center min-h-[70px] flex items-center justify-center relative">
            <Quote className="absolute top-2 left-2 h-4 w-4 text-[#DA8CA0]/40" />
            {isLoadingPhrase
              ? <Loader2 className="h-5 w-5 animate-spin text-white/30" />
              : <p className="text-[#DA8CA0] italic">"{challengePhrase}"</p>}
            <Quote className="absolute bottom-2 right-2 h-4 w-4 text-[#DA8CA0]/40 rotate-180" />
          </div>

          {/* VISUAL */}
          <div className="h-28 flex items-center justify-center">
            {status === "recording"
              ? <SmartVisualizer stream={previewStream} />
              : <p className="text-xs text-white/20 uppercase">Ready to Record</p>}
          </div>

          {/* CONTROLS */}
          <div className="flex justify-center">
            {status === "idle" && (
              <Button onClick={handleStart} className="h-16 w-16 rounded-full bg-[#DA8CA0]">
                <Mic />
              </Button>
            )}

            {status === "recording" && (
              <Button onClick={handleStop} variant="destructive" className="h-14 w-14 rounded-full">
                <Square />
              </Button>
            )}

            {status === "review" && (
              <div className="flex gap-3 w-full">
                <Button onClick={handleRetry} variant="outline" className="flex-1">Retry</Button>
                <Button className="flex-1 bg-[#DA8CA0]">Verify</Button>
              </div>
            )}
          </div>

          {/* LOGOUT */}
          <button
            onClick={() => { sessionStorage.clear(); router.push("/login") }}
            className="text-xs text-white/30 hover:text-white/70 flex items-center justify-center gap-2 pt-3 border-t border-white/10">
            <LogOut className="h-3 w-3" /> Log out
          </button>

        </div>
      </motion.div>
    </div>
  )
}
