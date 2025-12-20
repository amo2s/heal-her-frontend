// Mock data for staff dashboard

export interface Patient {
  id: string
  name: string
  age: number
  condition: string
  priority: "low" | "medium" | "high" | "critical"
  status: "stable" | "monitoring" | "critical" | "recovered"
  admittedDate: string
  lastUpdated: string
}

export interface Alert {
  id: string
  type: "warning" | "critical" | "info"
  message: string
  timestamp: string
  resolved: boolean
}

export interface Stat {
  label: string
  value: string
  change: string
  trend: "up" | "down" | "stable"
}

export const mockPatients: Patient[] = [
  {
    id: "P001",
    name: "Michael Chen",
    age: 45,
    condition: "Cardiac Arrest",
    priority: "critical",
    status: "critical",
    admittedDate: "2024-01-15",
    lastUpdated: "2024-01-15T14:30:00",
  },
  {
    id: "P002",
    name: "Sarah Williams",
    age: 32,
    condition: "Respiratory Distress",
    priority: "high",
    status: "monitoring",
    admittedDate: "2024-01-15",
    lastUpdated: "2024-01-15T13:45:00",
  },
  {
    id: "P003",
    name: "Robert Johnson",
    age: 67,
    condition: "Stroke Symptoms",
    priority: "high",
    status: "stable",
    admittedDate: "2024-01-14",
    lastUpdated: "2024-01-15T12:20:00",
  },
  {
    id: "P004",
    name: "Emily Davis",
    age: 28,
    condition: "Allergic Reaction",
    priority: "medium",
    status: "stable",
    admittedDate: "2024-01-15",
    lastUpdated: "2024-01-15T11:00:00",
  },
  {
    id: "P005",
    name: "James Martinez",
    age: 54,
    condition: "Diabetic Emergency",
    priority: "medium",
    status: "monitoring",
    admittedDate: "2024-01-14",
    lastUpdated: "2024-01-15T10:15:00",
  },
]

export const mockAlerts: Alert[] = [
  {
    id: "A001",
    type: "critical",
    message: "Patient P001 vital signs deteriorating - immediate attention required",
    timestamp: "2024-01-15T14:30:00",
    resolved: false,
  },
  {
    id: "A002",
    type: "warning",
    message: "Medication schedule deviation for Patient P003",
    timestamp: "2024-01-15T13:15:00",
    resolved: false,
  },
  {
    id: "A003",
    type: "info",
    message: "New AI model update available for cardiac analysis",
    timestamp: "2024-01-15T12:00:00",
    resolved: true,
  },
]

export const mockStats: Stat[] = [
  {
    label: "Active Patients",
    value: "124",
    change: "+12",
    trend: "up",
  },
  {
    label: "Critical Cases",
    value: "8",
    change: "-2",
    trend: "down",
  },
  {
    label: "AI Predictions",
    value: "98.5%",
    change: "+0.3%",
    trend: "up",
  },
  {
    label: "Response Time",
    value: "2.3 min",
    change: "-0.5 min",
    trend: "down",
  },
]

export interface Report {
  id: string
  title: string
  type: "incident" | "analysis" | "audit" | "research"
  date: string
  status: "draft" | "pending" | "approved"
  author: string
}

export const mockReports: Report[] = [
  {
    id: "R001",
    title: "Monthly Incident Analysis - December 2024",
    type: "analysis",
    date: "2024-01-10",
    status: "approved",
    author: "Dr. Sarah Johnson",
  },
  {
    id: "R002",
    title: "AI Model Performance Audit Q4 2024",
    type: "audit",
    date: "2024-01-08",
    status: "approved",
    author: "Admin User",
  },
  {
    id: "R003",
    title: "Cardiac Emergency Response Protocol Review",
    type: "research",
    date: "2024-01-15",
    status: "pending",
    author: "Dr. Sarah Johnson",
  },
  {
    id: "R004",
    title: "Patient Outcome Statistics January 2024",
    type: "analysis",
    date: "2024-01-14",
    status: "draft",
    author: "John Paramedic",
  },
]
