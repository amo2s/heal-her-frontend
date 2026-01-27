"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Mic, Square, Loader2, AlertCircle, RefreshCw, LogOut, Quote, ShieldCheck, ShieldAlert } from "lucide-react"
import { useReactMediaRecorder } from "react-media-recorder"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"

// --- IMPORT THE SECURITY GUARD ---
// Assuming proxy.ts is in your root or lib folder. Adjust path if needed.
import { api, getSocket } from "@/lib/proxy" 

// --- INTELLIGENT VISUALIZER (Unchanged) ---
const SmartVisualizer = ({ stream }: { stream: MediaStream | null }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!stream || !canvasRef.current) return
    let audioContext: AudioContext | null = null
    let animationId: number
    let source: MediaStreamAudioSourceNode
    let analyser: AnalyserNode

    const initVisualizer = async () => {
      try {
        const audioTracks = stream.getAudioTracks()
        if (audioTracks.length === 0) return 

        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        if (audioContext.state === 'suspended') await audioContext.resume()

        try { source = audioContext.createMediaStreamSource(stream) } catch (err) { return }

        analyser = audioContext.createAnalyser()
        analyser.fftSize = 2048 
        source.connect(analyser)

        const bufferLength = analyser.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)
        const canvas = canvasRef.current
        if (!canvas) return
        const canvasCtx = canvas.getContext("2d")
        if (!canvasCtx) return

        const draw = () => {
          animationId = requestAnimationFrame(draw)
          analyser.getByteTimeDomainData(dataArray)
          canvasCtx.fillStyle = "rgba(22, 13, 51, 0.3)" 
          canvasCtx.fillRect(0, 0, canvas.width, canvas.height)
          canvasCtx.lineWidth = 3
          canvasCtx.strokeStyle = "#DA8CA0" 
          canvasCtx.beginPath()
          const sliceWidth = (canvas.width * 1.0) / bufferLength
          let x = 0
          for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0
            const y = (v * canvas.height) / 2
            if (i === 0) canvasCtx.moveTo(x, y)
            else canvasCtx.lineTo(x, y)
            x += sliceWidth
          }
          canvasCtx.lineTo(canvas.width, canvas.height / 2)
          canvasCtx.stroke()
        }
        draw()
      } catch (err) { console.error(err) }
    }
    const timeoutId = setTimeout(initVisualizer, 100)
    return () => {
      clearTimeout(timeoutId)
      cancelAnimationFrame(animationId)
      if (audioContext && audioContext.state !== 'closed') audioContext.close()
    }
  }, [stream])

  return (
    <canvas 
      ref={canvasRef} 
      width={400} 
      height={120} 
      className="w-full h-32 rounded-xl border border-white/10 bg-black/40 shadow-inner"
    />
  )
}

// --- MAIN RECORDER COMPONENT ---
export default function VoiceRecorder() {
  const router = useRouter()
  const [status, setStatus] = useState<'idle' | 'recording' | 'review' | 'analyzing' | 'success' | 'failed'>('idle')
  const [serverMessage, setServerMessage] = useState("")
  const [challengePhrase, setChallengePhrase] = useState<string>("")
  const [isLoadingPhrase, setIsLoadingPhrase] = useState(true)

  // Safety Timer Ref (to stop infinite spinning)
  const safetyTimerRef = useRef<NodeJS.Timeout | null>(null)

  const { startRecording, stopRecording, mediaBlobUrl, clearBlobUrl, previewStream } = useReactMediaRecorder({ 
    audio: true,
    blobPropertyBag: { type: "audio/wav" } 
  })

  // --- INITIALIZATION ---
  useEffect(() => {
    const init = async () => {
      // FIX 1: Read from sessionStorage (matches proxy.ts)
      const token = sessionStorage.getItem("sb-access-token")
      
      if (!token) {
        // Only kick if session storage is truly empty
        router.push("/login")
        return
      }

      try {
        // Use 'api' proxy instead of axios directly
        const response = await api.get("/verification/get-challenge")
        setChallengePhrase(response.data.phrase)
      } catch (error) {
        setServerMessage("Could not load security challenge.")
      } finally {
        setIsLoadingPhrase(false)
      }
    }
    init()

    return () => {
      // We don't necessarily disconnect the socket here because the proxy manages it,
      // but we do clear the safety timer.
      if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current)
    }
  }, [router])

  const handleStart = () => {
    clearBlobUrl()
    setStatus('recording')
    setServerMessage("")
    startRecording()
  }

  const handleStop = () => {
    stopRecording()
    setStatus('review')
  }

  // --- SECURE SOCKET LISTENER ---
  const connectAndListen = () => {
    // 1. Get the Shared Secure Socket
    const socket = getSocket();
    if (!socket) return; // Should not happen if logged in

    // 2. Ensure connection
    if (!socket.connected) socket.connect();

    // 3. Attach Listener (Prevent duplicates)
    socket.off("verification_result"); 
    
    // --- THE BRAIN: DECIDE WHAT TO SHOW USER ---
    socket.on("verification_result", (data: any) => {
        console.log("📩 Received Result:", data)
        
        // Clear safety timer because we got a result
        if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current)

        const rawMessage = (data.message || "").toLowerCase()

        // CASE 1: SUCCESS (FEMALE)
        if (data.status === "success") {
            setStatus('success')
            setServerMessage("Female voice detected. Access Granted.") 
            
            // FIX 2: Update sessionStorage
            const localUser = sessionStorage.getItem("user-data")
            if (localUser) {
                const parsed = JSON.parse(localUser)
                parsed.is_verified = true
                sessionStorage.setItem("user-data", JSON.stringify(parsed))
            }
            
            // We can disconnect here to save resources since verify is done
            socket.disconnect()
            setTimeout(() => { router.push("/chat") }, 3000)
        } 
        
        // CASE 2: FAILED
        else {
            setStatus('failed')
            
            // Smart Error Translation
            if (rawMessage.includes("male")) {
                setServerMessage("Male voice detected. Access Denied.")
            } 
            else if (rawMessage.includes("phrase")) {
                setServerMessage("Incorrect phrase. Please read exactly.")
            } 
            else if (rawMessage.includes("unclear")) {
                setServerMessage("Voice unclear. Please speak louder.")
            }
            else {
                // HIDE API ERRORS
                setServerMessage("Verification service busy. Please try again.") 
            }
            
            // Don't kill the socket entirely, just stop listening for this attempt
            // socket.disconnect() // Optional: Keep it open for retry or close
        }
    })
  }

  // --- SUBMIT ---
  const handleSubmit = async () => {
    if (!mediaBlobUrl) return
    setStatus('analyzing')
    setServerMessage("")

    try {
      const audioBlob = await fetch(mediaBlobUrl).then(r => r.blob())
      const audioFile = new File([audioBlob], "voice_verification.wav", { type: "audio/wav" })

      const formData = new FormData()
      formData.append("file", audioFile)
      formData.append("expected_phrase", challengePhrase)

      // 1. Connect Socket FIRST (Using Proxy)
      connectAndListen()

      // 2. Set Safety Timer (Stops infinite spinning after 30s)
      safetyTimerRef.current = setTimeout(() => {
          if (status === 'analyzing') {
              setStatus('failed')
              setServerMessage("Connection timed out. Please check internet.")
          }
      }, 30000)

      // 3. Upload File (Using Proxy API)
      // Note: We don't need to manually add the Authorization header here,
      // the 'api' interceptor does it automatically from sessionStorage!
      await api.post("/verification/analyze-voice", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

    } catch (error: any) {
      console.error("Verification Error:", error)
      setStatus('failed')
      setServerMessage("Upload failed. Please check your connection.")
    }
  }

  const handleRetry = () => {
    setStatus('idle')
    setServerMessage("")
    clearBlobUrl()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#160d33] p-4 text-white relative overflow-hidden font-sans">
      
      {/* Background Glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#DA8CA0]/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#6366f1]/20 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        {/* HEADER */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center justify-center mb-4 relative h-20 w-20">
             <Image 
               src="/heal-logo.png" 
               alt="Heal Her Logo" 
               fill 
               className="object-contain drop-shadow-[0_0_15px_rgba(218,140,160,0.5)]"
             />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Security Check</h1>
          <p className="text-[#CCCCD9]/60 text-sm max-w-[300px] mx-auto">
            Read the phrase below to verify you are a real person.
          </p>
        </div>

        {/* MAIN CARD */}
        <div className="bg-[#1C1246]/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden transition-all duration-500">
          
          {/* CHALLENGE PHRASE DISPLAY */}
          <div className="mb-6 p-6 bg-white/5 rounded-xl border border-white/10 text-center relative min-h-[100px] flex items-center justify-center">
            <Quote className="absolute top-3 left-3 h-5 w-5 text-[#DA8CA0]/40" />
            {isLoadingPhrase ? (
                <Loader2 className="h-6 w-6 animate-spin text-white/30"/>
            ) : (
                <p className="text-lg font-medium text-[#DA8CA0] font-serif italic leading-relaxed">
                    "{challengePhrase}"
                </p>
            )}
            <Quote className="absolute bottom-3 right-3 h-5 w-5 text-[#DA8CA0]/40 rotate-180" />
          </div>

          {/* VISUALIZER */}
          <div className="h-32 mb-6 relative flex items-center justify-center">
            {status === 'recording' ? (
                <SmartVisualizer stream={previewStream} />
            ) : status === 'review' || status === 'analyzing' ? (
                <div className="w-full h-full rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                    <div className="w-[80%] h-[2px] bg-[#DA8CA0]/30" />
                </div>
            ) : (
                <p className="text-xs text-white/20 uppercase tracking-widest font-semibold">Ready to Record</p>
            )}
          </div>

          {/* CONTROLS */}
          <div className="flex flex-col items-center justify-center min-h-[80px]">
            
            {status === 'idle' && (
              <Button 
                onClick={handleStart}
                disabled={isLoadingPhrase}
                className="h-20 w-20 rounded-full bg-[#DA8CA0] hover:bg-[#c76b85] shadow-[0_0_30px_rgba(218,140,160,0.4)] transition-all hover:scale-110 active:scale-95 flex items-center justify-center group"
              >
                <Mic className="h-8 w-8 text-[#160d33] group-hover:text-white transition-colors" />
              </Button>
            )}

            {status === 'recording' && (
              <div className="text-center space-y-4 w-full">
                <Button 
                  onClick={handleStop}
                  variant="destructive"
                  className="h-16 w-16 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 border-2 border-red-500/50 flex items-center justify-center mx-auto hover:scale-105 transition-all"
                >
                  <Square className="h-6 w-6 fill-current" />
                </Button>
                <p className="text-[#DA8CA0] text-xs font-medium animate-pulse">Recording... Tap to Stop</p>
              </div>
            )}

            {status === 'review' && (
              <div className="w-full flex gap-3 animate-in fade-in slide-in-from-bottom-2">
                <Button onClick={handleRetry} variant="outline" className="flex-1 border-white/10 hover:bg-white/5 text-[#CCCCD9] h-12 rounded-xl">
                  Retry
                </Button>
                <Button onClick={handleSubmit} className="flex-1 bg-[#DA8CA0] hover:bg-[#c76b85] text-[#160d33] font-bold h-12 rounded-xl shadow-lg shadow-[#DA8CA0]/20">
                  Verify Now
                </Button>
              </div>
            )}

             {status === 'analyzing' && (
               <div className="text-center space-y-3 w-full">
                 <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 text-[#DA8CA0] animate-spin" />
                    <span className="text-[#DA8CA0] font-medium">Analyzing Voice...</span>
                 </div>
                 <p className="text-xs text-[#CCCCD9]/50">Checking biometrics (do not close)</p>
               </div>
             )}

             {/* SUCCESS STATE - FEMALE */}
             {status === 'success' && (
               <div className="text-center space-y-2 animate-in zoom-in w-full">
                 <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm flex flex-col items-center gap-2">
                    <ShieldCheck className="h-8 w-8" />
                    <h3 className="font-bold text-lg">Verified!</h3>
                    <p className="font-medium text-emerald-200/80">{serverMessage}</p>
                 </div>
               </div>
             )}

             {/* FAILED STATE - MALE / ERROR */}
             {status === 'failed' && (
               <div className="text-center space-y-4 w-full animate-in shake">
                 <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm flex flex-col items-center gap-2">
                   <ShieldAlert className="h-8 w-8 opacity-80" />
                   <p className="font-bold text-lg text-red-400">Verification Failed</p>
                   <p className="font-medium opacity-90">{serverMessage}</p>
                 </div>
                 <Button onClick={handleRetry} className="w-full bg-white/10 hover:bg-white/20 h-12 rounded-xl">
                   <RefreshCw className="h-4 w-4 mr-2" /> Try Again
                 </Button>
               </div>
             )}

          </div>
        </div>

        <div className="mt-8 text-center">
          <button 
            onClick={() => {
              // FIX 3: Clear sessionStorage instead of localStorage
              sessionStorage.clear();
              router.push("/login");
            }} 
            className="text-[#CCCCD9]/30 hover:text-white/80 text-xs flex items-center justify-center gap-2 mx-auto transition-colors group"
          >
            <LogOut className="h-3 w-3 group-hover:text-red-400 transition-colors" /> Log out
          </button>
        </div>

      </motion.div>
    </div>
  )
}