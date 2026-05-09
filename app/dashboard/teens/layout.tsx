import type { Metadata } from "next"
import { TeensLayoutWrapper } from "@/components/teens/heal-ai/layout-wrapper"

export const metadata: Metadata = {
  title: "Teens Dashboard | HEAL Her",
  description: "Real talk about boundaries, consent, and staying safe.",
}

export default function TeensLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dark-mode theme-teens">
      <TeensLayoutWrapper>
        {children}
      </TeensLayoutWrapper>
    </div>
  )
}