'use client';

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import { useHeal } from "@/store/heal";
import { CHATS } from "@/data/heal";

const FOLLOWUPS: Record<"kids" | "teens" | "ya", string> = {
  kids: "Great question! Remember: it's always okay to say no — even to people you love. 💖",
  teens: "Totally fair to ask. Take your time, trust your gut, and remember a hesitant yes isn't a yes.",
  ya: "Good. Documenting your reasoning is itself a form of self-protection — well done for thinking it through.",
};

export function HealChat({ mascot }: { mascot?: string }) {
  const { group, nickname } = useHeal();
  const [messages, setMessages] = useState(CHATS[group]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const isKids = group === "kids";

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    
    const id = String(Date.now());
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    
    const userMsg = { id, role: "user" as const, text: input.trim(), time };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    // Simulated AI response delay
    setTimeout(() => {
      setMessages((m) => [
        ...m, 
        { id: id + "r", role: "assistant" as const, text: FOLLOWUPS[group], time }
      ]);
    }, 800);
  };

  return (
    <div className="glass flex h-[32rem] flex-col rounded-[2.5rem] border border-white/10 shadow-soft overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center gap-3 border-b border-white/5 bg-white/5 p-5 backdrop-blur-md">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent text-xl shadow-glow"
        >
          {mascot ?? "✨"}
        </motion.div>
        <div className="flex-1">
          <div className="flex items-center gap-2 font-bold tracking-tight text-foreground">
            HEAL Assistant 
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase text-emerald-500">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> 
              Online
            </span>
          </div>
          <div className="text-xs font-medium text-muted-foreground">Safe space for {nickname}</div>
        </div>
        <Sparkles className="h-4 w-4 text-primary animate-pulse" />
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto p-5 scrollbar-hide"
      >
        <AnimatePresence initial={false}>
          {messages.map((m) => {
            const isMe = m.role === "user";
            return (
              <motion.div
                key={m.id}
                layout
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`relative max-w-[85%] rounded-[1.5rem] px-5 py-3 text-sm leading-relaxed shadow-sm ${
                    isMe
                      ? "rounded-br-none bg-primary text-white"
                      : isKids
                        ? "rounded-bl-none bg-secondary text-secondary-foreground border border-secondary-foreground/5"
                        : "rounded-bl-none bg-white/10 text-foreground backdrop-blur-sm border border-white/5"
                  }`}
                >
                  {m.text}
                  <div className={`mt-1.5 text-[10px] font-medium opacity-60 ${isMe ? "text-right" : "text-left"}`}>
                    {m.time}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/5 border-t border-white/5">
        <div className="relative flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={isKids ? "Type a question…" : "Ask me anything safely…"}
            className="flex-1 rounded-2xl border border-white/10 bg-black/20 px-5 py-3.5 text-sm outline-none transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/10 placeholder:text-muted-foreground/50"
          />
          <motion.button 
            onClick={send}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-glow"
          >
            <Send className="h-5 w-5" />
          </motion.button>
        </div>
        <p className="mt-3 text-center text-[10px] font-medium text-muted-foreground/50">
          This is a private, encrypted chat. Dyg?
        </p>
      </div>
    </div>
  );
}