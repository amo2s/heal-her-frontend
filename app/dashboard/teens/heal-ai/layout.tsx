import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Heal AI | HEAL Her",
  description: "A secure, AI-powered space for real talk, guidance, and support.",
};

export default function HealAiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // We remove DashLayout from this file entirely.
  // The parent TeensLayoutWrapper is already providing the sidebar and shell.
  // This child layout now simply passes the chat page through to the parent.
  
  return (
    <div className="h-full w-full">
      {children}
    </div>
  );
}