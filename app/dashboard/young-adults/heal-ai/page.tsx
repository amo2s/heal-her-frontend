"use client"

import React, { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation" 
import { createPortal } from "react-dom"
import { 
  MoreVertical, Archive, Trash2, Flag, Menu, Loader2, Sparkles,
  ShieldCheck, BrainCircuit, Target, MessageSquareDashed, ShieldAlert, Lock, X
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { ComingSoonModal } from "@/components/modals/coming-soon-modal"
import { cn } from "@/lib/utils"
import { useAudio, MoodType } from "@/components/context/audio-manager"
import { ChatInput } from "@/components/chat-input"
import { ChatMessage } from "@/components/chat-message"
import { api } from "@/lib/proxy"

// IMPORTANT: Updated Sidebar path for young adults
import { Sidebar } from "@/components/young-adults/heal-ai/sidebar" 

// --- TYPES ---
interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: string
}

type SessionIntent = {
  label: string;
  icon: React.ReactNode;
  mood: MoodType;
  suggestion: string;
}

// Sophisticated session guides for young adults
const INTENTS: SessionIntent[] = [
  { label: "Venting", icon: <MessageSquareDashed className="w-5 h-5" />, mood: "gentle", suggestion: "I just need to vent right now. No judgment, please." },
  { label: "Advice", icon: <Target className="w-5 h-5" />, mood: "neutral", suggestion: "I need some objective advice on navigating a situation." },
  { label: "Growth", icon: <BrainCircuit className="w-5 h-5" />, mood: "happy", suggestion: "Teach me something new about personal boundaries, career, or mental health." },
  { label: "Crisis", icon: <ShieldAlert className="w-5 h-5" />, mood: "gentle", suggestion: "I'm feeling completely overwhelmed and need immediate support." },
];

export default function YoungAdultsChatPage() {
  const [messages, setMessages] = useState<Message[]>([]) 
  const [isGenerating, setIsGenerating] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isDataLoading, setIsDataLoading] = useState(true)

  // LAYOUT & COMPANION STATES
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [showVibeCheck, setShowVibeCheck] = useState(true)
  const [sessionMood, setSessionMood] = useState<MoodType>("neutral")
  const [showComingSoon, setShowComingSoon] = useState(false)
  const [showPremiumModal, setShowPremiumModal] = useState(false)

  const [sessionId, setSessionId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const searchParams = useSearchParams()
  const urlSessionId = searchParams.get("session_id")
  
  const { playSfx } = useAudio()

  useEffect(() => { setMounted(true) }, [])
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  useEffect(() => { scrollToBottom() }, [messages, isGenerating])

  const handleDeleteMessage = (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id))
  }

  const handleIntentSelect = async (intent: SessionIntent) => {
    playSfx('click');
    setSessionMood(intent.mood);
    setShowVibeCheck(false);
    handleSendMessage(intent.suggestion);
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
      const authToken = sessionStorage.getItem("sb-access-token") || "";

      const query = `
        query GetChatHistory($sessionId: String!) {
          getChatHistory(sessionId: $sessionId) { id role content createdAt }
        }
      `;
      // Updated proxy route for young adults
      const response = await api.post("/api/proxy/young_adult/heal-ai/graphql", { 
        query, variables: { sessionId: sessId } 
      }, {
        headers: { "Authorization": `Bearer ${authToken}` }
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

  // --- NATIVE STREAMING LOGIC ---
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isGenerating) return

    const userMessageId = `user-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    setMessages(prev => [...prev, { id: userMessageId, role: "user", content, createdAt: new Date().toISOString() }])
    setIsGenerating(true)
    
    const aiMessageId = `ai-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    try {
      const authToken = sessionStorage.getItem("sb-access-token") || "";

      const payload = {
        session_id: sessionId || null,
        provider: "mistral", 
        history: messages.slice(-8).map(m => ({ role: m.role, content: m.content })),
        current_message: { role: "user", content: content }
      };

      // Updated proxy route for young adults
      const response = await fetch("/api/proxy/young_adult/heal-ai/chat/stream", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        if (response.status === 402) setShowPremiumModal(true)
        throw new Error(`HTTP Error: ${response.status}`);
      }

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
                if (parsed.error) break;

                if (parsed.content) {
                  aiFullResponse += parsed.content;
                  setMessages(prev => {
                    const messageExists = prev.some(msg => msg.id === aiMessageId);
                    if (!messageExists) {
                      setIsGenerating(false);
                      return [...prev, { id: aiMessageId, role: "assistant", content: aiFullResponse, createdAt: new Date().toISOString() }];
                    } else {
                      return prev.map(msg => msg.id === aiMessageId ? { ...msg, content: aiFullResponse } : msg);
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
    } catch (error: any) {
      console.error("Chat Streaming Error:", error)
    } finally { 
      setIsGenerating(false) 
    }
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-white relative">
      
      {/* --- 1. DESKTOP SIDEBAR --- */}
      <div className="hidden md:block w-72 shrink-0 h-full border-r border-white/10 z-40 bg-background">
         <Sidebar onClose={() => {}} />
      </div>

      {/* --- 2. MOBILE SIDEBAR (DRAWER) --- */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setIsSidebarOpen(false)}
               className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm md:hidden"
             />
             <motion.div 
               initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
               transition={{ type: "spring", damping: 25, stiffness: 200 }}
               className="fixed inset-y-0 left-0 z-[70] w-[280px] bg-background border-r border-white/10 md:hidden"
             >
               <Sidebar onClose={() => setIsSidebarOpen(false)} />
             </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- 3. MAIN CHAT VIEW (FLEX COLUMN) --- */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        
        {/* Ambient Backgrounds */}
        <div className="absolute top-0 right-[10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0" />
        <div className="absolute bottom-0 left-[5%] w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none z-0" />

        {/* HEADER */}
        <Header onSidebarToggle={() => setIsSidebarOpen(true)} />

        {/* FEED AREA (Vertical custom scrollbar added here) */}
        <main className="flex-1 overflow-y-auto w-full relative z-10 flex flex-col [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
          
          {/* INTENT PICKER OVERLAY */}
          <AnimatePresence>
            {showVibeCheck && !urlSessionId && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center backdrop-blur-xl bg-background/40"
              >
                <motion.div initial={{ y: 15 }} animate={{ y: 0 }} transition={{ duration: 0.5 }} className="mb-10 flex flex-col items-center">
                   <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-2xl">
                     <Sparkles className="w-8 h-8 text-primary" />
                   </div>
                   <h2 className="text-3xl font-bold tracking-tight mb-2">What's on your mind?</h2>
                   <p className="text-white/50 text-sm font-medium">Select an intent to guide Heal AI for this session.</p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
                  {INTENTS.map((intent) => (
                    <motion.button
                      key={intent.label}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => handleIntentSelect(intent)}
                      className="flex items-center gap-4 py-4 px-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all shadow-lg text-left group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        {intent.icon}
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-bold text-white block">{intent.label}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* MESSAGES */}
          <div className="flex flex-col gap-4 p-4 md:p-6 w-full max-w-4xl mx-auto">
            {messages.map((msg) => (
              <ChatMessage 
                key={msg.id} 
                message={msg} 
                onDelete={handleDeleteMessage} 
                onFeatureNotAvailable={() => setShowComingSoon(true)} 
              />
            ))}
            {isGenerating && <ChatMessage message={{ id: "thinking", role: "assistant", content: "", createdAt: "" }} isThinking={true} />}
            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* INPUT AREA */}
        <div className="w-full relative z-30 px-4 md:px-6 pb-6 shrink-0">
          <div className="max-w-4xl mx-auto">
            <AnimatePresence>
              {messages.length > 0 && !isGenerating && (
                /* Horizontal custom scrollbar added here */
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="flex gap-2 overflow-x-auto pb-4 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20"
                >
                   {["Break that down for me", "Give me a real-world example", "What's the best approach?", "Let's dig deeper"].map((chip) => (
                     <motion.button
                       key={chip}
                       whileTap={{ scale: 0.98 }}
                       onClick={() => handleSendMessage(chip)}
                       className="whitespace-nowrap px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 text-xs font-semibold hover:bg-white/10 hover:text-white transition-colors"
                     >
                       {chip}
                     </motion.button>
                   ))}
                </motion.div>
              )}
            </AnimatePresence>
            <ChatInput onSendMessage={handleSendMessage} onStopGeneration={() => setIsGenerating(false)} isGenerating={isGenerating} />
          </div>
        </div>

      </div>

      {/* --- MODALS --- */}
      {mounted && createPortal(
        <>
          {showComingSoon && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={() => setShowComingSoon(false)}>
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

// --- HEADER COMPONENT ---
export function Header({ onMenuAction, onSidebarToggle }: { onMenuAction?: (action: string) => void, onSidebarToggle?: () => void }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSessionId = searchParams.get("session_id")
  const { playSfx } = useAudio()

  const [showMenu, setShowMenu] = useState(false)
  const [showComingSoon, setShowComingSoon] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setShowMenu(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleAction = (action: string) => {
    playSfx('click')
    setShowMenu(false)
    if (action === "delete") {
      if (currentSessionId) setShowDeleteModal(true)
    } else if (action === "archive" || action === "report") {
      setShowComingSoon(true)
    } else if (onMenuAction) {
      onMenuAction(action)
    }
  }

  const executeDelete = async () => {
    if (!currentSessionId) return
    setIsDeleting(true)
    try {
      router.push("/dashboard/young-adults/heal-ai") 
      setShowDeleteModal(false)
    } catch (e) { 
      console.error("[HEADER ERROR] Deletion failed:", e) 
    } finally { 
      setIsDeleting(false) 
    }
  }

  return (
    <>
      <header className="shrink-0 w-full h-20 px-4 md:px-8 flex items-center justify-between z-50 bg-background/80 backdrop-blur-2xl border-b border-white/10 shadow-sm">
        {/* LEFT: Sidebar Toggle */}
        <div className="flex items-center">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => { playSfx('click'); onSidebarToggle?.(); }}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-primary transition-colors md:hidden"
          >
            <Menu className="w-5 h-5" />
          </motion.button>
        </div>

        {/* CENTER: Premium Branding */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative h-9 w-9 p-1.5 bg-white/5 rounded-xl border border-white/10 shadow-2xl backdrop-blur-md"
          >
             <Image src="/heal-logo.png" alt="Logo" fill className="object-contain p-1.5" />
          </motion.div>
          
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg md:text-xl font-bold tracking-tight text-white leading-none">
                Heal <span className="text-primary">AI</span>
              </h1>
              <ShieldCheck className="w-3.5 h-3.5 text-primary/80" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 leading-none mt-1">
              Secure Support
            </p>
          </div>
        </div>

        {/* RIGHT: Action Menu */}
        <div className="flex items-center" ref={menuRef}>
          <motion.button 
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => { playSfx('click'); setShowMenu(!showMenu); }}
            className={cn(
              "p-2.5 rounded-xl transition-all duration-300 border",
              showMenu ? "bg-primary/20 border-primary/40 text-primary" : "bg-white/5 border-white/10 text-white/50 hover:text-white"
            )}
          >
            <MoreVertical className="w-5 h-5" /> 
          </motion.button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-4 top-20 w-48 overflow-hidden rounded-2xl bg-background border border-white/10 shadow-2xl z-[60]"
              >
                <div className="py-2">
                  <MenuItem icon={Archive} label="Archive Session" onClick={() => handleAction("archive")} />
                  <MenuItem icon={Flag} label="Report Issue" onClick={() => handleAction("report")} />
                  <div className="my-1 mx-4 h-px bg-white/5" />
                  <MenuItem icon={Trash2} label="Delete Chat" onClick={() => handleAction("delete")} danger disabled={!currentSessionId} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <ComingSoonModal isOpen={showComingSoon} onClose={() => setShowComingSoon(false)} />
      <DeleteConfirmationModal isOpen={showDeleteModal} isLoading={isDeleting} onClose={() => !isDeleting && setShowDeleteModal(false)} onConfirm={executeDelete} />
    </>
  )
}

function MenuItem({ icon: Icon, label, onClick, danger = false, disabled = false }: any) {
  return (
    <button onClick={onClick} disabled={disabled} className={cn(
      "w-full px-5 py-3 flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest transition-all",
      disabled ? "opacity-30 cursor-not-allowed" : "hover:bg-white/5",
      danger ? "text-red-400" : "text-white/60 hover:text-white"
    )}>
      <Icon className="w-4 h-4" />
      {label}
    </button>
  )
}

function DeleteConfirmationModal({ isOpen, isLoading, onClose, onConfirm }: any) {
  if (!isOpen) return null
  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={onClose}>
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm bg-background border border-white/10 rounded-3xl p-8 text-center"
      >
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Confirm Deletion</h3>
        <p className="text-xs text-white/50 mb-8 uppercase tracking-widest font-bold">This session will be purged permanently.</p>
        <div className="flex flex-col gap-3">
          <button onClick={onConfirm} disabled={isLoading} className="w-full py-4 bg-red-500 rounded-xl text-white font-bold uppercase text-[11px] tracking-widest shadow-lg transition-all hover:bg-red-600">
            {isLoading ? "Purging..." : "Delete Permanently"}
          </button>
          <button onClick={onClose} disabled={isLoading} className="w-full py-4 bg-white/5 rounded-xl text-white font-bold text-[11px] uppercase tracking-widest transition-all hover:bg-white/10">
            Cancel
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  )
}

function PremiumLimitModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={onClose}>
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-background border border-white/10 rounded-3xl p-8 shadow-2xl text-center"
          >
             <button onClick={onClose} className="absolute top-5 right-5 text-white/50 hover:text-white transition-colors">
               <X className="h-5 w-5" />
             </button>
             <div className="flex flex-col items-center gap-6">
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                    <Lock className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Daily Limit Reached.</h3>
                  <p className="text-white/50 text-sm leading-relaxed">You have sent 50 messages today. To continue your session, upgrade to Heal Her Premium.</p>
                </div>
                <button onClick={() => window.open('/pricing', '_blank')} className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-lg">
                  Upgrade for ₦7,500/mo
                </button>
             </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}