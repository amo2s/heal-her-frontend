import type { Metadata } from "next";
import { DashLayout } from "@/components/DashLayout";

export const metadata: Metadata = {
  title: "Kids Dashboard | HEAL Her",
  description: "A safe, fun, and protective space for our little explorers.",
};

export default function KidsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="light-mode theme-kids">
      <DashLayout base="kids">
        {children}
      </DashLayout>
    </div>
  );
}