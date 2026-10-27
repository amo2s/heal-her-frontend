'use client';

import { Nunito } from "next/font/google";
import { usePathname } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const nunito = Nunito({ 
  subsets: ["latin"],
  weight: ['300', '400', '600', '700', '800'],
  variable: '--font-nunito',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Define the routes where global background styles should be excluded
  const isDashboardRoute = pathname?.startsWith('/dashboard');

  const bodyClasses = [
    nunito.className,
    "font-sans",
    "antialiased",
    // Force the specific hex color for the landing page to match the gradient mask
    !isDashboardRoute ? "bg-[#1C1246] text-[#FAFAFA]" : "bg-background text-foreground"
  ].filter(Boolean).join(" ");

  return (
    <html lang="en">
      <body className={bodyClasses}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}