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

// Types needed for the Staff Dashboard
export interface Patient {
  id: string
  name: string
  age: number
  condition: string
  status: "Stable" | "Critical" | "Recovering" | "critical" | "monitoring" | "stable" | "recovered"
  priority: "critical" | "high" | "medium" | "low"
  lastCheckup: string
  roomNumber?: string
  lastUpdated: string
  admittedDate: string
}

export interface Alert {
  id: string
  patientName: string
  type: "Emergency" | "Warning" | "Info" | "critical" | "warning" | "info"
  message: string
  time: string
  timestamp: string
  resolved: boolean
}

export interface Report {
  id: string
  title: string
  date: string
  author: string
  type: string
  status: "Finalized" | "Draft" | "Pending Review" | "approved" | "pending" | "draft"
}

export interface StatItem {
  label: string
  value: string | number
  change: string
  trend: "up" | "down" | "neutral"
}

// ------------------------------------------------------------------
// 2. MOCK DATA (Required for Staff Dashboard pages to build)
// ------------------------------------------------------------------

export const mockPatients: Patient[] = [
  { 
    id: "1", name: "Jane Doe", age: 45, condition: "Post-surgery recovery", 
    status: "stable", priority: "low", lastCheckup: "2 hours ago", roomNumber: "304",
    lastUpdated: new Date().toISOString(), admittedDate: "2024-10-20"
  },
  { 
    id: "2", name: "Michael Chen", age: 62, condition: "Hypertension monitoring", 
    status: "monitoring", priority: "medium", lastCheckup: "4 hours ago", roomNumber: "201",
    lastUpdated: new Date().toISOString(), admittedDate: "2024-10-22"
  },
  { 
    id: "3", name: "Emily Davis", age: 28, condition: "Severe allergic reaction", 
    status: "critical", priority: "critical", lastCheckup: "15 mins ago", roomNumber: "ICU-4",
    lastUpdated: new Date().toISOString(), admittedDate: "2024-10-24"
  }
]

export const mockAlerts: Alert[] = [
  { id: "1", patientName: "Emily Davis", type: "critical", message: "O2 Saturation dropped below 90%", time: "10 mins ago", timestamp: new Date().toISOString(), resolved: false },
  { id: "2", patientName: "Michael Chen", type: "warning", message: "Missed scheduled medication", time: "1 hour ago", timestamp: new Date().toISOString(), resolved: false },
  { id: "3", patientName: "Jane Doe", type: "info", message: "Routine checkup completed", time: "2 hours ago", timestamp: new Date().toISOString(), resolved: true }
]

export const mockStats: StatItem[] = [
  { label: "Total Patients", value: 24, change: "+12%", trend: "up" },
  { label: "Critical Cases", value: 3, change: "-2%", trend: "down" },
  { label: "Active Alerts", value: 5, change: "+1", trend: "up" },
  { label: "Staff On Duty", value: 8, change: "0%", trend: "neutral" },
]

export const mockReports: Report[] = [
  { id: "r-101", title: "Monthly Patient Turnover", date: "Oct 25, 2024", author: "Dr. Smith", type: "Clinical", status: "approved" },
  { id: "r-102", title: "Inventory Usage Q3", date: "Oct 24, 2024", author: "Nurse Joy", type: "Administrative", status: "pending" }
]

// ------------------------------------------------------------------
// 3. BACKEND CONNECTION (The Real Chat Logic)
// ------------------------------------------------------------------

// This automatically switches between localhost and production URL
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://sliverboy-heal-her-backend.hf.space"

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
