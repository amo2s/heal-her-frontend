"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"

interface Session {
  id: string
  title: string
  created_at: string
}

interface ChatContextType {
  sessions: Session[]
  isLoading: boolean
  refreshSessions: () => Promise<void>
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Function to fetch sessions from Backend
  const refreshSessions = useCallback(async () => {
    // We don't set loading to true here to avoid flickering on updates
    const token = localStorage.getItem("sb-access-token")
    if (!token) {
        setIsLoading(false)
        return
    }

    try {
      // 1. Get User ID first
      const userRes = await fetch("http://127.0.0.1:8000/auth/me", {
        headers: { "Authorization": `Bearer ${token}` }
      })
      
      if (!userRes.ok) {
          setIsLoading(false)
          return
      }
      
      const userData = await userRes.json()

      // 2. Fetch Sessions for this user
      const sessionRes = await fetch(`http://127.0.0.1:8000/sessions?user_id=${userData.id}`)
      if (sessionRes.ok) {
        const data = await sessionRes.json()
        setSessions(data)
      }
    } catch (error) {
      console.error("Context: Failed to load sessions", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Auto-load on mount
  useEffect(() => {
    refreshSessions()
  }, [refreshSessions])

  return (
    <ChatContext.Provider value={{ sessions, isLoading, refreshSessions }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChatContext() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider")
  }
  return context
}