// lib/chat-api.ts (Formerly mock-bridge.ts)

export type Role = "user" | "assistant"

export interface Message {
  id: string
  role: Role
  content: string
  createdAt: string
}

// Response type from the Backend
interface ApiResponse {
  response: string
  session_id: string
}

const BACKEND_URL = "http://127.0.0.1:8000" // Ensure this matches your running server

// THE REAL BRIDGE FUNCTION
export const sendMessage = async (
  userText: string, 
  userId: string, 
  currentSessionId: string | null
): Promise<{ message: Message; newSessionId: string }> => {

  try {
    const res = await fetch(`${BACKEND_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,          // Must be the Real UUID from Supabase Auth
        message: userText,
        session_id: currentSessionId // Null for first message, UUID for the rest
      }),
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.detail || "Failed to fetch response")
    }

    const data: ApiResponse = await res.json()

    // Transform Backend Response -> Frontend Message Format
    const aiMessage: Message = {
      id: Date.now().toString(), // Or generate a better ID if needed
      role: "assistant",
      content: data.response,
      createdAt: new Date().toISOString()
    }

    return { 
      message: aiMessage, 
      newSessionId: data.session_id 
    }

  } catch (error) {
    console.error("Chat API Error:", error)
    // Fallback error message so the UI doesn't crash
    return {
      message: {
        id: Date.now().toString(),
        role: "assistant",
        content: "I'm having a little trouble connecting to the server right now. Please try again.",
        createdAt: new Date().toISOString()
      },
      newSessionId: currentSessionId || ""
    }
  }
}