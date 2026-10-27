import type { Metadata } from "next"
import { YoungAdultLayoutWrapper } from "@/components/young-adults/heal-ai/layout-wrapper"

export const metadata: Metadata = {
  title: "Young-Adults Dashboard | HEAL Her",
  description: "Navigate your wellness journey with professional resources, autonomy, and dedicated support.",
}

export default function YoungAdultLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dark-mode theme-young-adults">
      <YoungAdultLayoutWrapper>
        {children}
      </YoungAdultLayoutWrapper>
    </div>
  )
}