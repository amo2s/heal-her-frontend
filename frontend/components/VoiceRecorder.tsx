"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Mic, Square, Loader2, Quote, ShieldCheck, ShieldAlert, RefreshCw, LogOut } from "lucide-react"
import { useReactMediaRecorder } from "react-media-recorder"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/proxy" 
// NO SOCKET IMPORTS NEEDED!

// --- ERROR SANITIZER ---
const sanitizeError = (rawMessage: string) => {
    const msg = (rawMessage || "").toLowerCase();
    if (msg.includes("male")) return "Access Denied: Male voice detected.";
    if (msg.includes("phrase")) return "Verification Failed: Incorrect phrase.";
    if (msg.includes("unclear") || msg.includes("noisy")) return "Voice unclear. Please speak louder.";
    return "Verification failed. Please retry.";
}

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
  return <canvas ref={canvasRef} width={400} height={120} className="w-full h-32 rounded-xl border border-white/10 bg-black/40 shadow-inner" />
}

export default function VoiceRecorder() {
  const router = useRouter()
  
  // UI States
  const [status, setStatus] = useState<'idle' | 'recording' | 'review' | 'analyzing' | 'success' | 'failed'>('idle')
  const [serverMessage, setServerMessage] = useState("")
  const [challengePhrase, setChallengePhrase] = useState<string>("")
  const [isLoadingPhrase, setIsLoadingPhrase] = useState(true)

  // Animation States
  const [progress, setProgress] = useState(0)
  const [loadingText, setLoadingText] = useState("Uploading audio securely...")

  // Logic Refs
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null) // <--- POLLING REF
  const pendingResultRef = useRef<any>(null)
  const minWaitCompleteRef = useRef(false)
  const safetyTimerRef = useRef<NodeJS.Timeout | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const { startRecording, stopRecording, mediaBlobUrl, clearBlobUrl, previewStream } = useReactMediaRecorder({ 
    audio: true,
    blobPropertyBag: { type: "audio/wav" } 
  })

  // --- 1. INITIALIZATION ---
  useEffect(() => {
    const init = async () => {
      const token = sessionStorage.getItem("sb-access-token")
      if (!token) {
        router.push("/login")
        return
      }
      try {
        const response = await api.get("/verification/get-challenge", {
            headers: { Authorization: `Bearer ${token}` }
        })
        setChallengePhrase(response.data.phrase)
      } catch (error) {
        setServerMessage("Could not load challenge.")
      } finally {
        setIsLoadingPhrase(false)
      }
    }
    init()
    
    return () => {
      if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current)
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current) // Cleanup Poll
    }
  }, [router])

  // --- 2. TEXT ANIMATION ENGINE ---
  useEffect(() => {
    if (status === 'analyzing') {
        setLoadingText("Uploading audio securely...")
        setProgress(0)
        const t1 = setTimeout(() => setLoadingText("Analyzing biometric voice patterns..."), 2000)
        const t2 = setTimeout(() => setLoadingText("Verifying identity match..."), 5000)
        progressIntervalRef.current = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) return 90;
                return prev + 1.5; 
            })
        }, 100)
        return () => {
            clearTimeout(t1)
            clearTimeout(t2)
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
        }
    }
  }, [status])

  const handleStart = () => { clearBlobUrl(); setStatus('recording'); setServerMessage(""); startRecording(); }
  const handleStop = () => { stopRecording(); setStatus('review'); }

  // --- 3. PROCESS RESULT ---
  const processResult = (data: any) => {
      if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current)
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current) // STOP POLLING
      setProgress(100)
      
      if (data.status === "success") {
          setStatus('success')
          setServerMessage(data.message || "Verified. Access Granted.") 
          const localUser = sessionStorage.getItem("user-data")
          if (localUser) {
              try {
                  const parsed = JSON.parse(localUser)
                  parsed.is_verified = true
                  sessionStorage.setItem("user-data", JSON.stringify(parsed))
              } catch (e) {}
          }
          setTimeout(() => { router.push("/chat") }, 2500)
      } else {
          setStatus('failed')
          setServerMessage(sanitizeError(data.message))
      }
  }

  // --- 4. START POLLING (The Bank Method) ---
  const startPolling = async () => {
    const token = sessionStorage.getItem("sb-access-token")
    if (!token) return

    // Poll every 1 second
    pollingIntervalRef.current = setInterval(async () => {
        try {
            // We reuse the 'get-status' logic manually or create a tiny endpoint
            // BUT, since we don't want to write new backend code, we can re-hit an endpoint
            // OR use a lightweight check.
            
            // For now, let's assume we add a TINY new endpoint to check status
            // OR we can just check the profile table if you have a route for it.
            // Let's use the standard "get-user" route if it returns verification status
            
            const response = await api.get("/verification/check-status", {
                 headers: { Authorization: `Bearer ${token}` }
            })
            
            const data = response.data;
            console.log("🔍 Polling Status:", data);

            if (data.status !== "processing") {
                // If it's DONE (success or failed), stop polling and show result
                if (minWaitCompleteRef.current) {
                    processResult(data);
                } else {
                    console.log("⏳ Buffering Result...");
                    pendingResultRef.current = data;
                }
            }
        } catch (e) {
            console.error("Polling Error", e);
        }
    }, 1000);
  }

  // --- 5. SUBMIT ---
  const handleSubmit = async () => {
    if (!mediaBlobUrl) return
    setStatus('analyzing')
    setServerMessage("")
    pendingResultRef.current = null
    minWaitCompleteRef.current = false

    try {
      const audioBlob = await fetch(mediaBlobUrl).then(r => r.blob())
      const audioFile = new File([audioBlob], "voice_verification.wav", { type: "audio/wav" })
      const formData = new FormData()
      formData.append("file", audioFile)
      formData.append("expected_phrase", challengePhrase)

      // Start Visual Timers (4s Minimum)
      setTimeout(() => {
          minWaitCompleteRef.current = true;
          if (pendingResultRef.current) processResult(pendingResultRef.current);
      }, 4000); 

      // 60s Safety Timeout
      safetyTimerRef.current = setTimeout(() => {
          if (status === 'analyzing') {
              setStatus('failed')
              setServerMessage("Server timed out.")
          }
      }, 60000)

      const token = sessionStorage.getItem("sb-access-token")
      
      // Step A: Upload
      const response = await api.post("/verification/analyze-voice", formData, {
        headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${token}` },
      })

      if (response.data.status === "failed") {
          setTimeout(() => processResult(response.data), 1500)
          return; 
      }

      // Step B: Start Polling instead of Socket
      console.log("Phrase Verified. Starting Polling...");
      startPolling();

    } catch (error: any) {
      console.error("Upload Error:", error)
      setStatus('failed')
      setServerMessage("Upload failed.")
    }
  }

  const handleRetry = () => {
    setStatus('idle')
    setServerMessage("")
    clearBlobUrl()
    setProgress(0)
    setLoadingText("Uploading audio securely...")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#160d33] p-4 text-white relative overflow-hidden font-sans">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#DA8CA0]/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#6366f1]/20 rounded-full blur-[120px]" />

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 space-y-2">
           <div className="inline-flex items-center justify-center mb-4 relative h-20 w-20">
             <Image src="/heal-logo.png" alt="Heal Her Logo" fill className="object-contain drop-shadow-[0_0_15px_rgba(218,140,160,0.5)]"/>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Security Check</h1>
          <p className="text-[#CCCCD9]/60 text-sm max-w-[300px] mx-auto">Read the phrase below to verify you are a real person.</p>
        </div>

        <div className="bg-[#1C1246]/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          <div className="mb-6 p-6 bg-white/5 rounded-xl border border-white/10 text-center relative min-h-[100px] flex items-center justify-center">
            <Quote className="absolute top-3 left-3 h-5 w-5 text-[#DA8CA0]/40" />
            {isLoadingPhrase ? <Loader2 className="h-6 w-6 animate-spin text-white/30"/> : 
                <p className="text-lg font-medium text-[#DA8CA0] font-serif italic leading-relaxed">"{challengePhrase}"</p>}
            <Quote className="absolute bottom-3 right-3 h-5 w-5 text-[#DA8CA0]/40 rotate-180" />
          </div>

          <div className="h-32 mb-6 relative flex items-center justify-center">
            {status === 'recording' ? <SmartVisualizer stream={previewStream} /> : 
             (status === 'review' || status === 'analyzing') ? 
             <div className="w-full h-full rounded-xl bg-white/5 flex items-center justify-center border border-white/10"><div className="w-[80%] h-[2px] bg-[#DA8CA0]/30" /></div> : 
             <p className="text-xs text-white/20 uppercase tracking-widest font-semibold">Ready to Record</p>}
          </div>

          <div className="flex flex-col items-center justify-center min-h-[80px]">
            {status === 'idle' && (
              <Button onClick={handleStart} disabled={isLoadingPhrase} className="h-20 w-20 rounded-full bg-[#DA8CA0] hover:bg-[#c76b85] shadow-[0_0_30px_rgba(218,140,160,0.4)] transition-all hover:scale-110 active:scale-95 flex items-center justify-center group">
                <Mic className="h-8 w-8 text-[#160d33] group-hover:text-white transition-colors" />
              </Button>
            )}
            {status === 'recording' && (
              <div className="text-center space-y-4 w-full">
                <Button onClick={handleStop} variant="destructive" className="h-16 w-16 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 border-2 border-red-500/50 flex items-center justify-center mx-auto hover:scale-105 transition-all">
                  <Square className="h-6 w-6 fill-current" />
                </Button>
                <p className="text-[#DA8CA0] text-xs font-medium animate-pulse">Recording... Tap to Stop</p>
              </div>
            )}
            {status === 'review' && (
              <div className="w-full flex gap-3 animate-in fade-in">
                <Button onClick={handleRetry} variant="outline" className="flex-1 border-white/10 hover:bg-white/5 text-[#CCCCD9] h-12 rounded-xl">Retry</Button>
                <Button onClick={handleSubmit} className="flex-1 bg-[#DA8CA0] hover:bg-[#c76b85] text-[#160d33] font-bold h-12 rounded-xl">Verify Now</Button>
              </div>
            )}
            {status === 'analyzing' && (
               <div className="text-center space-y-4 w-full px-4 animate-in fade-in">
                 <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 text-[#DA8CA0] animate-spin" />
                    <span className="text-[#DA8CA0] font-medium transition-all duration-300">{loadingText}</span>
                 </div>
                 <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-[#DA8CA0]" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ ease: "linear", duration: 0.2 }}/>
                 </div>
                 <p className="text-xs text-[#CCCCD9]/50 animate-pulse">Please do not close this window.</p>
               </div>
             )}
             {status === 'success' && (
               <div className="text-center space-y-2 animate-in zoom-in w-full">
                 <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm flex flex-col items-center gap-2">
                    <ShieldCheck className="h-8 w-8" />
                    <h3 className="font-bold text-lg">Verified!</h3>
                    <p className="font-medium text-emerald-200/80">{serverMessage}</p>
                 </div>
               </div>
             )}
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
          <button onClick={() => { sessionStorage.clear(); router.push("/login"); }} className="text-[#CCCCD9]/30 hover:text-white/80 text-xs flex items-center justify-center gap-2 mx-auto transition-colors group">
            <LogOut className="h-3 w-3 group-hover:text-red-400 transition-colors" /> Log out
          </button>
        </div>
      </motion.div>
    </div>
  )
}