import type React from "react"
import type { Metadata } from "next"
import { Inter, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MedGuard AI - Intelligent Emergency Medical Assistance",
  description:
    "Healthcare-grade AI platform providing emergency response guidance, first aid support, and medical information with ethical responsibility.",
  generator: "sliver-verse",
  
  // --- UPDATED ICONS CONFIGURATION ---
  icons: {
    icon: "/favicon.ico", // Standard favicon (place in public folder)
    shortcut: "/favicon-16x16.png", // Optional: Small icon for shortcuts
    apple: "/apple-touch-icon.png", // For iPhone/iPad home screen
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}