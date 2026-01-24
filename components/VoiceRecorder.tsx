"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Mic, Square, Loader2, AlertCircle, RefreshCw, LogOut, Quote } from "lucide-react"
import { useReactMediaRecorder } from "react-media-recorder"
import { useRouter } from "next/navigation"
import axios from "axios"
import Image from "next/image"
import { Button } from "@/components/ui/button"

// --- INTELLIGENT VISUALIZER (The "Brain") ---
const SmartVisualizer = ({ stream }: { stream: MediaStream | null }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // 1. TOP LEVEL SAFETY: If no stream, do nothing.
    if (!stream || !canvasRef.current) return

    let audioContext: AudioContext | null = null
    let animationId: number
    let source: MediaStreamAudioSourceNode
    let analyser: AnalyserNode

    const initVisualizer = async () => {
      try {
        // 2. CRITICAL CHECK: Does the stream actually have audio tracks?
        const audioTracks = stream.getAudioTracks()
        if (audioTracks.length === 0) {
           // console.log("Stream exists but no audio tracks yet. Waiting...")
           return 
        }

        // 3. Create Audio Context
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        
        // 4. Force Resume (Wakes up audio engine on some browsers)
        if (audioContext.state === 'suspended') {
          await audioContext.resume()
        }

        // 5. Connect Stream (Wrapped in Try/Catch for safety)
        try {
            source = audioContext.createMediaStreamSource(stream)
        } catch (err) {
            console.error("Error creating stream source:", err)
            return // Stop here if it fails, don't crash
        }

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

          // Clear with Fade Effect
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

            if (i === 0) {
              canvasCtx.moveTo(x, y)
            } else {
              canvasCtx.lineTo(x, y)
            }

            x += sliceWidth
          }

          canvasCtx.lineTo(canvas.width, canvas.height / 2)
          canvasCtx.stroke()
        }

        draw()
      } catch (err) {
        console.error("Visualizer Init Error:", err)
      }
    }

    // Small timeout to allow stream to fully initialize tracks
    const timeoutId = setTimeout(initVisualizer, 100)

    return () => {
      clearTimeout(timeoutId)
      cancelAnimationFrame(animationId)
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close()
      }
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
  const [detectedGender, setDetectedGender] = useState<string | null>(null)
  const [challengePhrase, setChallengePhrase] = useState<string>("")
  const [isLoadingPhrase, setIsLoadingPhrase] = useState(true)

  // HOOK: React Media Recorder 
  const { startRecording, stopRecording, mediaBlobUrl, clearBlobUrl, previewStream } = useReactMediaRecorder({ 
    audio: true,
    blobPropertyBag: { type: "audio/wav" } 
  })

  // --- INITIALIZATION ---
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("sb-access-token")
      if (!token) {
        router.push("/login")
        return
      }

      try {
        const response = await axios.get("http://127.0.0.1:8000/verification/get-challenge", {
          headers: { "Authorization": `Bearer ${token}` }
        })
        setChallengePhrase(response.data.phrase)
      } catch (error) {
        console.error("Failed to load challenge", error)
        setServerMessage("Could not load security challenge. Please refresh.")
      } finally {
        setIsLoadingPhrase(false)
      }
    }

    init()
  }, [])

  // 1. START
  const handleStart = () => {
    clearBlobUrl()
    setStatus('recording')
    setDetectedGender(null)
    setServerMessage("")
    startRecording()
  }

  // 2. STOP
  const handleStop = () => {
    stopRecording()
    setStatus('review')
  }

  // 3. SUBMIT
  const handleSubmit = async () => {
    if (!mediaBlobUrl) return
    setStatus('analyzing')
    setServerMessage("")
    setDetectedGender(null)

    try {
      const audioBlob = await fetch(mediaBlobUrl).then(r => r.blob())
      const audioFile = new File([audioBlob], "voice_verification.wav", { type: "audio/wav" })

      const formData = new FormData()
      formData.append("file", audioFile)
      formData.append("expected_phrase", challengePhrase)

      const token = localStorage.getItem("sb-access-token")

      const response = await axios.post("http://127.0.0.1:8000/verification/analyze-voice", formData, {
        headers: {
          "Authorization": `Bearer ${token}`, 
          "Content-Type": "multipart/form-data",
        },
      })

      const data = response.data;

      if (data.status === "success") {
        setStatus('success')
        const userStr = localStorage.getItem("user-data")
        if (userStr) {
            const user = JSON.parse(userStr)
            user.is_verified = true
            localStorage.setItem("user-data", JSON.stringify(user))
        }
        setTimeout(() => { router.push("/chat") }, 2500)
        return;
      } 
      
      if (data.status === "failed") {
          const aiResult = data.data; 

          if (aiResult?.text_match === false) {
             setServerMessage("You didn't say the correct phrase. Please read it exactly.")
          } else if (aiResult?.gender === 'male') {
             setServerMessage("Access Denied. Male voice detected.")
             setDetectedGender('male')
          } else if (aiResult?.gender === 'female') {
             setServerMessage("Female voice detected, but not clear enough.")
             setDetectedGender('female')
          } else {
             setServerMessage(data.message || "Verification failed.")
          }
          
          setStatus('failed')
      }

    } catch (error: any) {
      console.error("Verification Error:", error)
      setStatus('failed')
      setServerMessage(error.response?.data?.detail || "System error. Please try again.")
    }
  }

  const handleRetry = () => {
    setStatus('idle')
    setServerMessage("")
    setDetectedGender(null)
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
          {/* LOGO REPLACEMENT */}
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

          {/* SMART VISUALIZER AREA */}
          <div className="h-32 mb-6 relative flex items-center justify-center">
            {status === 'recording' ? (
                <SmartVisualizer stream={previewStream} />
            ) : status === 'review' || status === 'analyzing' ? (
                // STATIC PLACEHOLDER
                <div className="w-full h-full rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                    <div className="w-[80%] h-[2px] bg-[#DA8CA0]/30" />
                </div>
            ) : (
                // IDLE TEXT
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
                    <span className="text-[#DA8CA0] font-medium">Analyzing...</span>
                 </div>
                 <p className="text-xs text-[#CCCCD9]/50">Checking voice pattern & phrase match</p>
               </div>
             )}

             {status === 'success' && (
               <div className="text-center space-y-2 animate-in zoom-in">
                 <div className="h-16 w-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                    <Image src="/heal-logo.png" alt="Verified" width={40} height={40} className="object-contain" />
                 </div>
                 <h3 className="text-emerald-400 font-bold text-lg mt-2">Verified!</h3>
               </div>
             )}

             {status === 'failed' && (
               <div className="text-center space-y-4 w-full animate-in shake">
                 <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm flex flex-col items-center gap-2">
                   <AlertCircle className="h-6 w-6 opacity-80" />
                   <p className="font-semibold">{serverMessage}</p>
                   {detectedGender && (
                       <span className="text-[10px] uppercase tracking-wider bg-black/30 px-3 py-1 rounded-full text-white/70 border border-white/10 mt-1">
                         AI Detected: {detectedGender}
                       </span>
                   )}
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
              localStorage.clear();
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