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
    // FIX 1: Use sessionStorage (Matches your Proxy & ChatPage)
    const token = sessionStorage.getItem("sb-access-token")
    
    if (!token) {
        setIsLoading(false)
        return
    }

    try {
      // OPTIMIZATION: Check if we have the User ID cached in session storage first
      let userId = sessionStorage.getItem("user-id")

      // If no ID cached, we must fetch it
      if (!userId) {
          // FIX 2: Changed /auth/me to /profile/me to match your Python Backend
          const userRes = await fetch("http://127.0.0.1:8000/profile/me", {
            headers: { "Authorization": `Bearer ${token}` }
          })
          
          if (!userRes.ok) {
             setIsLoading(false)
             return
          }
          
          const userData = await userRes.json()
          userId = userData.id
          
          // Cache it for next time
          if (userId) sessionStorage.setItem("user-id", userId)
      }

      // 3. Fetch Sessions for this user (Only if we have a User ID)
      if (userId) {
          const sessionRes = await fetch(`http://127.0.0.1:8000/sessions?user_id=${userId}`)
          if (sessionRes.ok) {
            const data = await sessionRes.json()
            setSessions(data)
          }
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