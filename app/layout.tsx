import type React from "react"
import type { Metadata } from "next"
import { Nunito } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

/* 🔥 GLOBAL FIX: stop Next.js from freezing pages */
export const dynamic = "force-dynamic"
export const revalidate = 0

// Initialize Nunito font
const nunito = Nunito({ 
  subsets: ["latin"],
  // Including multiple weights ensures bold headings and regular text look correct
  weight: ['300', '400', '600', '700', '800'],
  variable: '--font-nunito',
})

export const metadata: Metadata = {
  title: "Heal Her AI - Empowering Girls' Health Education",
  description:
    "A private, safe, and empowering AI companion for girls to learn about their bodies, health, and wellness.",
  generator: "sliver-verse",

  icons: {
    icon: "/favicon.ico", // You will need to update these icons later
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${nunito.className} font-sans antialiased bg-background text-foreground`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}