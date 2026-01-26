// lib/chat-api.ts

// ------------------------------------------------------------------
// 1. SHARED TYPES
// ------------------------------------------------------------------

export type Role = "user" | "assistant"

export interface Message {
  id: string
  role: Role
  content: string
  createdAt: string
}

interface ApiResponse {
  response: string
  session_id: string
}

// Types needed for the Staff Dashboard (Fixes build errors)
export interface Patient {
  id: string
  name: string
  age: number
  condition: string
  status: "Stable" | "Critical" | "Recovering"
  lastCheckup: string
  roomNumber?: string
}

export interface Alert {
  id: string
  patientName: string
  type: "Emergency" | "Warning" | "Info"
  message: string
  time: string
}

export interface Report {
  id: string
  title: string
  date: string
  author: string
  status: "Finalized" | "Draft" | "Pending Review"
}

// ------------------------------------------------------------------
// 2. MOCK DATA (Required for Staff Dashboard pages to build)
// ------------------------------------------------------------------

export const mockPatients: Patient[] = [
  { 
    id: "1", name: "Sarah Johnson", age: 45, condition: "Post-surgery recovery", 
    status: "Stable", lastCheckup: "2 hours ago", roomNumber: "304"
  },
  { 
    id: "2", name: "Michael Chen", age: 62, condition: "Hypertension monitoring", 
    status: "Recovering", lastCheckup: "4 hours ago", roomNumber: "201"
  },
  { 
    id: "3", name: "Emily Davis", age: 28, condition: "Severe allergic reaction", 
    status: "Critical", lastCheckup: "15 mins ago", roomNumber: "ICU-4"
  }
]

export const mockAlerts: Alert[] = [
  { id: "1", patientName: "Emily Davis", type: "Emergency", message: "O2 Saturation dropped below 90%", time: "10 mins ago" },
  { id: "2", patientName: "Michael Chen", type: "Warning", message: "Missed scheduled medication", time: "1 hour ago" },
  { id: "3", patientName: "Sarah Johnson", type: "Info", message: "Routine checkup completed", time: "2 hours ago" }
]

export const mockStats = {
  totalPatients: 24,
  criticalCases: 3,
  activeAlerts: 5,
  staffOnDuty: 8
}

export const mockReports: Report[] = [
  { id: "r-101", title: "Monthly Patient Turnover", date: "Oct 25, 2024", author: "Dr. Smith", status: "Finalized" },
  { id: "r-102", title: "Inventory Usage Q3", date: "Oct 24, 2024", author: "Nurse Joy", status: "Pending Review" }
]

// ------------------------------------------------------------------
// 3. BACKEND CONNECTION (The Real Chat Logic)
// ------------------------------------------------------------------

// This automatically switches between localhost and production URL
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

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
      id: Date.now().toString(),
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