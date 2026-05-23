"use client"

import React, { useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation" 
import { ChatInput } from "@/components/chat-input"
import { ChatMessage } from "@/components/chat-message" 
import { Loader2, Lock, Sparkles, X, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { createPortal } from "react-dom" 
import Image from "next/image"

// 1. API & CONTEXT IMPORTS
import { api } from "@/lib/proxy" 
import { useAudio, MoodType } from "@/components/context/audio-manager"
import { ComingSoonModal } from "@/components/modals/coming-soon-modal"

// --- TYPES ---
interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: string
}

type ChildMood = {
  label: string;
  emoji: string;
  mood: MoodType;
  color: string;
  suggestion: string;
}

const MOODS: ChildMood[] = [
  { label: "Happy", emoji: "😊", mood: "happy", color: "from-yellow-400 to-orange-500", suggestion: "I feel great today!" },
  { label: "Sad", emoji: "😢", mood: "gentle", color: "from-blue-400 to-indigo-500", suggestion: "I'm feeling a bit sad..." },
  { label: "Scared", emoji: "😨", mood: "gentle", color: "from-purple-400 to-pink-500", suggestion: "I'm a little scared." },
  { label: "Brave", emoji: "🦁", mood: "happy", color: "from-emerald-400 to-teal-500", suggestion: "I'm ready to learn!" },
];

function ChatContent() {
  const [messages, setMessages] = useState<Message[]>([]) 
  const [isGenerating, setIsGenerating] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isDataLoading, setIsDataLoading] = useState(true)

  // COMPANION STATES
  const [showVibeCheck, setShowVibeCheck] = useState(true)
  const [sessionMood, setSessionMood] = useState<MoodType>("neutral")
  const [showComingSoon, setShowComingSoon] = useState(false)
  const [showPremiumModal, setShowPremiumModal] = useState(false)

  const [sessionId, setSessionId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const searchParams = useSearchParams()
  const urlSessionId = searchParams.get("session_id")
  
  // [DOCUMENT CHANGE: Removed 'speak' from here as auto-read is disabled. Audio is now handled strictly in ChatMessage.tsx]
  const { playSfx } = useAudio()

  useEffect(() => { setMounted(true) }, [])
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  useEffect(() => { scrollToBottom() }, [messages, isGenerating])

  // --- DELETE LOGIC ---
  const handleDeleteMessage = (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id))
  }

  // --- INTELLIGENT SYNC LOGIC ---
  const handleMoodSelect = async (m: ChildMood) => {
    playSfx('yay');
    setSessionMood(m.mood);
    setShowVibeCheck(false);
    handleSendMessage(m.suggestion);
  };

  // --- INITIALIZATION ---
  useEffect(() => {
    let isMounted = true 
    const initChat = async () => {
      try {
        if (urlSessionId) {
          setShowVibeCheck(false);
          setSessionId(urlSessionId)
          await fetchHistory(urlSessionId, isMounted)
        } else {
          setSessionId(null)
          setMessages([]) 
        }
      } catch (error) { console.error("Init failed:", error) } 
      finally { if (isMounted) setIsDataLoading(false) }
    }
    initChat()
    return () => { isMounted = false }
  }, [urlSessionId]) 

  // --- GRAPHQL HISTORY FETCH ---
  const fetchHistory = async (sessId: string, isMounted: boolean) => {
    try {
      if (isMounted) setIsDataLoading(true) 
      
      const query = `
        query GetChatHistory($sessionId: String!) {
          getChatHistory(sessionId: $sessionId) {
            id
            role
            content
            createdAt
          }
        }
      `;

      const response = await api.post("/api/proxy/kids/ai-buddy/graphql", { 
        query, 
        variables: { sessionId: sessId } 
      });

      const history = response.data?.data?.getChatHistory;

      if (isMounted && Array.isArray(history)) {
        setMessages(history.map((msg: any) => ({
          id: msg.id || Math.random().toString(), 
          role: msg.role as "user" | "assistant",
          content: msg.content, 
          createdAt: msg.createdAt || new Date().toISOString()
        })))
      }
    } catch (err) { 
      console.error("History fetch error:", err) 
    } finally { 
      if (isMounted) setIsDataLoading(false) 
    }
  }

  // --- ELITE FIX: REST API NATIVE STREAMING LOGIC ---
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isGenerating) return

    // Ensure completely unique ID
    const userMessageId = `user-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    setMessages(prev => [...prev, { 
      id: userMessageId, 
      role: "user", 
      content, 
      createdAt: new Date().toISOString() 
    }])
    
    // Trigger the bouncy thinking bubble
    setIsGenerating(true)
    
    // Stable ID for the upcoming AI stream
    const aiMessageId = `ai-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    try {
      const payload = {
        session_id: sessionId || null,
        provider: "mistral", 
        history: messages.slice(-8).map(m => ({ 
          role: m.role,
          content: m.content
        })),
        current_message: {
          role: "user",
          content: content
        }
      };

      const response = await fetch("/api/proxy/kids/ai-buddy/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", 
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        if (response.status === 402) setShowPremiumModal(true)
        throw new Error(`HTTP Error: ${response.status}`);
      }

      // [DOCUMENT CHANGE: Removed the pre-emptive empty message push here. 
      // It was conflicting with `isGenerating` and causing UI flickering.]

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let aiFullResponse = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.replace("data: ", "").trim();
              if (dataStr === "[DONE]") break;

              try {
                const parsed = JSON.parse(dataStr);

                if (parsed.error) {
                  console.error("Stream Error from Backend:", parsed.error);
                  break;
                }

                if (parsed.content) {
                  aiFullResponse += parsed.content;
                  
                  // [DOCUMENT CHANGE: Bulletproof real-time sync mechanism]
                  setMessages(prev => {
                    // 1. Check if the AI bubble already exists in state
                    const messageExists = prev.some(msg => msg.id === aiMessageId);
                    
                    if (!messageExists) {
                      // 2. First chunk arrives! Turn OFF the thinking animation instantly 
                      // to prevent flickering, and spawn the actual text bubble.
                      setIsGenerating(false);
                      return [...prev, {
                        id: aiMessageId,
                        role: "assistant",
                        content: aiFullResponse,
                        createdAt: new Date().toISOString()
                      }];
                    } else {
                      // 3. Subsequent chunks: simply update the existing bubble's text.
                      return prev.map(msg => 
                        msg.id === aiMessageId ? { ...msg, content: aiFullResponse } : msg
                      );
                    }
                  });
                }

                if (parsed.session_id && !sessionId) {
                  setSessionId(parsed.session_id);
                  window.history.pushState(null, '', `?session_id=${parsed.session_id}`);
                }
              } catch (e) {
                // Silently ignore incomplete JSON chunks
              }
            }
          }
        }
      }

      // [DOCUMENT CHANGE: Removed 'if(aiFullResponse) speak(...)' completely.
      // Auto-speak is now disabled. Voice will only trigger on explicit user click.]

    } catch (error: any) {
      console.error("Chat Streaming Error:", error)
    } finally { 
      // Failsafe: Ensure thinking bubble turns off if stream fails
      setIsGenerating(false) 
    }
  }

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto relative overflow-hidden">
      
      {/* ORIGINAL BACKGROUND AMBIENCE */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-20 left-[10%] w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-40 right-[5%] w-80 h-80 bg-rose-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* RECTANGULAR VIBE CHECK */}
      <AnimatePresence>
        {showVibeCheck && !urlSessionId && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 text-center backdrop-blur-xl"
          >
            <motion.div initial={{ y: 20 }} animate={{ y: 0 }} className="mb-8">
               <div className="w-16 h-16 mx-auto mb-6 relative">
                  <Image src="/heal-logo.png" alt="Buddy" fill className="object-contain" />
               </div>
               <h2 className="text-2xl font-bold text-white mb-2">How are you feeling?</h2>
               <p className="text-[#DA8CA0] font-bold uppercase tracking-[0.2em] text-[10px]">Tap a mood to begin</p>
            </motion.div>

            <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
              {MOODS.map((m) => (
                <motion.button
                  key={m.label}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => handleMoodSelect(m)}
                  className={`flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-white/10 bg-gradient-to-br ${m.color} shadow-lg`}
                >
                  <span className="text-xl">{m.emoji}</span>
                  <span className="text-white font-bold uppercase text-[10px] tracking-wider">{m.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CHAT FEED */}
      <div className="flex-1 overflow-y-auto w-full p-4 md:p-6 scrollbar-none relative z-10">
        <div className="flex flex-col gap-2 pb-4 pt-10">
          {messages.map((msg) => (
            <ChatMessage 
              key={msg.id} 
              message={msg} 
              onDelete={handleDeleteMessage} 
              onFeatureNotAvailable={() => setShowComingSoon(true)} 
            />
          ))}
          {/* Render thinking bubble ONLY when no text has arrived yet */}
          {isGenerating && <ChatMessage message={{ id: "thinking", role: "assistant", content: "", createdAt: "" }} isThinking={true} />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* RECTANGULAR SMART TAPS */}
      <div className="w-full relative z-30 pt-2 pb-4 px-4">
        <AnimatePresence>
          {messages.length > 0 && !isGenerating && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2 overflow-x-auto pb-3 scrollbar-none">
               {["Tell me more!", "Confused ❓", "Cool! ⭐", "Help! 🚨"].map((chip) => (
                 <motion.button
                   key={chip}
                   whileTap={{ scale: 0.95 }}
                   onClick={() => handleSendMessage(chip)}
                   className="whitespace-nowrap px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 text-[10px] font-bold hover:bg-white/10 transition-colors uppercase tracking-widest"
                 >
                   {chip}
                 </motion.button>
               ))}
            </motion.div>
          )}
        </AnimatePresence>
        <ChatInput onSendMessage={handleSendMessage} onStopGeneration={() => setIsGenerating(false)} isGenerating={isGenerating} />
      </div>

      {/* PREMIUM LIMIT MODAL */}
      {mounted && createPortal(
        <>
          {showComingSoon && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowComingSoon(false)}>
              <ComingSoonModal isOpen={true} onClose={() => setShowComingSoon(false)} />
            </div>
          )}
          <PremiumLimitModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} />
        </>,
        document.body
      )}
    </div>
  )
}

function PremiumLimitModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md" onClick={onClose}>
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-[#1C1246] border border-[#DA8CA0]/50 rounded-3xl p-8 shadow-2xl text-center"
          >
             <button onClick={onClose} className="absolute top-4 right-4 text-[#CCCCD9] hover:text-white transition-colors">
               <X className="h-5 w-5" />
             </button>
             <div className="flex flex-col items-center gap-5">
                <div className="w-20 h-20 bg-gradient-to-tr from-[#DA8CA0] to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <Lock className="w-9 h-9 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Daily Limit Reached 🌸</h3>
                <p className="text-[#CCCCD9]/80 text-sm">You have sent 50 messages today! To continue, upgrade to Heal Her Premium.</p>
                <button onClick={() => window.open('/pricing', '_blank')} className="w-full h-12 bg-white hover:bg-[#DA8CA0] hover:text-white text-[#1C1246] font-bold rounded-xl transition-all">
                  Upgrade for ₦7,500/mo
                </button>
             </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// --- MAIN PAGE EXPORT (SUSPENSE WRAPPER) ---
export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center bg-[#1C1246]">
        <Loader2 className="w-8 h-8 animate-spin text-[#DA8CA0]" />
      </div>
    }>
      <ChatContent />
    </Suspense>
  )
}