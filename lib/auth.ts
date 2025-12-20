// Mock authentication utilities
export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "doctor" | "paramedic" | "dispatcher" | "analyst"
  avatar?: string
}

// Mock users for demonstration
export const mockUsers: User[] = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    email: "sarah@medguard.ai",
    role: "doctor",
    avatar: "/caring-doctor.png",
  },
  {
    id: "2",
    name: "Admin User",
    email: "admin@medguard.ai",
    role: "admin",
    avatar: "/admin-interface.png",
  },
  {
    id: "3",
    name: "John Paramedic",
    email: "john@medguard.ai",
    role: "paramedic",
    avatar: "/paramedic-scene.png",
  },
]

export function validateCredentials(email: string, password: string): User | null {
  // Mock authentication - in production, this would validate against a real database
  const user = mockUsers.find((u) => u.email === email)
  if (user && password === "demo123") {
    return user
  }
  return null
}

export function getCurrentUser(): User | null {
  // Mock function to get current user from session
  // In production, this would check cookies/session storage
  if (typeof window !== "undefined") {
    const userJson = localStorage.getItem("medguard_user")
    return userJson ? JSON.parse(userJson) : null
  }
  return null
}

export function setCurrentUser(user: User | null): void {
  if (typeof window !== "undefined") {
    if (user) {
      localStorage.setItem("medguard_user", JSON.stringify(user))
    } else {
      localStorage.removeItem("medguard_user")
    }
  }
}
